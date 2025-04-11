import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const Header = () => {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    logout(); // Clear user context
    navigate("/login");
  };

  const handleHomeClick = () => {
    if (user?.isSeller) {
      navigate("/sellerHome");
    } else {
      navigate("/home");
    }
  };

  return (
    <header style={styles.header}>
      <h2
        style={{ ...styles.title, ...(isHovered ? styles.iconHover : {}) }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleHomeClick}
      >
        Buy&Sell Store
      </h2>
      <div style={styles.nav}>
        {user && (
          <>
            <span style={styles.welcome}>Welcome, {user.firstName}</span>
            <Link to="/profile" style={styles.icon}>👤</Link>
            <Link to="/cart" style={styles.icon}>🛒</Link>
            <Link to="/wishlist" style={styles.icon}>❤️</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#f8f9fa",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc"
  },
  title: {
    margin: 0,
    fontWeight: "bold",
    cursor: "pointer"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  welcome: {
    fontWeight: "500"
  },
  icon: {
    fontSize: "20px",
    textDecoration: "none"
  },
  logoutBtn: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px"
  },
  iconHover: {
    border: "2px solid black"
  },
};

export default Header;
