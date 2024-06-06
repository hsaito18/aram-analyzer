import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import { Box, lighten, CircularProgress } from "@mui/material";
import { PlayerStats } from "../../../api/services/players/player.interface";
import { getBlankPlayerStats } from "../../../api/services/players/player.interface";
import "./profileTable.css";

const ProfileTable = () => {
  const [data, setData] = useState<PlayerStats>(getBlankPlayerStats());
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const removeFunc = playerAPI.onPlayerStats(
      "playerStatsData",
      (newData: PlayerStats) => {
        setData(newData);
      }
    );

    const removeLoadingFunc = playerAPI.onListener(
      "loadingData",
      (loading: boolean) => {
        setLoading(loading);
      }
    );

    return () => {
      removeFunc();
      removeLoadingFunc();
    };
  }, []);

  const WinRateCell = ({
    data,
  }: {
    data: { wins: number; losses: number };
  }) => {
    const totalPlayed = data.wins + data.losses;
    if (totalPlayed == 0) return <div style={{ marginRight: "1rem" }}>-</div>;
    return <>{Number((data.wins / totalPlayed) * 100).toFixed(1)}%</>;
  };

  return (
    <div id="profileMain">
      <div className="content">
        {isLoading ? (
          <div id="loadingBox">
            <div id="loadingText">Downloading Matches...</div>
            <div id="loadingSpinner">
              <CircularProgress />
            </div>
          </div>
        ) : (
          <>
            {data.totalPlayed > 0 ? (
              <div id="playerStatsContainer">
                <h2>Player Stats</h2>
                <div id="playerStatsCols">
                  <div id="winRatesCol">
                    <div className="tableTitle">Wins and Losses</div>
                    <table id="winRatesTable" className="baseTable">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Wins</td>
                          <td className="numberCell">{Number(data.wins)}</td>
                        </tr>
                        <tr>
                          <td>Losses</td>
                          <td className="numberCell">{Number(data.losses)}</td>
                        </tr>
                        <tr>
                          <td>Win Rate</td>
                          <td className="numberCell">
                            {Number(data.winRate).toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td>Total Played</td>
                          <td className="numberCell">
                            {Number(data.totalPlayed)}
                          </td>
                        </tr>
                        <tr>
                          <td>Last 10</td>
                          <td className="numberCell">
                            {data.lastTen[0]}-{data.lastTen[1]}
                          </td>
                        </tr>
                        <tr>
                          <td>Current Streak</td>
                          <td className="numberCell">
                            {data.results[0] ? "W" : "L"}
                            {data.currentStreak}
                          </td>
                        </tr>
                        <tr>
                          <td>Longest Win Streak</td>
                          <td className="numberCell">
                            {data.highs.longestWinStreak}
                          </td>
                        </tr>
                        <tr>
                          <td>Longest Loss Streak</td>
                          <td className="numberCell">
                            {data.highs.longestLossStreak}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="tableTitle">Class Winrates</div>
                    <table className="classWinRatesTable baseTable">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Wins</th>
                          <th>Losses</th>
                          <th>Win Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Burst Mages</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.burst.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.burst.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.burst} />
                          </td>
                        </tr>
                        <tr>
                          <td>Battle Mages</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.battlemage.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.battlemage.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.battlemage} />
                          </td>
                        </tr>
                        <tr>
                          <td>Artillery</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.artillery.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.artillery.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.artillery} />
                          </td>
                        </tr>
                        <tr>
                          <td>Marksmen</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.marksman.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.marksman.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.marksman} />
                          </td>
                        </tr>
                        <tr>
                          <td>Assassins</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.assassin.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.assassin.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.assassin} />
                          </td>
                        </tr>
                        <tr>
                          <td>Skirmishers</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.skirmisher.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.skirmisher.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.skirmisher} />
                          </td>
                        </tr>
                        <tr>
                          <td>Juggernauts</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.juggernaut.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.juggernaut.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.juggernaut} />
                          </td>
                        </tr>
                        <tr>
                          <td>Divers</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.diver.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.diver.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.diver} />
                          </td>
                        </tr>
                        <tr>
                          <td>Vanguards</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.vanguard.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.vanguard.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.vanguard} />
                          </td>
                        </tr>
                        <tr>
                          <td>Wardens</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.warden.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.warden.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.warden} />
                          </td>
                        </tr>
                        <tr>
                          <td>Catcher</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.catcher.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.catcher.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.catcher} />
                          </td>
                        </tr>
                        <tr>
                          <td>Enchanters</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.enchanter.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.enchanter.losses)}
                          </td>
                          <td className="numberCell">
                            <WinRateCell data={data.classWinRates.enchanter} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div id="killsCol">
                    <div className="tableTitle">Career Totals</div>
                    <table id="killsTable" className="baseTable">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Kills</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalKills)}
                          </td>
                        </tr>
                        <tr>
                          <td>Deaths</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalDeaths)}
                          </td>
                        </tr>
                        <tr>
                          <td>Assists</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalAssists)}
                          </td>
                        </tr>
                        <tr>
                          <td>KDA</td>
                          <td className="numberCell">
                            {Number(data.stats.kda).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td>Double Kills</td>
                          <td className="numberCell">
                            {Number(data.totalStats.doublekills)}
                          </td>
                        </tr>
                        <tr>
                          <td>Triple Kills</td>
                          <td className="numberCell">
                            {Number(data.totalStats.triplekills)}
                          </td>
                        </tr>
                        <tr>
                          <td>Quadra Kills</td>
                          <td className="numberCell">
                            {Number(data.totalStats.quadrakills)}
                          </td>
                        </tr>
                        <tr>
                          <td>Penta Kills</td>
                          <td className="numberCell">
                            {Number(data.totalStats.pentakills)}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="smallBreak"></div>
                          </td>
                        </tr>
                        <tr>
                          <td>Healing</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalHealing)}
                          </td>
                        </tr>
                        <tr>
                          <td>Shielding</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalShielding)}
                          </td>
                        </tr>
                        <tr>
                          <td>CC Time</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalCCTime)}
                          </td>
                        </tr>
                        <tr>
                          <td>Gold</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalGold)}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="smallBreak"></div>
                          </td>
                        </tr>
                        <tr id="damageTitleRow">
                          <td>Damage:</td>
                        </tr>
                        <tr>
                          <td>Champions</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalDamage)}
                          </td>
                        </tr>
                        <tr>
                          <td>Taken</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalDamageTaken)}
                          </td>
                        </tr>
                        <tr>
                          <td>Objectives</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalObjectiveDamage)}
                          </td>
                        </tr>
                        <tr>
                          <td>Self Mitigated</td>
                          <td className="numberCell">
                            {Number(data.totalStats.totalSelfMitigated)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div id="highsCol">
                    <div className="tableTitle">Career Highs</div>
                  </div>
                  <div id="teammatesCol"></div>
                </div>
              </div>
            ) : (
              <div id="noDataFound">No Matches Saved</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileTable;
