import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import "react-multi-carousel/lib/styles.css";
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
                <h3>Player Stats</h3>
                <div id="playerStatsCols">
                  <div id="winRatesCol">
                    <table id="winRatesTable">
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
                      </tbody>
                    </table>
                    Class Winrates
                    <table id="classWinRatesTable">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Wins</th>
                          <th>Losses</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Assassins</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.assassin.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.assassin.losses)}
                          </td>
                        </tr>
                        <tr>
                          <td>Burst Mages</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.burst.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.burst.losses)}
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
                        </tr>
                        <tr>
                          <td>Artillery</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.artillery.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.artillery.losses)}
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
                        </tr>
                        <tr>
                          <td>Skirmishers</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.skirmisher.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.skirmisher.losses)}
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
                        </tr>
                        <tr>
                          <td>Divers</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.diver.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.diver.losses)}
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
                        </tr>
                        <tr>
                          <td>Wardens</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.warden.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.warden.losses)}
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
                        </tr>
                        <tr>
                          <td>Catcher</td>
                          <td className="numberCell">
                            {Number(data.classWinRates.catcher.wins)}
                          </td>
                          <td className="numberCell">
                            {Number(data.classWinRates.catcher.losses)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
