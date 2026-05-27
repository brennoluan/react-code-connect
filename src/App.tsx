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

const AppContent = () => {
  useTokenRefresh();

  return (
    <DevsProvider>
      <div className="min-h-screen bg-graphite text-white">
        <Navigation />

        {/* Main Content Area */}
        <main className="md:ml-64 pb-16 md:pb-0">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
