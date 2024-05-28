import Profile from "./profile/Profile";
import Home from "./home/Home";
import { HashRouter, Route, Routes } from "react-router-dom";

export default function Router() {
  return (
    <>
      <HashRouter>
        <div className="App">
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/profile" Component={Profile} />
          </Routes>
        </div>
      </HashRouter>
    </>
  );
}
