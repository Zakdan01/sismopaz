'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { apiFetch, getStoredUser } from '../../../lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal para asignar rol Sismólogo
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(2); // 2: Sismólogo
  const [acreditacion, setAcreditacion] = useState('');
  const [institucion, setInstitucion] = useState('Observatorio San Calixto');

  const loadData = async () => {
    try {
      const currentUser = getStoredUser();
      if (!currentUser || !currentUser.roles?.includes('Administrador')) {
        router.push('/');
        return;
      }

      const [usersData, rolesData] = await Promise.all([
        apiFetch(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
        apiFetch('/admin/roles'),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      setMsg({ text: err.message || 'Error cargando usuarios', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleToggleStatus = async (user: any) => {
    setMsg(null);
    const newStatus = !user.estado;
    try {
      await apiFetch(`/admin/users/${user.idUsuario}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: newStatus }),
      });
      setMsg({
        text: `Usuario ${user.nombre} ${newStatus ? 'activado' : 'suspendido (sesiones revocadas)'}`,
        type: 'success',
      });
      loadData();
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setMsg(null);

    try {
      await apiFetch(`/admin/users/${selectedUser.idUsuario}/assign-role`, {
        method: 'POST',
        body: JSON.stringify({
          idRol: selectedRoleId,
          numeroAcreditacion: selectedRoleId === 2 ? acreditacion : undefined,
          institucionAcreditadora: selectedRoleId === 2 ? institucion : undefined,
        }),
      });

      setMsg({
        text: `Rol asignado correctamente a ${selectedUser.nombre}`,
        type: 'success',
      });
      setModalOpen(false);
      setSelectedUser(null);
      setAcreditacion('');
      loadData();
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gobernanza de Cuentas y Seguridad</h1>
          <p className="text-sm text-zinc-500">
            Sprint 5 (HU17 / RF5.03): Habilitación, suspensión de cuentas y acreditación de Sismólogos.
          </p>
        </div>
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

      {/* BARRA DE BÚSQUEDA */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-1 min-h-[44px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
            placeholder="Buscar por nombre, apellido o correo electrónico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="accent" onClick={loadData}>
            Buscar
          </Button>
        </div>
      </Card>

      {/* TABLA DE USUARIOS */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Usuario</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Roles Asignados</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones de Gobernanza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No se encontraron usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.idUsuario} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4">
                      <strong className="block text-zinc-900 font-bold">
                        {u.nombre} {u.apellidos}
                      </strong>
                      <span className="text-xs text-zinc-400">ID #{u.idUsuario}</span>
                      {u.perfilSismologo && (
                        <div className="mt-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                          Matrícula: {u.perfilSismologo.numeroAcreditacion}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600">
                      <div>{u.correo}</div>
                      <div className="text-xs text-zinc-400">{u.telefono || 'Sin teléfono'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles?.map((r: string) => (
                          <Badge
                            key={r}
                            variant={
                              r === 'Administrador'
                                ? 'severe'
                                : r === 'Sismólogo'
                                ? 'warning'
                                : 'info'
                            }
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.estado
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {u.estado ? 'Habilitada' : 'Suspendida'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* BOTÓN ASIGNAR ROL SISMÓLOGO */}
                        <Button
                          variant="outline"
                          className="text-xs py-1.5 px-3 min-h-[36px]"
                          onClick={() => {
                            setSelectedUser(u);
                            setModalOpen(true);
                          }}
                        >
                          Asignar Rol
                        </Button>

                        {/* BOTÓN SUSPENDER / ACTIVAR (RF5.03) */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded min-h-[36px] transition-colors ${
                            u.estado
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.estado ? 'Suspender' : 'Habilitar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: ASIGNAR ROL / ACREDITACIÓN SISMOLÓGICA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900">
              Asignar Rol a: {selectedUser?.nombre} {selectedUser?.apellidos}
            </h2>
            <p className="text-xs text-zinc-500">
              Cumplimiento RF5.03: Si seleccionas Sismólogo, debes registrar obligatoriamente la matrícula técnica.
            </p>

            <form onSubmit={handleAssignRoleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1 text-zinc-900">
                  Rol a Asignar
                </label>
                <select
                  className="w-full min-h-[44px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(parseInt(e.target.value, 10))}
                >
                  {roles.map((r) => (
                    <option key={r.idRol} value={r.idRol}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoleId === 2 && (
                <div className="space-y-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <Input
                    label="N° Acreditación / Matrícula Profesional *"
                    placeholder="Ej. SIS-LP-2026-089"
                    value={acreditacion}
                    onChange={(e) => setAcreditacion(e.target.value)}
                    required
                  />
                  <Input
                    label="Institución Acreditadora *"
                    placeholder="Ej. Observatorio San Calixto"
                    value={institucion}
                    onChange={(e) => setInstitucion(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="accent" className="flex-1">
                  Confirmar Asignación
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
