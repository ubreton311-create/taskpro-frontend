import { useState, useEffect } from "react";
import { Send, Lock, ShieldCheck, DollarSign, CheckCircle2, Phone } from "lucide-react";

interface NegotiationPanelProps {
  quoteId: string;
  initialAmount: number;
  onPaymentSuccess: (providerInfo: any) => void;
}

export default function NegotiationPanel({ quoteId, initialAmount, onPaymentSuccess }: NegotiationPanelProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Simulamos el historial por ahora
  const [history, setHistory] = useState<any[]>([]); 

  const handleCounterOffer = async () => {
    if (!amount || !message) return setError("Ingresa un monto y un mensaje.");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/negotiations/counter-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quoteId, amount: Number(amount), message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al enviar contraoferta");

      // Actualizamos el historial local (idealmente hacemos un fetch de los logs aquí)
      setHistory([...history, { amount, message, type: 'sent' }]);
      setMessage("");
      alert("Contraoferta enviada. El sistema ha filtrado cualquier dato de contacto.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/quotes/${quoteId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al procesar el pago");

      // Si el pago es exitoso, el backend nos devuelve el teléfono
      onPaymentSuccess(data.provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' }}>
      
      {/* HEADER */}
      <div style={{ background: '#f8f9fc', padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck color="#7a2fbf" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Negociación Segura</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Los datos de contacto están bloqueados.</p>
        </div>
      </div>

      {/* HISTORIAL CHAT */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '12px', borderRadius: '12px 12px 12px 0', maxWidth: '80%' }}>
          <p style={{ margin: 0, fontSize: '13px' }}>Cotización inicial enviada por <strong>${initialAmount} MXN</strong>.</p>
        </div>
        
        {history.map((msg, i) => (
          <div key={i} style={{ alignSelf: 'flex-end', background: '#7a2fbf', color: '#fff', padding: '12px', borderRadius: '12px 12px 0 12px', maxWidth: '80%' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>Contraoferta: ${msg.amount}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>{msg.message}</p>
          </div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: '16px', borderTop: '1px solid #eee', background: '#fff' }}>
        {error && <p style={{ color: 'red', fontSize: '12px', margin: '0 0 10px' }}>{error}</p>}
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#999' }} />
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Monto"
              style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          <button 
            onClick={handleCounterOffer} 
            disabled={loading}
            style={{ background: '#7a2fbf', color: '#fff', padding: '0 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Send size={18} />
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#999' }} />
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje (No se permiten teléfonos)..."
            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
      </div>

      {/* BOTÓN DE PAGO */}
      <div style={{ padding: '16px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
        <button 
          onClick={handlePayment}
          disabled={loading}
          style={{ width: '100%', background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle2 size={20} />
          Aprobar y Pagar para ver Contacto
        </button>
      </div>

    </div>
  );
}