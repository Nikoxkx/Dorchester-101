/**
 * Windows Node 20.12+ throws EINVAL when spawnSync runs npm.cmd without a shell.
 * These tests lock the resolver so `npm run build:exe` cannot regress to that.
 */
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { npmInvocation, needsWindowsCmdShell, spawnOptionsForCommand } from '../../scripts/lib/npm-spawn.mjs';

const nodeExe = path.join('C:', 'Program Files', 'nodejs', 'node.exe');
const npmCli = path.join('C:', 'Program Files', 'nodejs', 'node_modules', 'npm', 'bin', 'npm-cli.js');

describe('npmInvocation', () => {
  it('prefers npm_execpath (set by `npm run`) and never uses npm.cmd', () => {
    const result = npmInvocation(['ci', '--no-audit'], {
      platform: 'win32',
      execPath: nodeExe,
      env: { npm_execpath: npmCli },
      existsSync: (file) => file === npmCli,
    });

    expect(result.command).toBe(nodeExe);
    expect(result.commandArgs).toEqual([npmCli, 'ci', '--no-audit']);
    expect(result.spawnOptions.shell).toBe(false);
  });

  it('finds npm-cli.js next to node.exe when npm_execpath is missing', () => {
    const result = npmInvocation(['--version'], {
      platform: 'win32',
      execPath: nodeExe,
      env: {},
      existsSync: (file) => file === npmCli,
    });

    expect(result.command).toBe(nodeExe);
    expect(result.commandArgs[0]).toBe(npmCli);
    expect(result.commandArgs[1]).toBe('--version');
    expect(result.spawnOptions.shell).toBe(false);
  });

  it('falls back to npm.cmd WITH shell:true on Windows when no CLI script exists', () => {
    const result = npmInvocation(['ci'], {
      platform: 'win32',
      execPath: nodeExe,
      env: {},
      existsSync: () => false,
    });

    expect(result.command).toBe('npm.cmd');
    expect(result.commandArgs).toEqual(['ci']);
    expect(result.spawnOptions.shell).toBe(true);
    expect(result.spawnOptions.windowsHide).toBe(true);
  });

  it('uses plain `npm` without a shell on Unix', () => {
    const result = npmInvocation(['ci'], {
      platform: 'linux',
      execPath: '/usr/bin/node',
      env: {},
      existsSync: () => false,
    });

    expect(result.command).toBe('npm');
    expect(result.spawnOptions.shell).toBe(false);
  });

  it('ignores a non-JS npm_execpath (a .cmd path) and keeps looking', () => {
    const cmdPath = path.join('C:', 'Program Files', 'nodejs', 'npm.cmd');
    const result = npmInvocation(['ci'], {
      platform: 'win32',
      execPath: nodeExe,
      env: { npm_execpath: cmdPath },
      existsSync: (file) => file === cmdPath || file === npmCli,
    });

    expect(result.command).toBe(nodeExe);
    expect(result.commandArgs[0]).toBe(npmCli);
    expect(result.spawnOptions.shell).toBe(false);
  });
});

describe('spawnOptionsForCommand', () => {
  it('forces shell:true for .cmd / .bat on Windows so Node 20.12+ does not EINVAL', () => {
    expect(needsWindowsCmdShell('npm.cmd', 'win32')).toBe(true);
    expect(needsWindowsCmdShell('npm.CMD', 'win32')).toBe(true);
    expect(needsWindowsCmdShell('setup.bat', 'win32')).toBe(true);
    expect(needsWindowsCmdShell('npm.cmd', 'linux')).toBe(false);
    expect(needsWindowsCmdShell('/usr/bin/node', 'win32')).toBe(false);

    const opts = spawnOptionsForCommand('npm.cmd', { stdio: 'inherit', shell: false }, 'win32');
    expect(opts.shell).toBe(true);
    expect(opts.windowsHide).toBe(true);
  });

  it('leaves node.exe / unix binaries on shell:false', () => {
    const opts = spawnOptionsForCommand(nodeExe, { shell: false }, 'win32');
    expect(opts.shell).toBe(false);
  });
});
