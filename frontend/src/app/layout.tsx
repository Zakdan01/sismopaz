'use client';

import React, { useState } from 'react';
import './globals.css';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="es">
      <head>
        <title>SismoPaz - Sistema de Información Sísmica La Paz</title>
        <meta
          name="description"
          content="Plataforma de monitoreo sísmico, alertas ciudadanas y gestión de usuarios para la ciudad de La Paz, Bolivia."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-bg-app">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 max-w-[1440px] w-full mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
