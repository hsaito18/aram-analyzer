import Profile from "./profile/Profile";
import Home from "./home/Home";
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
  },
});

export default function Router() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <div className="App" style={{ width: "100%", height: "100%" }}>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/profile" Component={Profile} />
          </Routes>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}
