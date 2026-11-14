// Fails closed if a future change accidentally reintroduces October 2026 RCE-affected versions.
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const minimums = { next: '16.4.1', react: '19.2.9', 'react-dom': '19.2.9' };

function compare(a, b) {
  const va = a.split('.').map(Number), vb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((va[i] || 0) !== (vb[i] || 0)) return (va[i] || 0) - (vb[i] || 0);
  return 0;
}

let failed = false;
for (const [name, minimum] of Object.entries(minimums)) {
  const pinned = pkg.dependencies?.[name];
  const locked = lock.packages?.[`node_modules/${name}`]?.version;
  if (pinned !== locked || !/^\d+\.\d+\.\d+$/.test(locked || '') || compare(locked, minimum) < 0) {
    console.error(`[dependency-security] ${name} đang bị lệch phiên bản hoặc cũ hơn ngưỡng vá lỗi ${minimum}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('Dependency security floor: Next >=16.4.1, React/React DOM >=19.2.9');
