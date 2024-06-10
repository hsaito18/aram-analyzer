import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import { Box, CircularProgress } from "@mui/material";
import { useToPng } from "@hugocxl/react-to-image";
import html2canvas from "html2canvas";
import { formatLargeInteger } from "../../../services/string.service";
import { PerMinuteLabelCell } from "../championDetail/ChampionDetail";
import {
  PlayerStats,
  getBlankPlayerStats,
} from "../../../api/players/player.interface";
import "./profileTable.css";
import React from "react";

const NUM_TEAMMATES_SHOWN = 20;

interface TeammateData {
  puuid: string;
  wins: number;
  losses: number;
  winRate: number;
  totalPlayed: number;
  gameName: string;
  tagLine: string;
}

export function PlayerHighDateCell({
  data,
}: {
  data: { value: number; matchId: string; date: string; champName: string };
}) {
  const stringDate = new Date(Number(data.date)).toLocaleDateString();
  function handleClick() {
    console.log(`Match ID: ${data.matchId}`);
  }
  return (
    <div id="matchDateCell">
      <img
        className="profileHighChampIcon"
        src={`PATH_TO_ASSETS/assets/champion_icons/${data.champName}.jpg`}
      ></img>
      <Box
        component="span"
        sx={{
          backgroundColor: "orange",
          borderRadius: "0.25rem",
          color: "#fff",
          p: "0.25rem",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        {stringDate}
      </Box>
    </div>
  );
}

const ProfileTableStatic = ({
  data,
  teammateData,
  gameName,
  tagLine,
}: {
  data: PlayerStats;
  teammateData: TeammateData[];
  gameName: string;
  tagLine: string;
}) => {
  ///
  ///
  ///
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
    <div id="staticProfileMain">
      <div className="content">
        {
          <>
            {data.totalPlayed > 0 ? (
              <div id="playerStatsContainer">
                <h2>
                  {gameName}#{tagLine} Player Stats
                </h2>
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
                        <tr className="titleRow">
                          <td>Damage:</td>
                        </tr>
                        <tr>
                          <td>Champions</td>
                          <td className="numberCell">
                            {formatLargeInteger(data.totalStats.totalDamage)}
                          </td>
                        </tr>
                        <tr>
                          <td>Taken</td>
                          <td className="numberCell">
                            {formatLargeInteger(
                              data.totalStats.totalDamageTaken
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Objectives</td>
                          <td className="numberCell">
                            {formatLargeInteger(
                              data.totalStats.totalObjectiveDamage
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Self Mitigated</td>
                          <td className="numberCell">
                            {formatLargeInteger(
                              data.totalStats.totalSelfMitigated
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="smallBreak"></div>
                          </td>
                        </tr>
                        <tr className="titleRow">
                          <td>Other:</td>
                        </tr>
                        <tr>
                          <td>Healing</td>
                          <td className="numberCell">
                            {formatLargeInteger(data.totalStats.totalHealing)}
                          </td>
                        </tr>
                        <tr>
                          <td>Shielding</td>
                          <td className="numberCell">
                            {formatLargeInteger(data.totalStats.totalShielding)}
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
                            {formatLargeInteger(data.totalStats.totalGold)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div id="highsCol">
                    <div className="tableTitle">Career Highs</div>
                    <table id="highsTable" className="baseTable">
                      <thead>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Kills</td>
                          <td className="numberCell">
                            {Number(data.highs.mostKills.value)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostKills} />
                          </td>
                        </tr>
                        <tr>
                          <td>Deaths</td>
                          <td className="numberCell">
                            {Number(data.highs.mostDeaths.value)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostDeaths} />
                          </td>
                        </tr>
                        <tr>
                          <td>Assists</td>
                          <td className="numberCell">
                            {Number(data.highs.mostAssists.value)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostAssists} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <PerMinuteLabelCell label="Damage" />
                          </td>
                          <td className="numberCell">
                            {Number(data.highs.mostDamage.value).toFixed(0)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostDamage} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <PerMinuteLabelCell label="Damage Taken" />
                          </td>
                          <td className="numberCell">
                            {Number(data.highs.mostDamageTaken.value).toFixed(
                              0
                            )}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostDamageTaken}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <PerMinuteLabelCell label="Healing" />
                          </td>
                          <td className="numberCell">
                            {Number(data.highs.mostHealing.value).toFixed(0)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostHealing} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <PerMinuteLabelCell label="Shielding" />
                          </td>
                          <td className="numberCell">
                            {Number(data.highs.mostShielding.value).toFixed(0)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostShielding}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>CC Time</td>
                          <td className="numberCell">
                            {Number(data.highs.mostTotalCCTime.value).toFixed(
                              0
                            )}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostTotalCCTime}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <PerMinuteLabelCell label="Gold" />
                          </td>
                          <td className="numberCell">
                            {Number(data.highs.mostGold.value).toFixed(0)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostGold} />
                          </td>
                        </tr>
                        <tr>
                          <td>CS</td>
                          <td className="numberCell">
                            {Number(data.highs.mostTotalCS.value).toFixed(0)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.mostTotalCS} />
                          </td>
                        </tr>
                        <tr>
                          <td>KP%</td>
                          <td className="numberCell">
                            {Number(
                              data.highs.mostKillParticipation.value * 100
                            ).toFixed(0)}
                            %
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostKillParticipation}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Damage Share</td>
                          <td className="numberCell">
                            {Number(
                              data.highs.mostDamageShare.value * 100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostDamageShare}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Gold Share</td>
                          <td className="numberCell">
                            {Number(
                              data.highs.mostGoldShare.value * 100
                            ).toFixed(1)}
                            %
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.mostGoldShare}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Critical Strike</td>
                          <td className="numberCell">
                            {Number(data.highs.biggestCrit.value)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell data={data.highs.biggestCrit} />
                          </td>
                        </tr>
                        <tr>
                          <td>Killing Spree</td>
                          <td className="numberCell">
                            {Number(data.highs.biggestKillingSpree.value)}
                          </td>
                          <td className="profileMatchDateCell">
                            <PlayerHighDateCell
                              data={data.highs.biggestKillingSpree}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div id="teammatesCol">
                    <div className="tableTitle">Teammates</div>
                    <table id="teammateTable" className="baseTable">
                      <thead>
                        <tr>
                          <th></th>
                          <th>GP</th>
                          <th>W</th>
                          <th>L</th>
                          <th>WR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teammateData.map((teammate, index) => (
                          <tr key={index}>
                            <td>
                              <div className="teammateGameName">
                                {teammate.gameName}
                              </div>
                              {/* <div className="teammateTagLine">
                                #{teammate.tagLine}
                              </div> */}
                            </td>
                            <td className="numberCell">
                              {teammate.totalPlayed}
                            </td>
                            <td className="numberCell">{teammate.wins}</td>
                            <td className="numberCell">{teammate.losses}</td>
                            <td className="numberCell">
                              {(teammate.winRate * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div id="noDataFound">No Matches Saved</div>
            )}
          </>
        }
      </div>
    </div>
  );
};

export default ProfileTableStatic;
