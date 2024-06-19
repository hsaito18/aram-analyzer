import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  PlayerStats,
  getBlankPlayerStats,
} from "../../../api/players/player.interface";
import "./profileTable.css";
import "./ProfileTableClient.css";
import ProfileTableStatic from "./ProfileTableStatic";

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
    const userData = await playerAPI.getUserData(teammate.puuid);
    teammate["gameName"] = userData.gameName;
    teammate["tagLine"] = userData.tagLine;
  }
  return teammates;
}

const ProfileTable = ({
  gameName,
  tagLine,
}: {
  gameName: string;
  tagLine: string;
}) => {
  const [data, setData] = useState<PlayerStats>(getBlankPlayerStats());
  const [isLoading, setLoading] = useState<boolean>(false);
  const [teammateData, setTeammateData] = useState<TeammateData[]>([]);

  useEffect(() => {
    const removeFunc = playerAPI.onPlayerStats(
      "playerStatsData",
      async (newData: PlayerStats) => {
        setData(newData);
        const allTeammates = teammateDataArrayizer(newData.teammates);
        const topTeammates = teammateDataSorter(
          allTeammates,
          NUM_TEAMMATES_SHOWN
        );
        const finalTeammatesData = await teammateDataNamer(topTeammates);
        setTeammateData(finalTeammatesData);
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

  const testGraphic = async () => {
    playerAPI.generatePlayerGraphic();
  };

  const navigate = useNavigate();
  const navigateFunction = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  return (
    <>
      {isLoading ? (
        <div id="loadingBox">
          <div id="loadingText">Downloading Matches...</div>
          <div id="loadingSpinner">
            <CircularProgress />
          </div>
        </div>
      ) : (
        <ProfileTableStatic
          data={data}
          teammateData={teammateData}
          gameName={gameName}
          tagLine={tagLine}
          navigateFunction={navigateFunction}
        />
      )}
    </>
  );
};

export default ProfileTable;
