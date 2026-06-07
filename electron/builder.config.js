// electron-builder configuration
// Run: npx electron-builder --config electron/builder.config.js

module.exports = {
  appId: 'org.dor101.app',
  productName: 'DOR101',
  copyright: 'Copyright © 2026 DOR101 Community Project',
  asar: false,
  forceCodeSigning: false,
  
  directories: {
    output: 'dist-electron',
    buildResources: 'electron/assets',
  },

  files: [
    '!dist-electron/**/*',
    '!electron/**/*',
    'electron/main.js',
    '.next/**/*',
    'public/**/*',
    'node_modules/**/*',
    'package.json',
    'next.config.ts',
  ],

  asarUnpack: [
    '.next/**',
    'node_modules/next/**',
    'node_modules/@next/**',
  ],

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
  },

  portable: {
    artifactName: 'DOR101-Portable-${version}.${ext}',
  },

  extraMetadata: {
    main: 'electron/main.js',
  },
};
