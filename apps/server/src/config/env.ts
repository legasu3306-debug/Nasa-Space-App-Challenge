import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://fieldshift:fieldshift_pw@localhost:5432/fieldshift_ethiopia?schema=public'),
  NASA_POWER_BASE_URL: z.string().url().default('https://power.larc.nasa.gov/api/temporal'),
  NASA_CMR_SEARCH_URL: z.string().url().default('https://cmr.earthdata.nasa.gov/search'),
  NASA_ORNL_MODIS_URL: z.string().url().default('https://modis.ornl.gov/rst/api/v1'),
  NASA_GIBS_WMTS_URL: z.string().url().default('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'),
  NASA_EARTHDATA_TOKEN: z.string().optional().default(''),
  ERA5_CDS_API_URL: z.string().url().optional().default('https://cds.climate.copernicus.eu/api/v2'),
  ERA5_CDS_API_KEY: z.string().optional().default(''),
  NLDAS_GLDAS_BASE_URL: z.string().url().default('https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/'),
  EXTERNAL_API_TIMEOUT_MS: z.coerce.number().default(15000),
  TELEMETRY_CACHE_TTL_MINUTES: z.coerce.number().default(60)
});

export const env = EnvSchema.parse(process.env);
