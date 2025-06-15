import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccueilPage from "./pages/AccueilPage";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AccueilPage />} />
      {/* tes autres routes… */}
    </Routes>
  </BrowserRouter>
);

export default App;