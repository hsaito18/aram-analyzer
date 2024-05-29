import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import { UserData } from "../../api/services/players/player.interface";
import { Search } from "@mui/icons-material";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  const goToProfile = (data: { gameName: string; tagLine: string }) => {
    navigate("/profile", { state: { data } });
  };

  let isSearching = false;

  const searchPlayer = async (): Promise<void> => {
    isSearching = true;
    const gameName = document.getElementById(
      "gameNameField"
    ) as HTMLInputElement;
    const tagLine = document.getElementById("tagLineField") as HTMLInputElement;
    const data = {
      gameName: gameName.value,
      tagLine: tagLine.value,
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
        <div id="usernameInput">
          <TextField
            id="gameNameField"
            label="Game Name"
            variant="outlined"
          ></TextField>
          <TextField
            id="tagLineField"
            label="Tag Line"
            variant="outlined"
            defaultValue="NA1"
          ></TextField>
          <Button
            id="searchButton"
            onClick={searchPlayer}
            disabled={isSearching}
          >
            <Search />
          </Button>
        </div>
      </div>
    </>
  );
}
