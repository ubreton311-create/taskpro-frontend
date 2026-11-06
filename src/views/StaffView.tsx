import { useEffect, useState } from "react";
import { Mail, Phone, BriefcaseBusiness, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function StaffView() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo a los PROVEEDORES
          const providers = data.filter((u: any) => u.role === 'PROVIDER');
          setStaff(providers);
        }
      } catch (error) {
        console.error("Error cargando personal", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#252136] tracking-tight">Gestión de Personal</h1>
        <p className="text-[#777386] mt-1">Directorio de proveedores registrados en la plataforma.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#eeeaf5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#eeeaf5] flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-50 text-[#7a2fbf] rounded-xl flex items-center justify-center">
            <BriefcaseBusiness size={20} />
          </div>
          <h2 className="text-lg font-bold text-[#252136]">Lista de Proveedores</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando personal...</div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay proveedores registrados aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF9FC] text-xs font-semibold uppercase tracking-wider text-[#898397]">
                <tr>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Registro</th>
                  <th className="px-6 py-4">Estado KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF4]">
                {staff.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FCFAFE]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 text-[#7a2fbf] flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-[#252136]">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="flex items-center gap-2"><Mail size={14} /> {user.email}</p>
                      {user.phone && <p className="flex items-center gap-2 mt-1"><Phone size={14} /> {user.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {/* Si no tiene perfil, asumimos que está pendiente */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <ShieldCheck size={12} /> Registrado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}