import {
  Button,
  Card,
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  Input,
  Label,
  Link,
  ListBox,
  Select,
  Surface,
  TextField,
} from '@heroui/react';
import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  DEFAULT_BRAND_SEED,
  generatePalette,
  generateThemeTokens,
  normalizeHex,
  resolveTheme,
  SEED_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeMode,
  type ThemePreference,
} from './theme';

type ConnectionState = 'checking' | 'ready' | 'error';
type ConnectionResult = { state: 'ready' | 'error'; message: string };

function readPreference(): ThemePreference {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function StatusMark({ kind }: { kind: 'valid' | 'warning' | 'error' }) {
  const icons = {
    valid: CircleCheck,
    warning: TriangleAlert,
    error: CircleX,
  };
  const Icon = icons[kind];
  return <Icon aria-hidden="true" className="status-mark" strokeWidth={1.7} />;
}

function useConnection() {
  const [state, setState] = useState<ConnectionState>('checking');
  const [message, setMessage] = useState('Checking API and database readiness…');

  const fetchReadiness = useCallback(async (): Promise<ConnectionResult> => {
    try {
      const response = await fetch('/api/health/ready');
      if (!response.ok) throw new Error(`Readiness request returned ${response.status}.`);
      const result: unknown = await response.json();
      if (
        typeof result !== 'object' ||
        result === null ||
        !('status' in result) ||
        result.status !== 'ready' ||
        !('database' in result) ||
        result.database !== 'ready'
      ) {
        throw new Error('The API did not confirm database readiness.');
      }
      return { state: 'ready', message: 'API and database are ready.' };
    } catch (error) {
      return {
        state: 'error',
        message: error instanceof Error ? error.message : 'Could not reach the API.',
      };
    }
  }, []);

  useEffect(() => {
    void fetchReadiness().then(({ state: nextState, message: nextMessage }) => {
      setState(nextState);
      setMessage(nextMessage);
    });
  }, [fetchReadiness]);

  const check = useCallback(() => {
    setState('checking');
    setMessage('Checking API and database readiness…');
    void fetchReadiness().then(({ state: nextState, message: nextMessage }) => {
      setState(nextState);
      setMessage(nextMessage);
    });
  }, [fetchReadiness]);

  return { state, message, check };
}

export default function App() {
  const connection = useConnection();
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [seed, setSeed] = useState(
    () => normalizeHex(localStorage.getItem(SEED_STORAGE_KEY) ?? '') ?? DEFAULT_BRAND_SEED,
  );
  const [seedInput, setSeedInput] = useState(seed);
  const [seedError, setSeedError] = useState('');
  const resolvedTheme: ThemeMode = resolveTheme(preference, systemDark);
  const palette = useMemo(() => generatePalette(seed), [seed]);
  const themeTokens = useMemo(
    () => generateThemeTokens(seed, resolvedTheme),
    [seed, resolvedTheme],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    applyTheme(seed, resolvedTheme);
    document.documentElement.dataset.brandSeed = seed;
  }, [seed, resolvedTheme]);

  function changePreference(value: ThemePreference) {
    setPreference(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
  }

  function saveSeed(value: string) {
    setSeedInput(value);
    const normalized = normalizeHex(value);
    if (!normalized) {
      setSeedError(
        'Enter a valid 3 or 6 digit hex color, such as #0F8B78. The current seed is unchanged.',
      );
      return;
    }
    setSeedError('');
    setSeed(normalized);
    setSeedInput(normalized);
    localStorage.setItem(SEED_STORAGE_KEY, normalized);
  }

  const stateLabel =
    connection.state === 'ready'
      ? 'Ready'
      : connection.state === 'error'
        ? 'Connection issue'
        : 'Checking';

  return (
    <main className="app-shell" style={themeTokens as React.CSSProperties}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="School Scheduler home">
          <span aria-hidden="true" className="brand-mark">
            S
          </span>
          <span>School Scheduler</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link aria-current="page" className="nav-link active" href="/">
            Overview
          </Link>
        </nav>
        <div className="theme-control">
          <span>Appearance</span>
          <Select
            aria-label="Appearance"
            className="theme-picker"
            selectedKey={preference}
            variant="secondary"
            onSelectionChange={(key) => {
              if (key === 'light' || key === 'dark' || key === 'system') changePreference(key);
            }}
          >
            <Select.Trigger className="theme-picker-trigger">
              <Select.Value />
              <Select.Indicator aria-hidden="true" />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="system" textValue="System">
                  System
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="light" textValue="Light">
                  Light
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="dark" textValue="Dark">
                  Dark
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </header>

      <Surface
        className="workspace-frame"
        variant="default"
        role="region"
        aria-label="Workspace content"
        tabIndex={0}
      >
        <div className="workspace-context">
          <div>
            <p className="context-label">Application foundation</p>
            <h1 id="page-title">Overview</h1>
          </div>
          <div className={`connection-state ${connection.state}`} role="status" aria-live="polite">
            <span className="state-dot" aria-hidden="true" />
            <span>{stateLabel}</span>
          </div>
        </div>

        <div className="workspace-content">
          <Card
            className={`readiness-panel ${connection.state}`}
            variant="secondary"
            role="region"
            aria-labelledby="readiness-title"
          >
            <Card.Content className="readiness-content">
              <div className="readiness-copy">
                <p className="section-label">System status</p>
                <h2 id="readiness-title">
                  {connection.state === 'ready'
                    ? 'Ready to set up'
                    : connection.state === 'error'
                      ? 'Readiness check needs attention'
                      : 'Connecting to your workspace'}
                </h2>
                <p
                  className="readiness-message"
                  role={connection.state === 'error' ? 'alert' : undefined}
                >
                  {connection.message}
                </p>
              </div>
              {connection.state === 'error' ? (
                <Button variant="outline" onPress={() => void connection.check()}>
                  Retry connection
                </Button>
              ) : (
                <span className="status-caption">API · SQLite</span>
              )}
            </Card.Content>
          </Card>

          <Card
            className="setup-review"
            variant="default"
            role="region"
            aria-labelledby="review-title"
          >
            <Card.Header className="review-heading">
              <div>
                <p className="section-label">Interface review</p>
                <h2 id="review-title">Theme and component states</h2>
                <p>
                  One seed updates the complete interface palette. Preferences stay on this device.
                </p>
              </div>
              <div className="mode-chip" aria-label={`Current theme: ${resolvedTheme}`}>
                {resolvedTheme === 'light' ? 'Light mode' : 'Dark mode'}
              </div>
            </Card.Header>

            <Card.Content className="setup-review-content">
              <div className="review-grid">
                <div className="review-controls">
                  <TextField
                    className="seed-field"
                    isInvalid={Boolean(seedError)}
                    validationBehavior="aria"
                    value={seedInput}
                    onChange={saveSeed}
                  >
                    <Label>Brand color seed</Label>
                    <Input
                      aria-describedby={seedError ? 'seed-error' : 'seed-help'}
                      autoCapitalize="characters"
                    />
                  </TextField>
                  <ColorPicker
                    className="seed-color-picker"
                    value={seed}
                    onChange={(color) => saveSeed(color.toString('hex'))}
                  >
                    <ColorPicker.Trigger
                      aria-label="Choose brand seed"
                      className="seed-color-trigger"
                    >
                      <ColorSwatch shape="square" size="md" />
                    </ColorPicker.Trigger>
                    <ColorPicker.Popover className="seed-color-popover">
                      <ColorArea
                        aria-label="Brand color saturation and brightness"
                        className="seed-color-area"
                        colorSpace="hsb"
                        xChannel="saturation"
                        yChannel="brightness"
                      >
                        <ColorArea.Thumb />
                      </ColorArea>
                      <ColorSlider aria-label="Brand color hue" channel="hue" colorSpace="hsb">
                        <ColorSlider.Track>
                          <ColorSlider.Thumb />
                        </ColorSlider.Track>
                      </ColorSlider>
                    </ColorPicker.Popover>
                  </ColorPicker>
                  <p id="seed-help" className="help-copy">
                    Use a three or six digit sRGB hex value. Every state uses this hue.
                  </p>
                  {seedError && (
                    <p id="seed-error" className="field-error" role="alert">
                      <StatusMark kind="error" />
                      {seedError}
                    </p>
                  )}
                  <Select
                    className="theme-select"
                    selectedKey={preference}
                    variant="secondary"
                    onSelectionChange={(key) => {
                      if (key === 'light' || key === 'dark' || key === 'system') {
                        changePreference(key);
                      }
                    }}
                  >
                    <Label className="theme-select-label">Theme preference</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator aria-hidden="true" />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="system" textValue="Follow system">
                          Follow system
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="light" textValue="Light">
                          Light
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="dark" textValue="Dark">
                          Dark
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="component-review" aria-label="Component state samples">
                  <div className="sample-heading">
                    <h3>Button states</h3>
                    <span>Keyboard focus is visible</span>
                  </div>
                  <div className="button-row">
                    <Button className="app-button">Primary action</Button>
                    <Button variant="outline">Secondary</Button>
                    <Button isDisabled>Disabled</Button>
                  </div>
                  <div className="sample-statuses" aria-label="Status state samples">
                    <p className="sample-status valid">
                      <StatusMark kind="valid" />
                      <span>
                        <strong>Valid</strong> · Database connection confirmed
                      </span>
                    </p>
                    <p className="sample-status warning">
                      <StatusMark kind="warning" />
                      <span>
                        <strong>Needs review</strong> · Example warning state
                      </span>
                    </p>
                    <p className="sample-status error">
                      <StatusMark kind="error" />
                      <span>
                        <strong>Error</strong> · Example error state with recovery detail
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="palette-review" aria-label="Generated seed palette">
                {[
                  '0',
                  '50',
                  '100',
                  '200',
                  '300',
                  '400',
                  '500',
                  '600',
                  '700',
                  '800',
                  '900',
                  '950',
                  '1000',
                ].map((stop) => (
                  <span
                    className="palette-stop"
                    key={stop}
                    title={`${stop}: ${palette[stop]}`}
                    style={{ backgroundColor: palette[stop] }}
                    aria-label={`Palette ${stop}`}
                  />
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </Surface>
    </main>
  );
}
