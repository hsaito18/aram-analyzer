import { createRoot } from "react-dom/client";
// import "@fontsource/roboto/300.css";
// import "@fontsource/roboto/400.css";
// import "@fontsource/roboto/500.css";
// import "@fontsource/roboto/700.css";
// import Home from "./components/home/Home";
import Profile from "./components/profile/Profile";

const root = createRoot(document.body);
// root.render(<Home />);
root.render(
  <Profile
    username={"hsaito"}
    puuid={
      "XGOlma-Yb0Rs6b-7tH1cipe5LVujYmzoydUJmtMX182j7TALFlJYpx3m118LAFtROjnyGiUdLuazcg"
    }
  />
);
