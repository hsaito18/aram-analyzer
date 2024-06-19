import { ipcMain } from "electron";
import { mainWindow } from "../main";
import {
  puuidToName,
  createByUsername,
  saveARAMMatches,
  analyzePlayerMatches,
  getPlayerChampionStats,
  getPlayerProfileIcon,
  getPlayerStats,
  findByUsername,
  resetChampionStats,
  resetAllChampionStats,
  attachAllMatches,
} from "./players/player.controller";
import { UserData } from "./players/player.interface";
import { getMatchData } from "./matches/match.controller";
import { Match } from "./matches/match.interface";
import { champRow } from "../components/tables/table.interface";
import { getTopLineups, resetLineupsData } from "./lineups/lineup.controller";
import { getSearchHistory, addSearchHistory } from "./searchHistory";
import {
  generatePlayerGraphic,
  generateChampionGraphic,
} from "./graphics.service";
import Logger = require("electron-log/main");

ipcMain.handle("register-player", (event, userData) => {
  return createByUsername(userData);
});

async function getChampStats(
  event: Electron.IpcMainInvokeEvent,
  userData: UserData
) {
  const data = await getPlayerChampionStats(userData);
  const arrData = champDataArrayizer(data);
  arrData.sort((a, b) => b.wins - a.wins);
  event.sender.send("champTableData", arrData);
  return arrData;
}

async function getSingleChampionStats(
  event: Electron.IpcMainInvokeEvent,
  userData: UserData,
  champName: string
) {
  const data = await getPlayerChampionStats(userData);
  const champData: champRow = { ...data[champName], champName };
  champData["champName"] = champName;
  event.sender.send("champData", champData);
  return champData;
}

async function getPlayerStatsHandle(
  event: Electron.IpcMainInvokeEvent,
  userData: UserData
) {
  const data = await getPlayerStats(userData);
  event.sender.send("playerStatsData", data);
}

async function getMatchStats(
  event: Electron.IpcMainInvokeEvent,
  matchId: string
) {
  const data = await getMatchData(matchId);
  event.sender.send("matchData", data);
  return data;
}

ipcMain.on("analyze-matches", async (event, userData) => {
  Logger.log("analyzing matches for user", userData);
  event.sender.send("loadingData", true);
  await saveARAMMatches(userData);
  await analyzePlayerMatches(userData);
  await getChampStats(event, userData);
  await getPlayerStatsHandle(event, userData);
  event.sender.send("loadingData", false);
});

function champDataArrayizer(obj: any) {
  return Object.keys(obj).map((key) => ({
    champName: key,
    ...obj[key],
  }));
}

ipcMain.handle("get-champ-stats", getChampStats);

ipcMain.handle("get-profile-icon", async (event, userData) => {
  console.log("getting profile icon for user", userData);
  const icon = await getPlayerProfileIcon(userData);
  return icon;
});

ipcMain.on("get-player-stats", getPlayerStatsHandle);

ipcMain.handle("check-player", async (event, userData) => {
  const player = await findByUsername(userData);
  return !!player;
});

ipcMain.handle("create-player", async (event, userData) => {
  const out = await createByUsername(userData);
  return !!out;
});

ipcMain.on("reset-player", async (event, userData) => {
  resetChampionStats(userData);
});

ipcMain.on("reset-all", async (event) => {
  resetAllChampionStats();
});

ipcMain.handle("player-search", async (event, userData) => {
  addSearchHistory(userData);
  const player = await findByUsername(userData);
  console.log(`searched for player ${userData.gameName}#${userData.tagLine}`);
  return { gameName: player.gameName, tagLine: player.tagLine };
});

ipcMain.handle("get-search-history", async (event) => {
  return getSearchHistory();
});

ipcMain.handle("puuid-to-name", (event, puuid) => puuidToName(puuid));

ipcMain.on("attach-all-matches", () => attachAllMatches());

// Testing graphic generation API
ipcMain.on("generate-player-graphic", () =>
  generatePlayerGraphic({ gameName: "hsaito", tagLine: "NA1" })
);

ipcMain.on("generate-champion-graphic", () =>
  generateChampionGraphic({ gameName: "hsaito", tagLine: "NA1" }, "Leblanc")
);

ipcMain.handle("get-lineups-data", () => {
  return getTopLineups();
});

ipcMain.on("reset-lineups-data", () => {
  resetLineupsData();
});

ipcMain.handle("get-match-data", (event, id) => {
  return getMatchData(id);
});

ipcMain.on("navigate-back", () => {
  Logger.log("navigating back");
  if (mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
  }
});
