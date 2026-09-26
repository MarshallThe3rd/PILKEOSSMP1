/*
 * MODE LOCAL:
 * Untuk preview desain, file ini memakai DEMO_MODE=true.
 *
 * MODE PRODUKSI:
 * Isi API_URL dengan URL Web App Google Apps Script.
 * Backend Code.gs di bawah menerima request JSON.
 */
const DEMO_MODE = false;
const API_URL = "https://script.google.com/macros/s/AKfycbwcanKYPNFhfW0YhGl5kbLVXkbME2_QfQ6fTp-83N2xZGM6ah0g_F1h7FUwUnjU5UZN/exec";

const CONFIG = {
  electionTitle: "Pemilihan Ketua dan Wakil Ketua OSIS",
  schoolName: "SMP NEGERI 1 SALATIGA",
  period: "2026 / 2027",
  classes: ["VII A","VII B","VII C","VII D","VII E","VII F","VII G","VII H","VIII A","VIII B","VIII C","VIII D","VIII E","VIII F","VIII G","VIII H","IX A","IX B","IX C","IX D","IX E","IX F","IX G","IX H"],
  candidates: [
    {number:1,chairman:"Nama Ketua 1",viceChairman:"Nama Wakil 1",chairmanPhoto:"assets/KETUA1.jpg",viceChairmanPhoto:"assets/WAKIL1.jpeg",vision:"Membangun OSIS yang aktif, kreatif, dan berprestasi.",mission:["Meningkatkan kegiatan siswa.","Membangun budaya sekolah yang positif.","Mendorong prestasi akademik dan nonakademik."]},
    {number:2,chairman:"Nama Ketua 2",viceChairman:"Nama Wakil 2",chairmanPhoto:"assets/KETUA2.jpeg",viceChairmanPhoto:"assets/WAKIL2.jpeg",vision:"Mewujudkan OSIS yang kolaboratif dan inovatif.",mission:["Meningkatkan kolaborasi siswa.","Membuat kegiatan yang relevan.","Menampung aspirasi siswa."]},
    {number:3,chairman:"Nama Ketua 3",viceChairman:"Nama Wakil 3",chairmanPhoto:"assets/KETUA3.jpeg",viceChairmanPhoto:"assets/WAKIL3.jpeg",vision:"Menciptakan lingkungan sekolah yang nyaman dan produktif.",mission:["Mengembangkan kegiatan positif.","Memperkuat solidaritas siswa.","Mendorong kreativitas dan kepemimpinan."]}
  ]
};

let state = {category:null,identity:null,className:"",selected:null};

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("schoolName").textContent = CONFIG.schoolName;
  $("electionTitle").textContent = CONFIG.electionTitle;
  $("period").textContent = CONFIG.period;
  CONFIG.classes.forEach(c => $("classInput").insertAdjacentHTML("beforeend", `<option value="${esc(c)}">${esc(c)}</option>`));
  renderCandidates();
  document.querySelectorAll(".choice-card").forEach(b => b.addEventListener("click", () => startIdentity(b.dataset.category)));
  $("backHome").onclick = () => show("home");
  $("identityForm").onsubmit = validateIdentity;
  $("cancelConfirm").onclick = closeModal;
  $("cancelConfirm2").onclick = closeModal;
  $("submitVote").onclick = submitVote;
});

function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");scrollTo(0,0)}
function startIdentity(category){
  state.category=category;
  $("identityTitle").textContent=category==="MURID"?"Data Murid":"Data Guru";
  $("identityDesc").textContent=category==="MURID"?"Masukkan NIS dan kelas Anda.":"Masukkan NIP atau ID Guru Anda.";
  $("identityLabel").textContent=category==="MURID"?"NIS":"NIP / ID Guru";
  $("identityInput").placeholder=category==="MURID"?"MASUKKAN NIS":"Masukkan NIP / ID Guru";
  $("classField").style.display=category==="MURID"?"block":"none";
  $("classInput").required=category==="MURID";
  show("identity");
}
async function validateIdentity(e){
  e.preventDefault();
  state.identity=$("identityInput").value.trim();
  state.className=state.category==="MURID"?$("classInput").value:"";
  if(!state.identity || (state.category==="MURID"&&!state.className)){toast("Lengkapi data pemilih.");return}
  loading(true);
  try{
    const result=await api("validateIdentity",{category:state.category,identity:state.identity,className:state.className});
    if(!result.success){toast(result.message||"Data tidak valid.");return}
    show("candidates");
  }catch(err){toast(err.message||"Gagal menghubungi server.");}
  finally{loading(false)}
}
function renderCandidates(){
  $("candidateGrid").innerHTML=CONFIG.candidates.map(c=>`
    <article class="candidate">
      <div class="candidate-top">
        <div class="number">PASANGAN CALON</div>
        <h3>NOMOR ${c.number}</h3>
        <div class="people">
          <div class="person"><img src="${attr(c.chairmanPhoto)}" alt="Ketua"><div class="person-name">${esc(c.chairman)}</div><div class="person-role">Ketua</div></div>
          <div class="person"><img src="${attr(c.viceChairmanPhoto)}" alt="Wakil"><div class="person-name">${esc(c.viceChairman)}</div><div class="person-role">Wakil Ketua</div></div>
        </div>
      </div>
      <div class="candidate-body">
        <strong>VISI</strong><p>${esc(c.vision)}</p>
        <strong>MISI</strong><ul>${c.mission.map(m=>`<li>${esc(m)}</li>`).join("")}</ul>
      </div>
      <button class="vote" data-number="${c.number}">PILIH PASANGAN ${c.number}</button>
    </article>`).join("");
  document.querySelectorAll(".vote").forEach(b=>b.onclick=()=>openConfirm(Number(b.dataset.number)));
}
function openConfirm(number){
  state.selected=CONFIG.candidates.find(c=>c.number===number);
  $("selectedCandidate").innerHTML=`PASANGAN NOMOR ${state.selected.number}<br><small>${esc(state.selected.chairman)} & ${esc(state.selected.viceChairman)}</small>`;
  $("confirmModal").classList.remove("hidden");
}
function closeModal(){$("confirmModal").classList.add("hidden")}
async function submitVote(){
  if(!state.selected)return;
  closeModal();loading(true);
  try{
    const result=await api("submitVote",{category:state.category,identity:state.identity,className:state.className,candidateNumber:state.selected.number});
    if(!result.success){toast(result.message||"Suara gagal direkam.");return}
    show("success");let n=3;$("countdown").textContent=n;
    const timer=setInterval(()=>{n--;$("countdown").textContent=n;if(n<=0){clearInterval(timer);reset();show("home")}},1000);
  }catch(err){toast(err.message||"Gagal menyimpan suara.");}
  finally{loading(false)}
}
async function api(action,payload){
  if(DEMO_MODE){
    await new Promise(r=>setTimeout(r,500));
    if(action==="validateIdentity")return {success:true};
    return {success:true};
  }
  const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,payload})});
  const data=await res.json();
  return data;
}
function reset(){state={category:null,identity:null,className:"",selected:null};$("identityInput").value="";$("classInput").value="";$("confirmModal").classList.add("hidden")}
function loading(v){$("loading").classList.toggle("hidden",!v)}
let toastTimer;function toast(msg){clearTimeout(toastTimer);$("toast").textContent=msg;$("toast").classList.add("show");toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2800)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function attr(v){return esc(v)}
