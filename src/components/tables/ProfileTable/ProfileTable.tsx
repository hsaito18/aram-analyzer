import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import Carousel from "react-multi-carousel";
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
                          <td className="numberCell">{Number(data.wins)}</td>
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
