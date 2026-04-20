import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CourseComponent from "./Components/CourseComponent";
import NavbarComponent from "./Components/NavbarComponent";
import ProtectedRoute from "./Components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { LearningDashbaord } from "./Components/LearningDashbaord";
import CourseDetailPage from "./pages/CourseDetailPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourseStudents from "./pages/TeacherCourseStudents";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
        <NavbarComponent />

        <div className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<CourseComponent />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />

            {/* Authenticated (any role) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Student */}
            <Route
              path="/learning"
              element={
                <ProtectedRoute roles={["student"]}>
                  <LearningDashbaord />
                </ProtectedRoute>
              }
            />

            {/* Teacher */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute roles={["teacher", "admin"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:id/students"
              element={
                <ProtectedRoute roles={["teacher", "admin"]}>
                  <TeacherCourseStudents />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <footer className="bg-gray-800 text-gray-400 py-10 text-center mt-16">
          <p className="text-sm">
            © 2024 CourseMS. All rights reserved. | Built with React & Node.js
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
