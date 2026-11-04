import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, CheckCircle2, ShieldCheck, CalendarDays, Clock } from "lucide-react";

// Datos de respaldo en lo que conectas el endpoint GET /technicians/:id
const techniciansData: Record<string, any> = {
  "tech-1": { name: "Carlos Méndez", specialty: "Plomería", rating: 4.9, reviews: 245, distance: 1.2, available: true, initials: "CM", bio: "Plomero certificado con más de 10 años de experiencia en reparación de fugas, instalación de tuberías y mantenimiento general.", services: ["Reparación de fugas", "Destape de drenajes", "Instalación de muebles de baño"] },
  "tech-2": { name: "Ana Rodríguez", specialty: "Electricidad", rating: 4.8, reviews: 189, distance: 2.5, available: true, initials: "AR", bio: "Ingeniera eléctrica especializada en instalaciones residenciales, tableros de control y reparación de cortocircuitos.", services: ["Instalación de luminarias", "Reparación de tableros", "Cableado estructurado"] },
  "tech-3": { name: "Miguel Torres", specialty: "Reparaciones", rating: 4.7, reviews: 167, distance: 3.8, available: false, initials: "MT", bio: "Técnico en mantenimiento general. Experto en carpintería ligera, pintura y ajustes del hogar.", services: ["Reparación de muebles", "Pintura", "Mantenimiento preventivo"] },
};

export default function TechnicianProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Aquí conectarías a tu API: fetch(`${API_URL}/technicians/${id}`)
  const tech = techniciansData[id || "tech-1"] || techniciansData["tech-1"];

  return (
    <main className="min-h-screen bg-[#f7f5fb] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#7a2fbf] hover:underline">
          <ArrowLeft size={18} /> Volver al inicio
        </button>

        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl shadow-purple-950/5 border border-gray-100">
          
          <div className="bg-gradient-to-r from-[#42116f] to-[#7a2fbf] p-8 text-white relative">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start relative z-10">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-3xl font-black text-[#42116f] shadow-xl">
                {tech.initials}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-black">{tech.name}</h1>
                <p className="mt-1 text-lg text-purple-100">{tech.specialty}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start text-sm font-semibold">
                  <span className="flex items-center gap-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /> {tech.rating} ({tech.reviews} reseñas)</span>
                  <span className="flex items-center gap-1"><MapPin size={16} /> {tech.distance} km de distancia</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full border-[30px] border-white/10" />
          </div>

          <div className="p-8">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#1a1a1a]">Sobre mí</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{tech.bio}</p>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#1a1a1a]">Servicios que ofrece</h2>
                  <ul className="mt-3 space-y-2">
                    {tech.services.map((service: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CheckCircle2 size={18} className="text-green-500" /> {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-4 text-sm text-[#42116f]">
                  <ShieldCheck size={24} className="shrink-0" />
                  <p className="font-semibold">Identidad y antecedentes verificados por TaskPro.</p>
                </div>
              </div>

              <div className="w-full md:w-72 shrink-0">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-center">¿Listo para contratar?</h3>
                  <p className="mt-1 text-xs text-center text-gray-500">Agenda un servicio con {tech.name.split(' ')[0]} hoy mismo.</p>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                      <CalendarDays size={16} className="text-[#7a2fbf]" /> Disponibilidad inmediata
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                      <Clock size={16} className="text-[#7a2fbf]" /> Respuesta en ~15 min
                    </div>
                  </div>

                  <button className="mt-5 w-full rounded-xl bg-[#facc15] py-3.5 text-sm font-black text-[#1a1a1a] shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300">
                    Agendar servicio
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}