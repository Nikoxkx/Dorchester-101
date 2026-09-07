// electron-builder configuration for the DOR101 Windows desktop build.
//
// This file is driven by `npm run build:exe` (scripts/build-exe.mjs), which
// builds the website first and then calls:
//
//   npx electron-builder --config electron/builder.config.js --win
//
// See BUILD.md for the full manual-build guide.

module.exports = {
  appId: 'org.dor101.app',
  productName: 'DOR101',
  copyright: 'Copyright © 2026 DOR101 Community Project',

  /**
   * The app ships as a plain directory, not an asar archive. The desktop shell
   * spawns `next start` with `resources/app` as its working directory, and a
   * child process cannot chdir into an archive. (`asarUnpack` would not help:
   * it only punches holes in an archive that must exist in the first place.)
   */
  asar: false,

  forceCodeSigning: false,

  /**
   * Nothing in the runtime tree is a native module — `pg` is pure JavaScript and
   * `@next/swc-*` ships prebuilt NAPI binaries — so the rebuild step only costs
   * time and fails on machines without a C++ toolchain for no benefit.
   */
  npmRebuild: false,

  directories: {
    output: 'dist-electron',
    buildResources: 'electron/assets',
  },

  /**
   * What lands in `resources/app`.
   *
   * `node_modules` is deliberately NOT listed here. electron-builder collects the
   * production dependency tree itself (package.json "dependencies" and everything
   * below it) and copies it after these patterns are applied. Naming the whole
   * node_modules tree explicitly overrode that and copied everything on disk,
   * devDependencies included — measured at 1.2 GB across 50,000 files
   * (electron's own binaries, vite, typescript, playwright, esbuild,
   * electron-builder's 7zip helpers) against ~17 MB of actual application code.
   */
  files: [
    // The compiled website. `.next/cache` is the Turbopack build cache: ~102 MB
    // of hashes that speed up the *next* build and are never read at runtime.
    '.next/**/*',
    '!.next/cache/**/*',
    '!.next/trace',
    '!.next/trace-build',
    // Static assets. `public/IMAGE-CREDITS.md` is read from disk by the About
    // page at runtime, so /public is not optional.
    'public/**/*',
    // The two Electron entry points. The rest of electron/ is build input
    // (assets/) and stays out of the package.
    'electron/main.js',
    'electron/preload.js',
    // `next start` reads the config from its working directory. The build also
    // carries a resolved copy in .next/required-server-files.json.
    'next.config.ts',
    'package.json',
    // Source maps are debugger-only and account for most of .next/server's size.
    '!**/*.map',
  ],

  /** The window and tray icons need a real file next to the executable. */
  extraResources: [{ from: 'electron/assets/icon.ico', to: 'icon.ico' }],

  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
    icon: 'electron/assets/icon.ico',
    requestedExecutionLevel: 'asInvoker',
    sign: null,
    signAndEditExecutable: false,
    verifyUpdateCodeSignature: false,
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'DOR101',
    installerIcon: 'electron/assets/icon.ico',
    uninstallerIcon: 'electron/assets/icon.ico',
    license: 'LICENSE',
    // `DOR101 Setup 4.0.0.exe` — the name the README, the release notes and
    // scripts/publish-release.ps1 already point at.
    artifactName: '${productName} Setup ${version}.${ext}',
  },

  portable: {
    artifactName: 'DOR101-Portable-${version}.${ext}',
  },

  extraMetadata: {
    main: 'electron/main.js',
  },
};
