/**
 * gitDate.ts — the real last-edit date (YYYY-MM-DD) of a page's source files.
 *
 * Used for schema `dateModified` so it moves only when a page's content does.
 * Stamping the build date instead tells search engines every page changed on
 * every deploy, which they learn to ignore (the sitemap already avoids this).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export function lastEdited(paths: string[]): string {
  const existing = paths.filter((p) => fs.existsSync(p));
  if (existing.length) {
    try {
      const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...existing], { encoding: 'utf8' }).trim();
      if (out) return out;
    } catch {
      /* not a git checkout: fall through */
    }
  }
  return new Date().toISOString().slice(0, 10);
}
