import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccueilPage from "./pages/AccueilPage";
import ActivityList from "./pages/ActivityList";
import ActivityForm from "./pages/ActivityForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccueilPage />} />
        <Route path="/activities" element={<ActivityList />} />
        <Route path="/activities/new" element={<ActivityForm />} />
        <Route path="/activities/:id" element={<ActivityForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
