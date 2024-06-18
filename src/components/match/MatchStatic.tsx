import "./match.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Match, Participant } from "../../api/matches/match.interface";
import { summonerSpells } from "../../static/summonerSpells";
import {
  WinRateCell,
  matchTimeFormatter,
} from "../tables/ProfileTable/ProfileTableStatic";
import { TopBar } from "../shared/ProfileTopBar";
import ChampionTable from "../tables/ChampionTable";
import ProfileTable from "../tables/ProfileTable/ProfileTableClient";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { Home } from "@mui/icons-material";

const PlayerCell = ({
  player,
  isRed,
}: {
  player: Participant;
  isRed: boolean;
}) => {
  const playerItems = [];
  if (isRed) {
    for (let i = 0; i < 6; i++) {
      playerItems.push({
        imageUrl: player[`item${i}` as keyof Participant],
        id: `${i}${player.summonerName}`,
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      playerItems.push({
        imageUrl: player[`item${i}` as keyof Participant],
        id: `${i}${player.summonerName}`,
      });
    }
  }
  const playerSpells = [];
  playerSpells.push({
    spell: summonerSpells[player.summoner1Id as keyof typeof summonerSpells],
    id: player.summonerName + "ss1",
  });
  playerSpells.push({
    spell: summonerSpells[player.summoner2Id as keyof typeof summonerSpells],
    id: player.summonerName + "ss2",
  });
  return (
    <div className={isRed ? "playerCell redPlayerCell" : "playerCell"}>
      <div className={isRed ? "playerName redPlayerName" : "playerName"}>
        {player.summonerName}
      </div>
      <div className="playerKDA">
        {player.kills}/{player.deaths}/{player.assists}
      </div>
      <div className="playerCS"> {player.totalMinionsKilled}</div>
      <div className="playerDamage">{player.totalDamageDealtToChampions}</div>
      <div className="playerGold">{player.goldEarned}</div>
      <div className="playerItems">
        {playerItems.map((item, index) => (
          <img
            key={item.id}
            className="itemIcon"
            src={`static://assets/item/${item.imageUrl}.png`}
          ></img>
        ))}
      </div>
      <div className="playerSpells">
        {playerSpells.map((item, index) => (
          <img
            key={item.id}
            className="spellIcon"
            src={`static://assets/summoner_spells/${item.spell}.png`}
          ></img>
        ))}
      </div>
      <div className="playerChampion">
        <img
          className="championIcon"
          src={`static://assets/champion_icons/${player.championName}.jpg`}
        ></img>
      </div>
    </div>
  );
};

export default function MatchStatic({ matchData }: { matchData: Match }) {
  const blueSidePlayers = matchData.info.participants.filter(
    (player) => player.teamId === 100
  );
  const redSidePlayers = matchData.info.participants.filter(
    (player) => player.teamId === 200
  );

  const blueWon = matchData.info.teams[0].win;
  const gameTimeString = matchTimeFormatter(matchData.info.gameDuration);

  return (
    <div id="matchContent">
      <div id="playersBox">
        <div id="playersHeader">
          <div id="blueResult">{blueWon ? "Victory" : "Defeat"}</div>
          <div id="blueTowers">
            {matchData.info.teams[0].objectives.tower.kills}
            <img
              className="towerIcon"
              src={`static://assets/tower_icon.png`}
            ></img>
          </div>
          <div id="blueKills">
            {matchData.info.teams[0].objectives.champion.kills}
          </div>
          <div id="gameTime">{gameTimeString}</div>
          <div id="redKills">
            {matchData.info.teams[1].objectives.champion.kills}
          </div>
          <div id="redTowers">
            {matchData.info.teams[1].objectives.tower.kills}
            <img
              className="towerIcon"
              src={`static://assets/tower_icon.png`}
            ></img>
          </div>
          <div id="redResult"> {blueWon ? "Defeat" : "Victory"}</div>
        </div>
        <div id="blueContainer">
          <div id="blueTeamPlayers" className="teamSideBox">
            {blueSidePlayers.map((item, index) => (
              <PlayerCell key={item.summonerName} player={item} isRed={false} />
            ))}
          </div>
        </div>
        <div id="divider"></div>
        <div id="redContainer">
          <div id="redTeamPlayers" className="teamSideBox">
            {redSidePlayers.map((item, index) => (
              <PlayerCell key={item.summonerName} player={item} isRed={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
