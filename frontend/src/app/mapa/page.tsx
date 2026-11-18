'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';

export default function MapaPage() {
  const [macrodistritos, setMacrodistritos] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/macrodistritos')
      .then((data) => setMacrodistritos(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* BANNER DE ALERTA SEVERA (Restringido - diseño oficial) */}
      <div className="bg-rose-600 text-white p-5 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚠️</span>
            <strong className="text-lg">ALERTA SÍSMICA SEVERA</strong>
          </div>
          <p className="text-sm text-white/95">
            Sismo superficial registrado. Evacúe hacia puntos seguros. Macrodistritos prioritarios: Sur, Cotahuma.
          </p>
        </div>
        <Link href="/alertas">
          <button className="min-h-[44px] px-5 py-2.5 bg-white text-rose-600 font-bold rounded-lg text-sm hover:bg-zinc-100 transition-colors whitespace-nowrap">
            Ver Puntos de Evacuación
          </button>
        </Link>
      </div>

      {/* TITULO Y DESCRIPCION */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Monitoreo Cartográfico de Sismos</h1>
        <p className="text-zinc-500 text-sm">
          Información sísmica georreferenciada de la ciudad de La Paz (Datum WGS 84 / EPSG:4326).
        </p>
      </div>

      {/* GRID PRINCIPAL: FILTROS + CATÁLOGO + MAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: FILTROS Y CATÁLOGO RECIENTE */}
        <div className="space-y-6 lg:col-span-1">
          {/* Tarjeta de Filtros */}
          <Card title="Filtros de Búsqueda">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5 text-zinc-900">
                Ubicación (Macrodistrito)
              </label>
              <select className="w-full min-h-[44px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-800 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all">
                <option value="">Toda La Paz</option>
                {macrodistritos.map((m) => (
                  <option key={m.idMacrodistrito} value={m.idMacrodistrito}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="accent" className="flex-1">
                Filtrar
              </Button>
              <Button variant="outline" className="flex-1">
                Limpiar
              </Button>
            </div>
          </Card>

          {/* Tarjeta de Catálogo Reciente */}
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="font-bold text-zinc-900 text-sm">Catálogo Reciente</h2>
            </div>
            <div className="divide-y divide-zinc-200">
              <div className="p-4 hover:bg-zinc-50 cursor-pointer border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-zinc-900 text-sm">Macrodistrito Sur</strong>
                  <Badge variant="warning">4.2 Mw</Badge>
                </div>
                <p className="text-xs text-zinc-500">
                  18 Nov 2026 - 03:15 BOT · Profundidad: 45.0 km
                </p>
              </div>
              <div className="p-4 hover:bg-zinc-50 cursor-pointer border-l-4 border-emerald-500">
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-zinc-900 text-sm">Cotahuma</strong>
                  <Badge variant="success">3.1 Mw</Badge>
                </div>
                <p className="text-xs text-zinc-500">
                  17 Nov 2026 - 22:40 BOT · Profundidad: 18.0 km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: VISOR DE MAPA */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden min-h-[450px] flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h2 className="font-bold text-zinc-900 text-sm">Mapa Cartográfico Interactivo</h2>
              <span className="text-xs font-semibold px-2 py-1 bg-zinc-200 text-zinc-700 rounded">
                WGS 84 (EPSG:4326)
              </span>
            </div>
            <div className="flex-1 bg-zinc-100 flex items-center justify-center p-8 text-center min-h-[380px]">
              <div className="max-w-md">
                <p className="font-semibold text-zinc-800 text-base mb-1">
                  [ Contenedor Cartográfico Leaflet / PostGIS ]
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  Área asignada al Sprint 1 (Grupo 4) y Sprint 7 (Grupo 19).
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-zinc-600 bg-white px-3 py-1.5 rounded border border-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  API REST conectada con PostgreSQL 18
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CATÁLOGO DE COMPONENTES UI KIT DE REFERENCIA */}
      <div className="pt-6 border-t-2 border-dashed border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900 mb-1">Catálogo de Componentes Base (UI Kit)</h2>
        <p className="text-zinc-500 text-sm mb-6">
          Referencia visual para todos los módulos y grupos de desarrollo (Sprints 1 al 7).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Sistema de Botones" subtitle="Altura 44px (RNF02) y estados">
            <div className="flex flex-col gap-3">
              <Button variant="primary">Primario (Navegación / Login)</Button>
              <Button variant="accent">Acento (Guardar / Filtrar)</Button>
              <Button variant="outline">Secundario (Cancelar)</Button>
              <Button variant="severe">Destructivo (Restringido)</Button>
              <Button disabled>Deshabilitado</Button>
            </div>
          </Card>

          <Card title="Formularios e Inputs" subtitle="Manejo de Focus Ring naranja">
            <Input label="Magnitud Calculada (Mw)" placeholder="Ej. 4.8" defaultValue="4.8" />
            <Input label="Profundidad Focal (km)" placeholder="Ej. 35.0" />
            <Input label="Campo con Error (Simulado)" error="Este campo es obligatorio" />
          </Card>

          <Card title="Etiquetas Semánticas" subtitle="Badges de estado del catálogo">
            <div className="flex flex-col gap-3 items-start">
              <Badge variant="success">Sismo Registrado / Validado</Badge>
              <Badge variant="warning">Reporte Pendiente</Badge>
              <Badge variant="info">Revisado (Sismólogo)</Badge>
              <Badge variant="severe">Alerta Severa</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
