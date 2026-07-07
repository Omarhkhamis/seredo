// بطاقة دخول الزائر: نفس رسم downloadVisitorQrCard في example.gs بأبعاد 1080×1500.

type VisitorQrCardData = {
  qrImage: string;
  registrationId: string;
  fullName: string;
  logoSrc?: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (!src) {
      reject(new Error("empty image"));
      return;
    }

    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load error"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
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

function drawCenteredWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = String(text || "").split(" ");
  let line = "";
  const lines: string[] = [];

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.forEach((item, index) => {
    ctx.fillText(item, centerX, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function drawFallbackLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";

  ctx.fillStyle = "#25396e";
  ctx.font = "900 62px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
  ctx.fillText("SEREDO", x, y - 8);

  ctx.fillStyle = "#717273";
  ctx.font = "800 24px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
  ctx.fillText("EXPO 2026", x, y + 42);

  ctx.restore();
}

async function ensureCardFonts() {
  try {
    await Promise.all([
      document.fonts.load("900 50px Tajawal"),
      document.fonts.load("800 30px Tajawal"),
      document.fonts.load("700 22px Tajawal"),
      document.fonts.load("800 26px 'IBM Plex Sans Arabic'"),
    ]);
  } catch {
    // الخطوط الاحتياطية في ctx.font تكفي إذا تعذر التحميل.
  }
}

export async function downloadVisitorQrCard(data: VisitorQrCardData) {
  try {
    await ensureCardFonts();

    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1500;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("canvas not supported");
    }

    ctx.fillStyle = "#F7FAFC";
    ctx.fillRect(0, 0, width, height);

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#FFFFFF");
    bgGradient.addColorStop(1, "#EEF3F8");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#25396e";
    ctx.beginPath();
    ctx.arc(120, 120, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.07;
    ctx.beginPath();
    ctx.arc(970, 1320, 310, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(15,23,42,0.14)";
    ctx.shadowBlur = 46;
    ctx.shadowOffsetY = 22;

    roundRect(ctx, 90, 85, 900, 1330, 44);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.restore();

    roundRect(ctx, 90, 85, 900, 1330, 44);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#D7E0EA";
    ctx.stroke();

    ctx.save();
    roundRect(ctx, 90, 85, 900, 245, 44);
    ctx.clip();

    const headerGradient = ctx.createLinearGradient(90, 85, 990, 330);
    headerGradient.addColorStop(0, "#FFFFFF");
    headerGradient.addColorStop(1, "#F3F6FA");

    ctx.fillStyle = headerGradient;
    ctx.fillRect(90, 85, 900, 245);

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#25396e";
    ctx.beginPath();
    ctx.arc(195, 115, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#0D5C63";
    ctx.beginPath();
    ctx.arc(850, 105, 175, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#25396e";
    ctx.fillRect(90, 324, 900, 6);

    ctx.restore();

    roundRect(ctx, 90, 85, 900, 245, 44);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#D7E0EA";
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = "rgba(15,23,42,0.10)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;

    roundRect(ctx, 265, 132, 550, 150, 30);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.restore();

    roundRect(ctx, 265, 132, 550, 150, 30);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E2E8F0";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const logoBoxX = width / 2;
    const logoBoxY = 207;

    if (data.logoSrc) {
      try {
        const logoImg = await loadImage(data.logoSrc);
        const maxLogoW = 430;
        const maxLogoH = 115;
        const ratio = Math.min(
          maxLogoW / logoImg.width,
          maxLogoH / logoImg.height,
        );
        const logoW = logoImg.width * ratio;
        const logoH = logoImg.height * ratio;

        ctx.drawImage(
          logoImg,
          logoBoxX - logoW / 2,
          logoBoxY - logoH / 2,
          logoW,
          logoH,
        );
      } catch {
        drawFallbackLogo(ctx, logoBoxX, logoBoxY);
      }
    } else {
      drawFallbackLogo(ctx, logoBoxX, logoBoxY);
    }

    ctx.save();
    ctx.fillStyle = "#25396e";
    ctx.font = "900 50px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
    ctx.direction = "rtl";
    drawCenteredWrappedText(
      ctx,
      "معرض سيريدو العقاري بدورته الخامسة - جدة",
      width / 2,
      405,
      780,
      62,
    );
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#717273";
    ctx.font = "800 30px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
    ctx.direction = "rtl";
    ctx.fillText("بطاقة دخول الزائر", width / 2, 520);
    ctx.restore();

    ctx.save();
    roundRect(ctx, 280, 565, 520, 68, 34);
    ctx.fillStyle = "#F7FAFC";
    ctx.fill();
    ctx.strokeStyle = "#D7E0EA";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#25396e";
    ctx.font = "900 28px Arial, sans-serif";
    ctx.direction = "ltr";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.registrationId || "", width / 2, 600);
    ctx.restore();

    const qrSize = 430;
    const qrX = (width - qrSize) / 2;
    const qrY = 690;

    ctx.save();
    ctx.shadowColor = "rgba(15,23,42,0.12)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;

    roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 38);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.restore();

    roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 38);
    ctx.strokeStyle = "#D7E0EA";
    ctx.lineWidth = 3;
    ctx.stroke();

    try {
      const qrImg = await loadImage(data.qrImage);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      ctx.save();
      ctx.fillStyle = "#FEF2F2";
      roundRect(ctx, qrX, qrY, qrSize, qrSize, 20);
      ctx.fill();

      ctx.fillStyle = "#991B1B";
      ctx.font = "800 28px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillText("تعذر تحميل رمز QR", width / 2, qrY + qrSize / 2);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = "#25396e";
    ctx.font = "900 34px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    drawCenteredWrappedText(
      ctx,
      "يرجى عرض رمز QR هذا للموظف عند البوابة للدخول إلى المعرض",
      width / 2,
      1215,
      760,
      48,
    );
    ctx.restore();

    if (data.fullName) {
      ctx.save();
      ctx.fillStyle = "#64748B";
      ctx.font = "800 26px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      drawCenteredWrappedText(ctx, data.fullName, width / 2, 1320, 720, 40);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = "#D7E0EA";
    roundRect(ctx, 210, 1368, 660, 2, 1);
    ctx.fill();

    ctx.fillStyle = "#717273";
    ctx.font = "700 22px Tajawal, 'IBM Plex Sans Arabic', Arial, sans-serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillText("SEREDO 2026", width / 2, 1398);
    ctx.restore();

    downloadDataUrl(
      canvas.toDataURL("image/png"),
      `SEREDO-ENTRY-${data.registrationId || "QR"}.png`,
    );
  } catch {
    // عند أي فشل في رسم البطاقة نحمّل صورة QR وحدها بدل تعطيل الزر.
    downloadDataUrl(
      data.qrImage,
      `SEREDO-QR-${data.registrationId || "QR"}.png`,
    );
  }
}
