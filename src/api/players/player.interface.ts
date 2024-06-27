export interface UserData {
  gameName: string;
  tagLine: string;
}

export interface ChampStats {
  [key: string]: SingleChampStats;
}

export interface SingleChampStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  stats: DetailedChampStats;
  totalStats: TotalChampStats;
  highs: ChampHighs;
}

export interface DetailedChampStats {
  damagePerMinute: number;
  goldPerMinute: number;
  ccPerMinute: number;
  healingPerMinute: number;
  shieldingPerMinute: number;
  objectiveDamagePerMinute: number;
  damageTakenPerMinute: number;
  selfMitigatedPerMinute: number;
  killsPerMinute: number;
  deathsPerMinute: number;
  assistsPerMinute: number;
  killParticipation: number;
  damageShare: number;
  goldShare: number;
  killShare: number;
  killsPerGame: number;
  deathsPerGame: number;
  assistsPerGame: number;
  kda?: number;
}

export interface TotalChampStats {
  totalDamage: number;
  totalGold: number;
  totalCCTime: number;
  totalHealing: number;
  totalShielding: number;
  totalObjectiveDamage: number;
  totalDamageTaken: number;
  totalSelfMitigated: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  pentakills: number;
  quadrakills: number;
  triplekills: number;
  doublekills: number;
  killsPlusMinus: number;
}

export interface ChampHighs {
  mostKills: Superlative;
  mostDeaths: Superlative;
  mostAssists: Superlative;
  mostDamage: Superlative;
  mostTotalDamage: Superlative;
  mostGold: Superlative;
  mostTotalGold: Superlative;
  mostTotalCS: Superlative;
  mostCCTime: Superlative;
  mostTotalCCTime: Superlative;
  mostHealing: Superlative;
  mostTotalHealing: Superlative;
  mostShielding: Superlative;
  mostTotalShielding: Superlative;
  mostObjectiveDamage: Superlative;
  mostTotalObjectiveDamage: Superlative;
  mostDamageTaken: Superlative;
  mostTotalDamageTaken: Superlative;
  mostSelfMitigated: Superlative;
  mostTotalSelfMitigated: Superlative;
  mostDamageShare: Superlative;
  mostGoldShare: Superlative;
  mostKillParticipation: Superlative;
  biggestCrit: Superlative;
  biggestMultikill: Superlative;
  biggestKillingSpree: Superlative;
  longestGame: Superlative;
  shortestGame: Superlative;
}

export interface PlayerHighs extends ChampHighs {
  longestWinStreak: number;
  longestLossStreak: number;
}

export interface Superlative {
  value: number;
  matchId: string;
  date: number;
  champName: string;
}

export interface TeamStats {
  totalKills: number;
  totalDamage: number;
  totalDamageTaken: number;
  totalGold: number;
  totalDeaths: number;
}

interface WinRatePair {
  wins: number;
  losses: number;
}
export interface ClassWinRates {
  enchanter: WinRatePair;
  catcher: WinRatePair;
  juggernaut: WinRatePair;
  diver: WinRatePair;
  burst: WinRatePair;
  battlemage: WinRatePair;
  artillery: WinRatePair;
  marksman: WinRatePair;
  assassin: WinRatePair;
  skirmisher: WinRatePair;
  vanguard: WinRatePair;
  warden: WinRatePair;
}

export interface Player {
  puuid: string;
  gameName: string;
  tagLine: string;
  matches: string[];
  analyzedMatches: string[];
  champStats: ChampStats;
  playerStats: PlayerStats;
  profileIcon: number;
}

export interface Players {
  [key: string]: Player;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  lastUpdatedTime: number;
  stats: DetailedChampStats;
  totalStats: TotalChampStats;
  highs: PlayerHighs;
  classWinRates: ClassWinRates;
  results: number[];
  lastTen: number[];
  currentStreak: number;
  teammates: { [key: string]: { wins: number; losses: number } };
}

export interface SimplePlayerStats {
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  lastUpdatedTime: number;
}

function getBlankSuperlative(): Superlative {
  return { value: 0, matchId: "", date: 0, champName: "" };
}

export function getBlankChampHighs(): ChampHighs {
  return {
    mostKills: getBlankSuperlative(),
    mostDeaths: getBlankSuperlative(),
    mostAssists: getBlankSuperlative(),
    mostDamage: getBlankSuperlative(),
    mostTotalDamage: getBlankSuperlative(),
    mostGold: getBlankSuperlative(),
    mostTotalGold: getBlankSuperlative(),
    mostTotalCS: getBlankSuperlative(),
    mostCCTime: getBlankSuperlative(),
    mostTotalCCTime: getBlankSuperlative(),
    mostHealing: getBlankSuperlative(),
    mostTotalHealing: getBlankSuperlative(),
    mostShielding: getBlankSuperlative(),
    mostTotalShielding: getBlankSuperlative(),
    mostObjectiveDamage: getBlankSuperlative(),
    mostTotalObjectiveDamage: getBlankSuperlative(),
    mostDamageTaken: getBlankSuperlative(),
    mostTotalDamageTaken: getBlankSuperlative(),
    mostSelfMitigated: getBlankSuperlative(),
    mostTotalSelfMitigated: getBlankSuperlative(),
    mostDamageShare: getBlankSuperlative(),
    mostGoldShare: getBlankSuperlative(),
    mostKillParticipation: getBlankSuperlative(),
    biggestCrit: getBlankSuperlative(),
    biggestMultikill: getBlankSuperlative(),
    biggestKillingSpree: getBlankSuperlative(),
    longestGame: getBlankSuperlative(),
    shortestGame: getBlankSuperlative(),
  };
}

export function getBlankAverageStats(): DetailedChampStats {
  return {
    damagePerMinute: 0,
    goldPerMinute: 0,
    ccPerMinute: 0,
    healingPerMinute: 0,
    shieldingPerMinute: 0,
    objectiveDamagePerMinute: 0,
    damageTakenPerMinute: 0,
    selfMitigatedPerMinute: 0,
    killsPerMinute: 0,
    deathsPerMinute: 0,
    assistsPerMinute: 0,
    killParticipation: 0,
    damageShare: 0,
    goldShare: 0,
    killShare: 0,
    killsPerGame: 0,
    deathsPerGame: 0,
    assistsPerGame: 0,
    kda: 0,
  };
}

export function getBlankTotalStats(): TotalChampStats {
  return {
    totalDamage: 0,
    totalGold: 0,
    totalCCTime: 0,
    totalHealing: 0,
    totalShielding: 0,
    totalObjectiveDamage: 0,
    totalDamageTaken: 0,
    totalSelfMitigated: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    pentakills: 0,
    quadrakills: 0,
    triplekills: 0,
    doublekills: 0,
    killsPlusMinus: 0,
  };
}

export function getBlankPlayerStats(): PlayerStats {
  return {
    wins: 0,
    losses: 0,
    winRate: 0,
    totalPlayed: 0,
    lastUpdatedTime: 0,
    totalStats: getBlankTotalStats(),
    stats: getBlankAverageStats(),
    highs: {
      ...getBlankChampHighs(),
      longestWinStreak: 0,
      longestLossStreak: 0,
    },
    classWinRates: {
      enchanter: { wins: 0, losses: 0 },
      catcher: { wins: 0, losses: 0 },
      juggernaut: { wins: 0, losses: 0 },
      diver: { wins: 0, losses: 0 },
      burst: { wins: 0, losses: 0 },
      battlemage: { wins: 0, losses: 0 },
      artillery: { wins: 0, losses: 0 },
      marksman: { wins: 0, losses: 0 },
      assassin: { wins: 0, losses: 0 },
      skirmisher: { wins: 0, losses: 0 },
      vanguard: { wins: 0, losses: 0 },
      warden: { wins: 0, losses: 0 },
    },
    results: [],
    lastTen: [0, 0],
    currentStreak: 0,
    teammates: {},
  };
}

export interface PlayerInfo {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface PlayerStatsBasic {
  puuid: string;
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  lastUpdatedTime: number;
  results: number[];
  lastTen: number[];
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}
