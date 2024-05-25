import { ipcMain } from "electron";
import {
  createByUsername,
  saveARAMMatches,
  analyzePlayerMatches,
  getPlayerChampionStats,
  getPlayerProfileIcon,
} from "./players/player.controller";

ipcMain.handle("register-player", (event, userData) => {
  return createByUsername(userData);
});

ipcMain.on("analyze-matches", async (event, userData) => {
  console.log("analyzing matches for user", userData);
  await saveARAMMatches(userData);
  await analyzePlayerMatches(userData);
});

function champDataArrayizer(obj: any) {
  return Object.keys(obj).map((key) => ({
    champName: key,
    ...obj[key],
  }));
}

ipcMain.handle("get-champ-stats", async (event, userData) => {
  const data = await getPlayerChampionStats(userData);
  const arrData = champDataArrayizer(data);
  arrData.sort((a, b) => b.wins - a.wins);
  event.sender.send("champTableData", arrData);
  return arrData;
});

ipcMain.handle("get-profile-icon", async (event, userData) => {
  console.log("getting profile icon for user", userData);
  const icon = await getPlayerProfileIcon(userData);
  return icon;
});
