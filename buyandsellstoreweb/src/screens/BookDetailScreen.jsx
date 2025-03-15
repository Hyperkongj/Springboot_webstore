import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const API_BASE_URL = "http://localhost:8080";

const GET_BOOK_DETAILS = gql`
  query GetBookDetails($id: ID!) {
    book(id: $id) {
      id
      title
      author
      price
      imageUrl
      ratings
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $itemId: ID!, $type: String!) {
    addToCart(userId: $userId, itemId: $itemId, type: $type) {
      success
      message
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($userId: ID!, $itemId: ID!, $type: String!) {
    removeFromCart(userId: $userId, itemId: $itemId, type: $type) {
      success
      message
    }
  }
`;

const VIEW_CART = gql`
  query GetCartItems($userId: ID!) {
    cartItems(id: $userId) {
      itemId
      type
      name
      quantity
      price
      imageUrl
    }
  }
`;

const Book = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  
  const { loading, error, data } = useQuery(GET_BOOK_DETAILS, {
    variables: { id },
  });
  const { data: cartData, refetch: refetchCart } = useQuery(VIEW_CART, {
    variables: { userId: user?.id || "" },
    skip: !user?.id,
  });

  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART);
  const [removeFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART);
  const [cartMessage, setCartMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    if (cartData) {
      const bookInCart = cartData.cartItems.find((item) => item.itemId === id);
      setCartQuantity(bookInCart ? bookInCart.quantity : 0);
    }
  }, [cartData, id]);

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to add items to the cart.");
      return;
    }
    try {
      const response = await addToCart({
        variables: { userId: user.id, itemId: id, type: "book" },
      });
      setCartMessage(response.data.addToCart.message || "Book added to cart successfully!");
      refetchCart();
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to add the book to cart. Please try again.");
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to manage your cart.");
      return;
    }
    try {
      const response = await removeFromCart({
        variables: { userId: user.id, itemId: id, type: "book" },
      });
      setCartMessage(response.data.removeFromCart.message || "Book removed from cart!");
      refetchCart();
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to remove the book from cart. Please try again.");
    }
  };

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>Error loading book details: {error.message}</p>;

  const { book } = data;

  return (
    <div style={styles.container}>
      <div style={styles.bookDetails}>
        <img
          src={`${API_BASE_URL}${book.imageUrl}`}
          alt={book.title}
          style={styles.bookImage}
        />
        <div style={styles.bookInfo}>
          <h1>{book.title}</h1>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Price:</strong> ${book.price.toFixed(2)}</p>
          <p><strong>Ratings:</strong> {book.ratings.toFixed(1)} / 5</p>
          <div style={styles.cartButtons}>
            <button
              onClick={handleRemoveFromCart}
              style={styles.cartButton}
              disabled={removeLoading}
            >
              {removeLoading ? "Removing..." : "-"}
            </button>
            <span style={styles.cartQuantity}>{cartQuantity}</span>
            <button
              onClick={handleAddToCart}
              style={styles.cartButton}
              disabled={addLoading}
            >
              {addLoading ? "Adding..." : "+"}
            </button>
          </div>
          {cartMessage && <p style={styles.cartMessage}>{cartMessage}</p>}
        </div>
      </div>
      <div style={styles.reviews}>
        <h2>Reviews</h2>
        {book.reviews.map((review, index) => (
          <div key={index} style={styles.review}>
            <p><strong>{review.reviewer}:</strong> {review.comment}</p>
            <p><strong>Rating:</strong> {review.rating} / 5</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  bookDetails: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" },
  bookImage: { width: "200px", height: "300px", objectFit: "contain" },
  bookInfo: { maxWidth: "600px" },
  cartButtons: { display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" },
  cartQuantity: { fontSize: "18px", fontWeight: "bold" },
  cartButton: {
    padding: "10px 20px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cartMessage: { marginTop: "10px", color: "green" },
  reviews: { marginTop: "20px" },
  review: { marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" },
};

export default Book;
