import { useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, MapPin,
  ShieldCheck, LoaderCircle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type CountryCode = "MX" | "US";
type Step = 1 | 2 | 3 | 4;

interface OnboardingForm {
  fullName: string;
  phone: string;
  canInvoice: boolean;
  country: CountryCode;
  postalCode: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  extNumber: string;
  intNumber: string;
  isRented: boolean;
  addressComments: string;
  experienceYears: string;
  facebook: string;
  instagram: string;
  latitude: string;
  longitude: string;
  verificationCode: string;
}

const INITIAL_FORM: OnboardingForm = {
  fullName: '', phone: '', canInvoice: false, country: 'MX',
  postalCode: '', state: '', city: '', neighborhood: '',
  street: '', extNumber: '', intNumber: '', isRented: false, addressComments: '',
  experienceYears: '', facebook: '', instagram: '',
  latitude: '', longitude: '', verificationCode: ''
};

const inputClass = "w-full rounded-xl border border-[#e8e2ef] bg-white px-4 py-3.5 text-sm text-[#252136] shadow-sm outline-none transition-all duration-300 placeholder:text-[#aaa3b5] hover:border-[#cbb4df] focus:border-[#7a2fbf] focus:bg-white focus:ring-4 focus:ring-[rgba(122,47,191,0.12)] focus:shadow-[0_5px_20px_rgba(122,47,191,0.10)]";
const labelClass = "mb-2 block text-sm font-semibold text-[#383047]";
const fileCardClass = "rounded-2xl border border-dashed border-[#cbb4df] bg-purple-50/50 p-6 text-center hover:border-[#7a2fbf] transition-all duration-300";
const fileInputClass = "block w-full cursor-pointer text-xs text-[#777386] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#7a2fbf] file:to-[#64239f] file:px-4 file:py-2.5 file:font-semibold file:text-white";

export default function ProviderOnboardingView() {
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);
  const [step, setStep] = useState<Step>(1);
  
  const [taxCertificate, setTaxCertificate] = useState<File | null>(null);
  const [recommendationLetters, setRecommendationLetters] = useState<File[]>([]);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [proofOfAddressPhoto, setProofOfAddressPhoto] = useState<File | null>(null);

  const [isSearchingPostalCode, setIsSearchingPostalCode] = useState(false);
  const [postalMessage, setPostalMessage] = useState('');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const postalRequestId = useRef(0);

  function update<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrorMessage('');
  }

  async function searchPostalCode(): Promise<void> {
    const requestId = ++postalRequestId.current;
    const postalCode = form.postalCode.trim();
    setPostalMessage('');
    setErrorMessage('');

    if (!/^\d{5}$/.test(postalCode)) {
      setPostalMessage('Introduce un código postal de 5 dígitos.');
      return;
    }

    setIsSearchingPostalCode(true);

    try {
      const response = await fetch(`https://api.zippopotam.us/${form.country.toLowerCase()}/${postalCode}`);
      if (!response.ok) throw new Error('No se encontraron datos para ese CP.');
      const data = await response.json();
      if (requestId !== postalRequestId.current) return;

      const place = data.places?.[0];
      if (!place) throw new Error('La respuesta no contiene localidades.');

      setForm((current) => ({ ...current, state: place.state ?? '', city: place['place name'] ?? '' }));
      setPostalMessage(data.places.length > 1 ? `Hay ${data.places.length} localidades; se seleccionó la primera.` : 'Código postal encontrado.');
    } catch (error: unknown) {
      if (requestId === postalRequestId.current) {
        setPostalMessage(error instanceof Error ? error.message : 'Error al consultar CP.');
      }
    } finally {
      if (requestId === postalRequestId.current) setIsSearchingPostalCode(false);
    }
  }

  function changeCountry(country: CountryCode): void {
    postalRequestId.current += 1;
    setForm((current) => ({ ...current, country, postalCode: '', state: '', city: '', neighborhood: '' }));
    setPostalMessage('');
    setIsSearchingPostalCode(false);
  }

  function captureGps(): void {
    setErrorMessage(''); setSuccessMessage('');
    if (!navigator.geolocation) return setErrorMessage('Navegador no soporta geolocalización.');

    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({ ...current, latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) }));
        setIsCapturingGps(false);
        setSuccessMessage('Coordenadas GPS capturadas.');
      },
      (error: GeolocationPositionError) => {
        const messages: Record<number, string> = { 1: 'Permiso denegado.', 2: 'Ubicación no disponible.', 3: 'Tiempo de espera agotado.' };
        setErrorMessage(messages[error.code] ?? 'Error de GPS.');
        setIsCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function validateCurrentStep(): string | null {
    if (step === 1) {
      if (!form.fullName.trim() || !form.phone.trim()) return 'Introduce tu nombre y teléfono.';
      if (!form.postalCode || !form.state || !form.city || !form.street || !form.extNumber) return 'Completa la dirección.';
      if (form.canInvoice && !taxCertificate) return 'Adjunta tu constancia fiscal.';
    }
    if (step === 2) {
      if (!form.experienceYears) return 'Indica tus años de experiencia.';
    }
    if (step === 3) {
      if (!idPhoto) return 'Adjunta tu INE o Pasaporte.';
    }
    if (step === 4) {
      if (!form.verificationCode || form.verificationCode.length !== 4) return 'Escribe el código de 4 dígitos.';
      if (!proofOfAddressPhoto) return 'Adjunta la foto de tu domicilio.';
    }
    return null;
  }

  function nextStep(): void {
    const validationError = validateCurrentStep();
    if (validationError) return setErrorMessage(validationError);
    setErrorMessage(''); setSuccessMessage('');
    setStep((current) => Math.min(4, current + 1) as Step);
  }

  function previousStep(): void {
    setErrorMessage(''); setSuccessMessage('');
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const validationError = validateCurrentStep();
    if (validationError) return setErrorMessage(validationError);

    const token = localStorage.getItem("token");
    if (!token) return setErrorMessage("Sesión no encontrada. Inicia sesión de nuevo.");

    setIsSubmitting(true); setErrorMessage(''); setSuccessMessage('');

    try {
      const payload = new FormData();
      
      // Mapeo exacto de campos Frontend -> Backend NestJS
      payload.append('fullName', form.fullName);
      payload.append('phone', form.phone);
      payload.append('canInvoice', String(form.canInvoice));
      payload.append('zipCode', form.postalCode);
      payload.append('state', form.state);
      payload.append('city', form.city);
      payload.append('neighborhood', form.neighborhood);
      payload.append('street', form.street);
      payload.append('extNumber', form.extNumber);
      payload.append('intNumber', form.intNumber);
      payload.append('isRented', String(form.isRented));
      payload.append('addressComments', form.addressComments);
      payload.append('countryCode', form.country);
      payload.append('experienceYears', form.experienceYears);
      payload.append('socialLinks', JSON.stringify({ facebook: form.facebook, instagram: form.instagram }));
      payload.append('references', JSON.stringify([])); // Opcional, el backend parsea un array
      payload.append('verificationCode', form.verificationCode);
      
      if (form.latitude) payload.append('latitude', form.latitude);
      if (form.longitude) payload.append('longitude', form.longitude);

      if (taxCertificate) payload.append('taxCertificate', taxCertificate);
      if (idPhoto) payload.append('idPhoto', idPhoto);
      if (proofOfAddressPhoto) payload.append('proofOfAddressPhoto', proofOfAddressPhoto);
      
      recommendationLetters.forEach((file) => payload.append('recommendationLetters', file));

      const response = await fetch(`${API_URL}/providers/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) throw new Error("Sesión expirada (Error 401). Vuelve a entrar.");
        throw new Error(result.message || `Error del servidor (${response.status}).`);
      }

      setSuccessMessage('¡Expediente enviado exitosamente! Pendiente de revisión.');
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = ['Datos', 'Experiencia', 'Identidad', 'Seguridad'];

  return (
    <main className="min-h-screen bg-[#f8f9fc] px-4 py-10 text-[#252136] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-[#7a2fbf]">
            <ShieldCheck size={14} className="mr-1" /> TASKPRO · VERIFICACIÓN
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Verifica tu perfil profesional</h1>
        </header>

        <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-xl shadow-purple-100/50 sm:p-8">
          <nav aria-label="Progreso" className="mb-8 flex justify-between">
            {steps.map((label, index) => {
              const number = index + 1;
              const isComplete = number < step;
              const isCurrent = number === step;
              return (
                <div key={label} className="flex flex-col items-center text-center w-1/4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all duration-300 ${isComplete || isCurrent ? 'bg-[#7a2fbf] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                    {isComplete ? <Check size={20} /> : number}
                  </div>
                  <p className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-[#7a2fbf]' : 'text-gray-400'}`}>{label}</p>
                </div>
              );
            })}
          </nav>

          {errorMessage && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}
          {successMessage && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>}

          <form onSubmit={submitForm} noValidate>
            {step === 1 && (
              <section className="space-y-5">
                <h2 className="text-xl font-bold">Datos personales y dirección</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nombre completo *</label>
                    <input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Ej. Martha Sánchez" />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono *</label>
                    <input className={inputClass} type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+52 664 123 4567" />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 border border-purple-100 rounded-xl bg-purple-50 cursor-pointer">
                  <input type="checkbox" checked={form.canInvoice} onChange={(e) => update("canInvoice", e.target.checked)} className="h-5 w-5 accent-[#7a2fbf]" />
                  <span className="text-sm font-semibold">¿Puedes emitir facturas?</span>
                </label>

                {form.canInvoice && (
                  <div className={fileCardClass}>
                    <p className="text-sm font-bold mb-2">Constancia Fiscal (PDF)</p>
                    <input type="file" accept=".pdf" onChange={(e) => setTaxCertificate(e.target.files?.[0] || null)} className={fileInputClass} />
                  </div>
                )}

                <div className="mt-6 border-t pt-6">
                  <h3 className="font-bold mb-4">Dirección de ubicación</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>País</label>
                      <select className={inputClass} value={form.country} onChange={(e) => changeCountry(e.target.value as CountryCode)}>
                        <option value="MX">México</option>
                        <option value="US">Estados Unidos</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Código Postal / ZIP</label>
                      <div className="flex gap-2">
                        <input className={inputClass} maxLength={5} value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, ''))} placeholder="Ej. 22000" />
                        <button type="button" onClick={searchPostalCode} disabled={isSearchingPostalCode} className="bg-purple-600 text-white px-4 rounded-xl font-bold text-sm disabled:opacity-50">
                          {isSearchingPostalCode ? <LoaderCircle className="animate-spin" /> : "Buscar"}
                        </button>
                      </div>
                      {postalMessage && <p className="text-xs text-purple-600 mt-1">{postalMessage}</p>}
                    </div>
                    <div><label className={labelClass}>Estado</label><input className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
                    <div><label className={labelClass}>Ciudad</label><input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
                    <div><label className={labelClass}>Colonia</label><input className={inputClass} value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} /></div>
                    <div><label className={labelClass}>Calle</label><input className={inputClass} value={form.street} onChange={(e) => update("street", e.target.value)} /></div>
                    <div><label className={labelClass}>Número Exterior *</label><input className={inputClass} value={form.extNumber} onChange={(e) => update("extNumber", e.target.value)} /></div>
                    <div><label className={labelClass}>Número Interior</label><input className={inputClass} value={form.intNumber} onChange={(e) => update("intNumber", e.target.value)} /></div>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-5">
                <h2 className="text-xl font-bold">Experiencia profesional</h2>
                <div>
                  <label className={labelClass}>Años de experiencia *</label>
                  <input className={inputClass} type="number" min="0" value={form.experienceYears} onChange={(e) => update("experienceYears", e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Facebook (Opcional)</label><input className={inputClass} value={form.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="https://..." /></div>
                  <div><label className={labelClass}>Instagram (Opcional)</label><input className={inputClass} value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="https://..." /></div>
                </div>
                <div className={fileCardClass}>
                  <p className="text-sm font-bold mb-2">Cartas de recomendación (PDF)</p>
                  <input type="file" multiple accept=".pdf" onChange={(e) => setRecommendationLetters(Array.from(e.target.files || []))} className={fileInputClass} />
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-5">
                <h2 className="text-xl font-bold">Verificación de identidad</h2>
                <div className={fileCardClass}>
                  <p className="text-sm font-bold mb-2">INE o Pasaporte (Imagen) *</p>
                  <input type="file" accept="image/*" onChange={(e) => setIdPhoto(e.target.files?.[0] || null)} className={fileInputClass} />
                </div>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                  <p className="font-semibold mb-2">Ubicación GPS (Opcional)</p>
                  <button type="button" onClick={captureGps} disabled={isCapturingGps} className="w-full flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition">
                    {isCapturingGps ? <LoaderCircle className="animate-spin" /> : <MapPin size={18} />}
                    {form.latitude ? "Ubicación Capturada" : "Capturar GPS"}
                  </button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-5">
                <h2 className="text-xl font-bold">Seguridad y ubicación</h2>
                <div>
                  <label className={labelClass}>Código de Seguridad (4 dígitos) *</label>
                  <input className={inputClass} maxLength={4} value={form.verificationCode} onChange={(e) => update("verificationCode", e.target.value.replace(/\D/g, ''))} placeholder="0000" />
                  <p className="text-xs text-gray-500 mt-1">Escribe este código en un papel y tómate una foto con él en tu domicilio.</p>
                </div>
                <div className={fileCardClass}>
                  <p className="text-sm font-bold mb-2">Comprobante de domicilio (Imagen) *</p>
                  <input type="file" accept="image/*" onChange={(e) => setProofOfAddressPhoto(e.target.files?.[0] || null)} className={fileInputClass} />
                </div>
              </section>
            )}

            <div className="mt-8 flex justify-between border-t pt-6">
              <button type="button" onClick={previousStep} disabled={step === 1 || isSubmitting} className="px-5 py-3 border rounded-xl font-bold text-gray-600 disabled:opacity-50 transition hover:bg-gray-50">
                <ArrowLeft size={18} className="inline mr-1" /> Anterior
              </button>
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="px-7 py-3 bg-gradient-to-r from-[#7a2fbf] to-[#64239f] text-white font-bold rounded-xl shadow-lg transition hover:-translate-y-0.5">
                  Siguiente <ArrowRight size={18} className="inline ml-1" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-7 py-3 bg-gradient-to-r from-[#7a2fbf] to-[#64239f] text-white font-bold rounded-xl shadow-lg transition hover:-translate-y-0.5">
                  {isSubmitting ? <LoaderCircle className="animate-spin inline" /> : <CheckCircle2 className="inline mr-1" />}
                  {isSubmitting ? "Enviando..." : "Finalizar Registro"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}