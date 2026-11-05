import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  CalendarDays,
  Clock,
  Star,
  ArrowRight,
  Wrench,
  Zap,
  Sparkles,
  Snowflake,
  Users,
  Plus,
  Heart,
  Crown,
  ShieldCheck,
  ChevronRight,
  Navigation,
} from "lucide-react";

import { useTranslation } from "../i18n/i18n";
import { getCurrentUser } from "../utils/auth";

type Service = {
  id: string;
  translationKey: string;
  image: string;
  price: number;
  icon: typeof Wrench;
};

type Technician = {
  id: string;
  name: string;
  specialty: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  available: boolean;
  initials: string;
};

type Appointment = {
  id: string;
  title: string;
  technician: string;
  date: string;
  time: string;
  status: "confirmed" | "pending";
  image: string;
};

const defaultServices: Service[] = [
  {
    id: "plumbing",
    translationKey: "service.plumbing",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=85",
    icon: Wrench,
  },
  {
    id: "electrical",
    translationKey: "service.electrician",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85",
    icon: Zap,
  },
  {
    id: "cleaning",
    translationKey: "service.cleaning",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85",
    icon: Sparkles,
  },
  {
    id: "air-conditioning",
    translationKey: "service.ac",
    price: 550,
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=85",
    icon: Snowflake,
  },
];

const defaultTechnicians: Technician[] = [
  {
    id: "tech-1",
    name: "Carlos Méndez",
    specialty: "Plomería",
    distanceKm: 1.2,
    rating: 4.9,
    reviews: 245,
    available: true,
    initials: "CM",
  },
  {
    id: "tech-2",
    name: "Ana Rodríguez",
    specialty: "Electricidad",
    distanceKm: 2.5,
    rating: 4.8,
    reviews: 189,
    available: true,
    initials: "AR",
  },
  {
    id: "tech-3",
    name: "Miguel Torres",
    specialty: "Reparaciones",
    distanceKm: 3.8,
    rating: 4.7,
    reviews: 167,
    available: false,
    initials: "MT",
  },
];

const defaultAppointments: Appointment[] = [
  {
    id: "apt-1",
    title: "Instalación de aire acondicionado",
    technician: "Carlos Méndez",
    date: "2026-11-05",
    time: "16:00",
    status: "confirmed",
    image: defaultServices[3].image,
  },
  {
    id: "apt-2",
    title: "Reparación de tubería",
    technician: "Ana Rodríguez",
    date: "2026-11-07",
    time: "10:00",
    status: "pending",
    image: defaultServices[0].image,
  },
  {
    id: "apt-3",
    title: "Mantenimiento eléctrico",
    technician: "Miguel Torres",
    date: "2026-11-09",
    time: "14:00",
    status: "confirmed",
    image: defaultServices[1].image,
  },
];

const textFallbacks: Record<string, string> = {
  "hero.badge": "Servicio Premium",
  "hero.title": "¡Hola, {{name}}!",
  "hero.headline": "¿Qué servicio necesitas hoy?",
  "hero.description":
    "Encuentra profesionales confiables cerca de ti, en México y Estados Unidos.",
  "hero.search": "Buscar servicios (ej. plomería, electricidad...)",
  "hero.searchButton": "Buscar",
  "stats.users": "Usuarios registrados",
  "stats.completed": "Servicios completados",
  "stats.rating": "Calificación promedio",
  "services.title": "Servicios populares",
  "services.subtitle": "Los servicios más solicitados en TaskPro",
  "services.viewAll": "Ver todos los servicios",
  "services.from": "Desde",
  "technicians.title": "Técnicos cercanos",
  "technicians.map": "Ver mapa completo",
  "technicians.available": "Disponible",
  "technicians.busy": "Ocupado",
  "technicians.distance": "km",
  "technicians.profile": "Ver perfil",
  "appointments.title": "Próximos servicios",
  "appointments.viewAll": "Ver agenda",
  "appointments.confirmed": "Confirmado",
  "appointments.pending": "Pendiente",
  "premium.title": "TaskPro Premium",
  "premium.description":
    "Contrata los mejores servicios con total confianza",
  "premium.action": "Actualizar plan",
};

export default function Dashboard() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Estados para producción
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [technicians, setTechnicians] = useState<Technician[]>(defaultTechnicians);
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments);

  const user = getCurrentUser();
  const customerName = user?.name?.split(" ")[0] || "Carlos";
  const currency = language === "es" ? "MXN" : "USD";
  const locale = language === "es" ? "es-MX" : "en-US";

  // --- CONEXIÓN REAL A PRODUCCIÓN ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resServices, resTechs, resApts] = await Promise.all([
          fetch("/api/services").catch(() => null),
          fetch("/api/technicians/nearby").catch(() => null),
          fetch("/api/appointments/upcoming").catch(() => null),
        ]);

        if (resServices?.ok) {
          const data = await resServices.json();
          if (data?.length) setServices(data);
        }
        if (resTechs?.ok) {
          const data = await resTechs.json();
          if (data?.length) setTechnicians(data);
        }
        if (resApts?.ok) {
          const data = await resApts.json();
          if (data?.length) setAppointments(data);
        }
      } catch (error) {
        console.warn("Backend offline. Mostrando datos de respaldo.");
      }
    };
    fetchData();
  }, []);

  const tx = (key: string) => {
    const translated = t(key);
    return translated === key
      ? textFallbacks[key] ?? key
      : translated;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(`${date}T12:00:00`));

  const filteredServices = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase(locale);

    if (!normalized) return services;

    return services.filter((service) => {
      const title = t(service.translationKey);
      return title.toLocaleLowerCase(locale).includes(normalized);
    });
  }, [search, language, locale, t, services]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSearch = () => {
    const query = search.trim();
    if (!query) return;
    console.info("Buscar servicios en API:", query);
  };

  const handleAddService = (service: Service) => {
    console.info("Solicitar servicio:", service.id);
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-5 text-[#1a1a1a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#42116f] via-[#7a2fbf] to-[#a855f7] px-6 py-9 text-white shadow-xl shadow-purple-950/15 sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-8 top-8 hidden h-48 w-48 rotate-12 rounded-[36px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:block" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200/50 bg-yellow-400 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#24152f] shadow-lg shadow-yellow-950/10">
              <Star size={15} fill="currentColor" />
              {tx("hero.badge")}
            </span>

            <h1 className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {tx("hero.title").replace("{{name}}", customerName)}
              <br />
              <span className="text-yellow-300">
                {tx("hero.headline")}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
              {tx("hero.description")}
            </p>

            <form
              className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/30 bg-white/95 p-2 shadow-2xl shadow-purple-950/25 backdrop-blur-xl sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search
                  size={21}
                  className="shrink-0 text-[#7a2fbf]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={tx("hero.search")}
                  aria-label={tx("hero.search")}
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-[#1a1a1a] outline-none placeholder:text-gray-500"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#facc15] px-7 py-3 font-extrabold text-[#1a1a1a] shadow-lg shadow-yellow-950/15 transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {tx("hero.searchButton")}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/90">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-yellow-300" />
                Profesionales verificados
              </span>
              <span className="inline-flex items-center gap-2">
                <Star size={15} className="text-yellow-300" />
                Calidad y confianza
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-10 hidden w-64 rounded-2xl border border-white/30 bg-white/15 p-4 shadow-2xl backdrop-blur-xl xl:block">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-400 p-3 text-[#1a1a1a]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">TaskPro Verified</p>
                <p className="mt-1 text-xs text-white/80">
                  Servicios con confianza
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: tx("stats.users"),
              value: "12,500+",
              trend: "+12%",
              icon: Users,
            },
            {
              label: tx("stats.completed"),
              value: "3,200+",
              trend: "+18%",
              icon: Wrench,
            },
            {
              label: tx("stats.rating"),
              value: "4.8/5",
              trend: "★",
              icon: Star,
            },
          ].map((metric) => (
            <article
              key={metric.label}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-purple-950/5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#facc15] text-[#1a1a1a] sm:h-16 sm:w-16">
                <metric.icon size={27} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black tracking-tight sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {metric.label}
                </p>
                <p className="mt-1 text-xs font-bold text-green-600">
                  {metric.trend}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* POPULAR SERVICES */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {tx("services.title")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tx("services.subtitle")}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#7a2fbf] hover:text-[#5b168f] sm:self-auto"
            >
              {tx("services.viewAll")}
              <ArrowRight size={17} />
            </button>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-8 text-center text-sm text-gray-500">
              No se encontraron servicios con ese nombre.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/10"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={service.image}
                      alt={t(service.translationKey)}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=85";
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    <div className="absolute left-3 top-3 rounded-xl bg-[#facc15] p-2.5 text-[#1a1a1a] shadow">
                      <service.icon size={20} />
                    </div>

                    <button
                      type="button"
                      aria-label={`Favorito: ${t(service.translationKey)}`}
                      aria-pressed={favorites.includes(service.id)}
                      onClick={() => toggleFavorite(service.id)}
                      className="absolute right-3 top-3 rounded-full bg-black/25 p-2.5 text-white backdrop-blur-md transition hover:bg-white hover:text-[#7a2fbf]"
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(service.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-extrabold">
                      {t(service.translationKey)}
                    </h3>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          {tx("services.from")}
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {formatPrice(service.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`${tx("service.book")}: ${t(service.translationKey)}`}
                        onClick={() => handleAddService(service)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#facc15] text-[#1a1a1a] shadow-sm transition hover:rotate-90 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7a2fbf]"
                      >
                        <Plus size={23} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* TECHNICIANS + APPOINTMENTS */}
        <section className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-5">

          {/* MAP AND TECHNICIANS */}
          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 2xl:col-span-3">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black sm:text-xl">
                  <MapPin className="text-[#7a2fbf]" size={22} />
                  {tx("technicians.title")}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Profesionales en tu zona
                </p>
              </div>

              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#7a2fbf] hover:underline sm:text-sm"
              >
                {tx("technicians.map")}
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* MAP */}
              <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-gray-100 bg-purple-50">
                <iframe
                  title="Mapa de ejemplo de cobertura de TaskPro"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-117.10%2C32.45%2C-116.85%2C32.60&layer=mapnik"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full border-0"
                />

                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-bold shadow-lg">
                  <Navigation
                    size={15}
                    className="text-[#7a2fbf]"
                  />
                  Zona de ejemplo
                </div>
              </div>

              {/* TECHNICIAN LIST */}
              <div className="space-y-3">
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-purple-200 hover:bg-purple-50/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-yellow-100 text-sm font-black text-[#7a2fbf]">
                      {tech.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">
                        {tech.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {tech.specialty}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                        <Star
                          size={12}
                          fill="#facc15"
                          className="text-yellow-500"
                        />
                        <span className="font-bold text-[#1a1a1a]">
                          {tech.rating}
                        </span>
                        <span>({tech.reviews})</span>
                        <span>·</span>
                        <MapPin size={12} />
                        {tech.distanceKm} {tx("technicians.distance")}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          tech.available
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tech.available
                          ? tx("technicians.available")
                          : tx("technicians.busy")}
                      </span>

                      <button
                        type="button"
                        onClick={() => navigate(`/technician/${tech.id}`)}
                        className="text-xs font-bold text-[#7a2fbf] hover:underline"
                      >
                        {tx("technicians.profile")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* APPOINTMENTS TIMELINE */}
          <aside className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 2xl:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black sm:text-xl">
                  <CalendarDays
                    size={22}
                    className="text-[#7a2fbf]"
                  />
                  {tx("appointments.title")}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Tus próximas citas
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 text-xs font-bold text-[#7a2fbf] hover:underline sm:text-sm"
              >
                {tx("appointments.viewAll")}
                <ArrowRight size={14} className="ml-1 inline" />
              </button>
            </div>

            <div className="space-y-5">
              {appointments.map((appointment) => {
                const confirmed =
                  appointment.status === "confirmed";

                return (
                  <article
                    key={appointment.id}
                    className="relative border-l-2 border-purple-100 pb-1 pl-5 last:border-l-transparent"
                  >
                    <span
                      className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                        confirmed
                          ? "bg-green-500"
                          : "bg-[#facc15]"
                      }`}
                    />

                    <div className="flex items-start gap-3">
                      <img
                        src={appointment.image}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=85";
                        }}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover bg-gray-100"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-500">
                            {formatDate(appointment.date)}
                          </p>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
                              confirmed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-900"
                            }`}
                          >
                            {confirmed
                              ? tx("appointments.confirmed")
                              : tx("appointments.pending")}
                          </span>
                        </div>

                        <h3 className="mt-2 text-sm font-extrabold leading-snug">
                          {appointment.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {appointment.technician}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                          <Clock size={13} />
                          {appointment.time}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl border border-purple-200 px-4 py-3 text-sm font-bold text-[#7a2fbf] transition hover:bg-purple-50"
            >
              {tx("appointments.viewAll")}
            </button>
          </aside>
        </section>

        {/* PREMIUM PROMO */}
        <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-[#42116f] via-[#7a2fbf] to-[#59208e] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[30px] border-white/10" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-yellow-400 p-4 text-[#1a1a1a]">
                <Crown size={30} />
              </div>

              <div>
                <h2 className="text-xl font-black text-yellow-300 sm:text-2xl">
                  {tx("premium.title")}
                </h2>
                <p className="mt-1 max-w-lg text-sm text-purple-100">
                  {tx("premium.description")}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#facc15] px-6 py-3.5 text-sm font-extrabold text-[#1a1a1a] shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              {tx("premium.action")}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} TaskPro. Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}