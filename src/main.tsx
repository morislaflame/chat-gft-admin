import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StoreProvider, { Context } from "@/store/StoreProvider";
import { HeroUIProvider } from "@heroui/react";

export { Context };


// Избегаем повторного создания root при горячей перезагрузке
const rootElement = document.getElementById("root") as HTMLElement;

// Используем переменную window для хранения root между перезагрузками
declare global {
  interface Window {
    __REACT_ROOT__?: ReactDOM.Root;
  }
}

if (!window.__REACT_ROOT__) {
  window.__REACT_ROOT__ = ReactDOM.createRoot(rootElement);
}

window.__REACT_ROOT__.render(
  <HeroUIProvider>
    <StoreProvider>
      <main className="h-screen overflow-y-auto w-screen dark text-foreground bg-background">
        <App />
      </main>
    </StoreProvider>
  </HeroUIProvider>
);