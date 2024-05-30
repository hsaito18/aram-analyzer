import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Search } from "@mui/icons-material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material";
import Paper from "@mui/material/Paper";
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
        <div id="home-title">ARAM ANALYZER</div>
        <img src="static://assets/profileicon/0.png"></img>
        <div id="usernameInput">
          <TextField
            id="gameNameField"
            label="Game Name"
            variant="outlined"
            InputProps={{ sx: { fontSize: "1.3rem" } }}
            sx={{ fontSize: "1.2rem" }}
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
            sx={{ fontSize: "1.2rem" }}
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
      </div>
    </>
  );
}
