// Player settings (speed, last difficulty) in localStorage 'scrivenearth-settings'. Never required to work.
export type Speed = 'full' | 'quick' | 'instant';
export interface Settings {
  speed: Speed;
  difficulty: string;
  volume: number;
  muted: boolean;
}
export const SETTINGS_KEY = 'scrivenearth-settings';
const DEFAULTS: Settings = { speed: 'full', difficulty: 'normal', volume: 0.6, muted: false };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const o = JSON.parse(raw) as Partial<Settings>;
    return {
      speed: o.speed === 'quick' || o.speed === 'instant' || o.speed === 'full' ? o.speed : DEFAULTS.speed,
      difficulty: typeof o.difficulty === 'string' ? o.difficulty : DEFAULTS.difficulty,
      volume: typeof o.volume === 'number' ? Math.max(0, Math.min(1, o.volume)) : DEFAULTS.volume,
      muted: o.muted === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* settings are a convenience; the page works without them */
  }
}

export interface Params {
  seed: number | null;
  speed: Speed | null;
  bot: 'random' | 'ai';
  auto: boolean;
  decks: [number, number] | null;
  skiptitle: boolean;
  devdecks: boolean;
  demo: string | null;
  /** ?tutorial=1: open the guided first match at once. */
  tutorial: boolean;
}

export function readParams(search: string): Params {
  const q = new URLSearchParams(search);
  const sp = q.get('speed');
  const dk = q.get('decks');
  let decks: [number, number] | null = null;
  if (dk) {
    const [a, b] = dk.split(',').map((x) => Number(x));
    if (Number.isInteger(a) && Number.isInteger(b)) decks = [a, b];
  }
  const seed = q.get('seed');
  return {
    seed: seed !== null && seed !== '' && Number.isFinite(Number(seed)) ? Number(seed) : null,
    speed: sp === 'instant' || sp === 'quick' || sp === 'full' ? sp : null,
    bot: q.get('bot') === 'random' ? 'random' : 'ai',
    auto: q.get('auto') === '1',
    decks,
    skiptitle: q.get('skiptitle') === '1',
    devdecks: q.get('devdecks') === '1',
    demo: q.get('demo'),
    tutorial: q.get('tutorial') === '1',
  };
}
