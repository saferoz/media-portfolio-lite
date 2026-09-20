// Export the imagegen tile cutout without modifying its artwork or alpha.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const source = process.argv[2];
  if (!source) throw new Error('Pass the generated transparent tile master PNG.');
  const root = path.resolve(__dirname, '../..');
  const backup = path.join(root, 'tools/media/favicon-backup-seo-2026-09-20');
  const originals = path.join(root, 'tools/media/rh-tile');
  await fs.mkdir(backup, { recursive: true });
  await fs.mkdir(originals, { recursive: true });
  for (const name of ['favicon.ico', 'apple-icon.png']) {
    try { await fs.copyFile(path.join(root, 'src/app', name), path.join(backup, name), fs.constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  const master = path.join(originals, 'tile-transparent-master.png');
  if (path.resolve(source) !== master) await fs.copyFile(source, master);
  const { data, info } = await sharp(master).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
  if (alpha(0, 0) !== 0 || alpha(info.width - 1, info.height - 1) !== 0) throw new Error('Outside corners must be transparent.');
  if (alpha(Math.floor(info.width / 2), Math.floor(info.height / 2)) < 250) throw new Error('Tile interior must stay opaque.');
  await sharp(master).resize(192, 192).png().toFile(path.join(root, 'public/brand/rh-tile-v3.png'));
  await sharp(master).resize(180, 180).png().toFile(path.join(root, 'src/app/apple-icon.png'));
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(master).resize(size, size).ensureAlpha().png().toBuffer()));
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
  console.log('Exported navy tile icons with transparent outer corners; prior exports backed up.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
