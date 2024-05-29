import Profile from "./profile/Profile";
import Home from "./home/Home";
import { HashRouter, Route, Routes } from "react-router-dom";

export default function Router() {
  return (
    <>
      <HashRouter>
        <div className="App" style={{ width: "100%", height: "100%" }}>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/profile" Component={Profile} />
          </Routes>
        </div>
      </HashRouter>
    </>
  );
}
