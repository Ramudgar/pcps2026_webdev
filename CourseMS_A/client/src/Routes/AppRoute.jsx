import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../Components/NavbarComponents";
import HomeContent from "../pages/Home";
import Login from "../pages/Login";
import Course from "../pages/Course";

const AppRoute = () => {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Course />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRoute;
