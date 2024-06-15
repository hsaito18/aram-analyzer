import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Search } from "@mui/icons-material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material";
import Paper from "@mui/material/Paper";
import { Groups } from "@mui/icons-material";
import "./home.css";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ":hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#000" : "#f5f5f5",
  },
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-end",
  fontSize: "1.3rem",
}));

function resetAllPlayers() {
  playerAPI.resetAllPlayers();
  playerAPI.resetLineupsData();
}

function resetLineups() {
  playerAPI.resetLineupsData();
}

export default function Home() {
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const history = await playerAPI.getSearchHistory();
      setSearchHistory(history);
    };
    fetchData();
  }, []);

  const goToProfile = async (rawData: {
    gameName: string;
    tagLine: string;
  }) => {
    const data = await playerAPI.searchPlayer(rawData);
    navigate("/profile", { state: { data } });
  };

  let isSearching = false;

  const searchPlayer = async (): Promise<void> => {
    isSearching = true;
    const gameNameElement = document.getElementById(
      "gameNameField"
    ) as HTMLInputElement;
    const tagLineElement = document.getElementById(
      "tagLineField"
    ) as HTMLInputElement;
    const gameName = gameNameElement.value.trim();
    const tagLine = tagLineElement.value.replace(/\s/g, "");
    const data = {
      gameName,
      tagLine,
    };
    // IS THIS A SAVED PLAYER???
    const isSaved = await playerAPI.checkPlayer(data);
    if (isSaved) {
      goToProfile(data);
      isSearching = false;
      return;
    }
    // IS THIS A REAL PLAYER???
    const isReal = await playerAPI.createPlayer(data);
    if (isReal) {
      goToProfile(data);
      playerAPI.analyzeMatches(data);
      isSearching = false;
      return;
    }
    isSearching = false;
  };

  return (
    <>
      <div id="home-main">
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
        <div id="homeCard">
          <div id="home-title">
            <h1>ARAM ANALYZER</h1>
          </div>
          {/* <img src="static://assets/aram_logo.jpg"></img> */}
          <div id="usernameInput">
            <TextField
              id="gameNameField"
              label="Game Name"
              variant="outlined"
              InputProps={{ sx: { fontSize: "1.3rem" } }}
              InputLabelProps={{ sx: { fontSize: "1.3rem" } }}
              sx={{ fontSize: "1.3rem" }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchPlayer();
                }
              }}
            ></TextField>
            <TextField
              id="tagLineField"
              label="Tag Line"
              variant="outlined"
              defaultValue="NA1"
              InputProps={{ sx: { fontSize: "1.3rem" } }}
              sx={{ fontSize: "1.3rem" }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchPlayer();
                }
              }}
            ></TextField>
            <Button
              id="searchButton"
              onClick={searchPlayer}
              disabled={isSearching}
            >
              <Search />
            </Button>
          </div>
          <div id="searchHistoryBox">
            <div id="searchHistoryTitle">Recent</div>
            <Stack id="searchHistoryStack" spacing={2}>
              {searchHistory.map((item, index) => (
                <Item
                  key={index}
                  onClick={() => {
                    goToProfile(item);
                  }}
                  className="searchHistoryItem"
                >
                  <div id="searchHistoryGameName">{item.gameName}</div>
                  <div id="searchHistoryTagLine">#{item.tagLine}</div>
                </Item>
              ))}
            </Stack>
          </div>
          <Button onClick={resetAllPlayers}>RESET ALL PLAYERS</Button>
          <Button onClick={resetLineups}>RESET LINEUPS</Button>
          <Button onClick={playerAPI.attachAllMatches}>
            Attach all matches
          </Button>
          <div id="homeCardButtonRow">
            {/* <Button>
              <Groups></Groups>
            </Button> */}
            <Item
              id="lineupsButton"
              onClick={() => {
                navigate("/lineups");
              }}
            >
              <Groups />
            </Item>
          </div>
        </div>
      </div>
    </>
  );
}
