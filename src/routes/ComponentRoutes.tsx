import React from "react";
import { Route } from "react-router-dom";
import InfoCard from "../components/Common/InfoCard";
import MultiStepProgressBar from "../components/Common/MultiStepProgressBar";
// ... autres importations de composants

export const ComponentRoutes = (
  <>
    <Route path="/common/info-card" element={<InfoCard title="Exemple" description="Description d'exemple" />} />
    <Route path="/common/multi-step-progress-bar" element={<MultiStepProgressBar currentStep={1} totalSteps={3} />} />
    {/* ... autres routes de composants avec les props requises */}
  </>
);