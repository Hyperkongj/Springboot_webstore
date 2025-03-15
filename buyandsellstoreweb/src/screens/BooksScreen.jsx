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
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.books) {
      setBooks(data.books);
    }
  }, [data]);

  if (loading) return <p>Loading books...</p>;
  if (error) return <p>Error loading books: {error.message}</p>;

  return (
    <div style={styles.container}>
      <h1>Books</h1>
      <div style={styles.booksGrid}>
        {books.map((book) => (
          <div
            key={book.id}
            style={styles.bookTile}
            onClick={() => navigate(`/book/${book.id}`)}
          >
            <img
              src={`${API_BASE_URL}${book.imageUrl}`}
              alt={book.title}
              style={styles.bookImage}
            />
            <h2 style={styles.bookTitle}>{book.title}</h2>
            <p style={styles.bookAuthor}>By {book.author}</p>
            <p style={styles.bookPrice}>${book.price.toFixed(2)}</p>
            <p style={styles.bookRatings}>
              Ratings: {book.ratings.toFixed(1)} / 5
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
  },
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  bookTile: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  },
  bookImage: {
    width: "100%",
    height: "150px",
    objectFit: "contain",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },
  bookTitle: { fontSize: "18px", margin: "10px 0" },
  bookAuthor: { fontSize: "14px", color: "#555" },
  bookPrice: { fontSize: "16px", fontWeight: "bold", margin: "10px 0" },
  bookRatings: { fontSize: "14px", color: "#888" },
};

export default Books;
