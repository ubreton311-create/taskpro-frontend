import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, Clock3, UserRound, ShieldCheck, CheckCircle2,
  Loader2, Wallet, Sparkles, AlertCircle, Upload, Zap, PawPrint, Baby, Package, Sofa,
  Bath, Wrench, Trees, HeartPulse, BadgeCheck
} from "lucide-react";

// --------------------------------------------------
// TAXONOMÍA COMPLETA
// --------------------------------------------------
const TAXONOMY = [
  {
    id: "limpieza",
    label: "Limpieza",
    icon: Sparkles,
    subcats: [
      { id: "limpieza_hogar", label: "Limpieza Profunda de Hogar" },
      { id: "limpieza_pisos", label: "Limpieza de Pisos" },
      { id: "limpieza_sillones", label: "Limpieza de Sillones" },
      { id: "limpieza_alfombras", label: "Limpieza de Alfombras" },
      { id: "limpieza_oficinas", label: "Limpieza de Oficinas" },
      { id: "planchado", label: "Planchado y Lavandería" }
    ]
  },
  {
    id: "instalaciones",
    label: "Instalaciones",
    icon: Zap,
    subcats: [
      { id: "electricidad", label: "Electricidad" },
      { id: "plomeria", label: "Plomería" },
      { id: "linea_blanca", label: "Línea Blanca" },
      { id: "aire_acondicionado", label: "Aire Acondicionado" },
      { id: "electronica", label: "Electrónica / TV" }
    ]
  },
  {
    id: "reparaciones",
    label: "Reparaciones",
    icon: Wrench,
    subcats: [
      { id: "pintura", label: "Pintura e Impermeabilización" },
      { id: "albanileria", label: "Albañilería" },
      { id: "herreria", label: "Herrería" },
      { id: "carpinteria", label: "Carpintería" },
      { id: "cerrajeria", label: "Cerrajería" },
      { id: "vidreria", label: "Vidriería" }
    ]
  },
  {
    id: "exterior",
    label: "Exterior",
    icon: Trees,
    subcats: [
      { id: "jardineria", label: "Jardinería" }
    ]
  },
  {
    id: "cuidado",
    label: "Cuidado Personal",
    icon: HeartPulse,
    subcats: [
      { id: "enfermeria", label: "Enfermería / Cuidados" }
    ]
  }
];

const DIAGNOSTIC_FEE = 150; 

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(amount);

const getInitials = (name: string) =>
  name.trim().split(" ").filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join("");

interface QuoteRequestPayload {
  technicianId?: string;
  mainCategory: string;
  subCategory: string;
  date: string;
  time: string;
  description: string;
  diagnosticFee: number;
  hasImage: boolean;
  details: Record<string, unknown>;
}

async function createQuoteRequest(payload: QuoteRequestPayload) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("Solicitud enviada al backend:", payload);
  return { success: true, quoteId: `TP-${Date.now()}` };
}

// --------------------------------------------------
// COMPONENTE
// --------------------------------------------------
const RequestQuoteView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const technician = location.state?.technician;
  const technicianName = technician?.fullName || technician?.name || "Técnico asignado";
  const technicianPhoto = technician?.photo;

  // --- ESTADOS GENERALES ---
  const [mainCat, setMainCat] = useState("limpieza");
  const [subCat, setSubCat] = useState("limpieza_hogar");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- ESTADOS DINÁMICOS ---
  // 1. Limpieza
  const [cleanPropertyType, setCleanPropertyType] = useState("casa");
  const [cleanLevels, setCleanLevels] = useState("1");
  const [cleanBedrooms, setCleanBedrooms] = useState(2);
  const [cleanBathrooms, setCleanBathrooms] = useState(1);
  const [cleanHalfBaths, setCleanHalfBaths] = useState(0);
  const [hasTerrace, setHasTerrace] = useState(false);
  const [hasStairs, setHasStairs] = useState(false);
  const [hasFrontPatio, setHasFrontPatio] = useState(false);
  const [hasBackPatio, setHasBackPatio] = useState(false);
  const [floorTile, setFloorTile] = useState(true);
  const [floorWood, setFloorWood] = useState(false);
  const [floorLaminate, setFloorLaminate] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [hasKids, setHasKids] = useState(false);
  const [hasSupplies, setHasSupplies] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [deepStove, setDeepStove] = useState(false);
  const [deepBath, setDeepBath] = useState(false);
  const [deepKitchen, setDeepKitchen] = useState(false);
  const [deepFridge, setDeepFridge] = useState(false);
  const [officeCubicles, setOfficeCubicles] = useState(0);
  const [itemQuantity, setItemQuantity] = useState(1);

  // 2. Pintura
  const [paintPropertyType, setPaintPropertyType] = useState("casa");
  const [paintLevels, setPaintLevels] = useState("1");
  const [paintInterior, setPaintInterior] = useState(true);
  const [paintExterior, setPaintExterior] = useState(false);
  const [paintFurniture, setPaintFurniture] = useState("vacios");
  const [paintCondition, setPaintCondition] = useState("buen-estado");
  const [paintIncludeMaterial, setPaintIncludeMaterial] = useState(false);

  // 3. Plomería / Electricidad
  const [plumbingIssue, setPlumbingIssue] = useState("fuga");
  const [plumbingLocation, setPlumbingLocation] = useState("cocina");
  const [electricalIssue, setElectricalIssue] = useState("cortocircuito");

  // 4. Línea Blanca / Electrónica / A/C
  const [applianceBrand, setApplianceBrand] = useState("");
  const [applianceIssue, setApplianceIssue] = useState("no_enciende");
  const [acUnits, setAcUnits] = useState(1);

  // 5. Albañilería / Carpintería / Herrería / Vidriería / Cerrajería
  const [repairDetails, setRepairDetails] = useState("");
  const [cerrajeriaType, setCerrajeriaType] = useState("apertura");
  const [vidreriaType, setVidreriaType] = useState("cristal_roto");

  // 6. Jardinería
  const [gardenService, setGardenService] = useState("poda");
  const [gardenSize, setGardenSize] = useState("pequeno");

  // 7. Enfermería
  const [nursingService, setNursingService] = useState("curacion");
  const [nursingDuration, setNursingDuration] = useState("1_hora");

  // UI STATES
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [quoteId, setQuoteId] = useState("");

  const today = new Date();
  const minDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!date || !time || !description.trim()) {
      setError("Completa la fecha, hora y una breve descripción.");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        technicianId: technician?.id,
        mainCategory: mainCat,
        subCategory: subCat,
        date,
        time,
        description: description.trim(),
        diagnosticFee: DIAGNOSTIC_FEE,
        hasImage: !!imageFile,
        details: {
          cleanPropertyType, cleanLevels, cleanBedrooms, cleanBathrooms, cleanHalfBaths, officeCubicles,
          cleanAreas: { terrace: hasTerrace, stairs: hasStairs, frontPatio: hasFrontPatio, backPatio: hasBackPatio },
          cleanFloors: { tile: floorTile, wood: floorWood, laminate: floorLaminate },
          cleanExtras: { pets: hasPets, kids: hasKids, hasSupplies, allergies: hasAllergies },
          cleanDeep: { stove: deepStove, bath: deepBath, kitchen: deepKitchen, fridge: deepFridge },
          itemQuantity,
          paintPropertyType, paintLevels, paintInterior, paintExterior, paintFurniture, paintCondition, paintIncludeMaterial,
          plumbingIssue, plumbingLocation, electricalIssue, applianceBrand, applianceIssue, acUnits,
          repairDetails, cerrajeriaType, vidreriaType,
          gardenService, gardenSize,
          nursingService, nursingDuration
        }
      };

      const result = await createQuoteRequest(payload);
      if (!result.success) throw new Error("Error al enviar.");
      
      setQuoteId(result.quoteId);
      setSuccess(true);
    } catch {
      setError("Ocurrió un error al enviar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center p-5">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-purple-100 p-8 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={42} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#42116f] mb-3">¡Solicitud enviada!</h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            El profesional revisará tu solicitud para preparar una cotización formal y negociar contigo.
          </p>
          <div className="bg-purple-50 rounded-2xl p-5 mb-7 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Folio</p>
            <p className="text-xl font-extrabold text-[#42116f]">{quoteId}</p>
          </div>
          <button onClick={() => navigate("/")} className="w-full bg-[#42116f] hover:bg-[#7a2fbf] text-white font-bold py-4 rounded-xl transition-all">
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fc] pb-12">
      
      {/* HEADER SUTIL (Botón regresar y Seguridad) */}
      <header className="w-full bg-white border-b border-gray-100 mb-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#42116f] transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 group-hover:bg-purple-50 transition-colors">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> 
            </div>
            Regresar
          </button>
          
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 border border-green-100">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">Solicitud 100% Segura</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#42116f] tracking-tight">Cotiza tu servicio</h1>
          <p className="text-gray-500 mt-2 max-w-2xl text-sm leading-relaxed">
            Selecciona la categoría, danos los detalles y sube fotos. El profesional acudirá a validar y negociar contigo.
          </p>
        </div>

        {/* TARJETA DEL TÉCNICO (CONTRASTE FORZADO CON !text-white) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#42116f] to-[#7a2fbf] p-5 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 blur-2xl transform skew-x-12 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            {technicianPhoto ? (
              <img src={technicianPhoto} alt={technicianName} className="h-16 w-16 rounded-2xl object-cover border-2 border-white/30 shadow-md shrink-0" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 border-2 border-white/30 text-xl font-black !text-white shadow-inner backdrop-blur-sm">
                {getInitials(technicianName) || <UserRound size={28} className="!text-white" />}
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest !text-purple-100 mb-1">Profesional Asignado</p>
              
              {/* FORZANDO EL COLOR BLANCO CON ! */}
              <h2 className="text-xl font-black !text-white leading-tight drop-shadow-sm">{technicianName}</h2>
              
              <p className="text-xs font-semibold !text-white flex items-center gap-1 mt-1">
                <BadgeCheck size={14} className="text-[#facc15]"/> Verificado por TaskPro
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 bg-black/20 rounded-2xl px-5 py-3 border border-white/10 backdrop-blur-md shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider !text-purple-100 mb-0.5">Costo de Visita</p>
              
              {/* FORZANDO EL COLOR AMARILLO CON ! */}
              <p className="text-2xl font-black !text-[#facc15] leading-none drop-shadow-sm">{formatCurrency(DIAGNOSTIC_FEE)}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <section className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SELECTOR DE CATEGORÍA */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-900">1. ¿Qué servicio necesitas?</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {TAXONOMY.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setMainCat(cat.id);
                        // Keep the sub-service select in sync with the chosen category.
                        const [firstSub] = cat.subcats;
                        if (firstSub) setSubCat(firstSub.id);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        mainCat === cat.id ? "border-[#7a2fbf] bg-purple-50 text-[#42116f] shadow-sm" : "border-gray-100 bg-white text-gray-500 hover:border-purple-200"
                      }`}
                    >
                      <cat.icon size={20} className={`mb-1.5 ${mainCat === cat.id ? "text-[#7a2fbf]" : "text-gray-400"}`} />
                      <span className="text-[11px] font-bold">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 mt-3">Especifica el servicio:</label>
                  <select 
                    value={subCat} 
                    onChange={(e) => setSubCat(e.target.value)} 
                    className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none text-sm font-semibold focus:bg-white focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100"
                  >
                    {TAXONOMY.find(c => c.id === mainCat)?.subcats.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. LÓGICA DINÁMICA */}
              
              {/* --- LIMPIEZAS --- */}
              {["limpieza_hogar", "limpieza_pisos", "limpieza_sillones", "limpieza_alfombras", "limpieza_oficinas", "planchado"].includes(subCat) && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Limpieza</h3>
                  
                  {subCat === "limpieza_hogar" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Tipo de inmueble</label>
                          <select value={cleanPropertyType} onChange={(e) => setCleanPropertyType(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                            <option value="casa">Casa</option>
                            <option value="departamento">Departamento</option>
                            <option value="oficina">Oficina</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Número de niveles</label>
                          <select value={cleanLevels} onChange={(e) => setCleanLevels(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                            <option value="1">1 nivel</option>
                            <option value="2">2 niveles</option>
                            <option value="3">3 niveles</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1"><Sofa size={12} /> Recámaras</label>
                          <input type="number" min="0" value={cleanBedrooms} onChange={(e) => setCleanBedrooms(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1"><Bath size={12} /> Baños</label>
                          <input type="number" min="0" value={cleanBathrooms} onChange={(e) => setCleanBathrooms(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1 flex items-center gap-1"><Bath size={12} /> Medios baños</label>
                          <input type="number" min="0" value={cleanHalfBaths} onChange={(e) => setCleanHalfBaths(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Áreas adicionales</label>
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasTerrace} onChange={(e) => setHasTerrace(e.target.checked)} /> Terraza / Balcón</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasStairs} onChange={(e) => setHasStairs(e.target.checked)} /> Escaleras</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasFrontPatio} onChange={(e) => setHasFrontPatio(e.target.checked)} /> Patio Frontal</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasBackPatio} onChange={(e) => setHasBackPatio(e.target.checked)} /> Patio Trasero</label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Tipo de piso</label>
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={floorTile} onChange={(e) => setFloorTile(e.target.checked)} /> Loseta / Cerámica</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={floorWood} onChange={(e) => setFloorWood(e.target.checked)} /> Madera</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={floorLaminate} onChange={(e) => setFloorLaminate(e.target.checked)} /> Laminado</label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-purple-100">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Condiciones especiales</label>
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} /> <PawPrint size={12} /> Hay mascotas</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasKids} onChange={(e) => setHasKids(e.target.checked)} /> <Baby size={12} /> Hay niños</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasAllergies} onChange={(e) => setHasAllergies(e.target.checked)} /> <AlertCircle size={12} /> Alergias a químicos</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hasSupplies} onChange={(e) => setHasSupplies(e.target.checked)} /> <Package size={12} /> Yo pongo los productos</label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Limpieza profunda (opcional)</label>
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={deepStove} onChange={(e) => setDeepStove(e.target.checked)} /> Estufa / Horno</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={deepKitchen} onChange={(e) => setDeepKitchen(e.target.checked)} /> Cocina completa</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={deepBath} onChange={(e) => setDeepBath(e.target.checked)} /> Baño (sarro)</label>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={deepFridge} onChange={(e) => setDeepFridge(e.target.checked)} /> Refrigerador</label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {["limpieza_pisos", "limpieza_sillones", "limpieza_alfombras", "planchado"].includes(subCat) && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">¿Cuántas piezas / áreas / prendas son?</label>
                      <input type="number" min="1" value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                    </div>
                  )}

                  {subCat === "limpieza_oficinas" && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">¿Cuántos cubiculos / estaciones hay?</label>
                      <input type="number" min="1" value={officeCubicles} onChange={(e) => setOfficeCubicles(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                    </div>
                  )}
                </div>
              )}

              {/* --- PINTURA --- */}
              {subCat === "pintura" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Pintura</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Tipo de inmueble</label>
                      <select value={paintPropertyType} onChange={(e) => setPaintPropertyType(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="casa">Casa</option>
                        <option value="empresa">Empresa / Oficina</option>
                        <option value="comercio">Local Comercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Niveles del inmueble</label>
                      <select value={paintLevels} onChange={(e) => setPaintLevels(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="1">1 nivel</option>
                        <option value="2">2 niveles</option>
                        <option value="3">3 niveles</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1.5">¿Qué se va a pintar?</label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={paintInterior} onChange={(e) => setPaintInterior(e.target.checked)} /> Interiores</label>
                        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={paintExterior} onChange={(e) => setPaintExterior(e.target.checked)} /> Exteriores / Fachada</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Estado actual de las paredes</label>
                      <select value={paintCondition} onChange={(e) => setPaintCondition(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="buen-estado">Buen estado (Solo pintura)</option>
                        <option value="agrietadas">Agrietadas / Necesita resane</option>
                        <option value="humedad">Con humedad / Impermeabilizar</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-purple-100">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">¿Cómo están los muebles?</label>
                      <select value={paintFurniture} onChange={(e) => setPaintFurniture(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="vacios">Áreas vacías</option>
                        <option value="cubiertos">Muebles cubiertos (No mover)</option>
                        <option value="mover">Se requiere mover muebles</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={paintIncludeMaterial} onChange={(e) => setPaintIncludeMaterial(e.target.checked)} className="w-3.5 h-3.5 text-[#7a2fbf] rounded" />
                        <span className="text-xs font-semibold text-gray-700">Cotizar con material incluido</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PLOMERÍA --- */}
              {subCat === "plomeria" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Plomería</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Tipo de problema</label>
                      <select value={plumbingIssue} onChange={(e) => setPlumbingIssue(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="fuga">Fuga de agua</option>
                        <option value="destape">Destape de drenaje</option>
                        <option value="instalacion">Instalación (Llaves/Muebles)</option>
                        <option value="calentador">Problema con calentador</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Ubicación</label>
                      <select value={plumbingLocation} onChange={(e) => setPlumbingLocation(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="cocina">Cocina</option>
                        <option value="bano">Baño</option>
                        <option value="patio">Patio / Exterior</option>
                        <option value="general">Toda la casa</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ELECTRICIDAD --- */}
              {subCat === "electricidad" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Electricidad</h3>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">¿Cuál es el problema eléctrico?</label>
                    <select value={electricalIssue} onChange={(e) => setElectricalIssue(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                      <option value="cortocircuito">Cortocircuito / Apagones</option>
                      <option value="instalacion">Instalación de contactos/lámparas</option>
                      <option value="tablero">Revisión de tablero / Pastillas</option>
                      <option value="cableado">Cableado nuevo</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- LÍNEA BLANCA / ELECTRÓNICA / A/C --- */}
              {["linea_blanca", "electronica", "aire_acondicionado"].includes(subCat) && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles del Equipo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Marca del equipo</label>
                      <input type="text" value={applianceBrand} onChange={(e) => setApplianceBrand(e.target.value)} placeholder="Ej. LG, Samsung..." className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Falla principal</label>
                      <select value={applianceIssue} onChange={(e) => setApplianceIssue(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="no_enciende">No enciende</option>
                        <option value="hace_ruido">Hace ruido extraño</option>
                        <option value="no_enfria">No enfría</option>
                        <option value="fuga_agua">Fuga de agua</option>
                        <option value="instalacion">Requiere instalación</option>
                        <option value="mantenimiento">Mantenimiento</option>
                      </select>
                    </div>
                  </div>
                  {subCat === "aire_acondicionado" && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Número de equipos A/C</label>
                      <input type="number" min="1" value={acUnits} onChange={(e) => setAcUnits(Number(e.target.value))} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold" />
                    </div>
                  )}
                </div>
              )}

              {/* --- REPARACIONES --- */}
              {["albanileria", "herreria", "carpinteria"].includes(subCat) && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de la Reparación</h3>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Describe el trabajo a realizar</label>
                    <textarea rows={2} value={repairDetails} onChange={(e) => setRepairDetails(e.target.value)} placeholder="Ej. Reparar barda, cambiar puerta..." className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold resize-none" />
                  </div>
                </div>
              )}

              {/* --- CERRAJERÍA --- */}
              {subCat === "cerrajeria" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Cerrajería</h3>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Servicio requerido</label>
                    <select value={cerrajeriaType} onChange={(e) => setCerrajeriaType(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                      <option value="apertura">Apertura de puerta</option>
                      <option value="cambio_chapa">Cambio de chapa</option>
                      <option value="instalacion">Instalación nueva</option>
                      <option value="caja_fuerte">Caja fuerte</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- VIDRIERÍA --- */}
              {subCat === "vidreria" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Vidriería</h3>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Servicio requerido</label>
                    <select value={vidreriaType} onChange={(e) => setVidreriaType(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                      <option value="cristal_roto">Cambio de cristal</option>
                      <option value="ventana">Instalación de ventana</option>
                      <option value="cancel">Cancel de baño</option>
                      <option value="espejo">Corte de espejo</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- JARDINERÍA --- */}
              {subCat === "jardineria" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Jardinería</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Servicio</label>
                      <select value={gardenService} onChange={(e) => setGardenService(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="poda">Poda</option>
                        <option value="corte">Corte de pasto</option>
                        <option value="fumigacion">Fumigación</option>
                        <option value="limpieza">Limpieza general</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Tamaño</label>
                      <select value={gardenSize} onChange={(e) => setGardenSize(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="pequeno">Pequeño</option>
                        <option value="mediano">Mediano</option>
                        <option value="grande">Grande</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ENFERMERÍA --- */}
              {subCat === "enfermeria" && (
                <div className="bg-[#faf9fc] border border-purple-100 rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-black text-[#42116f] uppercase tracking-wider border-b border-purple-100 pb-2">Detalles de Cuidado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Servicio</label>
                      <select value={nursingService} onChange={(e) => setNursingService(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="curacion">Curación</option>
                        <option value="inyeccion">Inyección</option>
                        <option value="cuidado_adulto">Adulto mayor</option>
                        <option value="sueroterapia">Sueroterapia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Duración</label>
                      <select value={nursingDuration} onChange={(e) => setNursingDuration(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-gray-200 outline-none text-sm font-semibold">
                        <option value="1_hora">1 hora</option>
                        <option value="turno_8h">8 horas</option>
                        <option value="turno_12h">12 horas</option>
                        <option value="24h">24 horas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}


              {/* 3. FECHA Y HORA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Fecha tentativa</label>
                  <div className="relative">
                    <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a2fbf] pointer-events-none" />
                    <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100 outline-none transition text-sm text-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Hora preferida</label>
                  <div className="relative">
                    <Clock3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a2fbf] pointer-events-none" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100 outline-none transition text-sm text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 4. DESCRIPCIÓN CORTA */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Notas adicionales</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. La puerta principal tiene la chapa descompuesta..."
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100 outline-none transition resize-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* 5. IMAGEN */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sube fotos (opcional)</label>
                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${imagePreview ? 'border-[#7a2fbf] bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                  {imagePreview ? (
                    <div className="relative w-full h-full p-1">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                        <p className="text-white text-[10px] font-bold">Cambiar imagen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 mb-1.5 text-[#7a2fbf]" />
                      <p className="text-[11px] text-gray-500"><span className="font-bold text-[#7a2fbf]">Haz clic</span> o arrastra</p>
                      <p className="text-[9px] text-gray-400">PNG, JPG</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3 text-red-600">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /><p className="text-xs font-medium">{error}</p>
                </div>
              )}

              {/* BOTÓN DE ENVÍO CON TEXTO BLANCO FORZADO */}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#42116f] hover:bg-[#7a2fbf] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 text-sm">
                {loading ? (<><Loader2 size={18} className="animate-spin !text-white" /> <span className="!text-white">Enviando...</span></>) : (<><span className="!text-white">Solicitar diagnóstico y negociar</span> <CheckCircle2 size={18} className="!text-white" /></>)}
              </button>
            </form>
          </section>

          {/* DERECHA: INFO (FONDO MORADO, TEXTOS BLANCOS FORZADOS) */}
          <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="bg-[#42116f] p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Wallet size={18} className="text-[#facc15]" /></div>
                  
                  {/* FORZANDO TEXTO BLANCO */}
                  <h3 className="text-base font-extrabold !text-white">¿Cómo funciona?</h3>
                </div>
                <p className="!text-purple-100 text-xs">No te preocupes por calcular metros cuadrados. Nosotros nos adaptamos a ti.</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7a2fbf] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-gray-600">Selecciona las características de tu propiedad.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7a2fbf] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-gray-600">Sube una foto para que el experto vea el área.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7a2fbf] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-gray-600">Paga los {formatCurrency(DIAGNOSTIC_FEE)} de visita. El técnico llegará, confirmará y <strong>negociará el precio final</strong> contigo.</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-3 mt-4 border border-purple-100">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-[#42116f]">Costo de Visita</span>
                      <span className="font-black text-[#42116f] text-sm">{formatCurrency(DIAGNOSTIC_FEE)}</span>
                    </div>
                    <p className="text-[10px] text-purple-600 leading-relaxed">Este monto garantiza la asistencia del profesional y se descuenta del total si aceptas el trabajo.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default RequestQuoteView;