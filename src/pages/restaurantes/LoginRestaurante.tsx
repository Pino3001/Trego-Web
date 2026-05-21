import Header from "../../components/Header.js";
import logo from "../../assets/tregoRestaurante.svg";
import { useState } from "react";
import { useNavigate } from "react-router";
import OTPInput from "../../components/inicio/OTPInput.js";
import { TextInput } from "../../components/TextInput.js";
import TextoDivider from "../../components/TextoDivider.js";

type AuthStep = "INGRESO" | "VERI_CODE" | "LOADING";

export default function LoginRestaurante() {
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("INGRESO");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState<string>("");
  const [contrasenia, setContrasenia] = useState<string>("");

  return (
    <>
      {/* Anchor invisible para reCAPTCHA */}
      <div id="recaptcha-container" />

      <Header tipoUser="Restaurante" />

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="flex w-full max-w-4xl rounded-3xl mb-5 overflow-hidden shadow-2xl shadow-green-100 bg-white">
          {/* Panel izquierdo — marca */}
          <div className="hidden md:flex flex-col items-center justify-center bg-trego-restaurante w-5/12 h-130 p-10 gap-6">
            <div className="w-60 h-60 rounded-full bg-white flex items-center justify-center shadow-inner mb-10">
              <img src={logo} />
            </div>
            <p className="text-white text-4xl font-bold tracking-tight text-center leading-tight">
              Lo Pedís, Terego
            </p>
          </div>

          {/* Panel derecho — formulario */}
          <div className="flex-1 flex flex-col justify-start px-8 md:px-14 py-12 gap-10">
            {/* Encabezado dinámico */}
            <div className="mb-5">
              {step === "INGRESO" && (
                <>
                  <h1 className="text-4xl font-bold text-center text-gray-800">
                    Bienvenido
                  </h1>
                  <h2 className="text-2xl mt-5 font-bold text-center text-gray-600">
                    Inicio Restaurantes
                  </h2>
                </>
              )}
              {step === "VERI_CODE" && (
                <>
                  <button
                    onClick={() => {
                      setStep("INGRESO");
                      setError(null);
                      setOtp("");
                    }}
                    className="text-trego-restaurante text-sm font-medium mb-3 flex items-center gap-1 hover:underline"
                  >
                    ← Volver
                  </button>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Código de verificación
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Revisa tu correo electrónico
                  </p>
                </>
              )}
              {step === "LOADING" && (
                <h1 className="text-2xl font-bold text-gray-800">
                  Verificando...
                </h1>
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
            {step === "INGRESO" && (
              <div className="flex flex-col gap-8">
                <TextoDivider texto="Ingresa Usuario y Contraseña" />

                <TextInput
                  value={email}
                  onChange={setEmail}
                  placeholder="Correo electrónico"
                  type="email"
                  colorStyle="trego-restaurante"
                />

                <TextInput
                  value={contrasenia}
                  onChange={setContrasenia}
                  placeholder="Contraseña"
                  type="password"
                  colorStyle="trego-restaurante"
                />

                <button
                  onClick={() => setStep("VERI_CODE")}
                  className="
                    group flex items-center justify-center gap-3
                    w-full py-3.5 px-6 rounded-3xl
                    bg-trego-restaurante hover:bg-green-700
                    transition-all duration-200 text-gray-100 text-lg font-bold
                    shadow-md hover:shadow-md hover:shadow-green-100
                  "
                >
                  Iniciar Sesión
                </button>
              </div>
            )}

            {/* ── Ingreso de código OTP ── */}
            {step === "VERI_CODE" && (
              <div className="flex flex-col gap-5">
                <OTPInput variant="restaurante" value={otp} onChange={setOtp} />

                <button
                  //onClick={handleVerifyCode}
                  disabled={otp.length !== 6}
                  className="
                    group flex items-center justify-center gap-3
                    w-full py-3.5 px-6 rounded-3xl
                    bg-trego-restaurante hover:bg-green-700
                    transition-all duration-200 text-gray-100 text-lg font-bold
                    shadow-md hover:shadow-md hover:shadow-green-100
                  "
                >
                  Verificar código
                </button>

                <div className="text-center text-sm text-gray-500">
                  {resendCooldown > 0 ? (
                    <span>
                      Podés reenviar el código en{" "}
                      <span className="font-semibold text-orange-500">
                        {resendCooldown}s
                      </span>
                    </span>
                  ) : (
                    <button
                      //onClick={handleResend}
                      className="text-trego-restaurante font-semibold hover:underline"
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
                <p className="text-sm text-gray-400">
                  Verificando tus datos...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
