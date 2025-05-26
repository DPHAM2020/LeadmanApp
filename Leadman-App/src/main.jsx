import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MachineDowntime from "./pages/MachineDowntime.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import FQCChecklist from "./pages/FQCChecklist.jsx";
import ModuleInventory from "./pages/ModuleInventory.jsx";
import APowerInventory from "./pages/APowerInventory.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/downtimeLogger", element: <MachineDowntime /> },
  { path: "/fqcChecklist", element: <FQCChecklist /> },
  { path: "/moduleInventory", element: <ModuleInventory /> },
  { path: "/aPowerInventory", element: <APowerInventory /> },
  { path: "*", element: <NotFoundPage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </StrictMode>
);
