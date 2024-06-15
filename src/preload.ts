import { UserData } from "./api/players/player.interface";
import { contextBridge, ipcRenderer } from "electron/renderer";
import { Search } from "./api/searchHistory";

export const playerAPI = {
  registerPlayer: (userData: UserData) =>
    ipcRenderer.invoke("register-player", userData),
  analyzeMatches: (userData: UserData) =>
    ipcRenderer.send("analyze-matches", userData),
  getChampStats: (userData: UserData) =>
    ipcRenderer.invoke("get-champ-stats", userData),
  getPlayerStats: (userData: UserData) =>
    ipcRenderer.send("get-player-stats", userData),
  onTableChampStats: (channel: string, func: any) => {
    const newFunc = (_: any, data: any) => func(data);
    ipcRenderer.on(channel, newFunc);
    return () => ipcRenderer.removeListener(channel, newFunc);
  },
  onPlayerStats: (channel: string, func: any) => {
    const newFunc = (_: any, data: any) => func(data);
    ipcRenderer.on(channel, newFunc);
    return () => ipcRenderer.removeListener(channel, newFunc);
  },
  getProfileIcon: (userData: UserData): Promise<number> =>
    ipcRenderer.invoke("get-profile-icon", userData),
  checkPlayer: (userData: UserData): Promise<boolean> =>
    ipcRenderer.invoke("check-player", userData),
  createPlayer: (userData: UserData): Promise<boolean> =>
    ipcRenderer.invoke("create-player", userData),
  resetPlayer: (userData: UserData) =>
    ipcRenderer.send("reset-player", userData),
  resetAllPlayers: () => ipcRenderer.send("reset-all"),
  searchPlayer: (userData: UserData): Promise<UserData> =>
    ipcRenderer.invoke("player-search", userData),
  getSearchHistory: (): Promise<Search[]> =>
    ipcRenderer.invoke("get-search-history"),
  onListener: (channel: string, func: any) => {
    const newFunc = (_: any, data: any) => func(data);
    ipcRenderer.on(channel, newFunc);
    return () => ipcRenderer.removeListener(channel, newFunc);
  },
  getUserData: (puuid: string): Promise<UserData> =>
    ipcRenderer.invoke("puuid-to-name", puuid),
  attachAllMatches: () => ipcRenderer.send("attach-all-matches"),
  generatePlayerGraphic: () => ipcRenderer.send("generate-player-graphic"),
  generateChampionGraphic: () => ipcRenderer.send("generate-champion-graphic"),
  getLineupsData: () => ipcRenderer.invoke("get-lineups-data"),
  resetLineupsData: () => ipcRenderer.send("reset-lineups-data"),
};

contextBridge.exposeInMainWorld("playerAPI", playerAPI);
