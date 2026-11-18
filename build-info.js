import { execSync } from 'node:child_process';

// The label shown in the corner of the game: the build number is the number of commits on the branch (it only ever
// grows), then the commit and the time of the build. A "+" means the build includes changes that were not committed.
export function buildInfo() {
  const sh = (c) => { try { return execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
  const n = sh('git rev-list --count HEAD'), hash = sh('git rev-parse --short HEAD'), dirty = sh('git status --porcelain') ? '+' : '';
  return `build ${n || '?'}${dirty} · ${hash || 'no git'} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}
