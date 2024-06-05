import "./profile.css";
import { useState } from "react";
import ChampionTable from "../tables/ChampionTable";
import ProfileTable from "../tables/ProfileTable/ProfileTable";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import "react-multi-carousel/lib/styles.css";

export default function Profile() {
  const [page, setPage] = useState<number>(0);
  const MAX_PAGES = 3;
  const location = useLocation();
  const { gameName, tagLine } = location.state.data;

  const nextPage = () => {
    if (page === MAX_PAGES - 1) {
      setPage(0);
      return;
    }
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page === 0) {
      setPage(MAX_PAGES - 1);
      return;
    }
    setPage(page - 1);
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
        <ProfileTopBar gameName={gameName} tagLine={tagLine} />
        <div id="profileMainBox">
          <div id="profileLeft" className="profileSide">
            <button className="profileButton" onClick={prevPage}>
              <ChevronLeft />
            </button>
          </div>
          <div id="profileContent">
            <div
              className="carousel-item"
              style={{ display: page == 0 ? "flex" : "none" }}
            >
              <ProfileTable />
            </div>
            <div
              className="carousel-item"
              style={{ display: page == 1 ? "flex" : "none" }}
            >
              <ChampionTable />
            </div>
          </div>
          <div id="profileRight" className="profileSide">
            <button className="profileButton" onClick={nextPage}>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
