import "./profile.css";
import ChampionTable from "../tables/ChampionTable";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const { gameName, tagLine } = location.state.data;

  return (
    <>
      <div id="main">
        <ProfileTopBar gameName={gameName} tagLine={tagLine} />
        <ChampionTable />
      </div>
    </>
  );
}
