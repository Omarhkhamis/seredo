"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

const GATE_PIN_STORAGE_KEY = "seredo-gate-pin";
const SAME_CODE_COOLDOWN_MS = 3500;
const SCAN_INTERVAL_MS = 180;

type VerifyGatePageProps = {
  registrationId: string;
};

type ScanStatus = "success" | "duplicate" | "error";

type ScanOutcome = {
  status: ScanStatus;
  title: string;
  fullName?: string;
  registrationId?: string;
  company?: string;
  city?: string;
  time: string;
};

type ScanResponse = {
  ok?: boolean;
  message?: string;
  already_attended?: boolean;
  registration_id?: string;
  full_name?: string;
  company?: string;
  city?: string;
};

function extractRegistrationId(text: string) {
  const value = text.trim();

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const id = url.searchParams.get("id");

    if (id && id.trim()) {
      return id.trim();
    }
  } catch {
    // ليس رابطاً، نجرب النمط المباشر لرقم التسجيل.
  }

  const match = value.match(/SEREDO-[A-Z]+-\d{4}-\d+/i);

  return match ? match[0].toUpperCase() : "";
}

function nowLabel() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function VerifyGatePage({ registrationId }: VerifyGatePageProps) {
  const [pin, setPin] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [gateError, setGateError] = useState("");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<ScanOutcome | null>(null);
  const [recentScans, setRecentScans] = useState<ScanOutcome[]>([]);
  const [manualId, setManualId] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastDecodeAtRef = useRef(0);
  const lastCodeRef = useRef<{ id: string; at: number }>({ id: "", at: 0 });
  const busyRef = useRef(false);
  const pinRef = useRef("");
  const audioRef = useRef<AudioContext | null>(null);
  const initialHandledRef = useRef(false);

  const playFeedback = (status: ScanStatus) => {
    try {
      navigator.vibrate?.(status === "success" ? 120 : [80, 60, 80]);
    } catch {
      // الاهتزاز غير مدعوم، لا مشكلة.
    }

    try {
      const audioCtx = audioRef.current;

      if (!audioCtx) {
        return;
      }

      const tones =
        status === "success" ? [[880, 0]] : status === "duplicate" ? [[520, 0], [520, 0.18]] : [[220, 0]];

      for (const [frequency, delay] of tones) {
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.14);
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime + delay);
        oscillator.stop(audioCtx.currentTime + delay + 0.16);
      }
    } catch {
      // الصوت غير متاح، لا مشكلة.
    }
  };

  const recordOutcome = (outcome: ScanOutcome) => {
    setLastOutcome(outcome);
    setRecentScans((current) => [outcome, ...current].slice(0, 6));
    playFeedback(outcome.status);
  };

  const processScan = useCallback(async (rawId: string) => {
    const scanId = rawId.trim();

    if (!scanId || busyRef.current) {
      return;
    }

    busyRef.current = true;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan", id: scanId, pin: pinRef.current }),
      });
      const data = (await response.json()) as ScanResponse;

      if (!response.ok || !data.ok) {
        recordOutcome({
          status: "error",
          title: data.message || "تعذر تسجيل الحضور، حاول مرة أخرى.",
          registrationId: scanId,
          time: nowLabel(),
        });
        return;
      }

      recordOutcome({
        status: data.already_attended ? "duplicate" : "success",
        title: data.already_attended ? "تم تسجيل حضوره مسبقًا" : "تم تسجيل الحضور بنجاح",
        fullName: data.full_name,
        registrationId: data.registration_id,
        company: data.company,
        city: data.city,
        time: nowLabel(),
      });
    } catch {
      recordOutcome({
        status: "error",
        title: "تعذر الاتصال بالخادم، تأكد من الشبكة وحاول مجدداً.",
        registrationId: scanId,
        time: nowLabel(),
      });
    } finally {
      lastCodeRef.current = { id: scanId, at: Date.now() };
      busyRef.current = false;
      setIsProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("المتصفح لا يدعم فتح الكاميرا. استخدم الإدخال اليدوي بالأسفل.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setIsCameraOn(true);
    } catch {
      setIsCameraOn(false);
      setCameraError(
        "تعذر فتح الكاميرا. اسمح بالوصول إليها من إعدادات المتصفح، أو استخدم الإدخال اليدوي بالأسفل.",
      );
    }
  }, []);

  // حلقة قراءة إطارات الكاميرا وفك ترميز QR.
  useEffect(() => {
    if (!isCameraOn) {
      return;
    }

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);

      const video = videoRef.current;
      const now = Date.now();

      if (
        !video ||
        video.readyState < video.HAVE_ENOUGH_DATA ||
        busyRef.current ||
        now - lastDecodeAtRef.current < SCAN_INTERVAL_MS
      ) {
        return;
      }

      lastDecodeAtRef.current = now;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      const canvas = canvasRef.current;
      const scale = Math.min(1, 640 / video.videoWidth);

      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context || canvas.width === 0 || canvas.height === 0) {
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (!code || !code.data) {
        return;
      }

      const scanId = extractRegistrationId(code.data);

      if (!scanId) {
        return;
      }

      const lastCode = lastCodeRef.current;

      if (lastCode.id === scanId && now - lastCode.at < SAME_CODE_COOLDOWN_MS) {
        return;
      }

      lastCodeRef.current = { id: scanId, at: now };
      void processScan(scanId);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isCameraOn, processScan]);

  // استعادة جلسة موظف البوابة من نفس التبويب.
  useEffect(() => {
    const savedPin = sessionStorage.getItem(GATE_PIN_STORAGE_KEY);

    if (!savedPin) {
      setIsRestoring(false);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", pin: savedPin }),
        });

        if (response.ok) {
          pinRef.current = savedPin;
          setIsAuthed(true);
        } else {
          sessionStorage.removeItem(GATE_PIN_STORAGE_KEY);
        }
      } catch {
        // نُبقي شاشة الدخول عند فشل الاتصال.
      } finally {
        setIsRestoring(false);
      }
    })();
  }, []);

  // تشغيل الكاميرا بعد الدخول وإيقافها عند مغادرة الصفحة.
  useEffect(() => {
    if (!isAuthed) {
      return;
    }

    void startCamera();

    return stopCamera;
  }, [isAuthed, startCamera, stopCamera]);

  // إذا فُتحت الصفحة من رابط QR مباشرة (?id=...) نسجل حضوره فور الدخول.
  useEffect(() => {
    if (isAuthed && registrationId && !initialHandledRef.current) {
      initialHandledRef.current = true;
      void processScan(registrationId);
    }
  }, [isAuthed, registrationId, processScan]);

  async function handleLogin() {
    setGateError("");

    const currentPin = pin.trim();

    if (!currentPin) {
      setGateError("يرجى إدخال رمز موظف البوابة.");
      return;
    }

    setIsLoggingIn(true);

    try {
      if (!audioRef.current) {
        const AudioContextClass =
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (AudioContextClass) {
          audioRef.current = new AudioContextClass();
        }
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", pin: currentPin }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "رمز الدخول غير صحيح.");
      }

      pinRef.current = currentPin;
      sessionStorage.setItem(GATE_PIN_STORAGE_KEY, currentPin);
      setIsAuthed(true);
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "رمز الدخول غير صحيح أو حدث خطأ.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    stopCamera();
    sessionStorage.removeItem(GATE_PIN_STORAGE_KEY);
    pinRef.current = "";
    setPin("");
    setIsAuthed(false);
    setLastOutcome(null);
    setRecentScans([]);
    setManualId("");
    setCameraError("");
  }

  function handleManualSubmit() {
    const scanId = extractRegistrationId(manualId) || manualId.trim();

    if (!scanId) {
      return;
    }

    setManualId("");
    void processScan(scanId);
  }

  const outcomeStyles: Record<ScanStatus, string> = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    duplicate: "border-amber-300 bg-amber-50 text-amber-900",
    error: "border-red-300 bg-red-50 text-red-900",
  };

  const outcomeDot: Record<ScanStatus, string> = {
    success: "bg-emerald-500",
    duplicate: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface to-mist p-4 sm:p-6">
      <div className="w-[min(720px,100%)] rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
        {!isAuthed ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 text-2xl">
              🔒
            </div>
            <h1 className="text-3xl font-black text-brand-600 sm:text-4xl">تسجيل موظف البوابة</h1>
            <p className="mx-auto mt-3 mb-5 max-w-lg text-sm font-semibold leading-8 text-muted">
              أدخل رمز موظف البوابة مرة واحدة، ثم امسح رموز QR للزوار بالكاميرا وسيتم تسجيل حضورهم
              تلقائياً.
            </p>

            {isRestoring ? (
              <p className="text-sm font-bold text-muted">جاري التحقق من الجلسة...</p>
            ) : (
              <>
                <div className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row">
                  <input
                    type="password"
                    value={pin}
                    dir="ltr"
                    placeholder="رمز الدخول"
                    autoComplete="off"
                    onChange={(event) => setPin(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleLogin();
                      }
                    }}
                    className="min-h-12 w-full rounded-full border border-line bg-surface px-4 text-center text-base font-black outline-none transition focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => void handleLogin()}
                    disabled={isLoggingIn}
                    className="min-h-12 whitespace-nowrap rounded-full bg-brand-600 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isLoggingIn ? "جاري التحقق..." : "تسجيل الدخول"}
                  </button>
                </div>

                {gateError ? (
                  <div className="mx-auto mt-4 max-w-lg rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-black leading-7 text-red-800">
                    {gateError}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-black text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  وضع المسح نشط
                </div>
                <h1 className="text-2xl font-black text-brand-600 sm:text-3xl">بوابة تسجيل الحضور</h1>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-10 rounded-full border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition hover:bg-red-50"
              >
                خروج
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-line bg-brand-900">
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {isCameraOn ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      "h-[62%] w-[62%] max-w-[320px] rounded-2xl border-4 transition-colors duration-300",
                      isProcessing ? "border-amber-400/90" : "border-white/80",
                    )}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-sm font-bold leading-7 text-white/90">
                    {cameraError || "جاري تشغيل الكاميرا..."}
                  </p>
                  {cameraError ? (
                    <button
                      type="button"
                      onClick={() => void startCamera()}
                      className="min-h-10 rounded-full bg-white px-5 text-sm font-black text-brand-700 transition hover:bg-brand-50"
                    >
                      إعادة المحاولة
                    </button>
                  ) : null}
                </div>
              )}

              {isCameraOn ? (
                <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center">
                  <span className="rounded-full bg-black/45 px-4 py-1.5 text-xs font-black text-white">
                    {isProcessing ? "جاري تسجيل الحضور..." : "وجّه الكاميرا نحو رمز QR الخاص بالزائر"}
                  </span>
                </div>
              ) : null}
            </div>

            {lastOutcome ? (
              <div
                className={cn(
                  "mt-4 rounded-2xl border p-4",
                  outcomeStyles[lastOutcome.status],
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-black">
                    <span className={cn("h-2.5 w-2.5 rounded-full", outcomeDot[lastOutcome.status])} />
                    {lastOutcome.title}
                  </div>
                  <span className="text-xs font-bold opacity-70" dir="ltr">
                    {lastOutcome.time}
                  </span>
                </div>

                {lastOutcome.fullName ? (
                  <p className="mt-2 text-lg font-black">{lastOutcome.fullName}</p>
                ) : null}

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold opacity-80">
                  {lastOutcome.registrationId ? (
                    <span dir="ltr">{lastOutcome.registrationId}</span>
                  ) : null}
                  {lastOutcome.company ? <span>{lastOutcome.company}</span> : null}
                  {lastOutcome.city ? <span>{lastOutcome.city}</span> : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-4 text-center text-sm font-bold text-muted">
                لم يتم مسح أي رمز بعد. أول عملية مسح ستظهر نتيجتها هنا.
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
              <p className="mb-2 text-xs font-extrabold text-ink">
                الإدخال اليدوي (إذا تعذر مسح الرمز)
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={manualId}
                  dir="ltr"
                  placeholder="SEREDO-VIS-2026-000001"
                  onChange={(event) => setManualId(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleManualSubmit();
                    }
                  }}
                  className="min-h-11 w-full rounded-full border border-line bg-white px-4 text-center text-sm font-black outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
                />
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={isProcessing}
                  className="min-h-11 whitespace-nowrap rounded-full bg-brand-600 px-5 text-sm font-black text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  تسجيل الحضور
                </button>
              </div>
            </div>

            {recentScans.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-extrabold text-muted">آخر عمليات المسح</p>
                <div className="grid gap-2">
                  {recentScans.map((scan, index) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
                      key={`${scan.registrationId}-${scan.time}-${index}`}
                    >
                      <div className="inline-flex min-w-0 items-center gap-2 font-extrabold text-ink">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", outcomeDot[scan.status])} />
                        <span className="truncate">{scan.fullName || scan.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-muted">
                        {scan.registrationId ? <span dir="ltr">{scan.registrationId}</span> : null}
                        <span dir="ltr">{scan.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
