/**
 * Spawn npm in a way that works on every Node that this repo supports,
 * including Node 20.12+ / 22 / 24 / 25 on Windows.
 *
 * Node 20.12+ refuses to spawn `.cmd` / `.bat` without a shell
 * (`spawnSync npm.cmd EINVAL`, CVE-2024-27980). The reliable fix is to run
 * npm as a Node script (`npm-cli.js`) via `process.execPath`. Only if that
 * file cannot be found do we fall back to `npm.cmd` with `shell: true`.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function npmCliCandidates({ execPath = process.execPath } = {}) {
  const nodeDir = path.dirname(execPath);
  return [
    path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(nodeDir, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
}

function isJsCli(file) {
  return /\.(cjs|mjs|js)$/i.test(file);
}

/**
 * @param {string[]} args npm arguments, e.g. ['ci', '--no-audit']
 * @param {{ platform?: string, execPath?: string, env?: NodeJS.ProcessEnv, existsSync?: (p: string) => boolean }} [options]
 */
export function npmInvocation(args, options = {}) {
  const platform = options.platform ?? process.platform;
  const execPath = options.execPath ?? process.execPath;
  const env = options.env ?? process.env;
  const existsSync = options.existsSync ?? fs.existsSync;

  const fromEnv = env.npm_execpath;
  if (typeof fromEnv === 'string' && fromEnv.length > 0 && existsSync(fromEnv) && isJsCli(fromEnv)) {
    return {
      command: execPath,
      commandArgs: [fromEnv, ...args],
      spawnOptions: { shell: false, windowsHide: true },
    };
  }

  for (const candidate of npmCliCandidates({ execPath })) {
    if (existsSync(candidate)) {
      return {
        command: execPath,
        commandArgs: [candidate, ...args],
        spawnOptions: { shell: false, windowsHide: true },
      };
    }
  }

  if (platform === 'win32') {
    return {
      command: 'npm.cmd',
      commandArgs: args,
      spawnOptions: { shell: true, windowsHide: true },
    };
  }

  return {
    command: 'npm',
    commandArgs: args,
    spawnOptions: { shell: false },
  };
}

export function needsWindowsCmdShell(command, platform = process.platform) {
  if (platform !== 'win32') return false;
  const lower = String(command).toLowerCase();
  return lower.endsWith('.cmd') || lower.endsWith('.bat');
}

/**
 * Options that must be passed to spawnSync so a Windows `.cmd` does not EINVAL.
 */
export function spawnOptionsForCommand(command, extra = {}, platform = process.platform) {
  if (needsWindowsCmdShell(command, platform) && extra.shell !== true) {
    return { ...extra, shell: true, windowsHide: extra.windowsHide ?? true };
  }
  return extra;
}
