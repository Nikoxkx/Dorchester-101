/**
 * Tests for the desktop packaging helpers.
 *
 * These exist because of a specific CI failure: the packaged-app check passed
 * every route probe and then exited 1 with
 *
 *   ✖ EBUSY: resource busy or locked, rmdir '...\.desktop-package-check\app'
 *
 * The script killed its `next start` child and deleted the staging directory in
 * the same tick. On Windows the child has not released its working directory
 * yet at that point, so the rmdir failed — and because the throw happened
 * during cleanup, a good build was reported as a failed one and never
 * published. `stopProcess` waits for the exit; `removeDirRetrying` absorbs the
 * transient lock. Both are asserted here rather than re-discovered in CI.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { removeDirRetrying, stopProcess } from '../../scripts/lib/desktop-package.mjs';

/** A child that never exits, to prove the wait has a ceiling. */
function fakeChild(): ChildProcess {
  const emitter = new EventEmitter() as unknown as ChildProcess & { exitCode: number | null };
  emitter.exitCode = null;
  Object.defineProperty(emitter, 'signalCode', { value: null, writable: true });
  emitter.kill = () => true; // signal "sent", nothing happens
  return emitter;
}

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dor101-desktop-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('stopProcess', () => {
  it('resolves only after the child has really exited', async () => {
    const cwd = makeTempDir();
    // A process that would otherwise run forever, holding `cwd` open.
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      cwd,
      stdio: 'ignore',
    });

    let exited = false;
    child.on('exit', () => {
      exited = true;
    });

    await stopProcess(child);

    // This is the whole fix: the old code deleted the directory here, while
    // `exited` was still false.
    expect(exited, 'stopProcess resolved before the child emitted "exit"').toBe(true);
    expect(child.exitCode !== null || child.signalCode !== null).toBe(true);

    // And the consequence of it: the directory can now be removed with no
    // retries at all, which is what fails with EBUSY when it is not waited for.
    expect(() => fs.rmSync(cwd, { recursive: true, force: true })).not.toThrow();
    expect(fs.existsSync(cwd)).toBe(false);
  });

  it('resolves immediately for a child that is already gone', async () => {
    const child = spawn(process.execPath, ['-e', 'process.exit(0)'], { stdio: 'ignore' });
    await new Promise((resolve) => child.once('exit', resolve));

    const started = Date.now();
    await stopProcess(child);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('resolves immediately when there is no child at all', async () => {
    await expect(stopProcess(null as unknown as ChildProcess)).resolves.toBeUndefined();
  });

  it('gives up after the timeout instead of hanging forever', async () => {
    const child = fakeChild();
    const started = Date.now();
    await stopProcess(child, 250);
    const elapsed = Date.now() - started;

    expect(elapsed).toBeGreaterThanOrEqual(200);
    expect(elapsed).toBeLessThan(5000);
  });
});

describe('removeDirRetrying', () => {
  it('removes a populated tree and reports success', () => {
    const dir = makeTempDir();
    fs.mkdirSync(path.join(dir, 'nested', 'deeper'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'nested', 'deeper', 'file.txt'), 'x');

    expect(removeDirRetrying(dir)).toBeNull();
    expect(fs.existsSync(dir)).toBe(false);
  });

  it('is not an error when the directory is already gone', () => {
    expect(removeDirRetrying(path.join(os.tmpdir(), 'dor101-does-not-exist'))).toBeNull();
  });

  it('returns the error rather than throwing when removal is impossible', () => {
    // A file, not a directory: rmSync on it with recursive:true still throws
    // ENOTDIR/EISDIR-ish errors on some platforms, and the point is that the
    // caller gets the error back to decide what it means.
    const dir = makeTempDir();
    const blocker = path.join(dir, 'not-a-dir');
    fs.writeFileSync(blocker, 'x');
    fs.chmodSync(dir, 0o500); // read+execute only: cannot unlink inside it

    const error = removeDirRetrying(dir, { maxRetries: 1, retryDelay: 10 });
    fs.chmodSync(dir, 0o700);

    if (process.platform === 'win32' || process.getuid?.() !== 0) {
      expect(error, 'expected the locked directory to produce an error').not.toBeNull();
    }
    expect(blocker).toBeTruthy();
  });
});
