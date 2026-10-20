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
    {number:1,chairman:"Wildan Azmi Syafi'a",viceChairman:"Aulia Nadhifa Zahra",chairmanPhoto:"assets/KETUA1.jpg",viceChairmanPhoto:"assets/WAKIL1.jpeg",vision:"Terealisasinya OSIS SMP Negeri 1 Salatiga sebagai organisasi yang menjadi wadah bagi siswa siswi dalam mengembangkan potensi dan karakter diri yang ASPIRATIF (Aktif, Suportif, Peduli, Inovatif, Religius, Amanah, Terampil, Inspiratif, Futuristis) dengan berlandaskan pada nilai-nilai Pancasila serta 7 Kebiasaan Anak Indonesia Hebat guna terwujudnya regenerasi OSIS berkualitas dan lingkungan SMP Negeri 1 Salatiga yang positif tanpa perundungan demi mendukung siswa-siswinya untuk unggul dalam berorganisasi maupun berprestasi.",mission:["Meningkatkan keimanan dan ketakwaan kepada Tuhan Yang Maha Esa melalui kegiatan keagamaan yang rutin, bermakna, serta mencerminkan sikap toleransi antarumat beragama.","Menumbuhkan karakter siswa-siswi yang nasionalis melalui penekanan nilai-nilai Pancasila dengan menerapkan 8 Dimensi Profil Lulusan dan Program Kerja OSIS yang berbudaya nusantara.","Mengimplementasikan 7 Kebiasaan Anak Indonesia Hebat melalui keteladanan, pembiasaan dalam peraturan dan kegiatan positif di lingkungan sekolah guna membangun karakter siswa siswi yang disiplin serta bertanggung jawab.","Mewujudkan karakter siswa-siswi yang bermoral dengan menumbuhkan rasa empati dan simpati siswa melalui pembiasaan 5S (Senyum, Salam, Sapa, Sopan, Santun) dan 4 Kata Ajaib yaitu Tolong, Maaf, Terimakasih dan Permisi guna menciptakan lingkungan yang berbudaya positif tanpa adanya perundungan.","Mengembangkan keterampilan, dan inovasi siswa-siswi melalui program kerja yang edukatif, menarik, dan bermanfaat sebagai wadah pengembangan minat, bakat, serta potensi untuk meraih prestasi.","Menumbuhkan karakter siswa yang peduli dan cinta pada lingkungan sekitarnya melalui pembiasaan Budaya LISA (Lihat Sampah Ambil) dan meningkatkan kepekaan siswa terhadap tanggung jawabnya dalam menjaga lingkungan sekitar melalui cara yang kreatif dan kegiatan yang menarik.","Mewujudkan ruang lingkup OSIS yang aspiratif, positif, dan suportif dengan menampung dan menindaklanjuti aspirasi siswa secara terbuka dan bertanggung jawab, sekaligus mendukung siswa-siswi untuk aktif dan terampil melalui kegiatan yang partisipatif serta berlandaskan sikap saling menghormati dan menghargai satu sama lain.","Mewujudkan OSIS yang futuristis dengan meningkatkan literasi digital siswa guna membentuk karakter yang adaptif terhadap perkembangan zaman dan kreatif melalui pemanfaatan serta pembiasaan kegiatan berbasis teknologi digital secara bijak."]},
    {number:2,chairman:"Khumaira Firda Larasati",viceChairman:"Antariksa Nata Adhi",chairmanPhoto:"assets/KETUA2.jpeg",viceChairmanPhoto:"assets/WAKIL2.jpeg",vision:"Menciptakan OSIS SMP Negeri 1 Salatiga yang dapat memberikan kepemimpinan adil dan bijaksana dalam membentuk sekolah yang bisa menciptakan siswa siswi yang memiliki sikap BERKREASI (Beriman, Kreatif, Empati, Adaptif, Solutif, dan Inspiratif) serta memiliki sikap yang SPESIAL (Sopan, Pandai, Enerjik, Amanah, dan Lemah manah) untuk mewujudkan lingkungan sekolah yang aman, nyaman, dan toleran.",mission:["Menjadikan siswa-siswi yang selalu beriman dan bertakwa serta beribadah kepada Tuhan Yang Maha Esa sesuai kepercayaan masing-masing dengan melalui kegiatan keagamaan yang rutin, inklusif, dan begitu bermakna.","Mengintegrasikan nilai-nilai kebangsaan, cinta tanah air, dan pengamalan Pancasila dalam setiap momentum peringatan hari besar nasional maupun program sekolah dengan menumbuhkan sikap toleransi, gotong royong, tanggung jawab, dan kepedulian terhadap sesama.","Mewujudkan keseimbangan antara prestasi akademik, non-akademik, dan keaktifan berorganisasi melalui program OSIS dan program sekolah yang inovatif, kreatif, serta mendukung pengembangan potensi siswa.","Membangun jiwa yang peduli terhadap pentingnya menjaga lingkungan alam di sekitar kita dan di manapun kita berada.","Mengoptimalkan penerapan 7 Kebiasaan Anak Indonesia Hebat melalui pembiasaan positif yang konsisten guna membentuk siswa yang mandiri, disiplin tinggi, berintegritas, dan bertanggung jawab.","Membudayakan gerakan 5S (Senyum, Sapa, Salam, Sopan, dan Santun) serta memperkuat gerakan anti-perundungan dan kepedulian lingkungan melalui kegiatan yang partisipatif demi menciptakan lingkungan sekolah dan interaksi sosial yang aman, nyaman, dan harmonis.","Membentuk pribadi yang cerdas dengan menguasai bahasa asing, tetapi tetap tidak melupakan Bahasa Indonesia sebagai identitas bangsa kita.","Mewujudkan OSIS sebagai organisasi yang mewadahi aspirasi dan jembatan komunikasi yang terbuka, responsif, dan transparan dalam menampung serta menindaklanjuti ide, kritik, dan saran siswa demi kemajuan sekolah."]},
    {number:3,chairman:"Jasmine Bellvania Allesha",viceChairman:"Maria Berta Krissanti",chairmanPhoto:"assets/KETUA3.jpeg",viceChairmanPhoto:"assets/WAKIL3.jpeg",vision:"Terwujudnya OSIS SMP Negeri 1 Salatiga sebagai wadah pengembangan diri yang inklusif untuk membentuk generasi BERDAYA (Beriman, Empati, Religius, Disiplin, Aspiratif, Yakin, dan Aktif) yang berlandaskan nilai-nilai Pancasila serta keimanan dan ketakwaan kepada Tuhan Yang Maha Esa. Visi ini diwujudkan melalui penerapan 7 Kebiasaan Anak Indonesia Hebat, pengembangan potensi akademik dan nonakademik, penumbuhan kreativitas dan inovasi, penguatan nasionalisme dan wawasan global, serta penerapan prinsip LESTARI (Lingkungan Elok, Sehat, Tertib, Asri, Rapi, dan Indah) melalui pembudayaan kepedulian terhadap lingkungan yang bersih, hijau, dan berkelanjutan, guna membentuk generasi yang berkarakter, berprestasi, berwawasan lingkungan, dan siap bersaing di tingkat internasional.",mission:["Meningkatkan keimanan dan ketakwaan kepada Tuhan Yang Maha Esa melalui kegiatan keagamaan, pembiasaan perilaku positif, serta penanaman nilai-nilai moral dan akhlak mulia dalam kehidupan sehari-hari.","Menumbuhkan semangat nasionalisme dan cinta tanah air dengan mengenalkan kekayaan budaya Indonesia, serta menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari.","Menanamkan budaya sopan santun dan saling menghormati melalui pembiasaan 5S (Senyum, Salam, Sapa, Sopan, dan Santun) guna membentuk murid yang ramah, peduli terhadap sesama, serta mampu menjaga sikap dan tutur kata.","Membangun budaya disiplin dan tanggung jawab dengan meningkatkan kesadaran untuk menaati tata tertib dan melaksanakan kewajiban secara konsisten guna membentuk murid yang tertib, mandiri, dan berintegritas.","Mengembangkan potensi akademik dan nonakademik murid melalui penyediaan wadah kegiatan yang sesuai dengan minat dan bakat serta mendorong partisipasi aktif dalam berbagai kegiatan dan kompetisi guna meningkatkan keterampilan dan prestasi.","Mendorong kreativitas, inovasi, dan kepedulian terhadap lingkungan dengan memberikan ruang bagi murid untuk menyampaikan ide, menghasilkan karya, serta mengembangkan program kreatif dan ramah lingkungan berdasarkan prinsip LESTARI (Lingkungan Elok, Sehat, Tertib, Asri, Rapi, dan Indah).","Mewujudkan OSIS SMP Negeri 1 Salatiga yang inklusif dan aspiratif dengan menyediakan ruang bagi murid untuk menyampaikan pendapat, menampung aspirasi, serta menindaklanjutinya secara terbuka, adil, dan bertanggung jawab.","Memperluas wawasan global dan meningkatkan daya saing internasional murid melalui penguatan literasi, kemampuan komunikasi, penguasaan teknologi, serta pengenalan perkembangan ilmu pengetahuan dan budaya dunia."]}
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
  $("identityInput").addEventListener("input", e => {
    if(state.category === "MURID") e.target.value=e.target.value.replace(/\D/g,"");
  });
});

function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");scrollTo(0,0)}
function startIdentity(category){
  state.category=category;
  $("identityTitle").textContent=category==="MURID"?"Data Siswa":"Data Guru dan Staf";
  $("identityDesc").textContent=category==="MURID"?"Masukkan NIS dan kelas Anda.":"Masukkan KODE GURU Anda.";
  $("identityLabel").textContent=category==="MURID"?"NIS":"KODE GURU";
  $("identityInput").placeholder=category==="MURID"?"MASUKKAN NIS":"Masukkan KODE GURU";
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
        <div class="number">PASLON</div>
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
      <button class="vote" data-number="${c.number}">PILIH PASLON ${c.number}</button>
    </article>`).join("");
  document.querySelectorAll(".vote").forEach(b=>b.onclick=()=>openConfirm(Number(b.dataset.number)));
}
function openConfirm(number){
  state.selected=CONFIG.candidates.find(c=>c.number===number);
  $("selectedCandidate").innerHTML=`PASLON NOMOR ${state.selected.number}<br><small>${esc(state.selected.chairman)} & ${esc(state.selected.viceChairman)}</small>`;
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
