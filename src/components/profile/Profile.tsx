import "./profile.css";
import ChampionTable from "../tables/ChampionTable";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const { gameName, tagLine } = location.state.data;
  //static://assets/profileicon/0.png
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
        <div id="profileContent">
          <ChampionTable />
        </div>
      </div>
    </>
  );
}
