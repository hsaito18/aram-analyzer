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
}

export interface ChampHighs {
  mostKills: SuperlativeTrio;
  mostDeaths: SuperlativeTrio;
  mostAssists: SuperlativeTrio;
  mostDamage: SuperlativeTrio;
  mostTotalDamage: SuperlativeTrio;
  mostGold: SuperlativeTrio;
  mostTotalGold: SuperlativeTrio;
  mostTotalCS: SuperlativeTrio;
  mostCCTime: SuperlativeTrio;
  mostTotalCCTime: SuperlativeTrio;
  mostHealing: SuperlativeTrio;
  mostTotalHealing: SuperlativeTrio;
  mostShielding: SuperlativeTrio;
  mostTotalShielding: SuperlativeTrio;
  mostObjectiveDamage: SuperlativeTrio;
  mostTotalObjectiveDamage: SuperlativeTrio;
  mostDamageTaken: SuperlativeTrio;
  mostTotalDamageTaken: SuperlativeTrio;
  mostSelfMitigated: SuperlativeTrio;
  mostTotalSelfMitigated: SuperlativeTrio;
  mostDamageShare: SuperlativeTrio;
  mostGoldShare: SuperlativeTrio;
  mostKillParticipation: SuperlativeTrio;
  biggestCrit: SuperlativeTrio;
  biggestMultikill: SuperlativeTrio;
  biggestKillingSpree: SuperlativeTrio;
}

export interface PlayerHighs extends ChampHighs {
  longestWinStreak: number;
  longestLossStreak: number;
}

export interface SuperlativeTrio {
  value: number;
  matchId: string;
  date: string;
  champName: string;
}

export interface TeamStats {
  totalKills: number;
  totalDamage: number;
  totalGold: number;
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

function getBlankSuperlative(): SuperlativeTrio {
  return { value: 0, matchId: "", date: "", champName: "" };
}

export function getBlankPlayerStats(): PlayerStats {
  return {
    wins: 0,
    losses: 0,
    winRate: 0,
    totalPlayed: 0,
    lastUpdatedTime: 0,
    totalStats: {
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
    },
    stats: {
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
    },
    highs: {
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
      mostTotalObjectiveDamage: {
        value: 0,
        matchId: "",
        date: "",
        champName: "",
      },
      mostDamageTaken: getBlankSuperlative(),
      mostTotalDamageTaken: getBlankSuperlative(),
      mostSelfMitigated: getBlankSuperlative(),
      mostTotalSelfMitigated: {
        value: 0,
        matchId: "",
        date: "",
        champName: "",
      },
      mostDamageShare: getBlankSuperlative(),
      mostGoldShare: getBlankSuperlative(),
      mostKillParticipation: getBlankSuperlative(),
      biggestCrit: getBlankSuperlative(),
      biggestMultikill: getBlankSuperlative(),
      biggestKillingSpree: getBlankSuperlative(),
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
