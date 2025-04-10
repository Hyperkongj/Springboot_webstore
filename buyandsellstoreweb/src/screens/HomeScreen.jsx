import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Books", path: "/books" },
  { name: "Home Items", path: "/homeitems" }
];

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Explore Categories</h2>
      <div style={styles.grid}>
        {categories.map((category) => (
          <div
            key={category.name}
            style={styles.card}
            onClick={() => handleCategoryClick(category.path)}
            role="button"
            tabIndex={0}
            aria-label={`Go to ${category.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCategoryClick(category.path);
            }}
          >
            <h3>{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "30px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    fontWeight: "bold",
    fontSize: "18px",
    color: "#333",
  },
  cardHover: {
    transform: "scale(1.03)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
};

export default HomeScreen;
