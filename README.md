# FieldShift Ethiopia — Production Monorepo (`pnpm` Workspaces)

**NASA Space Apps Challenge 2026 — Field Shift: Adapting Farms with NASA Data**

## Monorepo Structure

```
fieldshift-ethiopia/
├── apps/
│   ├── server/                      # Backend (Express + TypeScript + Prisma + MVC)
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # MODEL: PostgreSQL schema & relations
│   │   │   └── migrations/          # Version-controlled SQL migrations (Zero seed script)
│   │   ├── src/
│   │   │   ├── controllers/         # CONTROLLER: Parse req, validate Zod, send res
│   │   │   ├── services/            # Business logic, Prisma queries & Real NASA APIs
│   │   │   │   ├── nasa/            # power.service.ts, cmr.service.ts, modis.service.ts
│   │   │   │   ├── weather/         # forecast.service.ts (Open-Meteo, Non-NASA)
│   │   │   │   ├── decisions/       # sowing, harvesting, threshing, crop-maturity
│   │   │   │   └── rotation/        # rotation.service.ts (Multi-objective scoring)
│   │   │   ├── routes/              # Modular Express routers
│   │   │   ├── middleware/          # Central error handler, rate-limit, Zod validation
│   │   │   ├── lib/                 # Singleton PrismaClient (prisma.ts) & Pino logger
│   │   │   ├── app.ts               # Express app configuration
│   │   │   └── index.ts             # HTTP server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── client/                      # VIEW: Frontend (React 18 + Vite + TypeScript)
│       ├── src/
│       │   ├── components/          # Reusable UI, layout, map & chart components
│       │   ├── pages/               # All 10 route views (Dashboard, Sowing, Threshing, etc.)
│       │   ├── hooks/               # TanStack Query, Dexie offline DB & Voice/i18n hooks
│       │   ├── lib/                 # Typed API client (api.ts), offlineDb.ts, i18n.ts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/                      # Shared Zod schemas & inferred TypeScript types
│       └── src/                     # farm, weather, decision, rotation, datasource schemas
├── docs/                            # Scientific methodology, data sources, architecture & limitations
├── pnpm-workspace.yaml
├── docker-compose.yml               # Runs Postgres + Server + Client
└── package.json                     # pnpm workspaces root
```

## Real NASA API Integrations (Zero Seed / Zero Fake Data)

1. **NASA LaRC POWER Agroclimatology API (`power.service.ts`)**:
   - Daily endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point` (`PRECTOTCORR`, `T2M`, `T2M_MAX`, `T2M_MIN`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `GWETTOP`, `GWETROOT`)
   - Climatology endpoint: `https://power.larc.nasa.gov/api/temporal/climatology/point` (30-year monthly & annual rainfall and temperature baseline)
2. **NASA Common Metadata Repository (CMR) Granule Search API (`cmr.service.ts`)**:
   - Endpoint: `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=...&point=lon,lat`
   - Queries real satellite granule passes over exact Ethiopian farm coordinates for:
     - `GPM_3IMERGDL` / `GPM_3IMERGDF` (GPM IMERG V07B Daily 0.1° Precipitation)
     - `SPL3SMP_E` (SMAP Enhanced 9 km Daily L3 Surface Soil Moisture)
     - `MOD13Q1` (MODIS Terra 250 m 16-Day NDVI/EVI)
     - `ECO2LSTE` (ECOSTRESS 70 m Land Surface Temperature & Evapotranspiration)
     - `SRTMGL1` (Shuttle Radar Topography Mission 30 m Digital Elevation Model)
3. **NASA ORNL DAAC MODIS Subset REST API (`modis.service.ts`)**:
   - Endpoint: `https://modis.ornl.gov/rst/api/v1/MOD13Q1/dates` & `/subset`
4. **Open-Meteo Operational Weather Forecast API (`forecast.service.ts`)**:
   - Endpoint: `https://api.open-meteo.com/v1/forecast` (Explicitly labelled as an **External Non-NASA Forecast Source** for upcoming 7-day / 168-hour rain probability, wind speed, wind gusts, and humidity).
