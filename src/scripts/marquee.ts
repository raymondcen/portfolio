// Mobile marquee for any [data-marquee] box that clips one line of text (its first child element).
// Below 900px, when the text overflows, the box gets .marquee and an aria-hidden copy of the text, and both loop left
// (styles and --marquee-gap in global.css). Text that fits stays still. Reduced motion or desktop: no copy, no motion.
// Rechecks when the box resizes (window resize, orientation change) and when the text changes (live updates)
const SPEED = 30; // px per second, the same for every line
const DELAY = 400; // ms after page load before anything scrolls

const mobile = matchMedia('(width < 900px) and (prefers-reduced-motion: no-preference)');
const boxes = document.querySelectorAll<HTMLElement>('[data-marquee]');
let started = false;

function update(box: HTMLElement) {
  const text = box.firstElementChild as HTMLElement;
  // Measure the text alone: with the copy in, the box always overflows
  if (box.classList.contains('marquee')) {
    box.classList.remove('marquee');
    box.lastElementChild!.remove();
  }
  if (!started || !mobile.matches || box.scrollWidth <= box.clientWidth) return;

  const copy = text.cloneNode(true) as HTMLElement;
  copy.setAttribute('aria-hidden', 'true');
  // Links in the copy stay clickable but out of the tab order
  copy.querySelectorAll<HTMLElement>('a, button, [tabindex]').forEach((el) => (el.tabIndex = -1));
  box.append(copy);
  box.classList.add('marquee');
  // One loop moves one copy plus the gap, so the duration keeps every line at SPEED
  const distance = copy.getBoundingClientRect().left - text.getBoundingClientRect().left;
  box.style.setProperty('--marquee-dur', `${distance / SPEED}s`);
}

const resize = new ResizeObserver((entries) => entries.forEach((e) => update(e.target as HTMLElement)));
for (const box of boxes) {
  const text = box.firstElementChild as HTMLElement;
  resize.observe(box);
  // A re-render with the same text (a 30s poll) leaves a running loop alone instead of restarting it
  new MutationObserver(() => {
    const copy = box.classList.contains('marquee') && box.lastElementChild;
    if (!copy || copy.textContent !== text.textContent) update(box);
  }).observe(text, { childList: true, characterData: true, subtree: true });
}
mobile.addEventListener('change', () => boxes.forEach(update));

addEventListener('load', () =>
  setTimeout(async () => {
    // Web fonts set the final widths
    await document.fonts.ready;
    started = true;
    boxes.forEach(update);
  }, DELAY),
);
