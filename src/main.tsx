import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

// Vite removes this branch and its assets from production builds.
if (import.meta.env.DEV && window.location.pathname === "/__design") {
  import("./dev/design/DesignPreview").then(({ DesignPreview }) => {
    root.render(<StrictMode><DesignPreview /></StrictMode>);
  });
} else {
  root.render(<StrictMode><App /></StrictMode>);
}
