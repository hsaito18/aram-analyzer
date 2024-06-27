import { Match, Participant, Team } from "./match.interface";
import { RIOT_API_KEY } from "../../config/API_KEY/apiConfig";
import * as db from "../db/index";
import log from "electron-log/main";
import axios from "axios";
import fs from "fs";

export let matches_set: Set<string> = new Set();
loadMatchesSet().then((res) => {
  matches_set = res;
  log.info(`Loaded ${matches_set.size} matches from SQL`);
});

async function loadMatchesSet(): Promise<Set<string>> {
  const matches_set: Set<string> = new Set();
  try {
    const query = "SELECT match_id FROM Matches";
    const res = await db.query(query);
    for (const row of res.rows) {
      matches_set.add(row.match_id);
    }
  } catch (error) {
    log.error(`Error loading matches set: ${error}`);
  }
  return matches_set;
}

interface MatchInfo {
  match_id: string;
  dataVersion: string;
  endOfGameResult: string;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  queueId: number;
  tournamentCode: string;
}
const getMatchInfo = async (id: string): Promise<MatchInfo> => {
  const query = `SELECT * FROM Matches WHERE match_id = '${id}'`;
  const res = await db.query(query);
  return res.rows[0];
};

export const getMatchParticipants = async (
  id: string
): Promise<Participant[]> => {
  const query = `SELECT * FROM Participants WHERE match_id = '${id}'`;
  const res = await db.query(query);
  return res.rows;
};

const getMatchTeams = async (id: string): Promise<Team[]> => {
  const query = `SELECT * FROM Teams WHERE match_id = '${id}'`;
  const res = await db.query(query);
  const blueTeam = {
    bans: res.rows[0].blue_bans,
    objectives: {
      baron: {
        first: res.rows[0].blue_objectives_baron_first,
        kills: res.rows[0].blue_objectives_baron_kills,
      },
      champion: {
        first: res.rows[0].blue_objectives_champion_first,
        kills: res.rows[0].blue_objectives_champion_kills,
      },
      dragon: {
        first: res.rows[0].blue_objectives_dragon_first,
        kills: res.rows[0].blue_objectives_dragon_kills,
      },
      horde: {
        first: res.rows[0].blue_objectives_horde_first,
        kills: res.rows[0].blue_objectives_horde_kills,
      },
      inhibitor: {
        first: res.rows[0].blue_objectives_inhibitor_first,
        kills: res.rows[0].blue_objectives_inhibitor_kills,
      },
      riftHerald: {
        first: res.rows[0].blue_objectives_riftHerald_first,
        kills: res.rows[0].blue_objectives_riftHerald_kills,
      },
      tower: {
        first: res.rows[0].blue_objectives_tower_first,
        kills: res.rows[0].blue_objectives_tower_kills,
      },
    },
    teamId: res.rows[0].blue_teamId,
    win: res.rows[0].blue_win,
  };
  const redTeam = {
    bans: res.rows[0].red_bans,
    objectives: {
      baron: {
        first: res.rows[0].red_objectives_baron_first,
        kills: res.rows[0].red_objectives_baron_kills,
      },
      champion: {
        first: res.rows[0].red_objectives_champion_first,
        kills: res.rows[0].red_objectives_champion_kills,
      },
      dragon: {
        first: res.rows[0].red_objectives_dragon_first,
        kills: res.rows[0].red_objectives_dragon_kills,
      },
      horde: {
        first: res.rows[0].red_objectives_horde_first,
        kills: res.rows[0].red_objectives_horde_kills,
      },
      inhibitor: {
        first: res.rows[0].red_objectives_inhibitor_first,
        kills: res.rows[0].red_objectives_inhibitor_kills,
      },
      riftHerald: {
        first: res.rows[0].red_objectives_riftHerald_first,
        kills: res.rows[0].red_objectives_riftHerald_kills,
      },
      tower: {
        first: res.rows[0].red_objectives_tower_first,
        kills: res.rows[0].red_objectives_tower_kills,
      },
    },
    teamId: res.rows[0].red_teamId,
    win: res.rows[0].red_win,
  };
  return [blueTeam, redTeam];
};

export const loadMatch = async (id: string): Promise<Match> => {
  if (!matches_set.has(id)) throw new Error(`Match ${id} not found!`);
  const matchesInfo = await getMatchInfo(id);
  const participants = await getMatchParticipants(id);
  const puuids = participants.map((participant) => participant.puuid);
  const teams = await getMatchTeams(id);
  return {
    metadata: {
      dataVersion: matchesInfo.dataVersion,
      matchId: matchesInfo.match_id,
      participants: puuids,
    },
    info: {
      endOfGameResult: matchesInfo.endOfGameResult,
      gameCreation: matchesInfo.gameCreation,
      gameDuration: matchesInfo.gameDuration,
      gameEndTimestamp: matchesInfo.gameEndTimestamp,
      gameId: matchesInfo.gameId,
      gameMode: matchesInfo.gameMode,
      gameName: matchesInfo.gameName,
      gameStartTimestamp: matchesInfo.gameStartTimestamp,
      gameType: matchesInfo.gameType,
      gameVersion: matchesInfo.gameVersion,
      mapId: matchesInfo.mapId,
      participants,
      platformId: "",
      queueId: matchesInfo.queueId,
      teams,
      tournamentCode: matchesInfo.tournamentCode,
    },
  };
};

const saveMatchInfo = async (id: string, match: Match) => {
  const matchesQuery = `
  INSERT INTO Matches
    ( 
      "match_id", 
      "dataVersion", 
      "endOfGameResult", 
      "gameCreation", 
      "gameDuration", 
      "gameEndTimestamp", 
      "gameId", 
      "gameMode", 
      "gameName", 
      "gameStartTimestamp", 
      "gameType", 
      "gameVersion", 
      "mapId", 
      "queueId", 
      "tournamentCode" 
    )
  VALUES ('${id}', '${match.metadata.dataVersion}', 
  '${match.info.endOfGameResult}', '${match.info.gameCreation}', 
  '${match.info.gameDuration}', '${match.info.gameEndTimestamp}', 
  '${match.info.gameId}', '${match.info.gameMode}', 
  '${match.info.gameName}', '${match.info.gameStartTimestamp}', 
  '${match.info.gameType}', '${match.info.gameVersion}', 
  '${match.info.mapId}', '${match.info.queueId}', 
  '${match.info.tournamentCode}')
  ON CONFLICT (match_id) DO NOTHING;
`;
  try {
    await db.query(matchesQuery);
  } catch (error) {
    log.error(`Error saving match: ${error}`);
  }
};

const saveParticipants = async (id: string, match: Match) => {
  const gameCreationTime = match.info.gameCreation;
  const participantWithMatchIds = match.info.participants.map((participant) => {
    return {
      ...participant,
      game_creation_time: gameCreationTime,
      match_id: id,
    };
  });
  const participantQueries = participantWithMatchIds.map((participant) => {
    const participantJson = JSON.stringify(participant);
    return `INSERT INTO Participants SELECT * FROM json_populate_record(NULL::Participants, '${participantJson.replace(
      /'/g,
      "''"
    )}') ON CONFLICT ON CONSTRAINT participant_key DO NOTHING;`;
  });
  for (const query of participantQueries) {
    try {
      await db.query(query);
    } catch (error) {
      console.error("Error saving participants...", error);
    }
  }
};

const saveTeams = async (id: string, match: Match) => {
  if (!match.info.teams[0] || !match.info.teams[1]) return;
  const teamsQuery = `
  INSERT INTO Teams (
    match_id, 
    blue_bans, 
    blue_objectives_baron_first, 
    blue_objectives_baron_kills, 
    blue_objectives_champion_first, 
    blue_objectives_champion_kills, 
    blue_objectives_dragon_first, 
    blue_objectives_dragon_kills, 
    blue_objectives_horde_first, 
    blue_objectives_horde_kills, 
    blue_objectives_inhibitor_first, 
    blue_objectives_inhibitor_kills, 
    "blue_objectives_riftHerald_first", 
    "blue_objectives_riftHerald_kills", 
    blue_objectives_tower_first, 
    blue_objectives_tower_kills, 
    "blue_teamId", 
    blue_win, 
    red_bans, 
    red_objectives_baron_first, 
    red_objectives_baron_kills, 
    red_objectives_champion_first, 
    red_objectives_champion_kills, 
    red_objectives_dragon_first, 
    red_objectives_dragon_kills, 
    red_objectives_horde_first, 
    red_objectives_horde_kills, 
    red_objectives_inhibitor_first, 
    red_objectives_inhibitor_kills, 
    "red_objectives_riftHerald_first", 
    "red_objectives_riftHerald_kills", 
    red_objectives_tower_first, 
    red_objectives_tower_kills, 
    "red_teamId", 
    red_win
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
  ON CONFLICT (match_id) DO NOTHING;
`;

  // Prepare your data array from `data.info.teams[0]` and other sources
  const values = [
    id,
    match.info.teams[0].bans.length > 0
      ? JSON.stringify(match.info.teams[0].bans)
      : "{}",
    match.info.teams[0].objectives.baron.first,
    match.info.teams[0].objectives.baron.kills,
    match.info.teams[0].objectives.champion.first,
    match.info.teams[0].objectives.champion.kills,
    match.info.teams[0].objectives.dragon.first,
    match.info.teams[0].objectives.dragon.kills,
    match.info.teams[0].objectives.horde?.first,
    match.info.teams[0].objectives.horde?.kills,
    match.info.teams[0].objectives.inhibitor.first,
    match.info.teams[0].objectives.inhibitor.kills,
    match.info.teams[0].objectives.riftHerald.first,
    match.info.teams[0].objectives.riftHerald.kills,
    match.info.teams[0].objectives.tower.first,
    match.info.teams[0].objectives.tower.kills,
    match.info.teams[0].teamId,
    match.info.teams[0].win,
    match.info.teams[1].bans.length > 0
      ? JSON.stringify(match.info.teams[1].bans)
      : "{}",
    match.info.teams[1].objectives.baron.first,
    match.info.teams[1].objectives.baron.kills,
    match.info.teams[1].objectives.champion.first,
    match.info.teams[1].objectives.champion.kills,
    match.info.teams[1].objectives.dragon.first,
    match.info.teams[1].objectives.dragon.kills,
    match.info.teams[1].objectives.horde?.first,
    match.info.teams[1].objectives.horde?.kills,
    match.info.teams[1].objectives.inhibitor.first,
    match.info.teams[1].objectives.inhibitor.kills,
    match.info.teams[1].objectives.riftHerald.first,
    match.info.teams[1].objectives.riftHerald.kills,
    match.info.teams[1].objectives.tower.first,
    match.info.teams[1].objectives.tower.kills,
    match.info.teams[1].teamId,
    match.info.teams[1].win,
  ];

  try {
    await db.query(teamsQuery, values);
  } catch (error) {
    console.error("Error saving teams... ", error);
  }
};

export const saveMatch = async (id: string, match: Match) => {
  matches_set.add(id);
  await saveMatchInfo(id, match);
  await saveParticipants(id, match);
  await saveTeams(id, match);
  log.info(`Finished saving match: ${id}`);
};

const hasMatch = async (id: string): Promise<boolean> => {
  return matches_set.has(id);
};

export const downloadMatches = async (ids: string[]): Promise<boolean> => {
  for (const match of ids) {
    if (await hasMatch(match)) continue;
    try {
      const res = await downloadMatch(match);
      if (!res) {
        log.info(`Rate limited, waiting 2 minutes...`);
        await new Promise((resolve) => setTimeout(resolve, 120000));
        await downloadMatch(match);
      }
    } catch (error) {
      console.error(`Failed to download match: ${error}`);
      return false;
    }
  }
  return true;
};

export async function downloadMatch(id: string): Promise<boolean> {
  const options = {
    method: "GET",
    headers: {
      "X-Riot-Token": RIOT_API_KEY,
    },
  };
  const response = await axios
    .get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,
      options
    )
    .catch((error) => {
      if (error.response.status === 429) {
        return 2;
      }
      return 1;
    });
  if (response == 2) return false;
  if (response == 1) throw new Error(`Error downloading match ${id}`);
  const matchData = response?.data;
  if (matchData !== null) {
    saveMatch(id, matchData);
  }
  return true;
}

export const uploadLocalMatches = async () => {
  const filenames = fs.readdirSync("saved_matches/");

  for (const filename of filenames) {
    if (filename == "matches_set.txt") continue;
    const match = JSON.parse(
      fs.readFileSync(`saved_matches/${filename}`, "utf8")
    );
    await saveMatch(match.metadata.matchId, match);
  }
};

export async function getMatchData(id: string): Promise<Match | null> {
  let matchData: Match | null = null;
  if (!(await hasMatch(id))) {
    await downloadMatch(id);
  }
  matchData = await loadMatch(id);
  return matchData;
}

export const getMatchTimeline = async (
  matchId: string
): Promise<object | null> => {
  try {
    const options = {
      method: "GET",
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY,
      },
    };
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`,
      options
    );
    return response.data;
  } catch (error) {
    log.error(`Error getting match timeline: ${error}`);
    return null;
  }
};
