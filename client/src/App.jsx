import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./modules/common/components/Footer";
import Header from "./modules/common/components/Header";
import NotFound from "./modules/common/components/NotFound";
import ActivatePage from "./modules/auth/pages/ActivatePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./modules/auth/pages/LoginPage";
import PropertiesPage from "./modules/properties/pages/PropertiesPage";
import ProfilePage from "./modules/profile/pages/ProfilePage";
import RegisterPage from "./modules/auth/pages/RegisterPage";

const App = () => {
  return (
    <>
      <Router>
        <Header />
        <main className="py-3">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/activate/:uid/:token" element={<ActivatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer theme="dark" />
        </main>
        <Footer />
      </Router>
    </>
  );
};

export default App;
