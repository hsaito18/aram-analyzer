import Button from "@mui/material/Button";
import "./profile.css";
import ChampionTable from "../tables/ChampionTable";

export default function Profile({
  gameName,
  tagLine,
}: {
  gameName: string;
  tagLine: string;
}) {
  const userData = { gameName, tagLine };

  function registerPlayer() {
    const out = playerAPI.registerPlayer(userData);
  }

  function analyzeMatches(): void {
    const out = playerAPI.analyzeMatches(userData);
  }

  async function getChampStats(): Promise<void> {
    const a = await playerAPI.getChampStats(userData);
  }

  return (
    <>
      <div id="main">
        <div id="top-bar">
          <h1 id="username">
            {" "}
            {gameName}#{tagLine}{" "}
          </h1>
          <Button
            id="register-button"
            variant="contained"
            onClick={registerPlayer}
          >
            Register Player
          </Button>
          <Button
            id="analyze-button"
            variant="contained"
            onClick={analyzeMatches}
          >
            Analyze Matches
          </Button>
          <Button onClick={getChampStats}>Get Champ Stats</Button>
        </div>

        <h2> Champions </h2>
        <ChampionTable />
      </div>
    </>
  );
}
