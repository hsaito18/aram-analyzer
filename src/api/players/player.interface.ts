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
      mostKills: { value: 0, matchId: "", date: "" },
      mostDeaths: { value: 0, matchId: "", date: "" },
      mostAssists: { value: 0, matchId: "", date: "" },
      mostDamage: { value: 0, matchId: "", date: "" },
      mostTotalDamage: { value: 0, matchId: "", date: "" },
      mostGold: { value: 0, matchId: "", date: "" },
      mostTotalGold: { value: 0, matchId: "", date: "" },
      mostTotalCS: { value: 0, matchId: "", date: "" },
      mostCCTime: { value: 0, matchId: "", date: "" },
      mostTotalCCTime: { value: 0, matchId: "", date: "" },
      mostHealing: { value: 0, matchId: "", date: "" },
      mostTotalHealing: { value: 0, matchId: "", date: "" },
      mostShielding: { value: 0, matchId: "", date: "" },
      mostTotalShielding: { value: 0, matchId: "", date: "" },
      mostObjectiveDamage: { value: 0, matchId: "", date: "" },
      mostTotalObjectiveDamage: { value: 0, matchId: "", date: "" },
      mostDamageTaken: { value: 0, matchId: "", date: "" },
      mostTotalDamageTaken: { value: 0, matchId: "", date: "" },
      mostSelfMitigated: { value: 0, matchId: "", date: "" },
      mostTotalSelfMitigated: { value: 0, matchId: "", date: "" },
      mostDamageShare: { value: 0, matchId: "", date: "" },
      mostGoldShare: { value: 0, matchId: "", date: "" },
      mostKillParticipation: { value: 0, matchId: "", date: "" },
      biggestCrit: { value: 0, matchId: "", date: "" },
      biggestMultikill: { value: 0, matchId: "", date: "" },
      biggestKillingSpree: { value: 0, matchId: "", date: "" },
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
