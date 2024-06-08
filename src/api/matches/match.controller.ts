import { Match } from "./match.interface";
import { RIOT_API_KEY } from "../../config/API_KEY/apiConfig";
import fs from "fs";
import axios from "axios";

export const matches_set: Set<string> = loadMatchesSet();
console.log(`Loaded ${matches_set.size} matches`);

function loadMatchesSet(): Set<string> {
  const matches_set: Set<string> = new Set();
  try {
    const data = fs.readFileSync("saved_matches/matches_set.txt", "utf-8");
    for (const match of data.split("\n")) {
      matches_set.add(match);
    }
    return matches_set;
  } catch (error) {
    return matches_set;
  }
}

export function loadMatch(id: string): Match {
  try {
    if (!matches_set.has(id)) {
      throw new Error(`Match ${id} not found`);
    }
    const data = fs.readFileSync(`saved_matches/${id}.json`, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error loading match: ${error}`);
    throw new Error(`Match ${id} not found`);
  }
}

export function saveMatch(id: string, match: Match) {
  try {
    fs.writeFileSync(
      `saved_matches/${id}.json`,
      JSON.stringify(match),
      "utf-8"
    );
    matches_set.add(id);
    fs.writeFileSync(
      "saved_matches/matches_set.txt",
      Array.from(matches_set).join("\n"),
      "utf-8"
    );
    console.log(`Match saved successfully!`);
  } catch (error) {
    console.log(`Error saving match: ${error}`);
  }
}

export function hasMatch(id: string): boolean {
  return matches_set.has(id);
}

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

export async function getMatchData(id: string): Promise<Match | null> {
  let matchData: Match | null = null;
  if (!hasMatch(id)) {
    await downloadMatch(id);
  }
  matchData = loadMatch(id);
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
    console.log(`Error getting match timeline: ${error}`);
    return null;
  }
};
