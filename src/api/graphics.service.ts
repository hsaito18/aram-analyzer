import React from "react";
import log from "electron-log/main";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer";
import ProfileTableStatic from "../components/tables/ProfileTable/ProfileTableStatic";
import ChampionDetail from "../components/tables/championDetail/ChampionDetail";
import {
  getPlayerStats,
  puuidToName,
  getPlayerSingleChampionStats,
  CHAMP_STATS_ERROR,
} from "./players/player.controller";
import { PlayerStats, UserData } from "./players/player.interface";
import fs from "fs";
import path from "path";

interface TeammateData {
  puuid: string;
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  gameName: string;
  tagLine: string;
}

const NUM_TEAMMATES_SHOWN = 20;

function teammateDataArrayizer(teammates: object): TeammateData[] {
  const teammateArray: TeammateData[] = [];
  for (const [key, value] of Object.entries(teammates)) {
    const currTeammate = { puuid: key, ...value };
    currTeammate["totalPlayed"] = currTeammate.wins + currTeammate.losses;
    currTeammate["winRate"] = currTeammate.wins / currTeammate.totalPlayed;
    teammateArray.push(currTeammate);
  }
  return teammateArray;
}

function teammateDataSorter(
  teammates: TeammateData[],
  num: number
): TeammateData[] {
  teammates.sort((a, b) => {
    if (b.totalPlayed !== a.totalPlayed) {
      return b.totalPlayed - a.totalPlayed;
    }
    return b.wins - a.wins;
  });
  const topNTeammates = teammates.slice(0, num);
  return topNTeammates.filter((teammate) => teammate.totalPlayed > 1);
}

async function teammateDataNamer(
  teammates: TeammateData[]
): Promise<TeammateData[]> {
  for (const teammate of teammates) {
    const userData = await puuidToName(teammate.puuid);
    teammate["gameName"] = userData.gameName;
    teammate["tagLine"] = userData.tagLine;
  }
  return teammates;
}

const generateGraphic = async (
  htmlBody: string,
  cssPaths: string[],
  width: number,
  height: number
): Promise<string> => {
  const cssFiles = cssPaths.map((path) => fs.readFileSync(path, "utf-8"));

  // Create a full HTML document to render the component
  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0px !important;
            font-family: Roboto, sans-serif;     
          }
          ${cssFiles.join("\n")}
        </style>
      </head>
      <body>
        <div id="graphicRoot">
          ${htmlBody}
        </div>
      </body>
    </html>
  `;

  // TODO: How does this work with the packaged app?
  html = html.replace(/static:\//g, path.join(__dirname, "..", "renderer"));

  const outputPathHTML = path.resolve(__dirname, "output.html");
  fs.writeFileSync(outputPathHTML, html);

  // Use puppeteer to take a screenshot of the rendered HTML
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
  });

  // Load the HTML file in Puppeteer and wait for all network connections to be idle
  await page.goto(`file://${outputPathHTML}`, { waitUntil: "networkidle0" });

  const screenshot = await page.screenshot({
    encoding: "base64",
    type: "png",
  });

  const testScreenshot = await page.screenshot({ type: "jpeg" });

  await browser.close();

  // Write the screenshot Buffer to a file
  const outputPath = path.resolve(__dirname, "output.png");
  fs.writeFileSync(outputPath, testScreenshot);

  return screenshot;
};

const getGraphicData = async (
  userData: UserData
): Promise<[PlayerStats, TeammateData[]]> => {
  const playerData = await getPlayerStats(userData);
  const allTeammates = teammateDataArrayizer(playerData.teammates);
  const topTeammates = teammateDataSorter(allTeammates, NUM_TEAMMATES_SHOWN);
  const teammateData = await teammateDataNamer(topTeammates);
  return [playerData, teammateData];
};

export const generatePlayerGraphic = async (
  userData: UserData
): Promise<string> => {
  const [data, teammateData] = await getGraphicData(userData);
  if (data.totalPlayed == 0) return "No matches saved!";
  const reactComp = React.createElement(ProfileTableStatic, {
    data: data,
    teammateData: teammateData,
    gameName: userData.gameName,
    tagLine: userData.tagLine,
    isElectron: false,
  });
  const output = renderToStaticMarkup(reactComp);

  // Read the CSS files
  const cssFilePaths = [
    "src/main.css",
    "src/components/profile/profile.css",
    "src/components/tables/ProfileTable/profileTable.css",
    "src/components/tables/championDetail/championDetail.css",
    // ... other CSS file paths
  ];
  return generateGraphic(output, cssFilePaths, 1480, 900);
};

export const generateChampionGraphic = async (
  userData: UserData,
  champName: string
): Promise<string | CHAMP_STATS_ERROR> => {
  const champData = await getPlayerSingleChampionStats(userData, champName);
  log.info(`Generating champ graphic for ${userData.gameName}'s ${champName}`);
  if (champData == "PLAYER_NOT_FOUND" || champData == "CHAMP_NOT_FOUND") {
    return champData;
  }
  const champRow = { ...champData, champName };
  const reactComp = React.createElement(ChampionDetail, {
    champData: champRow,
  });
  const output =
    '<div id="playerTitle">' +
    userData.gameName +
    "'s" +
    "</div>" +
    renderToStaticMarkup(reactComp);
  // Read the CSS files
  const cssFilePaths = [
    "src/main.css",
    "src/components/tables/championDetail/championDetail.css",
    "src/components/tables/championDetail/championDetailGraphic.css",
  ];

  return generateGraphic(output, cssFilePaths, 1480, 440);
};
