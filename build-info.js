import { execSync } from 'node:child_process';

// The label shown at the bottom edge of the game: the build number is the number of commits on the branch (it only ever
// grows), then the commit and the time of the build. A "+" means the build includes changes that were not committed.
export function buildMeta() {
  const sh = (c) => { try { return execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
  const n = sh('git rev-list --count HEAD'), hash = sh('git rev-parse --short HEAD'), dirty = sh('git status --porcelain') ? '+' : '';
  const label = `build ${n || '?'}${dirty} · ${hash || 'no git'} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
  return { n: +n || 0, hash, label };
}
export const buildInfo = () => buildMeta().label;

// Vite plugin: writes build.json next to index.html. A running game fetches it now and then and offers to update
// when a newer build is out (see checkBuild in main.js).
export function buildJson(meta) {
  return {
    name: 'build-json',
    apply: 'build',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'build.json', source: JSON.stringify(meta) }); },
  };
}
