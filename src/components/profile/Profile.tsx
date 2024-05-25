import "./profile.css";
import ChampionTable from "../tables/ChampionTable";
import ProfileTopBar from "../shared/ProfileTopBar";

export default function Profile({
  gameName,
  tagLine,
}: {
  gameName: string;
  tagLine: string;
}) {
  const userData = { gameName, tagLine };

  return (
    <>
      <div id="main">
        <ProfileTopBar gameName={gameName} tagLine={tagLine} />
        <h2> Champions </h2>
        <ChampionTable />
      </div>
    </>
  );
}
