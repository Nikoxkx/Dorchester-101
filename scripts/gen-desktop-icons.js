// Renders the Electron desktop icons (app window, tray, exe, installer and
// portable icons) from the SAME artwork the website ships, so the desktop
// app can never drift from the site again.
//
// Run with `node scripts/gen-desktop-icons.js` after the website icon set
// changes. Source of truth is `public/icons/logo-1024.png` — the highest
// resolution tile of the website icon (the sunset "101 DORCHESTER" art that
// layout.tsx and manifest.json serve). Outputs:
//
//   electron/assets/icon.png   512x512 tile (Linux/mac buildResources icon)
//   electron/assets/icon.ico   16/24/32/48/64/128 as 32-bit BMP + 256 as PNG
//
// electron/builder.config.js points `win.icon`, `nsis.installerIcon`,
// `nsis.uninstallerIcon` and `extraResources` at icon.ico, and
// electron/main.js loads it at runtime for the window and tray icons — so
// one regenerated .ico restyles everything the user sees on Windows.
//
// The ICO is encoded here (BMP entries for the small sizes, a PNG-compressed
// entry for 256) instead of adding another dependency: Explorer, NSIS and
// rcedit all accept both flavours, and BMP keeps the small sizes crisp when
// Windows falls back to uncompressed decoding.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const sourcePng = path.join(root, 'public', 'icons', 'logo-1024.png');
const outPng = path.join(root, 'electron', 'assets', 'icon.png');
const outIco = path.join(root, 'electron', 'assets', 'icon.ico');

const BMP_SIZES = [16, 24, 32, 48, 64, 128];
const PNG_SIZE = 256;

async function rgbaForSize(size) {
  const { data } = await sharp(sourcePng).resize(size, size).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return data;
}

/** One 32bpp uncompressed BMP-in-ICO image (BITMAPINFOHEADER + XOR + AND mask). */
function bmpEntry(size, rgba) {
  const xorBytes = size * size * 4;
  const andRowBytes = Math.ceil(size / 8);
  const andRowPadded = Math.ceil(andRowBytes / 4) * 4;
  const andBytes = andRowPadded * size;

  const buffer = Buffer.alloc(40 + xorBytes + andBytes);
  // BITMAPINFOHEADER; height is doubled: XOR bitmap + AND mask follow.
  buffer.writeUInt32LE(40, 0);
  buffer.writeInt32LE(size, 4);
  buffer.writeInt32LE(size * 2, 8);
  buffer.writeUInt16LE(1, 12);
  buffer.writeUInt16LE(32, 14);
  buffer.writeUInt32LE(0, 16); // BI_RGB
  buffer.writeUInt32LE(xorBytes + andBytes, 20);

  // XOR: bottom-up BGRA.
  for (let y = 0; y < size; y++) {
    const srcRow = (size - 1 - y) * size;
    const dst = 40 + y * size * 4;
    for (let x = 0; x < size; x++) {
      const s = (srcRow + x) * 4;
      buffer[dst + x * 4] = rgba[s + 2]; // B
      buffer[dst + x * 4 + 1] = rgba[s + 1]; // G
      buffer[dst + x * 4 + 2] = rgba[s]; // R
      buffer[dst + x * 4 + 3] = rgba[s + 3]; // A
    }
  }

  // AND mask: 1 = transparent; rows padded to 32 bits.
  const andStart = 40 + xorBytes;
  for (let y = 0; y < size; y++) {
    const srcRow = (size - 1 - y) * size;
    for (let x = 0; x < size; x++) {
      if (rgba[(srcRow + x) * 4 + 3] === 0) {
        const o = andStart + y * andRowPadded + (x >> 3);
        buffer[o] |= 0x80 >> (x & 7);
      }
    }
  }
  return buffer;
}

(async () => {
  if (!fs.existsSync(sourcePng)) {
    throw new Error(`missing ${sourcePng} — regenerate the website icon set first (node scripts/gen-icons.js)`);
  }

  // 1. The plain PNG used as buildResources icon on non-Windows platforms.
  await sharp(sourcePng).resize(512, 512).png().toFile(outPng);

  // 2. The ICO: small sizes uncompressed, 256 PNG-compressed.
  const entries = [];
  for (const size of BMP_SIZES) {
    entries.push({ size, data: bmpEntry(size, await rgbaForSize(size)) });
  }
  entries.push({ size: PNG_SIZE, data: await sharp(sourcePng).resize(PNG_SIZE, PNG_SIZE).png().toBuffer() });

  const headerSize = 6;
  const dirSize = 16 * entries.length;
  let offset = headerSize + dirSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(dirSize);
  entries.forEach((entry, i) => {
    const o = i * 16;
    directory[o] = entry.size === 256 ? 0 : entry.size; // width, 0 encodes 256
    directory[o + 1] = entry.size === 256 ? 0 : entry.size; // height
    directory[o + 2] = 0; // palette
    directory[o + 3] = 0; // reserved
    directory.writeUInt16LE(1, o + 4); // planes
    directory.writeUInt16LE(32, o + 6); // bit count
    directory.writeUInt32LE(entry.data.length, o + 8);
    directory.writeUInt32LE(offset, o + 12);
    offset += entry.data.length;
  });

  fs.writeFileSync(outIco, Buffer.concat([header, directory, ...entries.map((e) => e.data)]));

  console.log('wrote', path.relative(root, outPng), `and`, path.relative(root, outIco), `(${entries.length} sizes: ${BMP_SIZES.join('/')} bmp + ${PNG_SIZE} png)`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
