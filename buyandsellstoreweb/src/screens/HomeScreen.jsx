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
      <h2>Explore Categories</h2>
      <div style={styles.grid}>
        {categories.map((category) => (
          <div
            key={category.name}
            style={styles.card}
            onClick={() => handleCategoryClick(category.path)}
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
    padding: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: "30px",
    cursor: "pointer",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
};

export default HomeScreen;
