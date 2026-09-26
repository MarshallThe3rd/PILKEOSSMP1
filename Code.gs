/**
 * GOOGLE APPS SCRIPT BACKEND
 *
 * 1. Buat Google Spreadsheet.
 * 2. Isi SPREADSHEET_ID.
 * 3. Deploy sebagai Web App.
 * 4. Isi URL Web App ke script.js.
 */

const SPREADSHEET_ID = "GANTI_DENGAN_ID_SPREADSHEET";
const ADMIN_TOKEN = "GANTI_DENGAN_TOKEN_ADMIN";

const CANDIDATES = [1,2,3];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    const payload = body.payload || {};

    let result;
    if (action === "validateIdentity") result = validateIdentity(payload);
    else if (action === "submitVote") result = submitVote(payload);
    else throw new Error("Action tidak dikenal.");

    return json_(result);
  } catch (err) {
    return json_({success:false,message:err.message});
  }
}

function setupSystem() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  getOrCreate_(ss,"VOTES",["Timestamp","Kategori","IdentityHash","Kelas","Kandidat"]);
  getOrCreate_(ss,"RESULTS",["Kandidat","Suara Murid","Suara Guru","Total"]);
  rebuildResults_();
  return "Setup berhasil.";
}

function getOrCreate_(ss,name,headers){
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0)sh.appendRow(headers);
  sh.setFrozenRows(1);
}

function validateIdentity(p){
  const category=normalizeCategory_(p.category);
  const identity=normalizeIdentity_(p.identity);
  const className=String(p.className||"").trim();

  if(!["MURID","GURU"].includes(category))throw new Error("Kategori tidak valid.");
  if(!identity)throw new Error("Identitas wajib diisi.");
  if(category==="MURID"&&!className)throw new Error("Kelas wajib diisi.");

  const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("VOTES");
  if(hasHash_(sh,hash_(category,identity)))
    return {success:false,alreadyVoted:true,message:"Identitas ini sudah menggunakan hak suara."};

  return {success:true};
}

function submitVote(p){
  const lock=LockService.getScriptLock();
  lock.waitLock(10000);
  try{
    const category=normalizeCategory_(p.category);
    const identity=normalizeIdentity_(p.identity);
    const className=String(p.className||"").trim();
    const candidate=Number(p.candidateNumber);

    if(!["MURID","GURU"].includes(category))throw new Error("Kategori tidak valid.");
    if(!identity)throw new Error("Identitas wajib diisi.");
    if(category==="MURID"&&!className)throw new Error("Kelas wajib diisi.");
    if(!CANDIDATES.includes(candidate))throw new Error("Kandidat tidak valid.");

    const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("VOTES");
    const identityHash=hash_(category,identity);

    if(hasHash_(sh,identityHash))
      return {success:false,alreadyVoted:true,message:"Anda sudah menggunakan hak suara."};

    sh.appendRow([new Date(),category,identityHash,category==="MURID"?className:"",candidate]);
    rebuildResults_();
    return {success:true,message:"Suara berhasil direkam."};
  }finally{
    lock.releaseLock();
  }
}

function hasHash_(sh,target){
  const last=sh.getLastRow();
  if(last<=1)return false;
  return sh.getRange(2,3,last-1,1).getValues().some(r=>String(r[0])===target);
}

function rebuildResults_(){
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const v=ss.getSheetByName("VOTES");
  const r=ss.getSheetByName("RESULTS");
  const count={1:{MURID:0,GURU:0},2:{MURID:0,GURU:0},3:{MURID:0,GURU:0}};
  const last=v.getLastRow();
  if(last>1)v.getRange(2,1,last-1,5).getValues().forEach(x=>{const c=Number(x[4]),cat=String(x[1]);if(count[c]&&count[c][cat]!==undefined)count[c][cat]++});
  r.clearContents();
  r.appendRow(["Kandidat","Suara Murid","Suara Guru","Total"]);
  CANDIDATES.forEach(c=>{const m=count[c].MURID,g=count[c].GURU;r.appendRow(["Nomor "+c,m,g,m+g])});
  r.setFrozenRows(1);
}

function hash_(category,identity){
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,category+":"+identity,Utilities.Charset.UTF_8);
  return bytes.map(b=>("0"+(b&255).toString(16)).slice(-2)).join("");
}

function normalizeIdentity_(x){return String(x||"").trim().toUpperCase().replace(/\s+/g,"")}
function normalizeCategory_(x){return String(x||"").trim().toUpperCase()}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
