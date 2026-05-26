import { Routes, Route } from "react-router";
import { DevsProvider } from "./features/devs/contexts/DevsContext";
import { Navigation } from "./features/navigation/components/Navigation";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { ContactPage } from "./pages/ContactPage";
import { AuthProvider } from "./features/auth/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <DevsProvider>
        <div className="min-h-screen bg-graphite text-white">
          <Navigation />

          {/* Main Content Area */}
          <main className="md:ml-64 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contact/:devId" element={<ContactPage />} />
            </Routes>
          </main>
        </div>
      </DevsProvider>
    </AuthProvider>
  );
}

export default App;
