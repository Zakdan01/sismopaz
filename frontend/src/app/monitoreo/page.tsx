'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function MonitoreoPage() {
  return (
    <ProtectedRoute requiredRoles={['Sismólogo', 'Administrador']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Sprint 7 · Grupo 19</Badge>
              <span className="text-xs text-zinc-500">Módulo en Desarrollo</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Catálogo Sísmico Oficial y Monitoreo Instrumental
            </h1>
            <p className="text-sm text-zinc-500">
              Registro formal de eventos sísmicos (WGS 84 / PostGIS), control de duplicidad y revisión técnica.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="text-xs">
              ← Volver al Panel
            </Button>
          </Link>
        </div>

        <Card title="Catálogo de Monitoreo Técnico (RF7.02 / HU20)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="p-3">Evento</th>
                  <th className="p-3">Fecha / Hora (UTC/BOT)</th>
                  <th className="p-3">Magnitud & Escala</th>
                  <th className="p-3">Profundidad</th>
                  <th className="p-3">Fuente</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr className="hover:bg-zinc-50">
                  <td className="p-3 font-semibold text-zinc-900">SIS-2026-001</td>
                  <td className="p-3 text-xs text-zinc-600">18/11/2026 03:15 BOT</td>
                  <td className="p-3">
                    <Badge variant="warning">4.2 Mw</Badge>
                  </td>
                  <td className="p-3 text-xs text-zinc-600">45.0 km (Intermedia)</td>
                  <td className="p-3 text-xs text-zinc-500">Obs. San Calixto</td>
                  <td className="p-3">
                    <Badge variant="success">Publicado</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="outline" className="text-xs py-1 px-2.5 min-h-[32px]">
                      Editar Parámetros
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Alcance del Módulo (Sprint 7 - Grupo 19)">
          <p className="text-xs text-zinc-500">
            Responsabilidad asignada al <strong>Grupo 19</strong>: RF7.01 (Registro formal con PostGIS), RF7.02 (Panel de monitoreo), RF7.03 (Revisión/actualización con trazabilidad inmutable) y RF7.04 (Control de procedencia y detección de duplicados).
          </p>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
