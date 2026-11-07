import { useState, type FormEvent, type ElementType } from "react";
import { API_URL, SUPPORT } from '../services/config';
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
  BadgeCheck,
  Wallet,
  CalendarCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";

// ======================================================
// CONFIGURACIÓN
// ======================================================

// ======================================================
// TIPOS
// ======================================================
type ContactForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type Benefit = {
  title: string;
  description: string;
  icon: ElementType;
  gradient: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

// ======================================================
// BENEFICIOS
// ======================================================
const benefits: Benefit[] = [
  {
    title: "Servicio rápido",
    description: "Conectamos tus necesidades con profesionales para que recibas atención sin complicaciones.",
    icon: Zap,
    gradient: "from-yellow-300 to-amber-400",
  },
  {
    title: "Calidad garantizada",
    description: "Trabajamos para ofrecerte experiencias de servicio confiables y satisfactorias.",
    icon: ShieldCheck,
    gradient: "from-purple-500 to-violet-700",
  },
  {
    title: "Soporte 24/7",
    description: "Estamos disponibles para ayudarte cuando tengas preguntas o necesites asistencia.",
    icon: Headphones,
    gradient: "from-fuchsia-500 to-purple-700",
  },
  {
    title: "Precios transparentes",
    description: "Consulta los precios y las condiciones de tu servicio antes de confirmar.",
    icon: Wallet,
    gradient: "from-amber-400 to-yellow-500",
  },
  {
    title: "Flexibilidad total",
    description: "Encuentra opciones que se adapten a tus horarios y necesidades.",
    icon: RefreshCw,
    gradient: "from-violet-500 to-purple-800",
  },
  {
    title: "Profesionales verificados",
    description: "Priorizamos la confianza y la validación de los profesionales de nuestra plataforma.",
    icon: BadgeCheck,
    gradient: "from-yellow-400 to-orange-500",
  },
];

// ======================================================
// COMPONENTE: CONTACT CARD
// ======================================================
type ContactCardProps = {
  icon: ElementType;
  title: string;
  value: string;
  description: string;
  href: string;
  external?: boolean;
};

function ContactCard({ icon: Icon, title, value, description, href, external = false }: ContactCardProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-950/5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#42116f] to-[#7a2fbf] text-white shadow-md shadow-purple-900/20 transition-transform group-hover:scale-105">
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
        <p className="mt-1 truncate text-sm font-extrabold text-[#42116f]">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#7a2fbf]" />
    </a>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
export default function CustomerServiceView() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      setError("Completa todos los campos para continuar.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Ingresa una dirección de correo electrónico válida.");
      return;
    }

    if (form.phone.trim().length < 7) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("El mensaje debe contener al menos 10 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No fue posible enviar tu mensaje.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al enviar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Public support channels come from configuration; unset channels are not
  // rendered at all, so a real customer never reaches a placeholder number.
  const whatsappUrl = SUPPORT.whatsapp
    ? `https://wa.me/${SUPPORT.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hola, necesito ayuda con TaskPro.")}`
    : null;
  const mailtoUrl = SUPPORT.email ? `mailto:${SUPPORT.email}` : null;
  const telUrl = SUPPORT.phone ? `tel:${SUPPORT.phone.replace(/[^\d+]/g, "")}` : null;
  const hasContactChannel = Boolean(whatsappUrl || mailtoUrl || telUrl);

  return (
    <main className="min-h-screen bg-[#f8f6fc] px-4 py-8 text-[#1a1a1a] sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        <header className="mb-9">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#7a2fbf] shadow-sm">
            <Sparkles size={15} /> Centro de ayuda TaskPro
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#42116f] sm:text-4xl lg:text-5xl">
                ¿Cómo podemos <span className="text-[#7a2fbf]">ayudarte?</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                Estamos aquí para resolver tus dudas, escuchar tus comentarios y ayudarte a disfrutar de una mejor experiencia con TaskPro.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" /> Centro de atención TaskPro
            </div>
          </div>
        </header>

        {/* CONTACT SECTION */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT: CONTACT FORM */}
          <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-8 lg:col-span-7">
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-[#42116f]">
                <MessageCircle size={23} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#42116f] sm:text-2xl">Envíanos un mensaje</h2>
                <p className="mt-1 text-sm text-gray-500">Completa el formulario y cuéntanos cómo podemos ayudarte.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-bold text-gray-700">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-gray-200 bg-[#faf9fc] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a2fbf] focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-bold text-gray-700">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-gray-200 bg-[#faf9fc] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a2fbf] focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-phone" className="mb-2 block text-sm font-bold text-gray-700">
                  Número de teléfono <span className="text-red-500">*</span>
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-[#faf9fc] transition focus-within:border-[#7a2fbf] focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-100">
                  <div className="flex items-center gap-2 border-r border-gray-200 px-3 text-sm font-semibold text-gray-500">
                    <Phone size={16} /> <span>+52</span>
                  </div>
                  <input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="664 000 0000"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">Incluye tu lada si tu número no es de México.</p>
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-bold text-gray-700">
                  ¿En qué podemos ayudarte? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  minLength={10}
                  maxLength={2000}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Escribe aquí tu consulta, comentario o solicitud..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#faf9fc] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a2fbf] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
                <div className="mt-2 text-right text-xs text-gray-400">{form.message.length}/2000 caracteres</div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <ShieldCheck size={19} className="shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div role="status" className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <div>
                    <p className="font-extrabold">¡Mensaje enviado correctamente!</p>
                    <p className="mt-1 text-xs">Hemos recibido tu solicitud. Gracias por contactar a TaskPro.</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#facc15] px-6 py-4 text-sm font-black text-[#1a1a1a] shadow-lg shadow-yellow-900/10 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2fbf] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={19} className="animate-spin" /> Enviando mensaje...</>
                ) : (
                  <>Enviar mensaje <Send size={18} className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">Tus datos serán utilizados para atender tu solicitud.</p>
            </form>
          </div>

          {/* RIGHT: CONTACT INFORMATION */}
          <aside className="flex flex-col gap-5 lg:col-span-5">
            <div className="rounded-3xl border border-purple-100 bg-[#f0eafa] p-5 sm:p-6">
              <h2 className="mb-2 text-xl font-black text-[#42116f]">Información de contacto</h2>
              <p className="mb-5 text-sm leading-6 text-gray-500">Elige el canal que prefieras para comunicarte con nuestro equipo.</p>
              <div className="space-y-3">
                {mailtoUrl && SUPPORT.email && (
                  <ContactCard icon={Mail} title="Correo electrónico" value={SUPPORT.email} description="Escríbenos tus consultas" href={mailtoUrl} />
                )}
                {telUrl && SUPPORT.phone && (
                  <ContactCard icon={Phone} title="Teléfono" value={SUPPORT.phone} description="Atención telefónica" href={telUrl} />
                )}
                {whatsappUrl && (
                  <ContactCard icon={MessageCircle} title="WhatsApp" value="Chatea con nosotros" description="Envíanos un mensaje directo" href={whatsappUrl} external />
                )}
                {!hasContactChannel && (
                  <p className="text-sm leading-6 text-gray-500">
                    Los canales de contacto directo no están disponibles todavía.
                    Envíanos tu solicitud con el formulario y te responderemos por correo.
                  </p>
                )}
              </div>
            </div>

            <div className="relative isolate flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#42116f] via-[#60209b] to-[#7a2fbf] p-6 text-white shadow-xl shadow-purple-950/15 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/10" />
              <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-2xl" />
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
                  <Headphones size={28} className="text-[#facc15]" />
                </div>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#facc15] px-3 py-1.5 text-xs font-black text-[#42116f]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" /> COMPROMISO TASKPRO
                </div>
                
                {/* CORRECCIÓN DE CONTRASTE: AQUI SE AGREGA text-white */}
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">
                  Soporte<br />
                  <span className="text-[#facc15]">24/7</span>
                </h3>
                
                <p className="mt-3 max-w-sm text-sm font-medium leading-7 text-purple-100">
                  Queremos que tengas la mejor experiencia. Nuestro centro de ayuda está diseñado para acompañarte en cada paso.
                </p>
                {(whatsappUrl || mailtoUrl) && (
                  <a
                    href={whatsappUrl ?? mailtoUrl ?? "#"}
                    {...(whatsappUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#facc15] px-5 py-3.5 text-sm font-black text-[#1a1a1a] shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300"
                  >
                    Contactar soporte <ArrowRight size={18} />
                  </a>
                )}
                <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-5">
                  <div className="flex -space-x-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#60209b] bg-yellow-300 text-[#42116f]"><Users size={16} /></div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#60209b] bg-purple-200 text-[#42116f]"><Headphones size={16} /></div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#60209b] bg-white text-[#42116f]"><Star size={16} /></div>
                  </div>
                  <p className="text-xs leading-5 text-purple-100">Estamos aquí para ayudarte.<br /><strong className="text-white">Tu experiencia es nuestra prioridad.</strong></p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* BENEFITS SECTION */}
        <section className="mt-14 lg:mt-20">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#7a2fbf]">
              <Sparkles size={14} /> La experiencia TaskPro
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#42116f] sm:text-3xl lg:text-4xl">¿Por qué elegir TaskPro?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">Creamos una plataforma pensada para conectar personas con servicios de forma sencilla, confiable y transparente.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-950/10">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-50 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative z-10">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${benefit.gradient} text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-[#42116f]">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-500">{benefit.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-xs font-extrabold text-[#7a2fbf]">
                      <span>TaskPro</span><span className="h-1 w-1 rounded-full bg-[#facc15]" /><span>Tu aliado en servicios</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm sm:p-9 lg:mt-16">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex items-center gap-4">
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#42116f] to-[#7a2fbf] text-white sm:flex"><CalendarCheck size={30} /></div>
              <div>
                <h3 className="text-xl font-black text-[#42116f] sm:text-2xl">Estamos listos para ayudarte.</h3>
                <p className="mt-2 text-sm text-gray-500">Tu satisfacción es parte de nuestro compromiso.</p>
              </div>
            </div>
            {(mailtoUrl || whatsappUrl) && (
              <a
                href={mailtoUrl ?? whatsappUrl ?? "#"}
                {...(mailtoUrl ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#facc15] px-7 py-4 text-sm font-black text-[#1a1a1a] shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Hablar con TaskPro <ArrowRight size={18} />
              </a>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-purple-100 py-6 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} TaskPro. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}