// spawnSync que tolera shims .cmd en Windows (codegraph, claude, npm) sin pasar args con shell:true
// (Node 24 avisa DEP0190): con shell, el comando se arma como un solo string citado.
import { spawnSync } from 'node:child_process';

const quote = a => (/[\s"&|<>^]/.test(a) ? `"${String(a).replace(/"/g, '\\"')}"` : String(a));

export function run(cmd, args = [], opts = {}) {
  const { shell, ...rest } = opts;
  const base = { encoding: 'utf8', timeout: 60_000, ...rest };
  return shell
    ? spawnSync([cmd, ...args].map(quote).join(' '), { ...base, shell: true })
    : spawnSync(cmd, args, base);
}
