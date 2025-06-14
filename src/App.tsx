import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import FriendsPage from "./pages/FriendsPage";
import ChatPage from "./pages/ChatPage";
import { ThemeProvider } from "./components/Theme-provider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicRoute";
import ChatListPage from "./pages/ChatListPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignUpPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicOnlyRoute>
                <SignInPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:friendId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
