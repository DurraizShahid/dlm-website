import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./debug-env.ts"; // Debug environment variables

createRoot(document.getElementById("root")!).render(<App />);
