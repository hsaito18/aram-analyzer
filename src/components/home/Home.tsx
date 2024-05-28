import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { UserData } from "../../api/services/players/player.interface";

export default function Home() {
  const navigate = useNavigate();
  const data: UserData = {
    gameName: "hsaito",
    tagLine: "NA1",
  };

  const goToProfile = () => {
    navigate("/profile", { state: { data } });
  };

  return (
    <>
      <div id="home-main">
        <h1>Home</h1>
        <Button onClick={goToProfile}>
          <h2>Profile</h2>
        </Button>
      </div>
    </>
  );
}
