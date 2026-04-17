/**
 * NavbarComponent - Modern Navigation Bar
 * 
 * Features:
 * - Sticky header with blur effect
 * - Modern button styles
 * - Responsive design
 */

function NavbarComponent() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎓</span>
          <span style={styles.logoText}>CourseMS</span>
        </div>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <NavLink href="#" active>Browse</NavLink>
          <NavLink href="#">My Learning</NavLink>
          <NavLink href="#">Instructors</NavLink>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.loginBtn}>Log In</button>
          <button style={styles.signupBtn}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }) {
  return (
    <a 
      href={href}
      style={{
        ...styles.navLink,
        color: active ? '#111827' : '#6b7280',
        fontWeight: active ? '600' : '500',
      }}
    >
      {children}
      {active && <span style={styles.activeIndicator} />}
    </a>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
    padding: '0 20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    position: 'relative',
    fontSize: '15px',
    textDecoration: 'none',
    padding: '8px 0',
    transition: 'color 0.2s',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: '#6366f1',
    borderRadius: '2px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  loginBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signupBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default NavbarComponent;
