/**
 * GOOGLE APPS SCRIPT BACKEND
 * PILKETOS SMP
 *
 * Struktur Spreadsheet:
 *
 * 1. MASTER_PEMILIH
 *    NIS | NAMA | KELAS | STATUS
 *
 * 2. MASTER_GURU
 *    NIP | NAMA | STATUS
 *
 * 3. SHEET VOTES
 *    Timestamp | Kategori | NIS/NIP | Nama | Kelas | Kandidat
 *
 * 4. SHEET RESULTS
 *    Kandidat | Suara Siswa | Suara Guru | Total
 */

const SPREADSHEET_ID = "172vVwulkvhfg4hj-nLwsNKrXthxnSFLoSAhq0grH6gM";

const PJ_SESSION_TTL_SECONDS = 21600; // 6 jam

const CANDIDATES = [1, 2, 3];

const SHEET_PEMILIH = "MASTER_PEMILIH";
const SHEET_GURU = "MASTER_GURU";
const SHEET_VOTES = "SHEET VOTES";
const SHEET_RESULTS = "SHEET RESULTS";


/* =========================================================
   API ENTRY POINT
   ========================================================= */

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");

    const action = body.action;
    const payload = body.payload || {};

    let result;

    if (action === "validateIdentity") {
      result = validateIdentity(payload);

    } else if (action === "submitVote") {
      result = submitVote(payload);

    } else if (action === "loginPJ") {
      result = loginPJ(payload);

    } else if (action === "getPJResults") {
      result = getPJResults(payload);

    } else {
      throw new Error("Action tidak dikenal.");
    }

    return json_(result);

  } catch (err) {
    return json_({
      success: false,
      message: err.message || "Terjadi kesalahan pada server."
    });
  }
}


/* =========================================================
   SPREADSHEET HELPERS
   ========================================================= */

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}


function getSheet_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    const availableSheets = ss
      .getSheets()
      .map(sheet => sheet.getName())
      .join(", ");

    throw new Error(
      'Sheet "' +
      sheetName +
      '" tidak ditemukan. Sheet yang tersedia: ' +
      availableSheets
    );
  }

  return sheet;
}


/* =========================================================
   VALIDATE IDENTITY
   ========================================================= */

function validateIdentity(p) {
  const category = normalizeCategory_(p.category);
  const identity = normalizeIdentity_(p.identity);

  if (!["MURID", "GURU"].includes(category)) {
    throw new Error("Kategori tidak valid.");
  }

  if (!identity) {
    throw new Error("Identitas wajib diisi.");
  }

  // Cari identitas di MASTER
  const person = findPerson_(category, identity);

  if (!person) {
    return {
      success: false,
      message:
        category === "MURID"
          ? "NIS tidak ditemukan atau tidak aktif."
          : "NIP tidak ditemukan atau tidak aktif."
    };
  }

  // Cek apakah sudah voting
  const votes = getSheet_(getSpreadsheet_(), SHEET_VOTES);
  const identityHash = hash_(category, identity);

  if (hasHash_(votes, identityHash)) {
    return {
      success: false,
      alreadyVoted: true,
      message: "Identitas ini sudah menggunakan hak suara."
    };
  }

  return {
    success: true,
    nama: person.nama,
    kelas: person.kelas || ""
  };
}


/* =========================================================
   SUBMIT VOTE
   ========================================================= */

function submitVote(p) {
  const lock = LockService.getScriptLock();

  lock.waitLock(10000);

  try {
    const category = normalizeCategory_(p.category);
    const identity = normalizeIdentity_(p.identity);
    const candidate = Number(p.candidateNumber);

    if (!["MURID", "GURU"].includes(category)) {
      throw new Error("Kategori tidak valid.");
    }

    if (!identity) {
      throw new Error("Identitas wajib diisi.");
    }

    if (!CANDIDATES.includes(candidate)) {
      throw new Error("Kandidat tidak valid.");
    }

    /*
     * PENTING:
     * Jangan percaya nama/kelas yang dikirim frontend.
     * Backend mencari ulang identitas dari MASTER.
     */
    const person = findPerson_(category, identity);

    if (!person) {
      return {
        success: false,
        message:
          category === "MURID"
            ? "NIS tidak ditemukan atau tidak aktif."
            : "NIP tidak ditemukan atau tidak aktif."
      };
    }

    const ss = getSpreadsheet_();
    const votes = getSheet_(ss, SHEET_VOTES);

    const identityHash = hash_(category, identity);

    // Cegah double vote
    if (hasHash_(votes, identityHash)) {
      return {
        success: false,
        alreadyVoted: true,
        message: "Anda sudah menggunakan hak suara."
      };
    }

    /*
     * Struktur:
     * Timestamp
     * Kategori
     * NIS/NIP
     * Nama
     * Kelas
     * Kandidat
     */
    votes.appendRow([
      new Date(),
      category,
      identity,
      person.nama,
      person.kelas || "",
      candidate
    ]);

    // Update hasil
    rebuildResults_();

    return {
      success: true,
      message: "Suara berhasil direkam."
    };

  } finally {
    lock.releaseLock();
  }
}


/* =========================================================
   MASTER DATA
   ========================================================= */

function findPerson_(category, identity) {
  const ss = getSpreadsheet_();

  let sheet;
  let data;

  if (category === "MURID") {
    sheet = getSheet_(ss, SHEET_PEMILIH);
    data = sheet.getDataRange().getValues();

    /*
     * MASTER_PEMILIH
     * NIS | NAMA | KELAS | STATUS
     */
    for (let i = 1; i < data.length; i++) {
      const nis = normalizeIdentity_(data[i][0]);
      const nama = String(data[i][1] || "").trim();
      const kelas = String(data[i][2] || "").trim();
      const status = normalizeStatus_(data[i][3]);

      if (
        nis === identity &&
        status === "AKTIF"
      ) {
        return {
          nama: nama,
          kelas: kelas
        };
      }
    }

  } else if (category === "GURU") {
    sheet = getSheet_(ss, SHEET_GURU);
    data = sheet.getDataRange().getValues();

    /*
     * MASTER_GURU
     * NIP | NAMA | STATUS
     */
    for (let i = 1; i < data.length; i++) {
      const nip = normalizeIdentity_(data[i][0]);
      const nama = String(data[i][1] || "").trim();
      const status = normalizeStatus_(data[i][2]);

      if (
        nip === identity &&
        status === "AKTIF"
      ) {
        return {
          nama: nama,
          kelas: ""
        };
      }
    }
  }

  return null;
}


/* =========================================================
   CEK DOUBLE VOTE
   ========================================================= */

function hasHash_(sheet, targetHash) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return false;
  }

  /*
   * Kolom C = NIS/NIP
   * Kita menyimpan hash di memory check,
   * tetapi database tetap menyimpan NIS/NIP sesuai desain.
   *
   * Karena sekarang database menyimpan identitas asli,
   * pengecekan dilakukan langsung berdasarkan
   * kategori + identitas.
   */

  const rows = sheet
    .getRange(2, 2, lastRow - 1, 2)
    .getValues();

  for (let i = 0; i < rows.length; i++) {
    const category = normalizeCategory_(rows[i][0]);
    const identity = normalizeIdentity_(rows[i][1]);

    if (hash_(category, identity) === targetHash) {
      return true;
    }
  }

  return false;
}


/* =========================================================
   REBUILD RESULTS
   ========================================================= */

function rebuildResults_() {
  const ss = getSpreadsheet_();

  const votes = getSheet_(ss, SHEET_VOTES);
  const results = getSheet_(ss, SHEET_RESULTS);

  const count = {
    1: { MURID: 0, GURU: 0 },
    2: { MURID: 0, GURU: 0 },
    3: { MURID: 0, GURU: 0 }
  };

  const lastRow = votes.getLastRow();

  if (lastRow > 1) {

    /*
     * SHEET VOTES
     *
     * A Timestamp
     * B Kategori
     * C NIS/NIP
     * D Nama
     * E Kelas
     * F Kandidat
     */

    const rows = votes
      .getRange(2, 1, lastRow - 1, 6)
      .getValues();

    rows.forEach(row => {
      const category = normalizeCategory_(row[1]);
      const candidate = Number(row[5]);

      if (
        count[candidate] &&
        count[candidate][category] !== undefined
      ) {
        count[candidate][category]++;
      }
    });
  }

  // Bersihkan hasil lama
  results.clearContents();

  // Header
  results.appendRow([
    "Kandidat",
    "Suara Siswa",
    "Suara Guru",
    "Total"
  ]);

  // Isi hasil
  CANDIDATES.forEach(candidate => {
    const studentVotes = count[candidate].MURID;
    const teacherVotes = count[candidate].GURU;

    results.appendRow([
      "Nomor " + candidate,
      studentVotes,
      teacherVotes,
      studentVotes + teacherVotes
    ]);
  });

  results.setFrozenRows(1);
}


/* =========================================================
   PJ LOGIN
   ========================================================= */

function loginPJ(p) {
  const properties = PropertiesService.getScriptProperties();
  const configuredUsername = properties.getProperty("PJ_USERNAME");
  const configuredPassword = properties.getProperty("PJ_PASSWORD");
  const username = String(p.username || "");
  const password = String(p.password || "");

  if (!configuredUsername || !configuredPassword) {
    return {
      success: false,
      message: "Credential PJ belum dikonfigurasi di Script Properties."
    };
  }

  if (
    username !== configuredUsername ||
    password !== configuredPassword
  ) {
    return {
      success: false,
      message: "Username atau password PJ salah."
    };
  }

  const token = Utilities.getUuid();

  CacheService
    .getScriptCache()
    .put(
      "PJ_SESSION_" + token,
      "active",
      PJ_SESSION_TTL_SECONDS
    );

  return {
    success: true,
    token: token
  };
}


/* =========================================================
   PJ RESULTS
   ========================================================= */

function getPJResults(p) {
  if (!isPJSession_(p.token)) {
    return {
      success: false,
      unauthorized: true,
      message: "Sesi PJ tidak valid atau sudah berakhir."
    };
  }

  return {
    success: true,
    data: readAggregateResults_()
  };
}


function isPJSession_(token) {
  if (!token) {
    return false;
  }

  return Boolean(
    CacheService
      .getScriptCache()
      .get("PJ_SESSION_" + String(token))
  );
}


/* =========================================================
   READ AGGREGATE RESULTS
   ========================================================= */

function readAggregateResults_() {
  const ss = getSpreadsheet_();
  const sheet = getSheet_(ss, SHEET_RESULTS);

  const rows = sheet.getDataRange().getValues();

  const data = {
    candidate1: 0,
    candidate2: 0,
    candidate3: 0,
    studentVotes: 0,
    teacherVotes: 0,
    totalVotes: 0
  };

  rows.slice(1).forEach(row => {
    /*
     * SHEET RESULTS
     *
     * A Kandidat
     * B Suara Siswa
     * C Suara Guru
     * D Total
     */

    const candidate = Number(
      String(row[0]).replace(/\D/g, "")
    );

    const student = Number(row[1]) || 0;
    const teacher = Number(row[2]) || 0;

    if (
      candidate >= 1 &&
      candidate <= 3
    ) {
      data["candidate" + candidate] =
        student + teacher;
    }

    data.studentVotes += student;
    data.teacherVotes += teacher;
  });

  data.totalVotes =
    data.studentVotes +
    data.teacherVotes;

  return data;
}


/* =========================================================
   UTILITIES
   ========================================================= */

function hash_(category, identity) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    category + ":" + identity,
    Utilities.Charset.UTF_8
  );

  return bytes
    .map(b =>
      ("0" + (b & 255).toString(16)).slice(-2)
    )
    .join("");
}


function normalizeIdentity_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}


function normalizeCategory_(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}


function normalizeStatus_(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}


function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}