import React from "react";
import { Route } from "react-router-dom";
import AccueilPage from "../pages/AccueilPage";
import ActivityDetailPage from "../pages/ActivityDetailPage";
// ... autres importations de pages principales

export const MainRoutes = (
  <>
    <Route path="/" element={<AccueilPage />} />
    <Route path="/activity-detail" element={<ActivityDetailPage />} />
    {/* ... autres routes principales */}
  </>
);