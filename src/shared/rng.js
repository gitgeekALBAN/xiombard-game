// Small seeded RNG so host and clients generate identical procedural content.
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + next() * (hi - lo);
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

const FIRST = ['Uncle', 'Aunt', 'Old', 'Lady', 'Sir', 'Granny', 'Little', 'Cousin', 'Mister', 'Madame', 'Professor', 'Count'];
const LAST = ['Mortimer', 'Grimsby', 'Bones', 'Wobble', 'Crumb', 'Fennick', 'Mildew', 'Pockets', 'Noodle', 'Gloom',
  'Bartleby', 'Snitch', 'Cobweb', 'Pickles', 'Dreary', 'Lumpkin', 'Moth', 'Tumble', 'Vex', 'Ashby'];

export function corpseName(seed) {
  const r = rng(seed * 7 + 3);
  return `${r.pick(FIRST)} ${r.pick(LAST)}`;
}
