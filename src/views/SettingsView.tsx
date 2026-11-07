import { useEffect, useState } from 'react';
import { Settings, UserRound, Mail, Percent, Save, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import type { AdminProfile } from '../services/adminApi';

export default function SettingsView() {
  const [profile, setProfile] = useState<AdminProfile>({ name: '', email: '' });
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileResponse, settingsResponse] = await Promise.all([
          adminApi.getProfile(),
          adminApi.getPlatformSettings(),
        ]);
        setProfile({ name: profileResponse.name ?? '', email: profileResponse.email ?? '' });
        setCommissionRate(settingsResponse.commissionRate ?? 10);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración.');
      } finally {
        setLoading(false);
      }
    };
    void loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) return setProfileMessage('Completa todos los campos.');
    try {
      setSavingProfile(true);
      setProfileMessage(null);
      const updated = await adminApi.updateProfile({ name: profile.name.trim(), email: profile.email.trim() });
      setProfile({ name: updated.name, email: updated.email });
      setProfileMessage('Tu perfil se actualizó correctamente.');
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) return setSettingsMessage('La comisión debe estar entre 0 y 100.');
    try {
      setSavingSettings(true);
      setSettingsMessage(null);
      const updated = await adminApi.updatePlatformSettings({ commissionRate });
      setCommissionRate(updated.commissionRate);
      setSettingsMessage('La configuración se guardó correctamente.');
    } catch (err) {
      setSettingsMessage(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-[#7a2fbf]" /><p className="mt-3 text-sm text-gray-500">Cargando configuración...</p></div></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-3"><Settings className="h-6 w-6 text-[#7a2fbf]" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Configuración</h1><p className="mt-1 text-sm text-gray-500">Administra tu perfil y los parámetros de TaskPro.</p></div>
      </div>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p className="text-sm">{error}</p></div>}

      {/* Perfil */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5"><div className="rounded-xl bg-purple-100 p-2.5"><UserRound className="h-5 w-5 text-[#7a2fbf]" /></div><div><h2 className="font-bold text-gray-900">Perfil del administrador</h2><p className="mt-1 text-sm text-gray-500">Actualiza tus datos personales.</p></div></div>
        <form onSubmit={handleSaveProfile} className="space-y-5 p-6">
          <div><label className="mb-2 block text-sm font-semibold text-gray-700">Nombre completo</label><div className="relative"><UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="text" required value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100" /></div></div>
          <div><label className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</label><div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="email" required value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100" /></div></div>
          {profileMessage && <p className={`text-sm ${profileMessage.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>{profileMessage}</p>}
          <div className="flex justify-end border-t border-gray-100 pt-5"><button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 rounded-xl bg-[#7a2fbf] px-6 py-3 font-semibold text-white hover:bg-[#6825a5] disabled:opacity-60">{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{savingProfile ? 'Guardando...' : 'Guardar perfil'}</button></div>
        </form>
      </section>

      {/* Plataforma */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5"><div className="rounded-xl bg-purple-100 p-2.5"><ShieldCheck className="h-5 w-5 text-[#7a2fbf]" /></div><div><h2 className="font-bold text-gray-900">Configuración de plataforma</h2><p className="mt-1 text-sm text-gray-500">Define las reglas comerciales.</p></div></div>
        <form onSubmit={handleSaveSettings} className="space-y-6 p-6">
          <div className="max-w-xl"><label className="mb-2 block text-sm font-semibold text-gray-700">Comisión de la plataforma</label><div className="relative"><Percent className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="number" min="0" max="100" step="0.01" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-14 outline-none focus:border-[#7a2fbf] focus:ring-2 focus:ring-purple-100" /><span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500">%</span></div></div>
          {settingsMessage && <p className={`text-sm ${settingsMessage.includes('correctamente') ? 'text-green-600' : 'text-red-600'}`}>{settingsMessage}</p>}
          <div className="flex justify-end border-t border-gray-100 pt-5"><button type="submit" disabled={savingSettings} className="inline-flex items-center gap-2 rounded-xl bg-[#7a2fbf] px-6 py-3 font-semibold text-white hover:bg-[#6825a5] disabled:opacity-60">{savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{savingSettings ? 'Guardando...' : 'Guardar configuración'}</button></div>
        </form>
      </section>
    </div>
  );
}