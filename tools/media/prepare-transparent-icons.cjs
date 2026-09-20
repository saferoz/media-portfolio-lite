// Resize the imagegen cutouts; alpha and source artwork are preserved.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const [light, dark] = process.argv.slice(2);
  if (!light || !dark) throw new Error('Pass the transparent light and dark PNG cutouts.');
  const root = path.resolve(__dirname, '../..');
  const destination = path.join(root, 'public/brand');
  const backup = path.join(root, 'tools/media/favicon-backup-2026-09-20');
  await fs.mkdir(destination, { recursive: true });
  await fs.mkdir(backup, { recursive: true });
  for (const name of ['icon.png', 'favicon.ico', 'apple-icon.png']) {
    try { await fs.copyFile(path.join(root, 'src/app', name), path.join(backup, name), fs.constants.COPYFILE_EXCL); }
    catch (error) { if (!['EEXIST', 'ENOENT'].includes(error.code)) throw error; }
  }
  const originals = path.join(root, 'tools/media/rh-cutouts');
  await fs.mkdir(originals, { recursive: true });
  for (const [source, theme] of [[light, 'light'], [dark, 'dark']]) {
    const preserved = path.join(originals, `${theme}.png`);
    if (path.resolve(source) !== preserved) await fs.copyFile(source, preserved);
    const metadata = await sharp(source).metadata();
    if (!metadata.hasAlpha) throw new Error(`${theme} source has no transparency.`);
    const trimmed = await sharp(source).trim({ background: '#00000000' }).toBuffer();
    await sharp(trimmed).resize(176, 176, { fit: 'contain', background: '#00000000' }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#00000000' }).png().toFile(path.join(destination, `rh-${theme}-v2.png`));
  }
  const icon = path.join(destination, 'rh-light-v2.png');
  await sharp(icon).resize(180, 180).png().toFile(path.join(root, 'src/app/apple-icon.png'));
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(icon).resize(size, size).ensureAlpha().png().toBuffer()));
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index]; header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await fs.writeFile(path.join(root, 'src/app/favicon.ico'), Buffer.concat([header, ...images]));
  // Remove only the superseded route, after its recoverable backup was made.
  await fs.unlink(path.join(root, 'src/app/icon.png')).catch(error => { if (error.code !== 'ENOENT') throw error; });
  console.log('Exported transparent theme icons, touch icon and ICO; preserved the previous icons.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
