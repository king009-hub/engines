import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n";

let rendered = false;
const renderApp = () => {
  if (rendered) return;
  rendered = true;
  console.log('[main] Rendering app, language:', i18n.language);
  createRoot(document.getElementById("root")!).render(<App />);
};

// Ensure i18n is initialized before rendering the app
if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on('initialized', renderApp);
}
