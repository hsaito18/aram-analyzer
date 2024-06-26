import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Home } from "@mui/icons-material";
import { champRow } from "../tables/table.interface";
import { SimplePlayerStats } from "../../api/players/player.interface";
import "./profileTopBar.css";
import { styled } from "@mui/material";
import Paper from "@mui/material/Paper";

export const TopBar = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "flex-end",
  fontSize: "1.3rem",
  borderBottom: "1px solid a0a0a0",
  borderRadius: "0px",
  padding: "8px 8px 2px 8px",
  height: "10vh",
  transform: "translateY(-1px), translateX(-1px)",
  backgroundColor: "rgba(1, 1, 1, 0.7)",
  scale: "calc(100%+2px)",
}));

export default function ProfileTopBar({
  gameName,
  tagLine,
}: {
  gameName: string;
  tagLine: string;
}) {
  const userData = { gameName, tagLine };

  const [data, setData] = useState<SimplePlayerStats>({
    totalPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    lastUpdatedTime: 0,
  });

  useEffect(() => {
    const removeFunc = playerAPI.onPlayerStats(
      "playerStatsData",
      (newData: SimplePlayerStats) => {
        setData(newData);
      }
    );

    return () => {
      removeFunc();
    };
  }, []);

  function formatDate(dateNum: number): string {
    if (dateNum == 0) {
      return "-";
    }
    return new Date(Number(dateNum))
      .toLocaleString()
      .replace(/T/, " ") // replace T with a space
      .replace(/\..+/, ""); // delete the dot and everything after;
  }

  function analyzeMatches(): void {
    playerAPI.analyzeMatches(userData);
  }

  function resetPlayer(): void {
    playerAPI.resetPlayer(userData);
  }

  function registerPlayer(): void {
    playerAPI.registerPlayer(userData);
  }

  const navigate = useNavigate();
  function goHome(): void {
    navigate("/");
  }

  useEffect(() => {
    playerAPI.getChampStats(userData);
    playerAPI.getPlayerStats(userData);
  }, []);

  return (
    <>
      <TopBar id="top-bar">
        {/* <img id="profilePic" src={image}></img> */}
        <div className="topBarColumn">
          <div id="leftCol">
            <div id="navButtons">
              <Button
                variant="contained"
                sx={{ minWidth: "0px", width: "40px", height: "40px" }}
                onClick={goHome}
              >
                <Home></Home>
              </Button>
            </div>
            <div id="leftSide">
              <div id="username">
                <div id="gameName">{gameName}</div>
                <div id="tagLine">#{tagLine}</div>
              </div>
              <div id="topBarButtons">
                <Button
                  id="analyze-button"
                  variant="contained"
                  onClick={analyzeMatches}
                >
                  Update
                </Button>
                <Button onClick={resetPlayer}>RESET</Button>
              </div>
              <div id="lastUpdatedBox">
                <div id="lastUpdatedText">Last updated:</div>
                <div id="lastUpdatedDate">
                  {formatDate(data.lastUpdatedTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="topBarColumn">
          <div id="center"></div>
        </div>
        <div className="topBarColumn" id="rightCol">
          <div id="rightSide">
            <div id="stats">
              <div>Played: {data.totalPlayed}</div>
              <div>Wins: {data.wins}</div>
              <div>Losses: {data.losses}</div>
              <div>Winrate: {Number(data.winRate).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </TopBar>
    </>
  );
}
