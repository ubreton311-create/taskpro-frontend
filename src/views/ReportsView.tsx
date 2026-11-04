import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ReportsView() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/quotes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setQuotes(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  // Procesar datos reales para el gráfico
  const chartData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const dataMap = new Map();

    quotes.filter(q => q.status === 'COMPLETED').forEach(q => {
      const date = new Date(q.createdAt);
      const month = months[date.getMonth()];
      const revenue = Number(q.totalAmount) * 0.15; // Comisión del 15%
      
      if (dataMap.has(month)) {
        dataMap.set(month, dataMap.get(month) + revenue);
      } else {
        dataMap.set(month, revenue);
      }
    });

    return Array.from(dataMap, ([name, ingresos]) => ({ name, ingresos }));
  }, [quotes]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.ingresos, 0);
  const completedJobs = quotes.filter(q => q.status === 'COMPLETED').length;

  if (loading) return <div className="p-10 text-center">Cargando reportes...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#252136] tracking-tight">Reportes y Estadísticas</h1>
        <p className="text-[#777386] mt-1">Análisis de ingresos y rendimiento de la plataforma.</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign size={24}/></div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Ingresos Totales (15%)</p>
            <p className="text-2xl font-bold text-[#252136]">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-[#7a2fbf] flex items-center justify-center"><CheckCircle2 size={24}/></div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Trabajos Completados</p>
            <p className="text-2xl font-bold text-[#252136]">{completedJobs}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp size={24}/></div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Promedio por Trabajo</p>
            <p className="text-2xl font-bold text-[#252136]">
              ${completedJobs > 0 ? (totalRevenue / completedJobs).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Ingresos */}
      <div className="bg-white p-6 rounded-2xl border border-[#eeeaf5] shadow-sm">
        <h2 className="text-lg font-bold text-[#252136] mb-6">Ingresos por Mes</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip cursor={{ fill: '#f3e8ff' }} formatter={(val) => [`$${val}`, 'Ingresos']} />
              <Bar dataKey="ingresos" fill="#7a2fbf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}