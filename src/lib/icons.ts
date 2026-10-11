import lucide from '@iconify-json/lucide/icons.json';

export type LucideName = keyof typeof lucide.icons;

// Lucide icon as the mask of an .icon-wash: SVG strokes can't use background-clip, so the gradient shows through the icon
export const maskIcon = (name: LucideName) =>
  `--icon: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${lucide.icons[name].body}</svg>`)}")`;
