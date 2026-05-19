import { useState, useEffect } from "react";
import { useNavigate } from 'react-router';

// Firebase imports — ajustá la ruta a tu configuración
import { auth } from "../../firebase.config.js"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import Header from "../components/Header.js";
import logo from "../assets/bolsa-trego.svg"
import OTPInput from "../components/inicio/OTPInput.js";
import { GoogleIcon, SMSIcon } from "../components/icons.jsx";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AuthStep =
  | "METHOD_SELECT"
  | "SMS_PHONE"
  | "SMS_CODE"
  | "LOADING";

// ─── Helpers ──────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | undefined;
  }
}

function clearRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
}


// ─── Componente principal ─────────────────────────────────────────────────────

export default function LoginCliente() {
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("METHOD_SELECT");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Limpia recaptcha al desmontar
  useEffect(() => () => clearRecaptcha(), []);

  // Countdown para reenvío de código
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ── Redirige tras login exitoso ────────────────────────────────────────────
  // El paso 6 del flujo principal: el backend/AuthService identifica el perfil.
  // Aquí redirigís según la respuesta de tu API; ajustá las rutas según tu proyecto.
  function handlePostLogin(isNewUser: boolean) {
    if (isNewUser) {
      navigate("/completar-perfil"); // CU "Modificar perfil" — flujo 7.1
    } else {
      navigate("/inicio");
    }
  }

  // ── Google ─────────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setError(null);
    setStep("LOADING");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user } = result;

      // Enviar idToken a tu backend (POST /api/auth/google/{idToken})
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/auth/google/${idToken}`, { method: "POST" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          // Flujo 6.1 — cuenta deshabilitada
          setError("Acceso denegado. Su cuenta se encuentra deshabilitada. Contacte al soporte.");
          setStep("METHOD_SELECT");
          await auth.signOut();
          return;
        }
        throw new Error(data?.message ?? "Error al autenticar con Google.");
      }

      const data = await res.json();
      handlePostLogin(data.isNewUser ?? false);
    } catch (err: unknown) {
      setStep("METHOD_SELECT");
      const msg = err instanceof Error ? err.message : "Error al iniciar con Google.";
      setError(msg);
    }
  }

  // ── SMS — enviar código ────────────────────────────────────────────────────
  async function handleSendCode() {
    if (!phone.trim()) {
      setError("Ingresá tu número de teléfono.");
      return;
    }
    setError(null);
    setStep("LOADING");

    try {
      clearRecaptcha();

      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      // Firebase espera el número en formato E.164, ej: +59891234567
      const formatted = phone.startsWith("+") ? phone : `+${phone}`;
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmation(result);
      setResendCooldown(60);
      setOtp("");
      setStep("SMS_CODE");
    } catch (err: unknown) {
      clearRecaptcha();
      setStep("SMS_PHONE");
      const msg = err instanceof Error ? err.message : "No se pudo enviar el código.";
      setError(msg);
    }
  }

  // ── SMS — verificar código ─────────────────────────────────────────────────
  async function handleVerifyCode() {
    if (otp.length !== 6) {
      setError("Ingresá el código de 6 dígitos.");
      return;
    }
    if (!confirmation) return;
    setError(null);
    setStep("LOADING");

    try {
      const result = await confirmation.confirm(otp);
      const { user } = result;

      // Flujo 3.B.2.b.7 — enviar idToken al backend igual que Google
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/auth/google/${idToken}`, { method: "POST" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setError("Acceso denegado. Su cuenta se encuentra deshabilitada. Contacte al soporte.");
          setStep("METHOD_SELECT");
          await auth.signOut();
          return;
        }
        throw new Error(data?.message ?? "Error al validar sesión.");
      }

      const data = await res.json();
      handlePostLogin(data.isNewUser ?? false);
    } catch (err: unknown) {
      // Flujo 3.B.2.b.E1 — código expirado o inválido
      const msg = err instanceof Error ? err.message : "";
      const isCodeError =
        msg.includes("invalid-verification-code") ||
        msg.includes("expired-code") ||
        msg.includes("invalid-code");

      setError(
        isCodeError
          ? "El código es incorrecto o ha expirado."
          : "No se pudo verificar el código."
      );
      setStep("SMS_CODE");
    }
  }

  // ── Reenviar código ────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtp("");
    setStep("SMS_PHONE");
    // Volvemos a SMS_PHONE para que el usuario confirme el número y reenvíe
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Anchor invisible para reCAPTCHA */}
      <div id="recaptcha-container" />

      <Header />

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="flex w-full max-w-4xl rounded-3xl mb-5 overflow-hidden shadow-2xl shadow-orange-100 bg-white">

          {/* Panel izquierdo — marca */}
          <div className="hidden md:flex flex-col items-center justify-center bg-orange-500 w-5/12 h-130 p-10 gap-6">
            <div className="w-60 h-60 rounded-full bg-white/15 flex items-center justify-center shadow-inner mb-10">
            <img src={logo} />
            </div>
            <p className="text-white text-4xl font-bold tracking-tight text-center leading-tight">
              Lo Pedís, Terego
            </p>
          </div>

          {/* Panel derecho — formulario */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-14 py-12 gap-6">

            {/* Encabezado dinámico */}
            <div className="mb-10">
              {step === "METHOD_SELECT" && (
                <>
                  <h1 className="text-4xl font-bold text-center text-gray-800">Bienvenido</h1>
                </>
              )}
              {step === "SMS_PHONE" && (
                <>
                  <button
                    onClick={() => { setStep("METHOD_SELECT"); setError(null); setPhone(""); }}
                    className="text-orange-500 text-sm font-medium mb-3 flex items-center gap-1 hover:underline"
                  >
                    ← Volver
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">Ingresá tu número</h1>
                  <p className="text-sm text-gray-500 mt-1">Te enviaremos un código de verificación</p>
                </>
              )}
              {step === "SMS_CODE" && (
                <>
                  <button
                    onClick={() => { setStep("SMS_PHONE"); setError(null); setOtp(""); }}
                    className="text-orange-500 text-sm font-medium mb-3 flex items-center gap-1 hover:underline"
                  >
                    ← Volver
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">Código de verificación</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Enviamos un código al{" "}
                    <span className="font-semibold text-gray-700">{phone}</span>
                  </p>
                </>
              )}
              {step === "LOADING" && (
                <h1 className="text-2xl font-bold text-gray-800">Verificando...</h1>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Selección de método ── */}
            {step === "METHOD_SELECT" && (
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 text-xs text-gray-400 uppercase tracking-widest">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span>Elegir método de inicio</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  onClick={handleGoogle}
                  className="
                    group flex items-center justify-center gap-3
                    w-full py-3.5 px-6 rounded-2xl border-2 border-gray-200
                    bg-white hover:border-orange-400 hover:bg-orange-50
                    transition-all duration-200 font-semibold text-gray-700
                    shadow-sm hover:shadow-md hover:shadow-orange-100
                  "
                >
                  <GoogleIcon />
                  Iniciar con Google
                </button>

                <button
                  onClick={() => { setStep("SMS_PHONE"); setError(null); }}
                  className="
                    group flex items-center justify-center gap-3
                    w-full py-3.5 px-6 rounded-2xl border-2 border-gray-200
                    bg-white hover:border-orange-400 hover:bg-orange-50
                    transition-all duration-200 font-semibold text-gray-700
                    shadow-sm hover:shadow-md hover:shadow-orange-100
                  "
                >
                  <SMSIcon />
                  Iniciar vía SMS
                </button>
              </div>
            )}

            {/* ── Ingreso de teléfono ── */}
            {step === "SMS_PHONE" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Número de teléfono
                  </label>
                  <div className="flex rounded-2xl overflow-hidden border-2 border-gray-200 focus-within:border-orange-400 transition-colors">
                    <span className="flex items-center px-4 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-200 select-none">
                      +598
                    </span>
                    <input
                      type="tel"
                      placeholder="91 234 567"
                      value={phone}
                      onChange={(e) => {
                        // Permite que el usuario escriba con o sin prefijo
                        const val = e.target.value.replace(/[^\d\s\-+]/g, "");
                        setPhone(val);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                      className="flex-1 px-4 py-3.5 outline-none text-gray-800 text-sm bg-white placeholder:text-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Ingresá el número sin el prefijo del país (ya incluido).
                  </p>
                </div>

                <button
                  onClick={handleSendCode}
                  className="
                    w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400
                    text-white font-bold text-sm tracking-wide
                    transition-all duration-200 shadow-lg shadow-orange-200
                    hover:shadow-xl hover:shadow-orange-300 active:scale-[0.98]
                  "
                >
                  Enviar código
                </button>
              </div>
            )}

            {/* ── Ingreso de código OTP ── */}
            {step === "SMS_CODE" && (
              <div className="flex flex-col gap-5">
                <OTPInput value={otp} onChange={setOtp} />

                <button
                  onClick={handleVerifyCode}
                  disabled={otp.length !== 6}
                  className="
                    w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600
                    text-white font-bold text-sm tracking-wide
                    transition-all duration-200 shadow-lg shadow-orange-200
                    hover:shadow-xl hover:shadow-orange-300 active:scale-[0.98]
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                  "
                >
                  Verificar código
                </button>

                <div className="text-center text-sm text-gray-500">
                  {resendCooldown > 0 ? (
                    <span>
                      Podés reenviar el código en{" "}
                      <span className="font-semibold text-orange-500">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-orange-500 font-semibold hover:underline"
                    >
                      Volver a pedir el código
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Loading ── */}
            {step === "LOADING" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                <p className="text-sm text-gray-400">Verificando tus datos...</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  );
}

