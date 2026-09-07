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
 * Kill a child process and resolve once it has *actually* exited.
 *
 * `child.kill()` only sends the signal. On Windows the process keeps its
 * working directory locked for a moment afterwards, so anything that deletes
 * that directory straight away fails with `EBUSY: resource busy or locked`.
 * That is exactly how the desktop package check used to fail in CI after every
 * route probe had passed — see scripts/verify-desktop-package.mjs.
 *
 * @param {import('node:child_process').ChildProcess} child
 * @param {number} timeoutMs  give up waiting after this long, so a process that
 *                            refuses to die cannot hang the whole check
 * @returns {Promise<void>}
 */
export function stopProcess(child, timeoutMs = 15_000) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve();
    };
    const deadline = setTimeout(settle, timeoutMs);

    child.once('exit', settle);
    child.once('error', settle);
    try {
      child.kill('SIGKILL');
    } catch {
      settle(); // already gone
    }
  });
}

/**
 * Delete a directory tree, retrying the errors that mean "try again in a
 * moment" rather than "this will never work".
 *
 * Node's `rmSync` already implements the retry, but only when `maxRetries` is
 * set, and only for EBUSY/EMFILE/ENFILE/ENOTEMPTY/EPERM — precisely the set a
 * just-killed process leaves behind on Windows. A directory that still cannot
 * be removed is not worth failing a build over, so the last error is returned
 * instead of thrown.
 *
 * @param {string} dir
 * @returns {Error | null}  the error that gave up, or null when it is gone
 */
export function removeDirRetrying(dir, { maxRetries = 12, retryDelay = 500 } = {}) {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries, retryDelay });
    return null;
  } catch (error) {
    return error;
  }
}

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
