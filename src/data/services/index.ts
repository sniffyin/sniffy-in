/**
 * Registry of the /services/<slug> pages, in display order.
 * Dependency-free so build scripts can read it.
 */
import type { ServicePageData } from './types';
import { deshedding } from './deshedding';
import { dematting } from './dematting';
import { puppyKitten } from './puppyKitten';
import { senior } from './senior';
import { tickFlea } from './tickFlea';
import { anxious } from './anxious';
import { medicated } from './medicated';

export const SERVICES: ServicePageData[] = [deshedding, dematting, puppyKitten, senior, tickFlea, anxious, medicated];

export const SERVICE_BY_SLUG: Record<string, ServicePageData> = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

export const servicePath = (slug: string) => `/services/${slug}`;

export type { ServicePageData } from './types';
