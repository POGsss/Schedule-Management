import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { DEFAULT_BRAND_SEED, SEED_STORAGE_KEY, THEME_STORAGE_KEY } from './theme';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

function readyResponse() {
  return Promise.resolve(
    new Response(JSON.stringify({ status: 'ready', database: 'ready' }), { status: 200 }),
  );
}

function injectApplicationStyles() {
  const stylesheet = document.createElement('style');
  stylesheet.textContent = readFileSync('src/styles.css', 'utf8').replace(
    /^@import[^;]+;\s*/gm,
    '',
  );
  document.head.append(stylesheet);
  return stylesheet;
}

describe('application foundation shell', () => {
  it('shows a ready state only after the API confirms database readiness', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    expect(screen.getByText('Connecting to your workspace')).toBeInTheDocument();
    expect(await screen.findByText('Ready to set up')).toBeInTheDocument();
    expect(screen.getByText('API and database are ready.')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/health/ready');
  });

  it('presents a recoverable error when readiness fails and retries on request', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockImplementationOnce(readyResponse);
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'Readiness check needs attention' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Retry connection' }));
    expect(await screen.findByText('API and database are ready.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preserves the last valid seed when input is invalid and stores a valid replacement', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    const field = screen.getByRole('textbox', { name: 'Brand color seed' });
    fireEvent.change(field, { target: { value: 'bad-color' } });
    expect(screen.getByRole('alert')).toHaveTextContent('The current seed is unchanged');
    expect(document.documentElement.dataset.brandSeed).toBe(DEFAULT_BRAND_SEED);
    fireEvent.change(field, { target: { value: '#2255dd' } });
    await waitFor(() => expect(document.documentElement.dataset.brandSeed).toBe('#2255DD'));
    expect(localStorage.getItem(SEED_STORAGE_KEY)).toBe('#2255DD');
  });

  it('persists theme selection and changes the document theme', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Appearance/ }));
    await user.click(await screen.findByRole('option', { name: 'Dark' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('updates theme preference from the HeroUI workspace selector', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Theme preference/ }));
    await user.click(await screen.findByRole('option', { name: 'Dark' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('keeps the selected route joined to the workspace and supports keyboard navigation', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass('active');
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('link', { name: 'School Scheduler home' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /Appearance/ })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('region', { name: 'Workspace content' })).toHaveFocus();
  });

  it('connects the active navigation tab to the workspace with reverse-radius corners', () => {
    const stylesheet = injectApplicationStyles();
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);

    try {
      const activeTab = screen.getByRole('link', { name: 'Overview' });
      const topbar = document.querySelector('.topbar');
      const navigation = document.querySelector('.primary-nav');
      const workspace = screen.getByRole('region', { name: 'Workspace content' });
      expect(topbar).not.toBeNull();
      expect(getComputedStyle(topbar as Element).padding).toBe('20px');
      expect(getComputedStyle(topbar as Element).height).toBe('76px');
      expect(getComputedStyle(topbar as Element).zIndex).toBe('1');
      expect(navigation).not.toBeNull();
      expect(getComputedStyle(navigation as Element).height).toBe('76px');
      expect(getComputedStyle(navigation as Element).marginTop).toBe('-20px');
      expect(getComputedStyle(navigation as Element).marginBottom).toBe('-20px');
      expect(getComputedStyle(activeTab).height).toBe('66px');
      expect(getComputedStyle(activeTab).marginTop).toBe('10px');
      expect(getComputedStyle(activeTab).marginBottom).toBe('0px');
      expect(getComputedStyle(workspace).zIndex).toBe('2');
      expect(Number(getComputedStyle(workspace).zIndex)).toBeGreaterThan(
        Number(getComputedStyle(topbar as Element).zIndex),
      );
    } finally {
      stylesheet.remove();
    }
  });

  it('does not render a footer below the full-screen workspace', () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('centers content vertically in HeroUI controls', () => {
    const stylesheet = injectApplicationStyles();
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);

    try {
      const trigger = document.querySelector('.theme-select .select__trigger');
      const appearanceTrigger = document.querySelector('.theme-picker .select__trigger');
      const colorTrigger = document.querySelector('.seed-color-trigger');
      const brandInput = document.querySelector('.seed-field .input');
      expect(trigger).not.toBeNull();
      expect(getComputedStyle(trigger as Element).alignItems).toBe('center');
      expect(appearanceTrigger).not.toBeNull();
      expect(getComputedStyle(appearanceTrigger as Element).alignItems).toBe('center');
      expect(colorTrigger).not.toBeNull();
      expect(getComputedStyle(colorTrigger as Element).alignItems).toBe('center');
      expect(brandInput).not.toBeNull();
      expect(getComputedStyle(brandInput as Element).height).toBe('42px');
      expect(getComputedStyle(brandInput as Element).lineHeight).toBe('normal');
    } finally {
      stylesheet.remove();
    }
  });

  it('separates cards and form controls by background without borders', () => {
    const stylesheet = injectApplicationStyles();
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);

    try {
      const borderlessSurfaces = document.querySelectorAll(
        '.workspace-context, .readiness-panel, .setup-review, .connection-state, .status-caption, .mode-chip, .seed-field .input, .theme-select .select__trigger, .theme-picker .select__trigger, .seed-color-trigger, .sample-status',
      );
      expect(borderlessSurfaces.length).toBeGreaterThan(0);
      borderlessSurfaces.forEach((surface) => {
        expect(getComputedStyle(surface).borderTopWidth).toBe('0px');
      });
    } finally {
      stylesheet.remove();
    }
  });

  it('opens the HeroUI brand color picker from its accessible swatch control', async () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Choose brand seed' }));
    expect(await screen.findByRole('slider', { name: 'Brand color hue' })).toBeInTheDocument();
  });

  it('keeps the Appearance dropdown indicator visible on its filled control', () => {
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);

    const appearance = screen.getByRole('button', { name: /Appearance/ });
    const indicator = appearance.querySelector('.select__indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toBeVisible();
  });

  it('keeps overflow in the workspace surface instead of scrolling the page', () => {
    const stylesheet = injectApplicationStyles();
    vi.stubGlobal('fetch', vi.fn(readyResponse));
    render(<App />);

    try {
      const workspace = screen.getByRole('region', { name: 'Workspace content' });
      const generatedContent = document.createElement('div');
      generatedContent.style.height = '3000px';
      workspace.querySelector('.workspace-content')?.append(generatedContent);

      expect(workspace).toHaveClass('workspace-frame');
      expect(getComputedStyle(workspace).paddingTop).toBe('20px');
      expect(getComputedStyle(workspace).marginLeft).toBe('20px');
      expect(getComputedStyle(workspace).marginRight).toBe('20px');
      expect(getComputedStyle(workspace).overflowY).toBe('auto');
      expect(getComputedStyle(workspace).overflowX).toBe('hidden');
      expect(getComputedStyle(workspace).borderRadius).toBe('20px');
      expect(getComputedStyle(document.body).overflow).toBe('hidden');
    } finally {
      stylesheet.remove();
    }
  });
});
