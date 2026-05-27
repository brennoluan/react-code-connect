import { Routes, Route } from "react-router";
import { DevsProvider } from "./features/devs/contexts/DevsContext";
import { Navigation } from "./features/navigation/components/Navigation";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { ContactPage } from "./pages/ContactPage";
import { AuthProvider } from "./features/auth/contexts/AuthContext";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { useTokenRefresh } from "./features/auth/hooks/useTokenRefresh";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuth } from "./features/auth/hooks/useAuth";
import { LoadingComponent } from "./features/auth/components/LoadingComponent";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const { isLoading } = useAuth();

  useTokenRefresh();

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <DevsProvider>
      <div className="min-h-screen bg-graphite text-white">
        <Navigation />

        {/* Main Content Area */}
        <main className="md:ml-64 pb-16 md:pb-0">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/contact/:devId" element={<ContactPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </DevsProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
