import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import FuelFormPage from "@/react-app/pages/FuelForm";
import ChecklistFormPage from "@/react-app/pages/ChecklistForm";
import PassAlongFormPage from "@/react-app/pages/PassAlongForm";
import ValidationPage from "@/react-app/pages/ValidationPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/fuel" element={<FuelFormPage />} />
          <Route path="/checklist" element={<ChecklistFormPage />} />
          <Route path="/passalong" element={<PassAlongFormPage />} />
          <Route path="/validation" element={<ValidationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
