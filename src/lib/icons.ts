import lucide from '@iconify-json/lucide/icons.json';

export type LucideName = keyof typeof lucide.icons;

const mask = (viewBox: string, body: string) =>
  `--icon: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`)}")`;

// Lucide icon as the mask of an .icon-wash: SVG strokes can't use background-clip, so the gradient shows through the icon
export const maskIcon = (name: LucideName) => mask('0 0 24 24', lucide.icons[name].body);

// 22 x 40 chevrons for the About carousel arrows: stretching Lucide's square chevron would distort its stroke
const tall = (d: string) =>
  mask('0 0 22 40', `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" d="${d}"/>`);
export const tallChevron = { left: tall('M17 3L5 20l12 17'), right: tall('M5 3l12 17L5 37') };
