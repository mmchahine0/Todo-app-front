import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "../src/redux/persist/persist";
import { persistor } from "./redux/persist/persist";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
