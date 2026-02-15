import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./utils/auth";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import DashboardPage from "./components/DashboardPage";
import LearningListPage from "./components/LearningListPage";
import LearningDetailPage from "./components/LearningDetailPage";

function RootRedirect() {
  return isAuthenticated()
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <PrivateRoute>
            <LearningListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/learning/:learningId"
        element={
          <PrivateRoute>
            <LearningDetailPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
