import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { EditorPage } from "./pages/EditorPage";
import { LoginPage } from "./pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "boards/:boardId", element: <EditorPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
