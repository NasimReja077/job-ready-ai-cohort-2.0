import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { registerSW } from "virtual:pwa-register";
import { store } from "@/store";
import App from "@/App";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(20,20,31,0.85)",
            color: "#f4f4f8",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            fontSize: "14px",
          },
        }}
      />
    </Provider>
  </React.StrictMode>
);
