export type ThemePreference = 'light' | 'dark' | 'system';
export type ThemeMode = 'light' | 'dark';

export const DEFAULT_BRAND_SEED = '#0F8B78';
export const THEME_STORAGE_KEY = 'school-scheduler-theme';
export const SEED_STORAGE_KEY = 'school-scheduler-brand-seed';

const stops = [
  ['0', 0.995, 0.02],
  ['50', 0.98, 0.04],
  ['100', 0.95, 0.1],
  ['200', 0.89, 0.2],
  ['300', 0.78, 0.35],
  ['400', 0.66, 0.65],
  ['500', 0.56, 1],
  ['600', 0.47, 0.9],
  ['700', 0.38, 0.7],
  ['800', 0.29, 0.45],
  ['900', 0.21, 0.25],
  ['950', 0.15, 0.12],
  ['1000', 0.1, 0.06],
] as const;

type Oklch = { lightness: number; chroma: number; hue: number };
type Rgb = { red: number; green: number; blue: number };
export type ThemeTokens = Record<string, string>;

function srgbToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  const channel = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, channel)) * 255);
}

export function normalizeHex(input: string): string | null {
  const value = input.trim();
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (!match) return null;
  const raw = match[1];
  if (!raw) return null;
  const expanded = raw.length === 3 ? [...raw].map((digit) => digit + digit).join('') : raw;
  return `#${expanded.toUpperCase()}`;
}

function hexToOklch(hex: string): Oklch {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error('Use a three or six digit opaque hexadecimal color.');
  const rgb = normalized.slice(1).match(/.{2}/g);
  if (!rgb) throw new Error('Invalid hexadecimal color.');
  const [r, g, b] = rgb.map((part) => srgbToLinear(Number.parseInt(part, 16)));
  const l = 0.4122214708 * r! + 0.5363325363 * g! + 0.0514459929 * b!;
  const m = 0.2119034982 * r! + 0.6806995451 * g! + 0.1073969566 * b!;
  const s = 0.0883024619 * r! + 0.2817188376 * g! + 0.6299787005 * b!;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bAxis = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const chroma = Math.hypot(a, bAxis);
  return { lightness, chroma, hue: chroma < 1e-7 ? 0 : (Math.atan2(bAxis, a) * 180) / Math.PI };
}

function oklchToRgb({ lightness, chroma, hue }: Oklch): Rgb {
  const angle = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  return {
    red: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function inGamut(color: Oklch): boolean {
  const angle = (color.hue * Math.PI) / 180;
  const a = color.chroma * Math.cos(angle);
  const b = color.chroma * Math.sin(angle);
  const lRoot = color.lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = color.lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = color.lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].every((channel) => channel >= -1e-7 && channel <= 1.0000001);
}

function toHex(color: Oklch): string {
  let chroma = Math.min(color.chroma, 0.16);
  if (!inGamut({ ...color, chroma })) {
    let low = 0;
    let high = chroma;
    for (let index = 0; index < 24; index += 1) {
      const middle = (low + high) / 2;
      if (inGamut({ ...color, chroma: middle })) low = middle;
      else high = middle;
    }
    chroma = low;
  }
  const rgb = oklchToRgb({ ...color, chroma });
  return `#${[rgb.red, rgb.green, rgb.blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function luminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0;
  const parts = normalized.slice(1).match(/.{2}/g);
  if (!parts) return 0;
  const [r, g, b] = parts.map((part) => srgbToLinear(Number.parseInt(part, 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

function readableForeground(background: string): string {
  return contrast(background, '#000000') >= contrast(background, '#FFFFFF') ? '#000000' : '#FFFFFF';
}

export function generatePalette(seed: string): Record<string, string> {
  const normalized = normalizeHex(seed);
  if (!normalized) throw new Error('Use a three or six digit opaque hexadecimal color.');
  const source = hexToOklch(normalized);
  return Object.fromEntries(
    stops.map(([name, lightness, multiplier]) => [
      name,
      toHex({ lightness, chroma: Math.min(source.chroma * multiplier, 0.16), hue: source.hue }),
    ]),
  );
}

export function generateThemeTokens(seed: string, mode: ThemeMode): ThemeTokens {
  const palette = generatePalette(seed);
  const pick = (lightStop: string, darkStop: string) =>
    palette[mode === 'light' ? lightStop : darkStop]!;
  const action = pick('600', '300');
  const onAction = readableForeground(action);
  const roles: Record<string, string> = {
    canvas: pick('100', '1000'),
    surface: mode === 'light' ? '#FFFFFF' : pick('950', '950'),
    'surface-subtle': pick('50', '900'),
    'surface-hover': pick('100', '800'),
    text: pick('950', '50'),
    'text-muted': pick('700', '300'),
    'border-subtle': pick('200', '800'),
    'border-strong': pick('500', '400'),
    shell: pick('800', '800'),
    'on-shell': pick('50', '50'),
    accent: action,
    'on-accent': onAction,
    'accent-hover': pick('700', '200'),
    'selected-subtle': pick('100', '800'),
    'focus-ring': pick('600', '200'),
    'disabled-surface': pick('50', '900'),
    'disabled-text': pick('700', '300'),
    overlay: pick('900', '1000'),
    selection: pick('200', '800'),
    'grid-line': pick('200', '800'),
    'meeting-surface': pick('100', '800'),
    'meeting-border': pick('500', '400'),
    'meeting-text': pick('950', '50'),
    'status-surface': pick('50', '900'),
    'status-border': pick('300', '700'),
    'status-text': pick('900', '100'),
    'status-success': pick('700', '300'),
    'status-warning': pick('700', '300'),
    'status-error': pick('700', '300'),
  };
  const tokens: ThemeTokens = {};
  for (const [name, value] of Object.entries(roles)) tokens[`--app-${name}`] = value;
  Object.assign(tokens, {
    '--background': `var(--app-canvas)`,
    '--foreground': `var(--app-text)`,
    '--surface': `var(--app-surface)`,
    '--surface-foreground': `var(--app-text)`,
    '--surface-secondary': `var(--app-surface-subtle)`,
    '--surface-secondary-foreground': `var(--app-text)`,
    '--overlay': `var(--app-surface)`,
    '--overlay-foreground': `var(--app-text)`,
    '--default': `var(--app-surface-subtle)`,
    '--default-foreground': `var(--app-text)`,
    '--accent': `var(--app-accent)`,
    '--accent-foreground': `var(--app-on-accent)`,
    '--success': `var(--app-status-success)`,
    '--success-foreground': `var(--app-text)`,
    '--warning': `var(--app-status-warning)`,
    '--warning-foreground': `var(--app-text)`,
    '--danger': `var(--app-status-error)`,
    '--danger-foreground': `var(--app-text)`,
    '--border': `var(--app-border-subtle)`,
    '--separator': `var(--app-border-subtle)`,
    '--focus': `var(--app-focus-ring)`,
    '--field-background': `var(--app-surface-subtle)`,
    '--field-foreground': `var(--app-text)`,
    '--field-placeholder': `var(--app-text-muted)`,
    '--field-border': `var(--app-border-strong)`,
    '--selection': `var(--app-selection)`,
    '--color-scheme': mode,
  });
  return tokens;
}

export function contrastRatio(foreground: string, background: string): number {
  return contrast(foreground, background);
}

export function meetsTextContrast(foreground: string, background: string, large = false): boolean {
  return contrast(foreground, background) >= (large ? 3 : 4.5);
}

export function applyTheme(seed: string, mode: ThemeMode): void {
  const normalized = normalizeHex(seed);
  if (!normalized) throw new Error('Invalid theme seed.');
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
  for (const [name, value] of Object.entries(generateThemeTokens(normalized, mode))) {
    root.style.setProperty(name, value);
  }
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ThemeMode {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}
