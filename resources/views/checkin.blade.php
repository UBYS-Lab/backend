<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
  <title>UBYS – Yoklama</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{min-height:100vh;background:linear-gradient(135deg,#0c2461 0%,#1a3a8f 100%);
         display:flex;align-items:center;justify-content:center;padding:20px;
         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
    .card{background:#fff;border-radius:20px;padding:36px 28px;width:100%;max-width:380px;
          box-shadow:0 24px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;align-items:center;gap:22px}
    .brand{display:flex;align-items:center;gap:10px}
    .brand-ico{width:44px;height:44px;background:#0c2461;border-radius:12px;display:flex;align-items:center;justify-content:center}
    .brand-ico svg{stroke:#fff;stroke-width:2.5;fill:none;width:22px;height:22px}
    .brand-name{font-size:21px;font-weight:800;color:#0c2461;letter-spacing:.3px}
    .state{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%}
    .spinner{width:52px;height:52px;border:4px solid #e4e7ec;border-top-color:#3b5bdb;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .ico{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center}
    .ico svg{stroke-width:2.5;fill:none;width:34px;height:34px}
    .ico.ok  {background:#dcfce7}.ico.ok  svg{stroke:#16a34a}
    .ico.err {background:#fee2e2}.ico.err svg{stroke:#dc2626}
    .ico.info{background:#e0f2fe}.ico.info svg{stroke:#0284c7}
    h2{font-size:22px;font-weight:800;color:#101828;text-align:center}
    .course{font-size:15px;font-weight:700;color:#3b5bdb;text-align:center}
    .sub{font-size:13px;color:#667085;text-align:center;line-height:1.65}
    .field{width:100%;display:flex;flex-direction:column;gap:6px}
    label{font-size:13px;font-weight:600;color:#344054}
    input{width:100%;border:1.5px solid #d0d5dd;border-radius:10px;padding:14px 16px;
          font-size:17px;outline:none;-webkit-appearance:none}
    input:focus{border-color:#3b5bdb;box-shadow:0 0 0 3px rgba(59,91,219,.12)}
    input.code-input{text-transform:uppercase;letter-spacing:4px;font-weight:700;text-align:center;font-size:22px}
    .token-badge{background:#eef4ff;border:1px solid #c7d7fd;border-radius:10px;padding:10px 18px;
                 font-size:24px;font-weight:800;color:#3b5bdb;letter-spacing:5px;text-align:center;width:100%}
    .btn{width:100%;padding:15px;border-radius:10px;border:none;font-size:16px;
         font-weight:700;cursor:pointer;transition:.15s;margin-top:2px}
    .btn-primary{background:#3b5bdb;color:#fff}
    .btn-primary:active{background:#2f4abf}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed}
    .btn-sec{background:#f2f4f7;color:#344054}
  </style>
</head>
<body>
<div class="card">
  <div class="brand">
    <div class="brand-ico">
      <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
    </div>
    <span class="brand-name">UBYS</span>
  </div>

  <!-- Form -->
  <div class="state" id="formState">
    <h2 style="font-size:19px">Yoklamaya Katıl</h2>

    @if($token)
      <div class="field">
        <label>Yoklama Kodu</label>
        <div class="token-badge">{{ $token }}</div>
      </div>
    @else
      <div class="field">
        <label for="tokenInput">Yoklama Kodu</label>
        <input id="tokenInput" class="code-input" type="text" placeholder="XXXXXXXX" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false">
      </div>
    @endif

    <div class="field">
      <label for="sno">Öğrenci Numarası</label>
      <input id="sno" type="text" placeholder="Öğrenci numaranızı girin" inputmode="text" autocomplete="username">
    </div>
    <button class="btn btn-primary" onclick="joinAttendance()">Yoklamaya Katıl</button>
  </div>

  <!-- Loading -->
  <div class="state" id="loadState" style="display:none">
    <div class="spinner"></div>
    <p class="sub">Kaydediliyorsunuz...</p>
  </div>

  <!-- Success -->
  <div class="state" id="okState" style="display:none">
    <div class="ico ok">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h2>Yoklama Alındı!</h2>
    <p class="course" id="courseName"></p>
    <p class="sub" id="okMsg"></p>
  </div>

  <!-- Already -->
  <div class="state" id="alreadyState" style="display:none">
    <div class="ico info">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h2>Zaten Kayıtlısınız</h2>
    <p class="sub" id="alreadyMsg"></p>
  </div>

  <!-- Error -->
  <div class="state" id="errState" style="display:none">
    <div class="ico err">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    </div>
    <h2>Hata</h2>
    <p class="sub" id="errMsg"></p>
    <button class="btn btn-sec" onclick="showForm()">Tekrar Dene</button>
  </div>
</div>

<script>
var PRESET='{{ $token }}';
function show(id){['formState','loadState','okState','alreadyState','errState'].forEach(function(s){document.getElementById(s).style.display=s===id?'flex':'none';});}
function showForm(){show('formState');}
document.getElementById('sno').addEventListener('keyup',function(e){if(e.key==='Enter')joinAttendance();});
function joinAttendance(){
  var sno=document.getElementById('sno').value.trim();
  if(!sno){alert('Öğrenci numaranızı girin.');return;}
  var tokenEl=document.getElementById('tokenInput');
  var token=PRESET||(tokenEl?tokenEl.value.trim().toUpperCase():'');
  if(!token){alert('Yoklama kodunu girin.');return;}
  show('loadState');
  fetch('/api/attendance/qr-checkin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({qr_token:token,student_no:sno})
  })
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.already){document.getElementById('alreadyMsg').textContent=d.message||'';show('alreadyState');}
    else if(d.success){document.getElementById('courseName').textContent=d.course_name||'';document.getElementById('okMsg').textContent=d.message||'Başarıyla kaydedildiniz.';show('okState');}
    else{document.getElementById('errMsg').textContent=d.message||'Bir hata oluştu.';show('errState');}
  })
  .catch(function(){document.getElementById('errMsg').textContent='Sunucuya bağlanılamadı.';show('errState');});
}
</script>
</body>
</html>
