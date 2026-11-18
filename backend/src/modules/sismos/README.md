# Módulo Sismos (Sprint 1 & Sprint 7)

Este módulo corresponde a los equipos de:
- **Sprint 1 (Grupo 4):** Catálogo de sismos, visor cartográfico, filtros de eventos.
- **Sprint 7 (Grupo 19):** Registro formal de eventos sísmicos, panel de monitoreo, revisión de duplicados.

## Tablas asociadas en PostgreSQL:
- `sismos`
- `sismos_fuentes`
- `fuentes_sismicas`
- `historial_estados_sismo`
- `historial_cambios_sismo`
- `posibles_duplicados_sismo`
- `tipos_magnitud`
- `estados_sismo`

## Instrucciones para el equipo:
1. Crear entidades TypeORM en `entities/`.
2. Crear `sismos.service.ts` y `sismos.controller.ts`.
3. Para endpoints de sismólogo, usar `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(RoleName.SISMOLOGO)`.
4. Importar `SismosModule` en `src/app.module.ts`.
