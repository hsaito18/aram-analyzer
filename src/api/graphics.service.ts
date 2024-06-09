import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer";
import ProfileTableStatic from "../components/tables/ProfileTable/ProfileTableStatic";
import { getPlayerStats, puuidToName } from "./players/player.controller";
import { PlayerStats } from "./players/player.interface";
import fs from "fs";
import path from "path";

const initialize = async () => {
  data = await getPlayerStats({ gameName: "hsaito", tagLine: "NA1" });
  console.log(`got data for ${data.currentStreak}`);
  const allTeammates = teammateDataArrayizer(data.teammates);
  const topTeammates = teammateDataSorter(allTeammates, NUM_TEAMMATES_SHOWN);
  teammateData = await teammateDataNamer(topTeammates);
  console.log(`teammate data: ${teammateData}`);
};

let data: PlayerStats;
let teammateData: TeammateData[];
initialize();

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

export const generateGraphic = async () => {
  const reactComp = React.createElement(ProfileTableStatic, {
    data: data,
    teammateData: teammateData,
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
  const cssFiles = cssFilePaths.map((path) => fs.readFileSync(path, "utf-8"));

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
        ${output}
      </body>
    </html>
  `;

  html = html.replace(
    /PATH_TO_ASSETS/g,
    path.join(__dirname, "..", "renderer")
  );

  console.log(html);
  const outputPathHTML = path.resolve(__dirname, "output.html");
  console.log(outputPathHTML);
  fs.writeFileSync(outputPathHTML, html);

  // Use puppeteer to take a screenshot of the rendered HTML
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: 1400,
    height: 900,
  });

  // Load the HTML file in Puppeteer and wait for all network connections to be idle
  await page.goto(`file://${outputPathHTML}`, { waitUntil: "networkidle0" });

  const screenshot = await page.screenshot();

  await browser.close();

  // Write the screenshot Buffer to a file
  const outputPath = path.resolve(__dirname, "output.jpeg");
  fs.writeFileSync(outputPath, screenshot);

  return outputPath;
};
