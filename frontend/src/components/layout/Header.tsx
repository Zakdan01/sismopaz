'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { getStoredUser, removeStoredToken } from '../../lib/api';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-zinc-900 text-2xl p-1 focus:outline-none"
          aria-label="Toggle Menu"
        >
          ☰
        </button>
        <Link href="/" className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Sismo<span className="text-orange-500">Paz</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-zinc-900 leading-tight">
                {user.nombre} {user.apellidos}
              </p>
              <p className="text-xs text-orange-600 font-medium">
                {user.roles?.join(', ') || 'Ciudadano'}
              </p>
            </div>
            <Link href="/perfil">
              <Button variant="outline" className="text-xs py-2 px-3">
                Mi Perfil
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-xs py-2 px-3 text-zinc-600"
            >
              Salir
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="primary" className="text-xs sm:text-sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:inline-flex">
              <Button variant="outline" className="text-xs sm:text-sm">
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
