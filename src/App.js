import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Sales from "./components/Sales";
import Production from "./components/Production";

import Finish from "./components/Finish";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Navbar from "./components/Navbar";
import Installation from "./components/installation";

const ConditionalNavbar = ({ isAuthenticated, onLogout, userRole }) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return !isAuthPage && isAuthenticated ? (
    <Navbar
      isAuthenticated={isAuthenticated}
      onLogout={onLogout}
      userRole={userRole}
    />
  ) : null;
};

const PrivateRoute = ({ element, isAuthenticated, requiredRole }) => {
  const userRole = localStorage.getItem("role");
  return isAuthenticated && (!requiredRole || userRole === requiredRole) ? (
    element
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();

  const handleLogin = ({ token, userId, role }) => {
    console.log("Login successful in App.js:", { token, userId, role });
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("role", role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem("role");
      if (role === "Production") {
        navigate("/production");
      } else if (role === "Finish") {
        navigate("/finish");
      } else if (role === "Installation") {
        navigate("/installation");
      } else {
        navigate("/sales");
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <ConditionalNavbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userRole={localStorage.getItem("role")}
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/sales"
          element={
            <PrivateRoute
              element={<Sales />}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/production"
          element={
            <PrivateRoute
              element={<Production />}
              isAuthenticated={isAuthenticated}
              requiredRole="Production"
            />
          }
        />

        <Route
          path="/finish"
          element={
            <PrivateRoute
              element={<Finish />}
              isAuthenticated={isAuthenticated}
              requiredRole="Finish"
            />
          }
        />
        <Route
          path="/installation"
          element={
            <PrivateRoute
              element={<Installation />}
              isAuthenticated={isAuthenticated}
              requiredRole="Installation"
            />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  localStorage.getItem("role") === "Production"
                    ? "/production"
                    : localStorage.getItem("role") === "Finish"
                    ? "/finish"
                    : localStorage.getItem("role") === "Installation"
                    ? "/installation"
                    : "/sales"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
