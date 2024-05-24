import { createRoot } from "react-dom/client";
// import "@fontsource/roboto/300.css";
// import "@fontsource/roboto/400.css";
// import "@fontsource/roboto/500.css";
// import "@fontsource/roboto/700.css";
// import Home from "./components/home/Home";
import Profile from "./components/profile/Profile";

const root = createRoot(document.getElementById("root"));
// root.render(<Home />);
root.render(<Profile gameName={"CAPTAINOBVOIUS"} tagLine={"NA1"} />);
