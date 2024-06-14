import "./lineups.css";
import { useState, useEffect } from "react";
import { PlayerLineup } from "../../api/lineups/lineup.interface";
import ChampionTable from "../tables/ChampionTable";
import ProfileTable from "../tables/ProfileTable/ProfileTableClient";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function Lineups() {
  const [data, setData] = useState<LineupRow[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await playerAPI.getLineupsData();
      const preparedData = await prepareTableData(data);
      setData(preparedData);
    };

    fetchData();
  }, []);

  interface LineupRow {
    wins: number;
    losses: number;
    playersString: string;
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
        <div id="lineupsMainBox">
          <div id="lineupsContent">
            <table>
              <thead>
                <tr>
                  <th>Lineup</th>
                  <th>Wins</th>
                  <th>Losses</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.playersString}</td>
                    <td>{item.wins}</td>
                    <td>{item.losses}</td>
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
