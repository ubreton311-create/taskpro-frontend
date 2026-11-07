import { useState } from "react";
import { LoaderCircle, X, CheckCircle2 } from "lucide-react";
import { getErrorMessage } from '../utils/errors';

interface Service {
  id: string;
  name: string;
  price: number | string;
  providerId: string;
}

interface BookingModalProps {
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
  apiBaseUrl: string;
}

export default function BookingModal({ service, onClose, onSuccess, apiBaseUrl }: BookingModalProps) {
  const [address, setAddress] = useState("");
  const [rooms, setRooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleBooking = async () => {
    if (!address || !date) {
      setErrorMsg("Por favor completa la dirección y la fecha.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa. Inicia sesión para reservar.");
      }

      // 1. Crear la Propiedad (POST /properties)
      const propRes = await fetch(`${apiBaseUrl}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          rooms,
          bathrooms,
          squareMeters: 80, // Requerido por tu Prisma
        }),
      });

      if (!propRes.ok) {
        const errData = await propRes.json();
        throw new Error(errData.message || "Error al crear la propiedad");
      }
      
      const propertyData = await propRes.json();

      // 2. Crear la Reserva (POST /bookings)
      const bookRes = await fetch(`${apiBaseUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: service.providerId,
          propertyId: propertyData.id,
          scheduledDate: new Date(date).toISOString(),
          totalAmount: Number(service.price),
        }),
      });

      if (!bookRes.ok) {
        const errData = await bookRes.json();
        throw new Error(errData.message || "Error al crear la reserva");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tp-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
      <div className="tp-modal-content" style={{ background: '#fff', padding: 30, borderRadius: 20, width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Reservar {service.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>¡Reserva Exitosa!</h3>
            <p style={{ color: '#666' }}>Tu servicio ha sido agendado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {errorMsg && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, fontSize: 13 }}>{errorMsg}</div>}

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Dirección de la propiedad</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Calle Falsa 123" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 5 }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Habitaciones</label>
                <input type="number" value={rooms} onChange={e => setRooms(Number(e.target.value))} min="1" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 5 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Baños</label>
                <input type="number" value={bathrooms} onChange={e => setBathrooms(Number(e.target.value))} min="1" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 5 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Fecha y Hora</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 5 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 15, borderTop: '1px solid #eee' }}>
              <div>
                <span style={{ fontSize: 12, color: '#666', display: 'block' }}>Total estimado</span>
                <strong style={{ fontSize: 20, color: '#7a2fbf' }}>${Number(service.price).toFixed(2)}</strong>
              </div>
              <button onClick={handleBooking} disabled={loading} style={{ background: '#7a2fbf', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <LoaderCircle size={18} className="spin" /> : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}