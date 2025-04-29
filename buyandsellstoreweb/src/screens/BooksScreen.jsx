import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      price
      imageUrl
      ratings
    }
  }
`;

const Books = () => {
  const { loading, error, data } = useQuery(GET_BOOKS);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.books && !loading) {
      setBooks(data.books);
    }
  }, [data, loading]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
  };

  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch(selectedSort) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating-desc":
        return b.ratings - a.ratings;
      default:
        return 0;
    }
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={styles.starFilled}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} style={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} style={styles.starEmpty}>☆</span>);
      }
    }
    
    return stars;
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p>Loading books...</p>
    </div>
  );
  
  if (error) return (
    <div style={styles.errorContainer}>
      <h2>Error</h2>
      <p>{error.message}</p>
    </div>
  );

  if (data.books.length === 0) {
    return (
      <div style={styles.emptyStateContainer}>
        <h2>No Books Available</h2>
        <p>Check back later for our updated collection.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.pageTitle}>Book Collection</h1>
        
        <div style={styles.controlsContainer}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.sortContainer}>
            <select 
              value={selectedSort} 
              onChange={handleSortChange}
              style={styles.sortSelect}
            >
              <option value="default">Sort by</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedBooks.length === 0 ? (
        <div style={styles.noResultsContainer}>
          <p>No books found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div style={styles.booksGrid}>
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              style={styles.bookCard}
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <div style={styles.imageWrapper}>
                <img
                  src={`${book.imageUrl}`}
                  alt={book.title}
                  style={styles.bookImage}
                />
              </div>
              <div style={styles.bookInfo}>
                <h2 style={styles.bookTitle}>{book.title}</h2>
                <p style={styles.bookAuthor}>By {book.author}</p>
                <div style={styles.ratingContainer}>
                  <div style={styles.stars}>
                    {renderStars(book.ratings)}
                  </div>
                  <span style={styles.ratingText}>
                    {book.ratings.toFixed(1)}
                  </span>
                </div>
                <p style={styles.bookPrice}>${book.price.toFixed(2)}</p>
                <button style={styles.viewDetailsButton}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    padding: "30px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  
  // Loading and error states
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    borderTopColor: "#007BFF",
    animation: "spin 1s ease-in-out infinite",
    marginBottom: "15px",
  },
  errorContainer: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "600px",
    margin: "100px auto",
  },
  emptyStateContainer: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    maxWidth: "600px",
    margin: "100px auto",
  },
  noResultsContainer: {
    padding: "30px",
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    margin: "20px 0",
  },
  
  // Header section
  headerSection: {
    marginBottom: "30px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "25px",
    textAlign: "center",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "10px",
  },
  searchContainer: {
    flex: "1 1 300px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  sortContainer: {
    flex: "0 0 200px",
  },
  sortSelect: {
    width: "100%",
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  
  // Books grid
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "25px",
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
    },
  },
  imageWrapper: {
    height: "220px",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
  },
  bookImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    transition: "transform 0.3s ease",
  },
  bookInfo: {
    padding: "20px",
    flex: "1",
    display: "flex",
    flexDirection: "column",
  },
  bookTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "8px",
    color: "#333",
    lineHeight: "1.3",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bookAuthor: {
    fontSize: "14px",
    color: "#666",
    marginTop: "0",
    marginBottom: "12px",
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  stars: {
    display: "flex",
    marginRight: "8px",
  },
  starFilled: {
    color: "#ffc107",
    fontSize: "16px",
  },
  starHalf: {
    color: "#ffc107",
    fontSize: "16px",
  },
  starEmpty: {
    color: "#e4e5e9",
    fontSize: "16px",
  },
  ratingText: {
    fontSize: "14px",
    color: "#666",
  },
  bookPrice: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#038552",
    marginTop: "auto",
    marginBottom: "15px",
  },
  viewDetailsButton: {
    padding: "10px 0",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    width: "100%",
  },
};

export default Books;