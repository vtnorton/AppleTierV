const ICON_PATHS = {
  download: '<path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" />',
  link: '<path d="M9 15l6-6" /><path d="M13 5h4a4 4 0 0 1 0 8h-2" /><path d="M11 19H7a4 4 0 0 1 0-8h2" />',
  upload: '<path d="M12 21V9" /><path d="M7 14l5-5 5 5" /><path d="M5 4h14" />',
  trash: '<path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v6" /><path d="M14 11v6" />',
  chevronUp: '<path d="M6 15l6-6 6 6" />',
  chevronDown: '<path d="M6 9l6 6 6-6" />',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export const createIcon = (name: IconName): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('icon');
  svg.innerHTML = ICON_PATHS[name];
  return svg;
};
