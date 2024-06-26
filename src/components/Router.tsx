import Profile from "./profile/Profile";
import Home from "./home/Home";
import Lineups from "./lineups/Lineups";
import Match from "./match/Match";
import { HashRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#56A2FF",
    },
    secondary: {
      main: "#FF6978",
    },
    mode: "dark",
  },
});

export default function Router() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <div
          className="App"
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
        >
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/match/:id" Component={Match} />
            <Route path="/profile" Component={Profile} />
            <Route path="/lineups" Component={Lineups} />
          </Routes>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}
