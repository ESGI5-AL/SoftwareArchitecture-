import { AuthProvider } from "./features/auth/AuthContext";
import { AppContent } from "./shared/components/AppContent";

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
