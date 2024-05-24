import { Match } from "./match.interface";
import fs from "fs";
import axios from "axios";

const matches_set: Set<string> = loadMatchesSet();
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
