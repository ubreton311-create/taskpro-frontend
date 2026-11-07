import { useState, useEffect } from "react";
import { LoaderCircle, X, CheckCircle2 } from "lucide-react";
import ServiceCard, { type Service } from "../components/ServiceCard";
import { API_URL } from '../services/config';
import { getErrorMessage, getApiErrorMessage } from '../utils/errors';

// CORRECCIÓN: Usamos la variable de entorno para producción

export default function BookingView() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Estados del Formulario
  const [countryCode, setCountryCode] = useState<"MX" | "US">("MX");
  const [zipCode, setZipCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [extNumber, setExtNumber] = useState("");
  const [intNumber, setIntNumber] = useState("");
  const [date, setDate] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cpLoading, setCpLoading] = useState(false);

  useEffect(() => {
    // CORRECCIÓN: Usamos la constante API_URL
    fetch(`${API_URL}/services`)
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setErrorMsg("Error al cargar el catálogo."))
      .finally(() => setLoading(false));
  }, []);

  // LA MAGIA: Busca Estado y Ciudad por Código Postal
  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value;
    setZipCode(cp);

    if (cp.length === 5) {
      setCpLoading(true);
      try {
        const res = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${cp}`);
        if (res.ok) {
          const data = await res.json();
          const place = data.places[0];
          setStateName(place['state']);
          setCity(place['place name']);
          
          setNeighborhoods(["Colonia Centro", "Fracc. Las Palmas", "Zona Río", "Otra (Especificar)"]);
        } else {
          setStateName("");
          setCity("");
          setNeighborhoods([]);
        }
      } catch (error) {
        console.error("Error buscando CP:", error);
      } finally {
        setCpLoading(false);
      }
    }
  };

  const handleBooking = async () => {
    if (!zipCode || !stateName || !city || !selectedNeighborhood || !street || !extNumber || !date) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }
    
    setSubmitting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay sesión activa.");

      const fullAddress = `${street} ${extNumber}${intNumber ? ` Int ${intNumber}` : ''}, ${selectedNeighborhood}`;

      // 1. Crear Propiedad
      // CORRECCIÓN: Usamos la constante API_URL
      const propRes = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          address: fullAddress,
          city: city,
          state: stateName,
          countryCode: countryCode,
          zipCode: countryCode === "US" ? zipCode : undefined,
          postalCode: countryCode === "MX" ? zipCode : undefined,
        }),
      });
      
      if (!propRes.ok) {
        const propErr = await propRes.json();
        throw new Error(getApiErrorMessage(propErr, "Error al registrar la propiedad."), { cause: propErr });
      }
      const property = await propRes.json();

      // 2. Crear Reserva
      // CORRECCIÓN: Usamos la constante API_URL
      const bookRes = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          providerId: selectedService?.providerId,
          propertyId: property.id,
          scheduledDate: new Date(date).toISOString(),
          totalAmount: Number(selectedService?.price),
        }),
      });

      if (!bookRes.ok) {
        const errData = await bookRes.json();
        throw new Error(getApiErrorMessage(errData, "Error al crear la reserva."), { cause: errData });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedService(null);
        setZipCode(""); setStateName(""); setCity(""); setNeighborhoods([]); setSelectedNeighborhood(""); setStreet(""); setExtNumber(""); setIntNumber(""); setDate("");
      }, 3000);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 600, color: '#7a2fbf' }}>Cargando catálogo premium...</div>;

  return (
    <section className="page-section" style={{ padding: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <span style={{ color: '#7a2fbf', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px' }}>TASK PRO SERVICE</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', color: '#252136' }}>Solicitar Servicio</h1>
        <p style={{ color: '#777386', fontSize: '14px' }}>Selecciona uno de nuestros servicios profesionales para tu hogar.</p>
      </div>

      {errorMsg && !selectedService && <p role="alert">{errorMsg}</p>}
      {!errorMsg && services.length === 0 && <p>No hay servicios disponibles por el momento.</p>}
      <div className="services-grid">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} onBook={setSelectedService} />
        ))}
      </div>

      {selectedService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16, 25, 45, 0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'dropdown-enter 200ms ease both', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#7a2fbf', letterSpacing: '1px' }}>AGENDAR SERVICIO</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: '#252136' }}>{selectedService.name}</h2>
              </div>
              <button type="button" aria-label="Cerrar formulario de reserva" onClick={() => { setSelectedService(null); setErrorMsg(""); setSuccess(false); }} style={{ background: '#f1f3f7', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#777386' }}>
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#252136', margin: '0 0 8px' }}>¡Reserva Exitosa!</h3>
                <p style={{ color: '#777386', fontSize: '14px' }}>Tu servicio ha sido agendado correctamente.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {errorMsg && <div role="alert" style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>{errorMsg}</div>}
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-country" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>País</label>
                    <select id="booking-country" value={countryCode} onChange={(e) => setCountryCode(e.target.value as "US" | "MX")} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }}>
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-postal" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>{countryCode === "US" ? "Zip Code" : "Código Postal"}</label>
                    <div style={{ position: 'relative' }}>
                      <input id="booking-postal" value={zipCode} onChange={handleZipCodeChange} placeholder={countryCode === "US" ? "92101" : "22000"} maxLength={5} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }} />
                      {cpLoading && <LoaderCircle size={16} className="spin" style={{ position: 'absolute', right: 12, top: 22, color: '#7a2fbf' }} />}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-state" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Estado</label>
                    <input id="booking-state" value={stateName} readOnly placeholder="Autocompletado" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', backgroundColor: '#f8f9fc', color: '#777386' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-city" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Municipio / Ciudad</label>
                    <input id="booking-city" value={city} readOnly placeholder="Autocompletado" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', backgroundColor: '#f8f9fc', color: '#777386' }} />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-neighborhood" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Colonia / Fraccionamiento</label>
                  <select id="booking-neighborhood" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} disabled={neighborhoods.length === 0} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none', backgroundColor: neighborhoods.length === 0 ? '#f8f9fc' : '#fff' }}>
                    <option value="">Selecciona una colonia...</option>
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 2 }}>
                    <label htmlFor="booking-street" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Calle</label>
                    <input id="booking-street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Ej. Av. Revolución" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-exterior" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Núm. Ext</label>
                    <input id="booking-exterior" value={extNumber} onChange={(e) => setExtNumber(e.target.value)} placeholder="123" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="booking-interior" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Núm. Int</label>
                    <input id="booking-interior" value={intNumber} onChange={(e) => setIntNumber(e.target.value)} placeholder="(Opcional)" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-date" style={{ fontSize: '13px', fontWeight: 700, color: '#252136' }}>Fecha y Hora</label>
                  <input id="booking-date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '6px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid #eeeaf3' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#777386', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Total a pagar</span>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#7a2fbf' }}>${Number(selectedService.price).toFixed(2)}</div>
                  </div>
                  <button onClick={handleBooking} disabled={submitting} style={{ background: '#7a2fbf', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(122, 47, 191, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {submitting ? <LoaderCircle size={18} className="spin" /> : "Confirmar Reserva"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}