import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";

import ScrollAnimationManager
  from "./components/ScrollAnimationManager";

import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <ScrollAnimationManager />

      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;