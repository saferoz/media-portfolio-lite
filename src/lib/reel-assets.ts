// SHA-256 prefixes of the original, unchanged playback files.
// qa/reel-assets.spec.ts verifies these against disk before delivery.
export const reelAssets: Record<string, { bytes: number; revision: string }> = {
  '/media/eltacoria-app-film.mp4': { bytes: 10513594, revision: '1ef3479945371f7f' },
  '/media/eltacoria-translation-film.mp4': { bytes: 8164758, revision: '4cde15024bc05bda' },
  '/media/jury-cake-film.mp4': { bytes: 7662098, revision: '66cc575b3750172c' },
  '/media/jury-eid-film.mp4': { bytes: 8204624, revision: 'f66eeef512a68ef2' },
  '/media/cadillac-escalade-v2-film.mp4': { bytes: 4781830, revision: 'c2d915df087a770b' },
  '/media/cadillac-film.mp4': { bytes: 36835417, revision: 'b65c73875793d653' },
  '/media/hazardous-film.mp4': { bytes: 31142745, revision: '021483f3c83a6b5e' },
};
