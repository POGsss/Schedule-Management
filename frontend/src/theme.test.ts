import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  generatePalette,
  generateThemeTokens,
  meetsTextContrast,
  normalizeHex,
  resolveTheme,
} from './theme';

describe('theme generation', () => {
  it('normalizes short and lowercase hex while rejecting alpha and malformed values', () => {
    expect(normalizeHex('  #abc ')).toBe('#AABBCC');
    expect(normalizeHex('0f8b78')).toBe('#0F8B78');
    expect(normalizeHex('#12')).toBeNull();
    expect(normalizeHex('#11223344')).toBeNull();
    expect(normalizeHex('nope')).toBeNull();
  });

  it.each(['#0F8B78', '#FF0000', '#FFFF00', '#FAFAFA', '#050505', '#808080', '#2255DD'])(
    'generates valid palette colors for %s',
    (seed) => {
      const palette = generatePalette(seed);
      expect(Object.keys(palette)).toHaveLength(13);
      for (const color of Object.values(palette)) expect(color).toMatch(/^#[\dA-F]{6}$/);
      expect(palette['0']).not.toBe(palette['1000']);
    },
  );

  it('keeps grayscale seeds achromatic instead of introducing another hue', () => {
    const grayscale = generatePalette('#808080');
    expect(new Set(Object.values(grayscale)).size).toBeGreaterThan(5);
    expect(grayscale['500']).toBe('#747474');
  });

  it('recolors every semantic role when the seed changes in both themes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const teal = generateThemeTokens('#0F8B78', mode);
      const blue = generateThemeTokens('#2255DD', mode);
      expect(Object.keys(teal).sort()).toEqual(Object.keys(blue).sort());
      for (const role of [
        '--app-accent',
        '--app-focus-ring',
        '--app-status-error',
        '--app-meeting-border',
      ]) {
        expect(teal[role]).not.toBe(blue[role]);
      }
      expect(teal['--danger']).toBe('var(--app-status-error)');
      expect(teal['--warning']).toBe('var(--app-status-warning)');
    }
  });

  it.each(['#0F8B78', '#FF0000', '#FFFF00', '#FAFAFA', '#050505', '#808080', '#2255DD'])(
    'maintains accessible text and action contrast for %s',
    (seed) => {
      for (const mode of ['light', 'dark'] as const) {
        const tokens = generateThemeTokens(seed, mode);
        expect(meetsTextContrast(tokens['--app-text']!, tokens['--app-canvas']!)).toBe(true);
        expect(meetsTextContrast(tokens['--app-text-muted']!, tokens['--app-canvas']!)).toBe(true);
        expect(
          contrastRatio(tokens['--app-on-accent']!, tokens['--app-accent']!),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(tokens['--app-on-shell']!, tokens['--app-shell']!),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(tokens['--app-status-text']!, tokens['--app-status-surface']!),
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(tokens['--app-border-strong']!, tokens['--app-surface']!),
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(tokens['--app-focus-ring']!, tokens['--app-canvas']!),
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it('supports the large-text contrast threshold', () => {
    expect(meetsTextContrast('#000000', '#FFFFFF', true)).toBe(true);
  });

  it('uses pure white for light surfaces and a dark palette surface in dark mode', () => {
    expect(generateThemeTokens('#B73838', 'light')['--app-surface']).toBe('#FFFFFF');
    expect(generateThemeTokens('#B73838', 'dark')['--app-surface']).toBe(
      generatePalette('#B73838')['950'],
    );
  });

  it('resolves system theme preference using the current operating system preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });
});
