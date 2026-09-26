const PJ_API_URL = "https://script.google.com/macros/s/AKfycbwcanKYPNFhfW0YhGl5kbLVXkbME2_QfQ6fTp-83N2xZGM6ah0g_F1h7FUwUnjU5UZN/exec";
const POLL_INTERVAL_MS = 8000;

let pjSessionToken = "";
let pollTimer = null;

const $ = id => document.getElementById(id);

$("pjLoginForm").addEventListener("submit", loginPJ);
$("pjLogout").addEventListener("click", logoutPJ);

async function loginPJ(event) {
  event.preventDefault();
  setMessage("pjLoginMessage", "Memeriksa akses...", "");

  try {
    const result = await callPJApi("loginPJ", {
      username: $("pjUsername").value.trim(),
      password: $("pjPassword").value
    });

    if (!result.success) {
      setMessage("pjLoginMessage", result.message || "Akses ditolak.", "error");
      return;
    }

    pjSessionToken = result.token;
    $("pjLogin").hidden = true;
    $("pjDashboard").hidden = false;
    await refreshResults();
    pollTimer = setInterval(refreshResults, POLL_INTERVAL_MS);
  } catch (error) {
    setMessage("pjLoginMessage", "Login belum dapat diproses.", "error");
  }
}

async function refreshResults() {
  if (!pjSessionToken) return;

  try {
    const result = await callPJApi("getPJResults", {token: pjSessionToken});
    if (!result.success) {
      if (result.unauthorized) logoutPJ(result.message);
      else setMessage("pjDataMessage", result.message || "Data belum dapat diperbarui", "error");
      return;
    }

    renderResults(result.data);
    setMessage("pjDataMessage", "", "");
    $("pjUpdatedAt").textContent = `Terakhir diperbarui: ${new Date().toLocaleTimeString("id-ID")}`;
  } catch (error) {
    setMessage("pjDataMessage", "Data belum dapat diperbarui", "error");
  }
}

function renderResults(data) {
  const candidateTotals = [data.candidate1, data.candidate2, data.candidate3].map(value => Number(value) || 0);
  const highest = Math.max(...candidateTotals, 1);
  const totalVotes = Number(data.totalVotes) || 0;

  $("totalVotes").textContent = totalVotes;
  $("studentVotes").textContent = Number(data.studentVotes) || 0;
  $("teacherVotes").textContent = Number(data.teacherVotes) || 0;

  candidateTotals.forEach((votes, index) => {
    const candidateNumber = index + 1;
    $("candidate" + candidateNumber).textContent = `${votes} suara`;
    $("candidate" + candidateNumber + "Bar").style.width = `${Math.round((votes / highest) * 100)}%`;
  });

  renderDonut(candidateTotals, totalVotes);
}

function renderDonut(candidateTotals, totalVotes) {
  $("donutTotalVotes").textContent = totalVotes;
  let offset = 0;

  candidateTotals.forEach((votes, index) => {
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    const candidateNumber = index + 1;
    const segment = $("candidate" + candidateNumber + "Donut");

    segment.setAttribute("stroke-dasharray", `${percentage} ${100 - percentage}`);
    segment.setAttribute("stroke-dashoffset", `${-offset}`);
    $("candidate" + candidateNumber + "Percentage").textContent = `${percentage.toFixed(1)}%`;
    $("candidate" + candidateNumber + "LegendVotes").textContent = `${votes} suara`;
    offset += percentage;
  });
}

function logoutPJ(message = "") {
  clearInterval(pollTimer);
  pollTimer = null;
  pjSessionToken = "";
  $("pjDashboard").hidden = true;
  $("pjLogin").hidden = false;
  $("pjLoginForm").reset();
  setMessage("pjLoginMessage", message, message ? "error" : "");
  setMessage("pjDataMessage", "", "");
}

async function callPJApi(action, payload) {
  const response = await fetch(PJ_API_URL, {
    method: "POST",
    headers: {"Content-Type": "text/plain;charset=utf-8"},
    body: JSON.stringify({action, payload})
  });
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

function setMessage(id, message, type) {
  const element = $(id);
  element.textContent = message;
  element.className = `pj-message ${type}`.trim();
}
