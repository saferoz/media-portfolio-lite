// Format and size exports only; keep source artwork intact.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const [ogSource, iconSource] = process.argv.slice(2);
  if (!ogSource || !iconSource) throw new Error('Provide OG JPEG and icon PNG paths.');
  const og = await sharp(ogSource).metadata();
  if (og.width !== 1731 || og.height !== 909 || og.format !== 'jpeg') throw new Error('OG dimensions must match layout metadata.');
  const backup = path.join(root, 'tools/media/favicon-backup-2026-09-19');
  await fs.mkdir(backup, { recursive: true });
  for (const name of ['icon.svg', 'apple-icon.png', 'favicon.ico']) {
    try {
      await fs.copyFile(path.join(root, 'src/app', name), path.join(backup, name), fs.constants.COPYFILE_EXCL);
    } catch (error) {
      if (error.code !== 'EEXIST' && !(name === 'icon.svg' && error.code === 'ENOENT')) throw error;
    }
  }
  await fs.copyFile(ogSource, path.join(root, 'public/media/raden-hanifa-og-v1.jpg'));
  await sharp(iconSource).resize(192, 192).png().toFile(path.join(root, 'src/app/icon.png'));
  await sharp(iconSource).resize(180, 180).png().toFile(path.join(root, 'src/app/apple-icon.png'));
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(iconSource).resize(size, size).ensureAlpha().png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await fs.writeFile(path.join(root, 'src/app/favicon.ico'), Buffer.concat([header, ...images]));
  console.log('Backed up original icons; exported OG JPEG, 192px PNG, 180px touch icon and 16/32/48px ICO.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
