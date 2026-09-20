# Transparent RH favicon cutouts

The user's original PNGs remain unchanged in `D:/Downloads/`:

- `ChatGPT Image Sep 20, 2026, 08_06_06 AM (1).png` (white/cyan on navy)
- `ChatGPT Image Sep 20, 2026, 08_06_06 AM (2).png` (navy/cyan on white)

`light.png` and `dark.png` are transparent derivatives made with the built-in imagegen tool. The tile, border, glow and surrounding background were removed. The final dark-browser variant uses light silver to avoid the rough white edges in the rejected cutouts. These are raster cutouts, not exact vector reconstructions.

Final light prompt:

> Use the supplied LIGHT favicon (navy rh and cyan inset on white background) as edit target. Produce ONLY that exact navy lowercase rh monogram and cyan inset on genuine transparent alpha PNG. Remove white background AND rounded-square outline entirely. No tile, border, shadow or glow. Preserve the letter shapes and cyan curved inset. Center with 6% transparent padding. This is the light-browser-theme favicon matching the user-supplied mark.

Final dark prompt:

> Make the clean NAVY/CYAN rh logo into its dark-theme variant. Critical: replace all navy letter fill with SOLID LIGHT SILVER #cbd5e1 (NOT WHITE); cyan inset stays #12bce9. Flat vector-like filled silhouette with sharp straight edges and smooth curves. No texture, no distressing, no outline, no glow, no grain, no stray pixels anywhere. Preserve rh geometry from the clean navy image. Export on genuine transparent alpha PNG. The prior white cutout was defective with ragged stray pixels; do NOT copy those defects. Light silver fill must have clean hard boundaries and completely empty surroundings.

Re-export from these files with `node tools/media/prepare-transparent-icons.cjs tools/media/rh-cutouts/light.png tools/media/rh-cutouts/dark.png`. Browser assets are `public/brand/rh-light-v2.png` and `public/brand/rh-dark-v2.png`; selection follows the browser color scheme. The script also exports the 180px Apple icon and 16/32/48px ICO. The superseded app icons are preserved in `tools/media/favicon-backup-2026-09-20/`.
