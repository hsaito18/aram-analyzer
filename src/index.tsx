import { createRoot } from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./main.css";
import Home from "./components/home/Home";
import Router from "./components/Router";

const root = createRoot(document.getElementById("root"));
root.render(<Router />);
// root.render(<Profile gameName={"hsaito"} tagLine={"NA1"} />);
