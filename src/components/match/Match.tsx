import "./match.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Match } from "../../api/matches/match.interface";
import MatchStatic from "./MatchStatic";
import {
  WinRateCell,
  matchTimeFormatter,
} from "../tables/ProfileTable/ProfileTableStatic";
import { TopBar } from "../shared/ProfileTopBar";
import ChampionTable from "../tables/ChampionTable";
import ProfileTable from "../tables/ProfileTable/ProfileTableClient";
import ProfileTopBar from "../shared/ProfileTopBar";
import { Button } from "@mui/material";
import { Home } from "@mui/icons-material";

export default function Match() {
  const [data, setData] = useState<Match>(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await playerAPI.getMatchData(id);
      setData(data);
    };
    fetchData();
  }, []);

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <>
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
      <div id="main">
        <div id="matchTopBar">
          <Button
            variant="contained"
            sx={{ minWidth: "0px", width: "40px", height: "40px" }}
            onClick={goHome}
          >
            <Home></Home>
          </Button>
        </div>
        <div id="matchMainBox">
          {" "}
          {data === null ? (
            <div id="loading">Loading...</div>
          ) : (
            <MatchStatic matchData={data} />
          )}
        </div>
      </div>
    </>
  );
}
