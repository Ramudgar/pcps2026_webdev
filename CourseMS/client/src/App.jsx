import "./App.css";
import CourseComponent from "./Components/CourseComponent";
import NavbarComponent from "./Components/NavbarComponent";

/**
 * App Component - Root component
 * 
 * Layout structure:
 * - Sticky Navbar at top
 * - Main content area with course listing
 */
function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <NavbarComponent />
      <main>
        <CourseComponent />
      </main>
      
      {/* Simple Footer */}
      <footer style={{
        backgroundColor: "#1f2937",
        color: "#9ca3af",
        padding: "40px 20px",
        textAlign: "center",
        marginTop: "60px"
      }}>
        <p style={{ fontSize: "14px" }}>
          © 2024 CourseMS. All rights reserved. | Built with React & Node.js
        </p>
      </footer>
    </div>
  );
}

export default App;
