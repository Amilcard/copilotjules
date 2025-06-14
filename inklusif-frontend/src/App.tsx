import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccueilPage from "./pages/AccueilPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import ActivityListPage from "./pages/ActivityListPage";
import AidesFinancieresPage from "./pages/AidesFinancieresPage";
import BackOfficePage from "./pages/BackOfficePage";
import ChildActivitiesPage from "./pages/ChildActivitiesPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import CreateActivityPage from "./pages/CreateActivityPage";
import EditActivityPage from "./pages/EditActivityPage";
import LoginPage from "./pages/LoginPage";
import ManageChildrenPage from "./pages/ManageChildrenPage";
import NotificationsRappelsPage from "./pages/NotificationsRappelsPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import PendingValidationsPage from "./pages/PendingValidationsPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import SocialAuthCallbackPage from "./pages/SocialAuthCallbackPage";
import UserProfileViewPage from "./pages/UserProfileViewPage";
import InfoCard from "./components/Common/InfoCard";
import MultiStepProgressBar from "./components/Common/MultiStepProgressBar";
import PasswordStrengthIndicator from "./components/Common/PasswordStrengthIndicator";
import RegistrationPrompt from "./components/Common/RegistrationPrompt";
import ToastNotification from "./components/Common/ToastNotification";
import AddEditChildModal from "./components/Dashboard/AddEditChildModal";
import DashboardSidebar from "./components/Dashboard/DashboardSidebar";
import ReservationRequestCard from "./components/Dashboard/ReservationRequestCard";
import ActivityResultsMap from "./components/Map/ActivityResultsMap";
import SimpleMapDisplay from "./components/Map/SimpleMapDisplay";
import DetailedOnboardingFlow from "./components/Onboarding/DetailedOnboardingFlow";
import OnboardingTutorial from "./components/Onboarding/OnboardingTutorial";
import OnboardingScreen1 from "./components/Onboarding/Screens/OnboardingScreen1";
import OnboardingScreen2 from "./components/Onboarding/Screens/OnboardingScreen2";
import OnboardingScreen3 from "./components/Onboarding/Screens/OnboardingScreen3";
import OnboardingScreen4 from "./components/Onboarding/Screens/OnboardingScreen4";
import CompleteProfileForm from "./components/Profile/CompleteProfileForm";
import ProfileProgressBar from "./components/Profile/ProfileProgressBar";
import FilterPanel from "./components/Search/FilterPanel";
import SearchBar from "./components/Search/SearchBar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccueilPage />} />
        <Route path="/activity-detail" element={<ActivityDetailPage />} />
        <Route path="/activity-list" element={<ActivityListPage />} />
        <Route path="/aides-financieres" element={<AidesFinancieresPage />} />
        <Route path="/back-office" element={<BackOfficePage />} />
        <Route path="/child-activities" element={<ChildActivitiesPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/create-activity" element={<CreateActivityPage />} />
        <Route path="/edit-activity" element={<EditActivityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/manage-children" element={<ManageChildrenPage />} />
        <Route path="/notifications-rappels" element={<NotificationsRappelsPage />} />
        <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
        <Route path="/pending-validations" element={<PendingValidationsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/social-auth-callback" element={<SocialAuthCallbackPage />} />
        <Route path="/user-profile-view" element={<UserProfileViewPage />} />
        <Route path="/common/info-card" element={<InfoCard />} />
        <Route path="/common/multi-step-progress-bar" element={<MultiStepProgressBar />} />
        <Route path="/common/password-strength-indicator" element={<PasswordStrengthIndicator />} />
        <Route path="/common/registration-prompt" element={<RegistrationPrompt isVisible={true} onDismiss={() => {}} />} />
        <Route path="/common/toast-notification" element={<ToastNotification message="Test" type="success" />} />
        <Route path="/dashboard/add-edit-child-modal" element={<AddEditChildModal />} />
        <Route path="/dashboard/sidebar" element={<DashboardSidebar />} />
        <Route path="/dashboard/reservation-request-card" element={<ReservationRequestCard />} />
        <Route path="/map/activity-results-map" element={<ActivityResultsMap />} />
        <Route path="/map/simple-map-display" element={<SimpleMapDisplay />} />
        <Route path="/onboarding/detailed-flow" element={<DetailedOnboardingFlow isVisible={true} onComplete={() => {}} />} />
        <Route path="/onboarding/tutorial" element={<OnboardingTutorial />} />
        <Route path="/onboarding/screen1" element={<OnboardingScreen1 />} />
        <Route path="/onboarding/screen2" element={<OnboardingScreen2 />} />
        <Route path="/onboarding/screen3" element={<OnboardingScreen3 />} />
        <Route path="/onboarding/screen4" element={<OnboardingScreen4 />} />
        <Route path="/profile/complete-profile-form" element={<CompleteProfileForm />} />
        <Route path="/profile/progress-bar" element={<ProfileProgressBar />} />
        <Route path="/search/filter-panel" element={<FilterPanel />} />
        <Route path="/search/search-bar" element={<SearchBar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;