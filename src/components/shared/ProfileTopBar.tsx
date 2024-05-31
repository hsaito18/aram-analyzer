import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Home } from "@mui/icons-material";
import { champRow } from "../tables/table.interface";
import { SimplePlayerStats } from "../../api/services/players/player.interface";
import "./profileTopBar.css";
import { styled } from "@mui/material";
import Paper from "@mui/material/Paper";

const TopBar = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#27303B" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "flex-end",
  fontSize: "1.3rem",
}));

export default function ProfileTopBar({
  gameName,
  tagLine,
}: {
  gameName: string;
  tagLine: string;
}) {
  const userData = { gameName, tagLine };
  // const [icon, setIcon] = useState(0);
  // const { loading, error, image } = useImage(`profileicon/${icon}.png`);
  // useEffect(() => {
  //   async function fetchIcon() {
  //     const out = await playerAPI.getProfileIcon(userData);
  //     setIcon(out);
  //   }
  //   fetchIcon();
  // });

  const [data, setData] = useState<SimplePlayerStats>({
    totalPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  });

  useEffect(() => {
    const removeFunc = playerAPI.onPlayerStats(
      "playerStatsData",
      (newData: champRow) => {
        setData(newData);
      }
    );

    return () => {
      removeFunc();
    };
  }, []);

  const lastUpdatedDate = new Date()
    .toLocaleString()
    .replace(/T/, " ") // replace T with a space
    .replace(/\..+/, ""); // delete the dot and everything after;

  function analyzeMatches(): void {
    playerAPI.analyzeMatches(userData);
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
              </div>
              <div id="lastUpdatedBox">
                <div id="lastUpdatedText">Last updated:</div>
                <div id="lastUpdatedDate">{lastUpdatedDate}</div>
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
