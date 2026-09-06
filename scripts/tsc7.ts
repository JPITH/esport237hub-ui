/**
 * Lance le `tsc` de TypeScript 7 (paquet aliasé `typescript7`, compilateur
 * natif) avec les arguments reçus. Ce dépôt vit à deux endroits — seul, et
 * en sous-module `packages/ui` du monorepo — et `typescript7` n'est pas au
 * même endroit dans les deux cas (à côté, ou remonté à la racine du
 * monorepo) : on le résout donc depuis ici plutôt que de figer un chemin.
 * Le paquet `typescript` (5.9) reste le moteur des outils qui ont besoin de
 * l'API JavaScript du compilateur (ESLint, Next, Nest, ts-jest) ; TS 7 n'a
 * plus cette API.
 */
import { dirname, join } from 'node:path';

const pkg = Bun.resolveSync('typescript7/package.json', import.meta.dir);
const tsc = join(dirname(pkg), 'bin', 'tsc');
const proc = Bun.spawnSync(['bun', tsc, ...Bun.argv.slice(2)], {
  cwd: join(import.meta.dir, '..'),
  stdio: ['inherit', 'inherit', 'inherit'],
});
process.exit(proc.exitCode ?? 1);
