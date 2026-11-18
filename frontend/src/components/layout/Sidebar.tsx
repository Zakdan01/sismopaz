'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser } from '../../lib/api';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const isAdmin = user?.roles?.includes('Administrador');
  const isSismologo = user?.roles?.includes('Sismólogo') || isAdmin;

  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-zinc-900 text-white'
        : 'text-zinc-700 hover:bg-zinc-100 hover:text-orange-600'
    }`;
  };

  const chipClass = (path: string) => {
    const isActive = pathname === path;
    return `text-[10px] font-semibold px-1.5 py-0.5 rounded ${
      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
    }`;
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-64px)] bg-white border-r border-zinc-200 p-5 overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* SECCIÓN 1: ACCESO PÚBLICO */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Acceso Público
            </p>
            <ul className="space-y-1">
              <li>
                <Link href="/" onClick={onClose} className={navItemClass('/')}>
                  <span>Visor Cartográfico</span>
                  <span className={chipClass('/')}>S1</span>
                </Link>
              </li>
              <li>
                <Link href="/" onClick={onClose} className={navItemClass('/alertas')}>
                  <span>Alertas y Evacuación</span>
                  <span className={chipClass('/alertas')}>S2</span>
                </Link>
              </li>
              <li>
                <Link href="/" onClick={onClose} className={navItemClass('/prevencion')}>
                  <span>Guías Prevención</span>
                  <span className={chipClass('/prevencion')}>S3</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* SECCIÓN 2: CIUDADANO REGISTRADO (SPRINT 5 & 4) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Ciudadano Registrado
            </p>
            <ul className="space-y-1">
              <li>
                <Link href="/perfil" onClick={onClose} className={navItemClass('/perfil')}>
                  <span>Mi Perfil / Zonas</span>
                  <span className={chipClass('/perfil')}>S5</span>
                </Link>
              </li>
              <li>
                <Link href="/" onClick={onClose} className={navItemClass('/reportes')}>
                  <span>Reportar Percepción</span>
                  <span className={chipClass('/reportes')}>S4</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* SECCIÓN 3: PANEL ADMINISTRATIVO / TÉCNICO */}
          {(isSismologo || isAdmin) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Panel Técnico & Admin
              </p>
              <ul className="space-y-1">
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin/usuarios"
                      onClick={onClose}
                      className={navItemClass('/admin/usuarios')}
                    >
                      <span>Gestión de Cuentas</span>
                      <span className={chipClass('/admin/usuarios')}>S5</span>
                    </Link>
                  </li>
                )}
                {isSismologo && (
                  <>
                    <li>
                      <Link href="/" onClick={onClose} className={navItemClass('/monitoreo')}>
                        <span>Catálogo Sísmico</span>
                        <span className={chipClass('/monitoreo')}>S7</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/" onClick={onClose} className={navItemClass('/auditoria')}>
                        <span>Auditoría Ciudadana</span>
                        <span className={chipClass('/auditoria')}>S4</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/" onClick={onClose} className={navItemClass('/estadisticas')}>
                        <span>Reportes Estadísticos</span>
                        <span className={chipClass('/estadisticas')}>S6</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
