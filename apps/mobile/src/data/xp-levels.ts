export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

const LEVELS: LevelInfo[] = [
  { level: 1,  title: 'Debutant',       xpRequired: 0,     icon: '\uD83C\uDF31' },
  { level: 2,  title: 'Curieux',        xpRequired: 50,    icon: '\uD83C\uDF31' },
  { level: 3,  title: 'Apprenti',       xpRequired: 120,   icon: '\uD83C\uDF3F' },
  { level: 4,  title: 'Explorateur',    xpRequired: 200,   icon: '\uD83C\uDF3F' },
  { level: 5,  title: 'Aventurier',     xpRequired: 350,   icon: '\uD83C\uDF3F' },
  { level: 6,  title: 'Challenger',     xpRequired: 550,   icon: '\u2B50' },
  { level: 7,  title: 'Warrior',        xpRequired: 800,   icon: '\u2B50' },
  { level: 8,  title: 'Expert',         xpRequired: 1100,  icon: '\u2B50' },
  { level: 9,  title: 'Master',         xpRequired: 1500,  icon: '\uD83D\uDD25' },
  { level: 10, title: 'Champion',       xpRequired: 2000,  icon: '\uD83D\uDD25' },
  { level: 11, title: 'Elite',          xpRequired: 2600,  icon: '\uD83D\uDD25' },
  { level: 12, title: 'Legendaire',     xpRequired: 3300,  icon: '\uD83D\uDC8E' },
  { level: 13, title: 'Mythique',       xpRequired: 4100,  icon: '\uD83D\uDC8E' },
  { level: 14, title: 'Divin',          xpRequired: 5000,  icon: '\uD83D\uDC8E' },
  { level: 15, title: 'Immortel',       xpRequired: 6000,  icon: '\uD83D\uDC51' },
  { level: 16, title: 'Transcendant',   xpRequired: 7200,  icon: '\uD83D\uDC51' },
  { level: 17, title: 'Absolu',         xpRequired: 8500,  icon: '\uD83D\uDC51' },
  { level: 18, title: 'Celeste',        xpRequired: 10000, icon: '\uD83C\uDF1F' },
  { level: 19, title: 'Eternel',        xpRequired: 12000, icon: '\uD83C\uDF1F' },
  { level: 20, title: 'Omniscient',     xpRequired: 15000, icon: '\uD83C\uDF1F' },
];

export function getLevelInfo(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevelInfo(xp: number): LevelInfo | null {
  const current = getLevelInfo(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  return next ?? null;
}

export function getProgressToNext(xp: number): number {
  const current = getLevelInfo(xp);
  const next = getNextLevelInfo(xp);
  if (!next) return 1;
  const range = next.xpRequired - current.xpRequired;
  const progress = xp - current.xpRequired;
  return Math.min(progress / range, 1);
}

export function getXpToNextLevel(xp: number): number {
  const next = getNextLevelInfo(xp);
  if (!next) return 0;
  return next.xpRequired - xp;
}

export function didLevelUp(oldXp: number, newXp: number): LevelInfo | null {
  const oldLevel = getLevelInfo(oldXp);
  const newLevel = getLevelInfo(newXp);
  if (newLevel.level > oldLevel.level) return newLevel;
  return null;
}
