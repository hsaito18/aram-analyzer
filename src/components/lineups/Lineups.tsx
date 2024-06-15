import "./lineups.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerLineup } from "../../api/lineups/lineup.interface";
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

const NUM_LINEUPS_SHOWN = 35;

export default function Lineups() {
  const [data, setData] = useState<LineupRow[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await playerAPI.getLineupsData();
      const preparedData = await prepareTableData(data);
      const slicedData = preparedData.slice(0, NUM_LINEUPS_SHOWN);
      setData(slicedData);
    };

    fetchData();
  }, []);

  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };
  interface LineupRow {
    wins: number;
    losses: number;
    playersString: string;
    kills: number;
    deaths: number;
    averageWinTime: number;
    averageLossTime: number;
    averageGameTime: number;
  }
  async function prepareTableData(data: PlayerLineup[]): Promise<LineupRow[]> {
    return Promise.all(
      data.map(async (lineup) => {
        const playersString = await Promise.all(
          lineup.players.map(async (player) => {
            const userData = await playerAPI.getUserData(player);
            return userData.gameName;
          })
        );
        return {
          wins: lineup.wins,
          losses: lineup.losses,
          playersString: playersString.join(", "),
          kills: lineup.kills,
          deaths: lineup.deaths,
          averageWinTime: lineup.averageWinTime,
          averageLossTime: lineup.averageLossTime,
          averageGameTime: lineup.averageGameTime,
        };
      })
    );
  }
  return (
    <>
      <div
        id="backgroundImage"
        style={{
          backgroundImage: "url(static://assets/howling_abyss_nexus.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(5px)",
          height: "100vh",
          width: "100vw",
          scale: "1.05",
        }}
      />
      <div id="main">
        <div id="lineupsTopBar">
          <Button
            variant="contained"
            sx={{ minWidth: "0px", width: "40px", height: "40px" }}
            onClick={goHome}
          >
            <Home></Home>
          </Button>
        </div>
        <div id="lineupsMainBox">
          <div id="lineupsContent">
            <table id="lineupsTable">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Lineup</th>
                  <th style={{ textAlign: "right" }}>Games</th>
                  <th style={{ textAlign: "right" }}>Wins</th>
                  <th style={{ textAlign: "right" }}>Losses</th>
                  <th style={{ textAlign: "right" }}>Win Rate</th>
                  <th style={{ textAlign: "right" }}>Kills</th>
                  <th style={{ textAlign: "right" }}>Deaths</th>
                  <th style={{ textAlign: "right" }}>KD +/-</th>
                  <th style={{ textAlign: "right" }}>Game Time</th>
                  <th style={{ textAlign: "right" }}>Win Time</th>
                  <th style={{ textAlign: "right" }}>Loss Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.playersString}</td>
                    <td style={{ textAlign: "right" }}>
                      {item.wins + item.losses}
                    </td>
                    <td style={{ textAlign: "right" }}>{item.wins}</td>
                    <td style={{ textAlign: "right" }}>{item.losses}</td>
                    <td style={{ textAlign: "right" }}>
                      <WinRateCell
                        data={{ wins: item.wins, losses: item.losses }}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>{item.kills}</td>
                    <td style={{ textAlign: "right" }}>{item.deaths}</td>
                    <td style={{ textAlign: "right" }}>
                      {item.kills - item.deaths}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {matchTimeFormatter(item.averageGameTime)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {matchTimeFormatter(item.averageWinTime)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {matchTimeFormatter(item.averageLossTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
