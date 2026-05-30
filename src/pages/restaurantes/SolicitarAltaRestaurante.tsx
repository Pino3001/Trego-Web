import { useState } from "react";
import Header from "../../components/body/Header.js";
import { TextInput } from "../../components/TextInput.js";
import Sidebar from "../../components/body/Sidebar.js";
import type { ImageField } from "../../components/typos/ImageField.js";
import ImageUploadField from "../../components/ImagenUploadField.js";
import type { DTORestaurante } from "../../data/DTORestaurante.js";
import {
  enviarSolicitudAltaRestaurante,
  obtenerFirmaCloudinary,
} from "../../api/apiSolicitudAltaRestaurante.js";
import AddressAutocomplete from "../../components/DireccionAutocomplete.js";
import type { DireccionGeoapify } from "../../data/DireccionGeoapify.js";
import type { DTODireccion } from "../../data/DTODireccion.js";

// ── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  nombre: string;
  razonSocial: string;
  rut: string;
  telefono: string;
  descripcion: string;
  direccion: string;
}

type SubmitStep = "FORM" | "LOADING" | "SUCCESS";

// ── Validators ─────────────────────────────────────────────────────────────
function validateRUT(rut: string): boolean {
  // Uruguayan RUT: 12 digits
  return /^\d{12}$/.test(rut.replace(/[-.\s]/g, ""));
}

function validateTelefono(tel: string): boolean {
  // Uruguay: +598 followed by 8 digits (after removing prefix spaces)
  const digits = tel.replace(/\D/g, "");
  return digits.length >= 11 && digits.startsWith("598");
}

export default function SolicitarAltaRestaurante() {
  const [step, setStep] = useState<SubmitStep>("FORM");

  const [form, setForm] = useState<FormData>({
    nombre: "",
    razonSocial: "",
    rut: "",
    telefono: "",
    descripcion: "",
    direccion: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string | undefined>>
  >({});

  const [direccionSeleccionada, setDireccionSeleccionada] =
    useState<DireccionGeoapify | null>(null);

  const [imagePerfil, setImagePerfil] = useState<ImageField>({
    file: null,
    previewUrl: null,
    uploadState: "idle",
    cloudUrl: null,
  });
  const [imagePortada, setImagePortada] = useState<ImageField>({
    file: null,
    previewUrl: null,
    uploadState: "idle",
    cloudUrl: null,
  });
  const [imageErrors, setImageErrors] = useState({
    perfil: false,
    portada: false,
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const handleImageChange = async (field: "perfil" | "portada", file: File) => {
    const estadoAnterior = field === "perfil" ? imagePerfil : imagePortada;
    if (estadoAnterior.previewUrl) {
      // Liberamos la memoria de la imagen anterior antes de pisarla
      URL.revokeObjectURL(estadoAnterior.previewUrl);
    }

    //CREAR LA NUEVA URL
    const previewUrl = URL.createObjectURL(file);
    const setter = field === "perfil" ? setImagePerfil : setImagePortada;

    setter({ file, previewUrl, uploadState: "uploading", cloudUrl: null });
    setImageErrors((p) => ({ ...p, [field]: false }));

    try {
      const nombreSinExtension =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

      //Llamamos a tu función externa
      const datosBack = await obtenerFirmaCloudinary(
        nombreSinExtension,
        "image",
      );

      //Cargamos el FormData con los nombres exactos que pide Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", datosBack.apiKey);
      formData.append("timestamp", datosBack.timestamp.toString());
      formData.append("signature", datosBack.firma); // 'firma' mapea a 'signature'
      formData.append("public_id", datosBack.publicId); // 'publicId' mapea a 'public_id'

      //Subida directa usando la URL exacta
      const cloudinaryRes = await fetch(datosBack.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryRes.ok) throw new Error("Cloudinary rechazó la imagen");

      const cloudinaryData = await cloudinaryRes.json();

      //Guardamos la URL segura final en tu estado
      setter((prev) => ({
        ...prev,
        uploadState: "done",
        cloudUrl: cloudinaryData.secure_url, // Esta URL es la que mandamos al backend en el submit
      }));
    } catch (error) {
      console.error("Error en el proceso de imagen:", error);
      setter({ file, previewUrl, uploadState: "idle", cloudUrl: null });
      setImageErrors((p) => ({ ...p, [field]: true }));
    }
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const set = (key: keyof FormData) => (v: string) => {
    setForm((p) => ({ ...p, [key]: v }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!form.razonSocial.trim())
      newErrors.razonSocial = "La razón social es requerida";
    if (!form.rut.trim()) {
      newErrors.rut = "El RUT es requerido";
    } else if (!validateRUT(form.rut)) {
      newErrors.rut = "El RUT debe tener 12 dígitos";
    }
    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!validateTelefono(form.telefono)) {
      newErrors.telefono = "Ingresá un número uruguayo válido (+598 XXXXXXXX)";
    }
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!direccionSeleccionada)
      newErrors.direccion = "La dirección es requerida";

    const imgErrors = {
      perfil: !imagePerfil.cloudUrl && imagePerfil.uploadState !== "done",
      portada: !imagePortada.cloudUrl && imagePortada.uploadState !== "done",
    };

    setErrors(newErrors);
    setImageErrors(imgErrors);

    return (
      Object.keys(newErrors).length === 0 &&
      !imgErrors.perfil &&
      !imgErrors.portada
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;

    setStep("LOADING");

    try {
      const dir: DTODireccion = {
        apartamento: 0,
        calle: direccionSeleccionada?.calle || "",
        esquina: direccionSeleccionada?.esquina || "",
        latitud: direccionSeleccionada?.latitud || 0,
        longitud: direccionSeleccionada?.longitud || 0,
        numero: direccionSeleccionada?.numero || 0,
      };
      const resto: DTORestaurante = {
        nombre: form.nombre,
        razonSocial: form.razonSocial,
        rut: form.rut,
        telefono: form.telefono,
        descripcion: form.descripcion,
        direccion: dir,
      };

      if (imagePerfil.cloudUrl) {
        resto.fotoPerfil = imagePerfil.cloudUrl;
      }

      if (imagePortada.cloudUrl) {
        resto.fotoPortada = imagePortada.cloudUrl;
      }

      const response = await enviarSolicitudAltaRestaurante(resto);
      setStep("SUCCESS");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);

      setApiError(
        "Ocurrió un error al enviar la solicitud. Intentá nuevamente.",
      );
      setStep("FORM");
    }
  };

  // ------Cancelar-------
  const handleCancel = () => {
    if (imagePerfil.previewUrl) URL.revokeObjectURL(imagePerfil.previewUrl);
    if (imagePortada.previewUrl) URL.revokeObjectURL(imagePortada.previewUrl);
    setForm({
      nombre: "",
      razonSocial: "",
      rut: "",
      telefono: "",
      descripcion: "",
      direccion: "",
    });
    setErrors({});
    setImagePerfil({
      file: null,
      previewUrl: null,
      uploadState: "idle",
      cloudUrl: null,
    });
    setImagePortada({
      file: null,
      previewUrl: null,
      uploadState: "idle",
      cloudUrl: null,
    });
    setImageErrors({ perfil: false, portada: false });
    setApiError(null);
  };

  return (
    <>
      <Header abrirPerfil tipoUser="Restaurante" />

      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 w-full">
          <div className="w-full max-w-6xl">
            <h1 className="text-3xl font-bold text-trego-restaurante text-center mb-4 tracking-tight">
              Alta Restaurante
            </h1>

            {/* ── SUCCESS ── */}
            {step === "SUCCESS" && (
              <div className="flex flex-col items-center gap-6 py-16">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-trego-restaurante"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  ¡Solicitud enviada!
                </h2>
                <p className="text-gray-500 text-center max-w-sm">
                  Nos comunicaremos a la brevedad. Recibirás un correo con
                  información sobre el proceso de verificación.
                </p>
              </div>
            )}

            {/* ── LOADING ── */}
            {step === "LOADING" && (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-trego-restaurante animate-spin" />
                <p className="text-sm text-gray-400">Enviando solicitud...</p>
              </div>
            )}

            {/* ── FORM ── */}
            {step === "FORM" && (
              <div className="bg-white w-full rounded-3xl shadow-lg  shadow-green-50 p-8 flex flex-col gap-8 justify-center">
                {/* API Error */}
                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Row 1: Images + descripcion */}
                <div className="flex flex-row md:flex-row gap-4">
                  <div className="flex flex-col gap-15">
                    {/* Images */}
                    <div className="flex flex-row md:flex-row gap-20 shrink-0">
                      <ImageUploadField
                        label="Imagen de Perfil"
                        imageField={imagePerfil}
                        onImageChange={(f) => handleImageChange("perfil", f)}
                        hasError={imageErrors.perfil}
                      />
                      <ImageUploadField
                        label="Imagen de Portada"
                        imageField={imagePortada}
                        onImageChange={(f) => handleImageChange("portada", f)}
                        hasError={imageErrors.portada}
                      />
                    </div>

                    {/* Descripcion */}
                    <div className="w-120 max-w-full mx-auto">
                      <h1 className="text-sm font-semibold px-5">
                        Descripción
                      </h1>
                      <textarea
                        value={form.descripcion}
                        onChange={(e) => set("descripcion")(e.target.value)}
                        placeholder="Describe tu restaurante, productos y público objetivo..."
                        rows={4}
                        className="peer w-full border border-gray-400 rounded-3xl p-5 outline-none
                     focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante"
                      />
                    </div>
                  </div>

                  {/* Nombre + Razon Social + RUT + tel + dir*/}
                  <div className="flex-1 flex w-full justify-center">
                    <div className="flex w-110 flex-col gap-4">
                      <div>
                        <h1 className="text-sm font-semibold px-5">Nombre</h1>
                        <TextInput
                          value={form.nombre}
                          onChange={set("nombre")}
                          placeholder="El Restaurante"
                          colorStyle="trego-restaurante"
                          label={false}
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold px-5">
                          Razón Social
                        </h1>
                        <TextInput
                          value={form.razonSocial}
                          onChange={set("razonSocial")}
                          placeholder="Restaurante S.A"
                          colorStyle="trego-restaurante"
                          label={false}
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold px-5">RUT</h1>
                        <TextInput
                          value={form.rut}
                          onChange={set("rut")}
                          placeholder="XXXXXXXXXXXX"
                          colorStyle="trego-restaurante"
                          label={false}
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold px-5">
                          Numero de telefono
                        </h1>
                        <TextInput
                          value={form.telefono}
                          onChange={set("telefono")}
                          placeholder="+598 99 000 000"
                          colorStyle="trego-restaurante"
                          label={false}
                        />
                      </div>
                      <div>
                        <AddressAutocomplete
                          label="Dirección"
                          value={form.direccion}
                          error={errors.direccion} // Si validaste que exista, le pasas el error aquí
                          onChangeText={(texto) => {
                            // Si el usuario edita a mano, guardamos el texto y borramos el objeto validado
                            setForm((prev) => ({ ...prev, direccion: texto }));
                            setDireccionSeleccionada(null);
                            setErrors((prev) => ({
                              ...prev,
                              direccion: undefined,
                            }));
                          }}
                          onSelectAddress={(dirCompletada) => {
                            // Cuando hace clic en una opción, guardamos el objeto validado
                            setDireccionSeleccionada(dirCompletada);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-10 px-10 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="
                      flex-1 py-3.5 px-6 rounded-3xl
                      bg-trego-restaurante hover:bg-green-700
                      text-white text-base font-bold
                      transition-all duration-200
                      shadow-md hover:shadow-green-200
                    "
                  >
                    Confirmar Solicitud
                  </button>
                  <button
                    onClick={handleCancel}
                    className="
                      flex-1 py-3.5 px-6 rounded-3xl
                      bg-gray-100 hover:bg-gray-200
                      text-gray-600 text-base font-semibold
                      transition-all duration-200
                    "
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
