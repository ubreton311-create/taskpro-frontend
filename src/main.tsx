import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { I18nProvider } from "./i18n/i18n";
import { GOOGLE_CLIENT_ID } from "./services/config";
import "./styles/globals.css";

const app = (
  <I18nProvider>
    <App />
  </I18nProvider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
