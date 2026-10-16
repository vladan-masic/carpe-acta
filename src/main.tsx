import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import "./styles/foundations.css";
import "./styles/current-action.css";
import "./styles/introduction.css";
import "./styles/guided-support.css";
import "./styles/activity-history.css";
import "./styles/achievements.css";
import "./styles/discovery-account.css";
import "./styles/homepage-reconstruction.css";
import "./styles/journey-reconstruction.css";
import "./styles/responsive-reconstruction.css";
import "./styles/toolbar.css";
import "./styles/hero-refinement.css";
import "./styles/collection-calendar.css";
import "./styles/decorative-continuity.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

// Vite removes this branch and its assets from production builds.
if (import.meta.env.DEV && window.location.pathname === "/__discovery") {
  document.documentElement.dataset.design = "notebook";
  document.documentElement.dataset.theme = "light";
  import("./dev/DiscoveryPreview").then(({ DiscoveryPreview }) => {
    root.render(<StrictMode><DiscoveryPreview /></StrictMode>);
  });
} else if (import.meta.env.DEV && window.location.pathname === "/__achievements") {
  document.documentElement.dataset.design = "notebook";
  document.documentElement.dataset.theme = "light";
  import("./dev/AchievementsPreview").then(({ AchievementsPreview }) => {
    root.render(<StrictMode><AchievementsPreview /></StrictMode>);
  });
} else if (import.meta.env.DEV && window.location.pathname === "/__progress") {
  document.documentElement.dataset.design = "notebook";
  document.documentElement.dataset.theme = "light";
  import("./dev/ProgressPreview").then(({ ProgressPreview }) => {
    root.render(<StrictMode><ProgressPreview /></StrictMode>);
  });
} else if (import.meta.env.DEV && window.location.pathname === "/__support") {
  document.documentElement.dataset.design = "notebook";
  document.documentElement.dataset.theme = "light";
  import("./dev/SupportPreview").then(({ SupportPreview }) => {
    root.render(<StrictMode><SupportPreview /></StrictMode>);
  });
} else if (import.meta.env.DEV && window.location.pathname === "/__design") {
  import("./dev/design/DesignPreview").then(({ DesignPreview }) => {
    root.render(<StrictMode><DesignPreview /></StrictMode>);
  });
} else {
  document.documentElement.dataset.design = "notebook";
  root.render(<StrictMode><App /></StrictMode>);
}
