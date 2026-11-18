'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiFetch, getStoredToken } from '../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [macrodistritos, setMacrodistritos] = useState<any[]>([]);
  const [selectedMacro, setSelectedMacro] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');

  // Password state
  const [passActual, setPassActual] = useState('');
  const [passNuevo, setPassNuevo] = useState('');

  const loadData = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const [pData, mData] = await Promise.all([
        apiFetch('/users/profile'),
        apiFetch('/macrodistritos'),
      ]);

      setProfile(pData);
      setNombre(pData.nombre);
      setApellidos(pData.apellidos);
      setTelefono(pData.telefono || '');
      setMacrodistritos(mData);
    } catch (err: any) {
      setMsg({ text: err.message || 'Error cargando perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ nombre, apellidos, telefono }),
      });
      setMsg({ text: 'Perfil actualizado exitosamente', type: 'success' });
      loadData();
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await apiFetch('/users/password', {
        method: 'PATCH',
        body: JSON.stringify({
          passwordActual: passActual,
          passwordNuevo: passNuevo,
        }),
      });
      setMsg({ text: 'Contraseña cambiada exitosamente', type: 'success' });
      setPassActual('');
      setPassNuevo('');
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedMacro) return;
    setMsg(null);
    try {
      await apiFetch('/users/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ idMacrodistrito: parseInt(selectedMacro, 10) }),
      });
      setSelectedMacro('');
      loadData();
      setMsg({ text: 'Suscripción zonal agregada', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleRemoveSubscription = async (id: number) => {
    setMsg(null);
    try {
      await apiFetch(`/users/subscriptions/${id}`, { method: 'DELETE' });
      loadData();
      setMsg({ text: 'Suscripción eliminada', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Cargando datos del perfil...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Mi Perfil y Preferencias</h1>
        <p className="text-sm text-zinc-500">
          Sprint 5 (HU16): Gestión de datos personales, credenciales y suscripciones a macrodistritos.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-lg text-sm ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* TARJETA DE ESTADO Y ROLES */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {profile?.nombre} {profile?.apellidos}
            </h2>
            <p className="text-sm text-zinc-500">{profile?.correo}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {profile?.roles?.map((r: string) => (
              <Badge key={r} variant={r === 'Administrador' ? 'severe' : r === 'Sismólogo' ? 'warning' : 'info'}>
                {r}
              </Badge>
            ))}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                profile?.estado ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {profile?.estado ? 'Cuenta Activa' : 'Cuenta Suspendida'}
            </span>
          </div>
        </div>

        {profile?.perfilSismologo && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong className="block font-bold">Matrícula Sismológica Oficial:</strong>
            <span>N°: {profile.perfilSismologo.numeroAcreditacion}</span> |{' '}
            <span>Institución: {profile.perfilSismologo.institucionAcreditadora}</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDITAR DATOS PERSONALES */}
        <Card title="Datos Personales" subtitle="Actualiza tus datos de contacto">
          <form onSubmit={handleUpdateProfile} className="space-y-2">
            <Input
              label="Nombres"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Input
              label="Apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
            <Input
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" variant="accent" className="w-full">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>

        {/* CAMBIO DE CONTRASEÑA */}
        <Card title="Seguridad de Acceso" subtitle="Actualiza tu contraseña (RNF03)">
          <form onSubmit={handleChangePassword} className="space-y-2">
            <Input
              label="Contraseña Actual"
              type="password"
              placeholder="••••••••"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              required
            />
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Mínimo 8 car., 1 mayús., 1 núm., 1 símb."
              value={passNuevo}
              onChange={(e) => setPassNuevo(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full">
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* GESTIÓN DE SUSCRIPCIONES A MACRODISTRITOS (RF5.02 / RF2.03) */}
      <Card
        title="Suscripciones Zonales de Alerta"
        subtitle="Selecciona los macrodistritos del Municipio de La Paz de los cuales deseas recibir alertas"
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            className="flex-1 min-h-[44px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-800 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
            value={selectedMacro}
            onChange={(e) => setSelectedMacro(e.target.value)}
          >
            <option value="">Selecciona un macrodistrito para suscribirte...</option>
            {macrodistritos.map((m) => (
              <option key={m.idMacrodistrito} value={m.idMacrodistrito}>
                {m.nombre}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="accent"
            onClick={handleAddSubscription}
            disabled={!selectedMacro}
          >
            Agregar Zona
          </Button>
        </div>

        {profile?.suscripciones && profile.suscripciones.length > 0 ? (
          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-lg overflow-hidden">
            {profile.suscripciones.map((s: any) => (
              <div
                key={s.idSuscripcion}
                className="p-3.5 flex justify-between items-center hover:bg-zinc-50"
              >
                <div>
                  <strong className="text-sm text-zinc-900 block">
                    Macrodistrito {s.macrodistrito || `ID #${s.idMacrodistrito}`}
                  </strong>
                  <span className="text-xs text-zinc-500">
                    Suscrito el {new Date(s.fechaSuscripcion).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSubscription(s.idSuscripcion)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded hover:bg-rose-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic py-2">
            No tienes macrodistritos suscritos actualmente. Selecciona uno arriba para recibir notificaciones zonales.
          </p>
        )}
      </Card>
    </div>
  );
}
