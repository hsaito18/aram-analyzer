import "./match.css";
import { useState, useEffect } from "react";
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

const thousandNumberFormatter = (number: number): string =>
  Number(number / 1000).toFixed(1) + "k";

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
        id: `${i}${player.riotIdGameName}`,
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      playerItems.push({
        imageUrl: player[`item${i}` as keyof Participant],
        id: `${i}${player.riotIdGameName}`,
      });
    }
  }
  const playerSpells = [];
  playerSpells.push({
    spell: summonerSpells[player.summoner1Id as keyof typeof summonerSpells],
    id: player.riotIdGameName + "ss1",
  });
  playerSpells.push({
    spell: summonerSpells[player.summoner2Id as keyof typeof summonerSpells],
    id: player.riotIdGameName + "ss2",
  });
  return (
    <div className={isRed ? "playerCell redPlayerCell" : "playerCell"}>
      <div className={isRed ? "playerName redPlayerName" : "playerName"}>
        {player.riotIdGameName}
      </div>
      <div className="playerKDA">
        {player.kills}/{player.deaths}/{player.assists}
      </div>
      <div className="playerCS"> {player.totalMinionsKilled}</div>
      <div className="playerDamage">
        {thousandNumberFormatter(player.totalDamageDealtToChampions)}
      </div>
      <div className="playerGold">
        {thousandNumberFormatter(player.goldEarned)}
      </div>
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
  const matchDateString = new Date(
    Number(matchData.info.gameCreation)
  ).toLocaleString();

  const blueSidePlayers = matchData.info.participants.filter(
    (player) => player.teamId === 100
  );
  const redSidePlayers = matchData.info.participants.filter(
    (player) => player.teamId === 200
  );

  const blueTeamGold = blueSidePlayers.reduce(
    (acc, player) => player.goldEarned + acc,
    0
  );
  const redTeamGold = redSidePlayers.reduce(
    (acc, player) => player.goldEarned + acc,
    0
  );

  const blueGoldString = Number(blueTeamGold / 1000).toFixed(1) + "k";
  const redGoldString = Number(redTeamGold / 1000).toFixed(1) + "k";

  const blueWon = matchData.info.teams[0].win;
  const gameTimeString = matchTimeFormatter(matchData.info.gameDuration);

  return (
    <div id="matchContent">
      <div id="matchHeader">
        <div id="matchId">{matchData.metadata.matchId}</div>
        <div id="matchDate">{matchDateString}</div>
      </div>
      <div id="playersBox">
        <div id="playersHeader">
          <div id="blueResult">{blueWon ? "Victory" : "Defeat"}</div>
          <div id="blueGold">
            {blueGoldString}
            <img
              className="goldIcon"
              src={`static://assets/match/icon_gold_single.png`}
            ></img>
          </div>
          <div id="blueTowers">
            {matchData.info.teams[0].objectives.tower.kills}
            <img
              className="towerIcon"
              src={`static://assets/match/tower_icon.png`}
            ></img>
          </div>
          <div id="blueKills">
            {matchData.info.teams[0].objectives.champion.kills}
            <img
              className="killsIcon"
              src={`static://assets/match/kills.png`}
            ></img>
          </div>
          <div id="gameTime">{gameTimeString}</div>
          <div id="redKills">
            {matchData.info.teams[1].objectives.champion.kills}
            <img
              className="killsIcon"
              src={`static://assets/match/kills.png`}
            ></img>
          </div>
          <div id="redTowers">
            {matchData.info.teams[1].objectives.tower.kills}
            <img
              className="towerIcon"
              src={`static://assets/match/tower_icon.png`}
            ></img>
          </div>
          <div id="blueGold">
            {redGoldString}
            <img
              className="goldIcon"
              src={`static://assets/match/icon_gold_single.png`}
            ></img>
          </div>
          <div id="redResult"> {blueWon ? "Defeat" : "Victory"}</div>
        </div>
        <div id="playersSubtitle">
          <div id="blueCSTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={"static://assets/match/icon_minions.png"}
              />
            </div>
          </div>
          <div id="blueDamageTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={"static://assets/match/icon_damage.png"}
              />
            </div>
          </div>
          <div id="blueGoldTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={`static://assets/match/icon_gold_single.png`}
              />
            </div>
          </div>
          <div id="redCSTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={"static://assets/match/icon_minions.png"}
              />
            </div>
          </div>
          <div id="redDamageTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={"static://assets/match/icon_damage.png"}
              />
            </div>
          </div>
          <div id="redGoldTitle" className="iconTitle">
            <div className="iconWrapper">
              <img
                className="subtitleIcon"
                src={`static://assets/match/icon_gold_single.png`}
              />
            </div>
          </div>
        </div>
        <div id="blueContainer">
          <div id="blueTeamPlayers" className="teamSideBox">
            {blueSidePlayers.map((item, index) => (
              <PlayerCell
                key={item.riotIdGameName}
                player={item}
                isRed={false}
              />
            ))}
          </div>
        </div>
        <div id="divider"></div>
        <div id="redContainer">
          <div id="redTeamPlayers" className="teamSideBox">
            {redSidePlayers.map((item, index) => (
              <PlayerCell
                key={item.riotIdGameName}
                player={item}
                isRed={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
