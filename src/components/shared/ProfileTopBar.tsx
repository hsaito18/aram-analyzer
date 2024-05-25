import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import useImage from "../../hooks/useImage";
import "./profileTopBar.css";

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

  function analyzeMatches(): void {
    playerAPI.analyzeMatches(userData);
  }
  function registerPlayer() {
    const out = playerAPI.registerPlayer(userData);
  }

  async function getChampStats(): Promise<void> {
    const a = await playerAPI.getChampStats(userData);
  }

  return (
    <>
      <div id="top-bar">
        {/* <img id="profilePic" src={image}></img> */}
        <h1 id="username">
          {gameName}#{tagLine}
        </h1>

        <Button
          id="analyze-button"
          variant="contained"
          onClick={analyzeMatches}
        >
          Update
        </Button>

        <button onClick={registerPlayer}>Register</button>
        <button onClick={getChampStats}>Get Champ Stats</button>
      </div>
    </>
  );
}
