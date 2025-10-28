import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StoreProvider, { Context } from "@/store/StoreProvider";

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
    <StoreProvider>
        <App />
    </StoreProvider>
);