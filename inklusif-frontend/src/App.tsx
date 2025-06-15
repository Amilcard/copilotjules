import React from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import { MainRoutes } from "./routes/MainRoutes";
import { ComponentRoutes } from "./routes/ComponentRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {MainRoutes}
        {ComponentRoutes}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
