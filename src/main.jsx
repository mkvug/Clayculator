import React from "react";
import { createRoot } from "react-dom/client";
import Configurator from "./configurator/Configurator.jsx";
import "./configurator/configurator.css";
import { initAnalytics } from "./analytics.js";

initAnalytics();

createRoot(document.getElementById("root")).render(<Configurator />);
