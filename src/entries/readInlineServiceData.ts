/**
 * Reads the service page content that scripts/generateServicePages.ts inlines
 * as `<script type="application/json" id="sniffy-service-data">`. Keeps the
 * page's chunk free of the whole services registry, the same trick the locality
 * entries use (see readInlineLocationData.ts).
 */
import type { ServicePageData } from '../data/services/types';

export const SERVICE_DATA_SCRIPT_ID = 'sniffy-service-data';

export function readInlineServiceData(): ServicePageData | null {
  const el = document.getElementById(SERVICE_DATA_SCRIPT_ID);
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as ServicePageData;
  } catch {
    return null;
  }
}
