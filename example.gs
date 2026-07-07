const CONFIG = {
  VISITORS_SHEET: "الزائرين",
  EXHIBITORS_SHEET: "العارضين",

  VISITOR_PREFIX: "SEREDO-VIS-2026-",
  EXHIBITOR_PREFIX: "SEREDO-EXH-2026-",

  GATE_PIN: "2026",

  SEREDO_LOGO_URL:
    "https://seredoexpo.sa/wp-content/uploads/2026/06/seredo-logo-removebg-preview.png",

  ATTENDANCE_HEADER: "حالة الحضور",
  ATTENDANCE_ABSENT: "لم يحضر",
  ATTENDANCE_PRESENT: "تم الحضور",

  VISITOR_HEADERS: [
    "تاريخ التسجيل",
    "رقم التسجيل",
    "اسم الشخص",
    "رقم الجوال",
    "الوظيفة",
    "الإيميل",
    "الشركة",
    "المدينة",
    "رابط التحقق",
    "حالة الحضور",
  ],

  EXHIBITOR_HEADERS: [
    "تاريخ التسجيل",
    "رقم التسجيل",
    "اسم الشخص",
    "رقم الجوال",
    "الوظيفة",
    "الإيميل",
    "الشركة",
    "المدينة",
  ],
};

function setupSheets() {
  const visitorsSheet = ensureSheet(
    CONFIG.VISITORS_SHEET,
    CONFIG.VISITOR_HEADERS,
  );
  ensureSheet(CONFIG.EXHIBITORS_SHEET, CONFIG.EXHIBITOR_HEADERS);
  prepareAttendanceColumn(visitorsSheet);
}

function doGet(e) {
  setupSheets();

  const params = e && e.parameter ? e.parameter : {};

  if (params.action === "verify") {
    return htmlOutput(renderVerifyPage(params.id || ""));
  }

  if (params.form === "exhibitor") {
    return htmlOutput(renderFormPage("exhibitor"));
  }

  return htmlOutput(renderFormPage("visitor"));
}

function doPost(e) {
  try {
    setupSheets();

    const payload = JSON.parse(
      (e && e.postData && e.postData.contents) || "{}",
    );
    const type = payload.type === "exhibitor" ? "exhibitor" : "visitor";

    delete payload.type;

    const result =
      type === "exhibitor"
        ? registerExhibitor(payload)
        : registerVisitor(payload);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        ok: false,
        message: error && error.message ? error.message : "تعذر حفظ التسجيل.",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function registerVisitor(data) {
  setupSheets();

  const sheet = getSheet(CONFIG.VISITORS_SHEET);
  const clean = sanitizeData(data);
  validateData(clean);

  const registrationId = nextId(CONFIG.VISITOR_PREFIX, sheet);
  const timestamp = new Date();

  const webAppUrl = ScriptApp.getService().getUrl();
  const verifyUrl =
    webAppUrl + "?action=verify&id=" + encodeURIComponent(registrationId);

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=" +
    encodeURIComponent(verifyUrl);

  let qrDataUrl = qrUrl;

  try {
    const qrBlob = UrlFetchApp.fetch(qrUrl).getBlob();
    qrDataUrl =
      "data:image/png;base64," + Utilities.base64Encode(qrBlob.getBytes());
  } catch (error) {
    qrDataUrl = qrUrl;
  }

  sheet.appendRow([
    timestamp,
    registrationId,
    clean.full_name,
    clean.phone,
    clean.job_title,
    clean.email,
    clean.company,
    clean.city,
    verifyUrl,
    CONFIG.ATTENDANCE_ABSENT,
  ]);

  const rowIndex = sheet.getLastRow();
  const headerMap = getHeaderMap(sheet);
  const attendanceCol = headerMap[CONFIG.ATTENDANCE_HEADER];

  if (attendanceCol) {
    applyAttendanceStyle(
      sheet,
      rowIndex,
      attendanceCol,
      CONFIG.ATTENDANCE_ABSENT,
    );
  }

  return {
    ok: true,
    type: "visitor",
    registration_id: registrationId,
    full_name: clean.full_name,
    verify_url: verifyUrl,
    qr_url: qrUrl,
    qr_data_url: qrDataUrl,
  };
}

function registerExhibitor(data) {
  setupSheets();

  const sheet = getSheet(CONFIG.EXHIBITORS_SHEET);
  const clean = sanitizeData(data);
  validateData(clean);

  const registrationId = nextId(CONFIG.EXHIBITOR_PREFIX, sheet);
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    registrationId,
    clean.full_name,
    clean.phone,
    clean.job_title,
    clean.email,
    clean.company,
    clean.city,
  ]);

  return {
    ok: true,
    type: "exhibitor",
    registration_id: registrationId,
    full_name: clean.full_name,
  };
}

function getSeredoLogoDataUrl() {
  const logoUrl = cleanValue(CONFIG.SEREDO_LOGO_URL);

  if (!logoUrl || logoUrl === "ضع_رابط_شعار_سيريدو_هنا") {
    return "";
  }

  try {
    const response = UrlFetchApp.fetch(logoUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
    });

    const code = response.getResponseCode();

    if (code < 200 || code >= 300) {
      return "";
    }

    const blob = response.getBlob();
    const contentType = blob.getContentType() || "image/png";

    return (
      "data:" +
      contentType +
      ";base64," +
      Utilities.base64Encode(blob.getBytes())
    );
  } catch (error) {
    return "";
  }
}

function getVisitorForGate(registrationId, pin) {
  validateGatePin(pin);

  const record = findVisitorRecordById(registrationId);

  if (!record) {
    throw new Error("لم يتم العثور على بيانات هذا الزائر.");
  }

  const visitor = record.data;
  const attendanceStatus =
    cleanValue(visitor[CONFIG.ATTENDANCE_HEADER]) || CONFIG.ATTENDANCE_ABSENT;

  return {
    ok: true,
    already_attended: attendanceStatus === CONFIG.ATTENDANCE_PRESENT,
    registration_id: cleanValue(visitor["رقم التسجيل"]),
    full_name: cleanValue(visitor["اسم الشخص"]),
    phone: cleanValue(visitor["رقم الجوال"]),
    job_title: cleanValue(visitor["الوظيفة"]),
    email: cleanValue(visitor["الإيميل"]),
    company: cleanValue(visitor["الشركة"]),
    city: cleanValue(visitor["المدينة"]),
    registered_at: formatDate(visitor["تاريخ التسجيل"]),
  };
}

function markVisitorAttended(registrationId, pin) {
  validateGatePin(pin);
  setupSheets();

  const record = findVisitorRecordById(registrationId);

  if (!record) {
    throw new Error("لم يتم العثور على بيانات هذا الزائر.");
  }

  const attendanceCol = record.headerMap[CONFIG.ATTENDANCE_HEADER];

  if (!attendanceCol) {
    throw new Error("لم يتم العثور على عمود حالة الحضور.");
  }

  record.sheet
    .getRange(record.rowIndex, attendanceCol)
    .setValue(CONFIG.ATTENDANCE_PRESENT);

  applyAttendanceStyle(
    record.sheet,
    record.rowIndex,
    attendanceCol,
    CONFIG.ATTENDANCE_PRESENT,
  );

  return {
    ok: true,
    registration_id: registrationId,
    attendance_status: CONFIG.ATTENDANCE_PRESENT,
  };
}

function validateGatePin(pin) {
  if (String(pin || "").trim() !== CONFIG.GATE_PIN) {
    throw new Error("رمز موظف البوابة غير صحيح.");
  }
}

function renderFormPage(type) {
  const isVisitor = type === "visitor";

  const title = isVisitor ? "تسجيل الزائرين" : "تسجيل العارضين";
  const subtitle = isVisitor
    ? "سجّل بياناتك، وسيظهر لك رمز QR الخاص بك لإبرازه عند دخول المعرض."
    : "سجّل بياناتك كعارض، وسيتم حفظ معلوماتك لدى فريق سيريدو.";

  const buttonText = "إرسال التسجيل";

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <base target="_top">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Tajawal:wght@700;800;900&display=swap');

    *{box-sizing:border-box}

    html,
    body{
      margin:0 !important;
      padding:0 !important;
      width:100% !important;
      background:transparent !important;
      overflow:hidden !important;
      font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;
      color:#111827;
      direction:rtl;
    }

    body.qr-open{
      overflow-y:auto !important;
    }

    .seredo-form-wrap{
      width:100%;
      max-width:650px;
      margin:0 auto;
      padding:0 !important;
      overflow:hidden !important;
    }

    body.qr-open .seredo-form-wrap{
      overflow:visible !important;
      padding-bottom:20px !important;
    }

    .seredo-card{
      width:100%;
      background:#ffffff;
      border:1px solid #D7E0EA;
      border-radius:24px;
      padding:26px 28px 28px !important;
      box-shadow:0 18px 50px rgba(15,23,51,.08);
      overflow:hidden !important;
    }

    body.qr-open .seredo-card{
      overflow:visible !important;
    }

    .eyebrow{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:7px 13px;
      border-radius:999px;
      background:rgba(37,57,110,.06);
      color:#25396e;
      font-size:12px;
      font-weight:800;
      margin-bottom:12px;
    }

    .eyebrow span{
      width:7px;
      height:7px;
      border-radius:50%;
      background:#0D5C63;
      display:inline-block;
    }

    h1{
      margin:0;
      font-family:"Tajawal","IBM Plex Sans Arabic",sans-serif;
      color:#25396e;
      font-size:34px;
      line-height:1.12;
      font-weight:900;
    }

    .lead{
      margin:10px 0 18px;
      color:#5b6478;
      font-size:14px;
      line-height:1.8;
      max-width:560px;
      font-weight:500;
    }

    .grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
    }

    .field{
      display:flex;
      flex-direction:column;
      gap:6px;
    }

    label{
      font-size:13px;
      font-weight:800;
      color:#25396e;
    }

    input{
      width:100%;
      height:46px;
      border-radius:13px;
      border:1px solid #D7E0EA;
      background:#F7FAFC;
      padding:0 14px;
      font-family:inherit;
      font-size:14px;
      outline:none;
      transition:.2s ease;
      text-align:right;
    }

    input[name="phone"]{
      direction:ltr;
      text-align:right;
      unicode-bidi:plaintext;
    }

    input::placeholder{
      color:#94A3B8;
      font-weight:500;
      text-align:right;
    }

    input:focus{
      background:#fff;
      border-color:#25396e;
      box-shadow:0 0 0 4px rgba(37,57,110,.10);
    }

    input.invalid{
      border-color:#DC2626 !important;
      background:#FEF2F2 !important;
      box-shadow:0 0 0 4px rgba(220,38,38,.08) !important;
    }

    .field-error{
      display:none;
      color:#B91C1C;
      font-size:12px;
      font-weight:800;
      line-height:1.6;
    }

    .field-error.show{
      display:block;
    }

    button{
      width:100%;
      min-height:54px;
      border:0;
      border-radius:999px;
      background:#25396e;
      color:#fff;
      font-family:inherit;
      font-size:15px;
      font-weight:900;
      cursor:pointer;
      margin-top:18px;
      transition:.25s ease;
      box-shadow:0 14px 30px rgba(37,57,110,.20);
    }

    button:hover{
      background:#16224a;
      transform:translateY(-2px);
    }

    button:disabled{
      opacity:.65;
      cursor:not-allowed;
      transform:none;
    }

    .result{
      margin-top:18px;
    }

    .success-box{
      border-radius:22px;
      padding:20px;
      background:linear-gradient(180deg,#F7FAFC 0%,#EEF3F8 100%);
      border:1px solid #D7E0EA;
      text-align:center;
    }

    .success-box h2{
      margin:0 0 8px;
      color:#25396e;
      font-family:"Tajawal","IBM Plex Sans Arabic",sans-serif;
      font-size:26px;
      font-weight:900;
    }

    .success-box p{
      margin:7px 0;
      color:#475569;
      font-size:14px;
      line-height:1.7;
    }

    .reg-id{
      display:inline-flex;
      padding:9px 14px;
      margin:10px 0;
      border-radius:999px;
      background:#fff;
      border:1px solid #D7E0EA;
      color:#25396e;
      font-weight:900;
      direction:ltr;
      font-size:13px;
    }

    .qr{
      width:210px;
      height:210px;
      margin:14px auto 8px;
      background:#fff;
      padding:9px;
      border-radius:17px;
      border:1px solid #D7E0EA;
      display:block;
    }

    .success-actions{
      display:flex;
      justify-content:center;
      gap:10px;
      flex-wrap:wrap;
      margin-top:14px;
    }

    .qr-btn{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:auto;
      min-height:42px;
      margin:0;
      padding:10px 18px;
      border-radius:999px;
      border:1px solid #25396e;
      background:#25396e;
      color:#ffffff;
      font-family:inherit;
      font-size:13px;
      font-weight:900;
      text-decoration:none;
      cursor:pointer;
      box-shadow:none;
      transition:.25s ease;
    }

    .qr-btn:hover{
      background:#16224a;
      transform:translateY(-2px);
    }

    .error{
      padding:13px 15px;
      border-radius:15px;
      background:#FEF2F2;
      color:#991B1B;
      border:1px solid #FECACA;
      font-weight:700;
      line-height:1.7;
      font-size:14px;
    }

    @media(max-width:640px){
      html,
      body{
        overflow:auto !important;
      }

      .seredo-form-wrap{
        max-width:100%;
        padding:0 10px 10px !important;
      }

      .seredo-card{
        border-radius:22px;
        padding:22px 18px !important;
      }

      h1{
        font-size:30px;
      }

      .grid{
        grid-template-columns:1fr;
      }

      input{
        height:46px;
      }

      .qr{
        width:200px;
        height:200px;
      }
    }
  </style>
</head>

<body>
  <div class="seredo-form-wrap">
    <div class="seredo-card">
      <div class="eyebrow"><span></span> سيريدو 2026</div>
      <h1>${title}</h1>
      <p class="lead">${subtitle}</p>

      <form id="seredoForm" novalidate>
        <div class="grid">
          <div class="field">
            <label>اسم الشخص</label>
            <input name="full_name" type="text" required autocomplete="name" placeholder="الاسم الكامل">
            <span class="field-error" data-error-for="full_name"></span>
          </div>

          <div class="field">
            <label>رقم الجوال</label>
            <input name="phone" type="tel" required inputmode="tel" autocomplete="tel" placeholder="رقم الجوال" dir="ltr">
            <span class="field-error" data-error-for="phone"></span>
          </div>

          <div class="field">
            <label>الوظيفة</label>
            <input name="job_title" type="text" required autocomplete="organization-title" placeholder="الوظيفة">
            <span class="field-error" data-error-for="job_title"></span>
          </div>

          <div class="field">
            <label>الإيميل</label>
            <input name="email" type="email" required autocomplete="email" placeholder="البريد الإلكتروني">
            <span class="field-error" data-error-for="email"></span>
          </div>

          <div class="field">
            <label>الشركة</label>
            <input name="company" type="text" required autocomplete="organization" placeholder="اسم الشركة">
            <span class="field-error" data-error-for="company"></span>
          </div>

          <div class="field">
            <label>المدينة</label>
            <input name="city" type="text" required autocomplete="address-level2" placeholder="المدينة">
            <span class="field-error" data-error-for="city"></span>
          </div>
        </div>

        <button id="submitBtn" type="submit">${buttonText}</button>
      </form>

      <div id="result" class="result"></div>
    </div>
  </div>

  <script>
    const FORM_TYPE = '${type}';
    const form = document.getElementById('seredoForm');
    const btn = document.getElementById('submitBtn');
    const result = document.getElementById('result');

    const rules = {
      full_name: {
        message: 'اكتب الاسم بالأحرف فقط بدون أرقام أو رموز.',
        test: function(value){
          return /^[A-Za-z\\u0600-\\u06FF\\s]{2,}$/.test(value.trim());
        }
      },
      phone: {
        message: 'رقم الجوال يجب أن يكون 10 أرقام، أو مع رمز الدولة بصيغة 13 خانة مثل +966500000000.',
        test: function(value){
          const v = value.trim();
          return /^\\d{10}$/.test(v) || /^\\+\\d{12}$/.test(v) || /^\\d{13}$/.test(v);
        }
      },
      job_title: {
        message: 'هذا الحقل مطلوب.',
        test: function(value){
          return value.trim().length > 0;
        }
      },
      email: {
        message: 'اكتب بريدًا إلكترونيًا صحيحًا.',
        test: function(value){
          return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
        }
      },
      company: {
        message: 'هذا الحقل مطلوب.',
        test: function(value){
          return value.trim().length > 0;
        }
      },
      city: {
        message: 'هذا الحقل مطلوب.',
        test: function(value){
          return value.trim().length > 0;
        }
      }
    };

    function setFieldError(name, message){
      const input = form.querySelector('[name="' + name + '"]');
      const error = form.querySelector('[data-error-for="' + name + '"]');

      if(input){
        input.classList.add('invalid');
      }

      if(error){
        error.textContent = message;
        error.classList.add('show');
      }
    }

    function clearFieldError(name){
      const input = form.querySelector('[name="' + name + '"]');
      const error = form.querySelector('[data-error-for="' + name + '"]');

      if(input){
        input.classList.remove('invalid');
      }

      if(error){
        error.textContent = '';
        error.classList.remove('show');
      }
    }

    function validateForm(){
      let valid = true;
      let firstInvalid = null;

      Object.keys(rules).forEach(function(name){
        const input = form.querySelector('[name="' + name + '"]');
        const value = input ? input.value : '';

        clearFieldError(name);

        if(!value.trim()){
          setFieldError(name, 'هذا الحقل مطلوب.');
          valid = false;
          if(!firstInvalid) firstInvalid = input;
          return;
        }

        if(!rules[name].test(value)){
          setFieldError(name, rules[name].message);
          valid = false;
          if(!firstInvalid) firstInvalid = input;
        }
      });

      if(firstInvalid){
        firstInvalid.focus();
      }

      return valid;
    }

    Object.keys(rules).forEach(function(name){
      const input = form.querySelector('[name="' + name + '"]');
      if(input){
        input.addEventListener('input', function(){
          clearFieldError(name);
        });
      }
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();

      result.innerHTML = '';
      document.body.classList.remove('qr-open');

      if(!validateForm()){
        result.innerHTML = '<div class="error">يرجى تصحيح الحقول المطلوبة قبل إرسال التسجيل.</div>';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'جاري إرسال التسجيل...';

      const payload = Object.fromEntries(new FormData(form).entries());

      const done = function(res){
        btn.disabled = false;
        btn.textContent = '${buttonText}';

        if(!res || !res.ok){
          result.innerHTML = '<div class="error">حدث خطأ أثناء التسجيل، حاول مرة أخرى.</div>';
          return;
        }

        form.reset();

        if(FORM_TYPE === 'visitor'){
          const qrImage = res.qr_data_url || res.qr_url;

          result.innerHTML =
            '<div class="success-box">' +
              '<h2>تم تسجيلك بنجاح</h2>' +
              '<p>احتفظ برمز QR التالي لإبرازه عند دخول معرض سيريدو.</p>' +
              '<div class="reg-id">' + res.registration_id + '</div>' +
              '<img class="qr" src="' + qrImage + '" alt="QR Code">' +
              '<p>يرجى حفظ رمز QR أو تحميله، وإبرازه لموظف البوابة عند الدخول.</p>' +
              '<div class="success-actions">' +
                '<button class="qr-btn" type="button" id="downloadQrBtn">تحميل QR</button>' +
              '</div>' +
            '</div>';

          document.body.classList.add('qr-open');

          const downloadQrBtn = document.getElementById('downloadQrBtn');
          if(downloadQrBtn){
            downloadQrBtn.addEventListener('click', function(){
              const originalText = downloadQrBtn.textContent;
              downloadQrBtn.disabled = true;
              downloadQrBtn.textContent = 'جاري تجهيز البطاقة...';

              const downloadData = {
                qrImage: qrImage,
                registrationId: res.registration_id,
                fullName: res.full_name || ''
              };

              google.script.run
                .withSuccessHandler(function(logoDataUrl){
                  downloadData.logoDataUrl = logoDataUrl || '';
                  downloadVisitorQrCard(downloadData);
                  downloadQrBtn.disabled = false;
                  downloadQrBtn.textContent = originalText;
                })
                .withFailureHandler(function(){
                  downloadData.logoDataUrl = '';
                  downloadVisitorQrCard(downloadData);
                  downloadQrBtn.disabled = false;
                  downloadQrBtn.textContent = originalText;
                })
                .getSeredoLogoDataUrl();
            });
          }

          setTimeout(function(){
            result.scrollIntoView({
              behavior:'smooth',
              block:'start'
            });
          }, 120);

        } else {
          result.innerHTML =
            '<div class="success-box">' +
              '<h2>تم إرسال طلبك بنجاح</h2>' +
              '<p>شكرًا لك، تم حفظ بياناتك ضمن تسجيلات العارضين.</p>' +
              '<div class="reg-id">' + res.registration_id + '</div>' +
            '</div>';
        }
      };

      const fail = function(err){
        btn.disabled = false;
        btn.textContent = '${buttonText}';
        result.innerHTML = '<div class="error">' + (err && err.message ? err.message : 'حدث خطأ أثناء الإرسال.') + '</div>';
      };

      if(FORM_TYPE === 'visitor'){
        google.script.run.withSuccessHandler(done).withFailureHandler(fail).registerVisitor(payload);
      } else {
        google.script.run.withSuccessHandler(done).withFailureHandler(fail).registerExhibitor(payload);
      }
    });

    function loadImage(src){
      return new Promise(function(resolve, reject){
        if(!src){
          reject(new Error('empty image'));
          return;
        }

        const img = new Image();
        img.onload = function(){
          resolve(img);
        };
        img.onerror = function(){
          reject(new Error('image load error'));
        };
        img.src = src;
      });
    }

    function roundRect(ctx, x, y, w, h, r){
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function drawCenteredWrappedText(ctx, text, centerX, y, maxWidth, lineHeight){
      const words = String(text || '').split(' ');
      let line = '';
      const lines = [];

      for(let i = 0; i < words.length; i++){
        const testLine = line ? line + ' ' + words[i] : words[i];
        const metrics = ctx.measureText(testLine);

        if(metrics.width > maxWidth && line){
          lines.push(line);
          line = words[i];
        }else{
          line = testLine;
        }
      }

      if(line){
        lines.push(line);
      }

      lines.forEach(function(item, index){
        ctx.fillText(item, centerX, y + index * lineHeight);
      });

      return lines.length * lineHeight;
    }

    function downloadCanvas(canvas, filename){
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function drawFallbackLogo(ctx, x, y){
      ctx.save();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'ltr';

      ctx.fillStyle = '#25396e';
      ctx.font = '900 62px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
      ctx.fillText('SEREDO', x, y - 8);

      ctx.fillStyle = '#717273';
      ctx.font = '800 24px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
      ctx.fillText('EXPO 2026', x, y + 42);

      ctx.restore();
    }

    async function downloadVisitorQrCard(data){
      try{
        const canvas = document.createElement('canvas');
        const width = 1080;
        const height = 1500;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#F7FAFC';
        ctx.fillRect(0, 0, width, height);

        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#FFFFFF');
        bgGradient.addColorStop(1, '#EEF3F8');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#25396e';
        ctx.beginPath();
        ctx.arc(120, 120, 260, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.07;
        ctx.beginPath();
        ctx.arc(970, 1320, 310, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = 'rgba(15,23,42,0.14)';
        ctx.shadowBlur = 46;
        ctx.shadowOffsetY = 22;

        roundRect(ctx, 90, 85, 900, 1330, 44);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();

        roundRect(ctx, 90, 85, 900, 1330, 44);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#D7E0EA';
        ctx.stroke();

        ctx.save();
        roundRect(ctx, 90, 85, 900, 245, 44);
        ctx.clip();

        const headerGradient = ctx.createLinearGradient(90, 85, 990, 330);
        headerGradient.addColorStop(0, '#FFFFFF');
        headerGradient.addColorStop(1, '#F3F6FA');

        ctx.fillStyle = headerGradient;
        ctx.fillRect(90, 85, 900, 245);

        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#25396e';
        ctx.beginPath();
        ctx.arc(195, 115, 170, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.07;
        ctx.fillStyle = '#0D5C63';
        ctx.beginPath();
        ctx.arc(850, 105, 175, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#25396e';
        ctx.fillRect(90, 324, 900, 6);

        ctx.restore();

        roundRect(ctx, 90, 85, 900, 245, 44);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#D7E0EA';
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = 'rgba(15,23,42,0.10)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 10;

        roundRect(ctx, 265, 132, 550, 150, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();

        roundRect(ctx, 265, 132, 550, 150, 30);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#E2E8F0';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const logoBoxX = width / 2;
        const logoBoxY = 207;

        if(data.logoDataUrl){
          try{
            const logoImg = await loadImage(data.logoDataUrl);
            const maxLogoW = 430;
            const maxLogoH = 115;
            const ratio = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
            const logoW = logoImg.width * ratio;
            const logoH = logoImg.height * ratio;

            ctx.drawImage(
              logoImg,
              logoBoxX - logoW / 2,
              logoBoxY - logoH / 2,
              logoW,
              logoH
            );
          }catch(e){
            drawFallbackLogo(ctx, logoBoxX, logoBoxY);
          }
        }else{
          drawFallbackLogo(ctx, logoBoxX, logoBoxY);
        }

        ctx.save();
        ctx.fillStyle = '#25396e';
        ctx.font = '900 50px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
        ctx.direction = 'rtl';
        drawCenteredWrappedText(
          ctx,
          'معرض سيريدو العقاري بدورتة الخامسة - جدة',
          width / 2,
          405,
          780,
          62
        );
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#717273';
        ctx.font = '800 30px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
        ctx.direction = 'rtl';
        ctx.fillText('بطاقة دخول الزائر', width / 2, 520);
        ctx.restore();

        ctx.save();
        roundRect(ctx, 280, 565, 520, 68, 34);
        ctx.fillStyle = '#F7FAFC';
        ctx.fill();
        ctx.strokeStyle = '#D7E0EA';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#25396e';
        ctx.font = '900 28px Arial, sans-serif';
        ctx.direction = 'ltr';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.registrationId || '', width / 2, 600);
        ctx.restore();

        const qrSize = 430;
        const qrX = (width - qrSize) / 2;
        const qrY = 690;

        ctx.save();
        ctx.shadowColor = 'rgba(15,23,42,0.12)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 12;

        roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 38);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();

        roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 38);
        ctx.strokeStyle = '#D7E0EA';
        ctx.lineWidth = 3;
        ctx.stroke();

        try{
          const qrImg = await loadImage(data.qrImage);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        }catch(e){
          ctx.save();
          ctx.fillStyle = '#FEF2F2';
          roundRect(ctx, qrX, qrY, qrSize, qrSize, 20);
          ctx.fill();

          ctx.fillStyle = '#991B1B';
          ctx.font = '800 28px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
          ctx.direction = 'rtl';
          ctx.textAlign = 'center';
          ctx.fillText('تعذر تحميل رمز QR', width / 2, qrY + qrSize / 2);
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = '#25396e';
        ctx.font = '900 34px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        drawCenteredWrappedText(
          ctx,
          'يرجى عرض رمز QR هذا للموظف عند البوابة للدخول إلى المعرض',
          width / 2,
          1215,
          760,
          48
        );
        ctx.restore();

        if(data.fullName){
          ctx.save();
          ctx.fillStyle = '#64748B';
          ctx.font = '800 26px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
          ctx.direction = 'rtl';
          ctx.textAlign = 'center';
          drawCenteredWrappedText(
            ctx,
            data.fullName,
            width / 2,
            1320,
            720,
            40
          );
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = '#D7E0EA';
        roundRect(ctx, 210, 1368, 660, 2, 1);
        ctx.fill();

        ctx.fillStyle = '#717273';
        ctx.font = '700 22px Tajawal, IBM Plex Sans Arabic, Arial, sans-serif';
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.fillText('SEREDO 2026', width / 2, 1398);
        ctx.restore();

        downloadCanvas(canvas, 'SEREDO-ENTRY-' + (data.registrationId || 'QR') + '.png');

      }catch(error){
        downloadQrImage(data.qrImage, 'SEREDO-QR-' + (data.registrationId || 'QR') + '.png');
      }
    }

    function downloadQrImage(dataUrl, filename){
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  </script>
</body>
</html>`;
}

function renderVerifyPage(id) {
  const safeId = cleanValue(id);

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <base target="_top">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Tajawal:wght@700;800;900&display=swap');

    *{box-sizing:border-box}

    body{
      margin:0;
      background:linear-gradient(180deg,#F7FAFC 0%,#EEF3F8 100%);
      font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;
      direction:rtl;
      color:#111827;
    }

    .wrap{
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
    }

    .card{
      width:min(680px,100%);
      background:#fff;
      border:1px solid #D7E0EA;
      border-radius:28px;
      padding:34px;
      box-shadow:0 18px 50px rgba(15,23,51,.08);
    }

    .gate-screen{
      text-align:center;
    }

    .lock{
      width:58px;
      height:58px;
      border-radius:20px;
      margin:0 auto 16px;
      background:rgba(37,57,110,.08);
      color:#25396e;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:26px;
      font-weight:900;
    }

    h1{
      margin:0;
      color:#25396e;
      font-family:"Tajawal","IBM Plex Sans Arabic",sans-serif;
      font-size:38px;
      font-weight:900;
      line-height:1.15;
    }

    .lead{
      margin:12px auto 20px;
      color:#64748b;
      line-height:1.9;
      max-width:520px;
      font-size:15px;
      font-weight:600;
    }

    .pin-box{
      display:flex;
      gap:10px;
      max-width:420px;
      margin:0 auto;
    }

    input{
      width:100%;
      height:52px;
      border-radius:999px;
      border:1px solid #D7E0EA;
      background:#F7FAFC;
      padding:0 18px;
      font-family:inherit;
      font-size:16px;
      outline:none;
      text-align:center;
      direction:ltr;
      font-weight:900;
    }

    input:focus{
      background:#fff;
      border-color:#25396e;
      box-shadow:0 0 0 4px rgba(37,57,110,.10);
    }

    button{
      border:0;
      border-radius:999px;
      background:#25396e;
      color:#fff;
      min-height:52px;
      padding:12px 24px;
      font-family:inherit;
      font-size:15px;
      font-weight:900;
      cursor:pointer;
      transition:.25s ease;
      white-space:nowrap;
    }

    button:hover{
      background:#16224a;
      transform:translateY(-2px);
    }

    button:disabled{
      opacity:.65;
      cursor:not-allowed;
      transform:none;
    }

    .error-note{
      margin:14px auto 0;
      display:none;
      max-width:520px;
      text-align:center;
      color:#991B1B;
      background:#FEF2F2;
      border:1px solid #FECACA;
      border-radius:14px;
      padding:12px;
      font-size:14px;
      font-weight:900;
      line-height:1.7;
    }

    .error-note.show{
      display:block;
    }

    .visitor-screen{
      display:none;
    }

    .visitor-screen.show{
      display:block;
    }

    .status{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:9px 15px;
      border-radius:999px;
      background:#ECFDF5;
      color:#047857;
      font-weight:900;
      font-size:14px;
      margin-bottom:16px;
    }

    .status span{
      width:8px;
      height:8px;
      border-radius:50%;
      background:#10B981;
    }

    .id{
      margin:14px 0 24px;
      display:inline-flex;
      padding:10px 16px;
      border-radius:999px;
      background:#F7FAFC;
      border:1px solid #D7E0EA;
      color:#25396e;
      direction:ltr;
      font-weight:900;
    }

    .data{
      display:grid;
      gap:12px;
    }

    .row{
      display:grid;
      grid-template-columns:150px 1fr;
      gap:12px;
      padding:14px 16px;
      border-radius:16px;
      background:#F7FAFC;
      border:1px solid #D7E0EA;
    }

    .label{
      color:#5b6478;
      font-weight:800;
    }

    .value{
      color:#111827;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .actions{
      margin-top:22px;
      display:flex;
      justify-content:center;
      gap:12px;
      flex-wrap:wrap;
    }

    .attend-btn{
      background:#166534;
      box-shadow:0 14px 28px rgba(22,101,52,.18);
    }

    .attend-btn:hover{
      background:#14532D;
    }

    .done-note{
      margin-top:14px;
      display:none;
      text-align:center;
      color:#166534;
      background:#DCFCE7;
      border:1px solid #86EFAC;
      border-radius:14px;
      padding:12px;
      font-size:14px;
      font-weight:900;
      line-height:1.7;
    }

    .done-note.show{
      display:block;
    }

    @media(max-width:560px){
      .card{padding:24px;border-radius:22px}
      h1{font-size:30px}
      .pin-box{flex-direction:column}
      .row{grid-template-columns:1fr;gap:4px}
      .attend-btn{width:100%}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">

      <div id="gateScreen" class="gate-screen">
        <div class="lock">🔒</div>
        <h1>دخول موظف البوابة</h1>
        <p class="lead">أدخل رمز موظف البوابة لعرض بيانات الزائر وتسجيل حضوره.</p>

        <div class="pin-box">
          <input id="gatePin" type="password" placeholder="رمز الدخول" autocomplete="off">
          <button id="loadVisitorBtn" type="button">عرض البيانات</button>
        </div>

        <div id="gateError" class="error-note"></div>
      </div>

      <div id="visitorScreen" class="visitor-screen">
        <div class="status"><span></span> بيانات الزائر مؤكدة</div>
        <h1>بيانات الزائر</h1>
        <div id="visitorId" class="id"></div>

        <div class="data">
          <div class="row"><div class="label">اسم الشخص</div><div id="vName" class="value"></div></div>
          <div class="row"><div class="label">رقم الجوال</div><div id="vPhone" class="value"></div></div>
          <div class="row"><div class="label">الوظيفة</div><div id="vJob" class="value"></div></div>
          <div class="row"><div class="label">الإيميل</div><div id="vEmail" class="value"></div></div>
          <div class="row"><div class="label">الشركة</div><div id="vCompany" class="value"></div></div>
          <div class="row"><div class="label">المدينة</div><div id="vCity" class="value"></div></div>
          <div class="row"><div class="label">تاريخ التسجيل</div><div id="vDate" class="value"></div></div>
        </div>

        <div class="actions">
          <button id="confirmAttendanceBtn" class="attend-btn" type="button">تسجيل حضور الزائر</button>
        </div>

        <div id="doneNote" class="done-note"></div>
        <div id="visitorError" class="error-note"></div>
      </div>

    </div>
  </div>

  <script>
    const REGISTRATION_ID = ${JSON.stringify(safeId)};

    const gateScreen = document.getElementById('gateScreen');
    const visitorScreen = document.getElementById('visitorScreen');
    const gatePin = document.getElementById('gatePin');
    const loadVisitorBtn = document.getElementById('loadVisitorBtn');
    const gateError = document.getElementById('gateError');

    const confirmAttendanceBtn = document.getElementById('confirmAttendanceBtn');
    const doneNote = document.getElementById('doneNote');
    const visitorError = document.getElementById('visitorError');

    let CURRENT_PIN = '';

    function setText(id, value){
      document.getElementById(id).textContent = value || '-';
    }

    function showError(box, message){
      box.textContent = message || 'حدث خطأ، حاول مرة أخرى.';
      box.classList.add('show');
    }

    function clearError(box){
      box.textContent = '';
      box.classList.remove('show');
    }

    loadVisitorBtn.addEventListener('click', function(){
      clearError(gateError);

      CURRENT_PIN = gatePin.value.trim();

      if(!CURRENT_PIN){
        showError(gateError, 'يرجى إدخال رمز موظف البوابة.');
        return;
      }

      loadVisitorBtn.disabled = true;
      loadVisitorBtn.textContent = 'جاري التحقق...';

      google.script.run
        .withSuccessHandler(function(res){
          loadVisitorBtn.disabled = false;
          loadVisitorBtn.textContent = 'عرض البيانات';

          if(!res || !res.ok){
            showError(gateError, 'تعذر عرض بيانات الزائر.');
            return;
          }

          gateScreen.style.display = 'none';
          visitorScreen.classList.add('show');

          setText('visitorId', res.registration_id);
          setText('vName', res.full_name);
          setText('vPhone', res.phone);
          setText('vJob', res.job_title);
          setText('vEmail', res.email);
          setText('vCompany', res.company);
          setText('vCity', res.city);
          setText('vDate', res.registered_at);

          if(res.already_attended){
            confirmAttendanceBtn.remove();
            doneNote.textContent = 'تم تسجيل حضور هذا الزائر مسبقًا.';
            doneNote.classList.add('show');
          }
        })
        .withFailureHandler(function(err){
          loadVisitorBtn.disabled = false;
          loadVisitorBtn.textContent = 'عرض البيانات';
          showError(gateError, err && err.message ? err.message : 'رمز الدخول غير صحيح أو حدث خطأ.');
        })
        .getVisitorForGate(REGISTRATION_ID, CURRENT_PIN);
    });

    gatePin.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        loadVisitorBtn.click();
      }
    });

    confirmAttendanceBtn.addEventListener('click', function(){
      clearError(visitorError);

      confirmAttendanceBtn.disabled = true;
      confirmAttendanceBtn.textContent = 'جاري تسجيل الحضور...';

      google.script.run
        .withSuccessHandler(function(res){
          if(res && res.ok){
            confirmAttendanceBtn.remove();
            doneNote.textContent = 'تم تسجيل حضور هذا الزائر بنجاح.';
            doneNote.classList.add('show');
          }else{
            confirmAttendanceBtn.disabled = false;
            confirmAttendanceBtn.textContent = 'تسجيل حضور الزائر';
            showError(visitorError, 'تعذر تسجيل الحضور، حاول مرة أخرى.');
          }
        })
        .withFailureHandler(function(err){
          confirmAttendanceBtn.disabled = false;
          confirmAttendanceBtn.textContent = 'تسجيل حضور الزائر';
          showError(visitorError, err && err.message ? err.message : 'حدث خطأ أثناء تسجيل الحضور.');
        })
        .markVisitorAttended(REGISTRATION_ID, CURRENT_PIN);
    });
  </script>
</body>
</html>`;
}

function findVisitorById(id) {
  const record = findVisitorRecordById(id);
  return record ? record.data : null;
}

function findVisitorRecordById(id) {
  if (!id) return null;

  const sheet = getSheet(CONFIG.VISITORS_SHEET);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return null;

  const headers = values[0].map(function (header) {
    return String(header || "").trim();
  });

  const headerMap = {};

  headers.forEach(function (header, index) {
    if (header) {
      headerMap[header] = index + 1;
    }
  });

  const idCol = headerMap["رقم التسجيل"];
  const attendanceCol = headerMap[CONFIG.ATTENDANCE_HEADER];

  if (!idCol) return null;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const regId = String(row[idCol - 1] || "").trim();

    if (regId === String(id).trim()) {
      const obj = {};

      headers.forEach(function (header, index) {
        if (header) {
          obj[header] = row[index];
        }
      });

      if (!obj[CONFIG.ATTENDANCE_HEADER]) {
        obj[CONFIG.ATTENDANCE_HEADER] = CONFIG.ATTENDANCE_ABSENT;

        if (attendanceCol) {
          sheet
            .getRange(i + 1, attendanceCol)
            .setValue(CONFIG.ATTENDANCE_ABSENT);
          applyAttendanceStyle(
            sheet,
            i + 1,
            attendanceCol,
            CONFIG.ATTENDANCE_ABSENT,
          );
        }
      }

      return {
        sheet: sheet,
        rowIndex: i + 1,
        headers: headers,
        headerMap: headerMap,
        data: obj,
      };
    }
  }

  return null;
}

function ensureSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    styleHeaderRow(sheet, headers.length);
    return sheet;
  }

  const maxColumns = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet
    .getRange(1, 1, 1, maxColumns)
    .getValues()[0]
    .map(function (value) {
      return String(value || "").trim();
    });

  const isEmpty = currentHeaders.every(function (cell) {
    return cell === "";
  });

  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeaderRow(sheet, headers.length);
    return sheet;
  }

  headers.forEach(function (header) {
    if (currentHeaders.indexOf(header) === -1) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(header);
    }
  });

  styleHeaderRow(sheet, sheet.getLastColumn());

  return sheet;
}

function prepareAttendanceColumn(sheet) {
  const headerMap = getHeaderMap(sheet);
  const attendanceCol = headerMap[CONFIG.ATTENDANCE_HEADER];

  if (!attendanceCol) return;

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return;

  for (let row = 2; row <= lastRow; row++) {
    const cell = sheet.getRange(row, attendanceCol);
    const value = cleanValue(cell.getValue()) || CONFIG.ATTENDANCE_ABSENT;

    cell.setValue(value);
    applyAttendanceStyle(sheet, row, attendanceCol, value);
  }
}

function applyAttendanceStyle(sheet, rowIndex, colIndex, value) {
  const cell = sheet.getRange(rowIndex, colIndex);
  const clean = cleanValue(value);

  if (clean === CONFIG.ATTENDANCE_PRESENT) {
    cell
      .setBackground("#DCFCE7")
      .setFontColor("#166534")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  } else {
    cell
      .setBackground("#FEE2E2")
      .setFontColor("#991B1B")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
  }
}

function styleHeaderRow(sheet, columnsCount) {
  if (!columnsCount || columnsCount < 1) return;

  sheet
    .getRange(1, 1, 1, columnsCount)
    .setBackground("#25396e")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
}

function getHeaderMap(sheet) {
  const lastCol = sheet.getLastColumn();

  if (lastCol < 1) return {};

  const headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (value) {
      return String(value || "").trim();
    });

  const map = {};

  headers.forEach(function (header, index) {
    if (header) {
      map[header] = index + 1;
    }
  });

  return map;
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);

  if (!sheet) {
    throw new Error("لم يتم العثور على تبويب: " + name);
  }

  return sheet;
}

function sanitizeData(data) {
  data = data || {};

  return {
    full_name: cleanValue(data.full_name),
    phone: cleanValue(data.phone),
    job_title: cleanValue(data.job_title),
    email: cleanValue(data.email),
    company: cleanValue(data.company),
    city: cleanValue(data.city),
  };
}

function validateData(data) {
  if (
    !data.full_name ||
    !data.phone ||
    !data.job_title ||
    !data.email ||
    !data.company ||
    !data.city
  ) {
    throw new Error("يرجى تعبئة جميع الحقول المطلوبة.");
  }

  if (!isValidName(data.full_name)) {
    throw new Error("اسم الشخص يجب أن يحتوي على أحرف فقط بدون أرقام أو رموز.");
  }

  if (!isValidPhone(data.phone)) {
    throw new Error(
      "رقم الجوال يجب أن يكون 10 أرقام، أو مع رمز الدولة بصيغة 13 خانة مثل +966500000000.",
    );
  }

  if (!isValidEmail(data.email)) {
    throw new Error("يرجى كتابة بريد إلكتروني صحيح.");
  }
}

function isValidName(value) {
  return /^[A-Za-z\u0600-\u06FF\s]{2,}$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  const v = String(value || "").trim();
  return /^\d{10}$/.test(v) || /^\+\d{12}$/.test(v) || /^\d{13}$/.test(v);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function cleanValue(value) {
  return String(value || "").trim();
}

function nextId(prefix, sheet) {
  const nextNumber = Math.max(1, sheet.getLastRow());
  return prefix + String(nextNumber).padStart(6, "0");
}

function formatDate(value) {
  try {
    return Utilities.formatDate(
      new Date(value),
      Session.getScriptTimeZone(),
      "yyyy/MM/dd - HH:mm",
    );
  } catch (e) {
    return esc(value);
  }
}

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlOutput(html) {
  return HtmlService.createHtmlOutput(html)
    .setTitle("سيريدو 2026")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
