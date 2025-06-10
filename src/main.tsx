import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/WebSocketProvider.tsx";

createRoot(document.getElementById("root")!).render(
<WebSocketProvider>
<App />
</WebSocketProvider>
);
