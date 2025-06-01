import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import SignUpPage from "./components/SignUp"
import SignInPage from "./components/SignIn"
import FriendsPage from "./components/FriendsPage"
import ChatPage from "./components/ChatPage"
import { ThemeProvider } from "./components/Theme-provider"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/chat/:friendId" element={<ChatPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
