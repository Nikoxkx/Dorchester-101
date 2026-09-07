/**
 * Shared helpers for the desktop packaging scripts.
 *
 * `next build` writes `.next/node_modules/<pkg>-<hash>` as symlinks back into
 * the repository's node_modules for every package listed in
 * `serverExternalPackages` (here: `pg` and `read-excel-file`). The compiled
 * server bundle requires them by exactly that path, so they have to survive
 * packaging — and Windows will not create a symlink without developer mode or
 * admin rights, which is why electron-builder either fails or ships a dangling
 * link and the API route 500s.
 *
 * Real copies are a few hundred kilobytes and work on every platform.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Replace every symlink under `dir` with a real copy of its target.
 *
 * @param {string} dir  directory to walk (the repo's .next, or a staged copy)
 * @returns {number}    how many links were replaced
 */
export function replaceSymlinksWithCopies(dir) {
  let replaced = 0;

  const walk = (current) => {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);

      if (entry.isSymbolicLink()) {
        let target;
        try {
          target = fs.realpathSync(full);
        } catch {
          continue; // dangling link: nothing to copy
        }
        fs.rmSync(full, { recursive: true, force: true });
        fs.cpSync(target, full, { recursive: true, dereference: true });
        replaced += 1;
        continue;
      }

      // The build cache is excluded from the package anyway.
      if (entry.isDirectory() && entry.name !== 'cache') walk(full);
    }
  };

  walk(dir);
  return replaced;
}

/**
 * The traced-external directories Next.js created under `.next/node_modules`,
 * as `{ name, isRealDirectory }`.
 *
 * @param {string} nextDir  a `.next` directory (in the repo or in a package)
 */
export function tracedExternals(nextDir) {
  const root = path.join(nextDir, 'node_modules');
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.map((entry) => {
    const full = path.join(root, entry.name);
    const isLink = fs.lstatSync(full).isSymbolicLink();
    let nonEmpty = false;
    try {
      nonEmpty = fs.readdirSync(full).length > 0;
    } catch {
      nonEmpty = false;
    }
    return { name: entry.name, ok: !isLink && nonEmpty, isLink };
  });
}
