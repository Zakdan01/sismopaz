'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function AlertasPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning">Sprint 2 · Grupo 2</Badge>
            <span className="text-xs text-zinc-500">Módulo en Desarrollo</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Alertas Sísmicas y Puntos de Evacuación
          </h1>
          <p className="text-sm text-zinc-500">
            Gestión de alertas tempranas, suscripciones zonales y georreferenciación de zonas seguras.
          </p>
        </div>
        <Link href="/mapa">
          <Button variant="outline" className="text-xs">
            ← Ver Mapa General
          </Button>
        </Link>
      </div>

      {/* BANNER DE ALERTA DEMO */}
      <div className="bg-amber-500 text-white p-5 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚠️</span>
            <strong className="text-base font-bold">ALERTA SÍSMICA MODERADA (DEMO)</strong>
          </div>
          <p className="text-xs text-white/95">
            Evento sísmico perceptible en macrodistritos Cotahuma y San Antonio. Mantenga la calma y siga las rutas de evacuación.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded">
          RF2.01 / HU05
        </span>
      </div>

      {/* TARJETA INFORMATIVA DE RESPONSABILIDAD */}
      <Card title="Alcance del Módulo (Sprint 2 - Grupo 2)">
        <p className="text-sm text-zinc-600 mb-4">
          Este módulo está asignado al <strong>Grupo 2</strong> según la especificación de requisitos del sistema. Incluye las siguientes funcionalidades:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <strong className="text-zinc-900 block font-semibold mb-1">RF2.01 · Alertas Sísmicas Activas</strong>
            <p className="text-zinc-500">Visualización pública de alertas clasificadas por nivel de gravedad (Informativa, Moderada, Severa).</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <strong className="text-zinc-900 block font-semibold mb-1">RF2.02 · Ciclo de Vida de Alertas</strong>
            <p className="text-zinc-500">Registro, edición y cierre inmutable de alertas por parte del usuario Sismólogo.</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <strong className="text-zinc-900 block font-semibold mb-1">RF2.04 · Directorio de Emergencias</strong>
            <p className="text-zinc-500">Nómina de entidades de primera respuesta (Bomberos 119, SAR 110, Defensa Civil 120, SEDES 123).</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <strong className="text-zinc-900 block font-semibold mb-1">RF2.05 · Puntos de Evacuación</strong>
            <p className="text-zinc-500">Zonas de seguridad oficiales con capacidad y coordenadas geográficas en los 9 macrodistritos.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
