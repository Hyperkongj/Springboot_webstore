// src/screens/BookDetailScreen.jsx
import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const API_BASE_URL = "http://localhost:8080";

// GraphQL queries and mutations remain the same...
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

// All other GraphQL definitions remain unchanged
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

const ADD_WISHLIST_ITEM = gql`
  mutation AddWishlistItem($input: WishlistItemInput!) {
    addWishlistItem(input: $input) {
      id
      userId
      itemId
      type
      name
      imageUrl
    }
  }
`;

const GET_WISHLIST_ITEMS = gql`
  query wishlistItems($userId: ID!) {
    wishlistItems(userId: $userId) {
      id
      userId
      itemId
      type
      name
      imageUrl
    }
  }
`;

const ADD_REVIEW = gql`
  mutation AddReview($bookId: ID!, $review: ReviewInput!) {
    addReview(bookId: $bookId, review: $review) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const UPDATE_REVIEW = gql`
  mutation UpdateReview($bookId: ID!, $reviewer: String!, $updatedReview: ReviewInput!) {
    updateReview(bookId: $bookId, reviewer: $reviewer, updatedReview: $updatedReview) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($bookId: ID!, $reviewer: String!) {
    deleteReview(bookId: $bookId, reviewer: $reviewer) {
      id
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

const Book = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  
  const { loading, error, data, refetch } = useQuery(GET_BOOK_DETAILS, {
    variables: { id },
  });

  const book = data?.book;

  const { data: cartData, refetch: refetchCart } = useQuery(VIEW_CART, {
    variables: { userId: user?.id || "placeholder-id" },
  });
    
  // Mutations
  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART);
  const [removeFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART);
  const [addReview] = useMutation(ADD_REVIEW);
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  const [addWishlistItem, { loading: wishlistLoading }] = useMutation(
    ADD_WISHLIST_ITEM,
    {
      update(cache, { data: { addWishlistItem } }) {
        try {
          const existing = cache.readQuery({
            query: GET_WISHLIST_ITEMS,
            variables: { userId: user.id },
          });
          if (existing && existing.wishlistItems) {
            cache.writeQuery({
              query: GET_WISHLIST_ITEMS,
              variables: { userId: user.id },
              data: {
                wishlistItems: [...existing.wishlistItems, addWishlistItem],
              },
            });
          }
        } catch (e) {
          console.warn("Cache update skipped:", e);
        }
      },
      onCompleted() {
        setWishlistMessage("Book added to wishlist!");
        setTimeout(() => setWishlistMessage(""), 3000);
      },
      onError(err) {
        console.error("Wishlist error:", err);
        setWishlistMessage("Failed to add book to wishlist.");
        setTimeout(() => setWishlistMessage(""), 3000);
      },
    }
  );

  // State hooks
  const [cartMessage, setCartMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  
  const existingReview = book?.reviews.find((r) => r.reviewer === user?.username);
  
  useEffect(() => {
    if (cartData) {
      const bookInCart = cartData.cartItems.find((item) => item.itemId === id);
      setCartQuantity(bookInCart ? bookInCart.quantity : 0);
    }
  }, [cartData, id]);

  useEffect(() => {
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating.toString());
    }
  }, [existingReview]);

  useEffect(() => {
    if (cartMessage) {
      const timer = setTimeout(() => setCartMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartMessage]);

  useEffect(() => {
    if (reviewMessage) {
      const timer = setTimeout(() => setReviewMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [reviewMessage]);

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to add items to the cart.");
      return;
    }
    try {
      const response = await addToCart({
        variables: { userId: user.id, itemId: id, type: "book" },
      });
      setCartMessage(
        response.data.addToCart.message || "Book added to cart successfully!"
      );
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
      setCartMessage(
        response.data.removeFromCart.message || "Book removed from cart!"
      );
      refetchCart();
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to remove the book from cart. Please try again.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!user || !user.id) {
      setWishlistMessage("Please log in to add items to the wishlist.");
      return;
    }
    try {
      await addWishlistItem({
        variables: {
          input: {
            userId: user.id,
            itemId: id,
            type: "book",
            name: data.book.title,
            imageUrl: data.book.imageUrl,
          },
        },
      });
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user?.username) return;
    const review = { reviewer: user.username, comment, rating: parseFloat(rating) };
  
    try {
      if (existingReview) {
        await updateReview({ variables: { bookId: id, reviewer: user.username, updatedReview: review } });
        setReviewMessage("Review updated successfully!");
      } else {
        await addReview({ variables: { bookId: id, review } });
        setReviewMessage("Review added successfully!");
      }
      refetch();
    } catch (err) {
      setReviewMessage("Error saving review. Please try again.");
      console.error(err);
    }
  };
  
  const handleDeleteReview = async () => {
    try {
      await deleteReview({ variables: { bookId: id, reviewer: user.username } });
      setComment("");
      setRating("");
      setReviewMessage("Review deleted.");
      refetch();
    } catch (err) {
      setReviewMessage("Failed to delete review.");
      console.error(err);
    }
  };

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
      <p>Loading book details...</p>
    </div>
  );
  
  if (error) return (
    <div style={styles.errorContainer}>
      <h2>Error</h2>
      <p>{error.message}</p>
    </div>
  );
  
  if (!book) return (
    <div style={styles.errorContainer}>
      <h2>Not Found</h2>
      <p>Book not found.</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.bookDetails}>
        <div style={styles.imageContainer}>
          <img
            src={`${book.imageUrl}`}
            alt={book.title}
            style={styles.bookImage}
          />
        </div>
        <div style={styles.bookInfo}>
          <h1 style={styles.bookTitle}>{book.title}</h1>
          <p style={styles.authorName}>By {book.author}</p>
          
          <div style={styles.ratingContainer}>
            <div style={styles.stars}>
              {renderStars(book.ratings)}
            </div>
            <span style={styles.ratingText}>
              {book.ratings.toFixed(1)} ({book.reviews.length} {book.reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <div style={styles.priceSection}>
            <span style={styles.price}>${book.price.toFixed(2)}</span>
          </div>
          
          <div style={styles.actionButtons}>
            <div style={styles.cartActions}>
              <div style={styles.cartQuantityControl}>
                <button
                  onClick={handleRemoveFromCart}
                  style={cartQuantity > 0 ? styles.quantityButton : styles.quantityButtonDisabled}
                  disabled={removeLoading || cartQuantity === 0}
                >
                  {removeLoading ? "..." : "-"}
                </button>
                <span style={styles.cartQuantity}>{cartQuantity}</span>
                <button
                  onClick={handleAddToCart}
                  style={styles.quantityButton}
                  disabled={addLoading}
                >
                  {addLoading ? "..." : "+"}
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                style={styles.addToCartButton}
                disabled={addLoading}
              >
                {addLoading ? "Adding..." : cartQuantity > 0 ? "Add More to Cart" : "Add to Cart"}
              </button>
            </div>
            
            <button
              onClick={handleAddToWishlist}
              style={styles.wishlistButton}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? "Adding..." : "♡ Wishlist"}
            </button>
          </div>
          
          {cartMessage && <div style={styles.messageBox}>{cartMessage}</div>}
          {wishlistMessage && <div style={styles.messageBox}>{wishlistMessage}</div>}
        </div>
      </div>
      
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          <button 
            style={activeTab === "description" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button 
            style={activeTab === "reviews" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({book.reviews.length})
          </button>
        </div>
        
        <div style={styles.tabContent}>
          {activeTab === "description" && (
            <div style={styles.description}>
              <p>
                This is a fascinating book that will captivate readers with its engaging storyline and memorable characters.
                {/* Note: You'd typically fetch this from your API */}
              </p>
            </div>
          )}
          
          {activeTab === "reviews" && (
            <div style={styles.reviewsContainer}>
              {book.reviews.length > 0 ? (
                book.reviews.map((review, i) => (
                  <div key={i} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewerName}>{review.reviewer}</span>
                      <div style={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p style={styles.noReviews}>No reviews yet. Be the first to review this book!</p>
              )}
              
              {user && (
                <div style={styles.reviewFormContainer}>
                  <h3 style={styles.reviewFormTitle}>
                    {existingReview ? "Update Your Review" : "Write a Review"}
                  </h3>
                  
                  <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                    <div style={styles.ratingInputContainer}>
                      <label style={styles.ratingLabel}>Your Rating:</label>
                      <div style={styles.ratingInput}>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          placeholder="0.0 - 5.0"
                          required
                          style={styles.ratingField}
                        />
                        <span style={styles.ratingScale}>/ 5</span>
                      </div>
                    </div>
                    
                    <div style={styles.commentContainer}>
                      <label style={styles.commentLabel}>Your Review:</label>
                      <textarea
                        placeholder="Share your thoughts about this book..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        style={styles.commentField}
                      />
                    </div>
                    
                    <div style={styles.reviewButtonsContainer}>
                      <button type="submit" style={styles.submitReviewButton}>
                        {existingReview ? "Update Review" : "Submit Review"}
                      </button>
                      
                      {existingReview && (
                        <button
                          type="button"
                          onClick={handleDeleteReview}
                          style={styles.deleteReviewButton}
                        >
                          Delete Review
                        </button>
                      )}
                    </div>
                  </form>
                  
                  {reviewMessage && (
                    <div style={styles.reviewMessageBox}>{reviewMessage}</div>
                  )}
                </div>
              )}
              
              {!user && (
                <div style={styles.loginPrompt}>
                  <p>Please log in to leave a review.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    color: "#333",
    backgroundColor: "#f9f9f9",
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
  },
  
  // Book details section
  bookDetails: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "30px",
    marginBottom: "30px",
  },
  imageContainer: {
    flex: "0 0 280px",
    display: "flex",
    justifyContent: "center",
  },
  bookImage: {
    width: "100%",
    maxWidth: "280px",
    height: "auto",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
  bookInfo: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
  },
  bookTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "0",
    marginBottom: "8px",
    color: "#1a1a1a",
  },
  authorName: {
    fontSize: "18px",
    color: "#555",
    marginTop: "0",
    marginBottom: "20px",
  },
  
  // Rating section
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  stars: {
    display: "flex",
    marginRight: "10px",
    fontSize: "20px",
  },
  starFilled: {
    color: "#ffc107",
  },
  starHalf: {
    color: "#ffc107",
    position: "relative",
  },
  starEmpty: {
    color: "#e4e5e9",
  },
  ratingText: {
    fontSize: "16px",
    color: "#666",
  },
  
  // Price section
  priceSection: {
    marginBottom: "25px",
  },
  price: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#038552",
  },
  
  // Action buttons
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  cartActions: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  cartQuantityControl: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
  },
  quantityButton: {
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f0f0f0",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f0f0f0",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "not-allowed",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartQuantity: {
    width: "50px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
  },
  addToCartButton: {
    flex: "1",
    padding: "0 30px",
    height: "45px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  wishlistButton: {
    height: "45px",
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  messageBox: {
    padding: "10px 15px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "6px",
    fontSize: "14px",
    marginTop: "15px",
    animation: "fadeIn 0.3s ease-in-out",
  },
  
  // Tabs section
  tabsContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e0e0e0",
  },
  tab: {
    padding: "15px 25px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    padding: "15px 25px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid #007BFF",
    fontSize: "16px",
    fontWeight: "600",
    color: "#007BFF",
    cursor: "pointer",
  },
  tabContent: {
    padding: "30px",
  },
  
  // Description tab
  description: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
  },
  
  // Reviews tab
  reviewsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  noReviews: {
    fontSize: "16px",
    color: "#666",
    fontStyle: "italic",
  },
  reviewCard: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  reviewerName: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#444",
  },
  reviewStars: {
    display: "flex",
    fontSize: "16px",
  },
  reviewComment: {
    margin: "0",
    fontSize: "15px",
    lineHeight: "1.5",
  },
  
  // Review form
  reviewFormContainer: {
    marginTop: "10px",
    padding: "25px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  reviewFormTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "20px",
    color: "#333",
  },
  reviewForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  ratingInputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ratingLabel: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#444",
  },
  ratingInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  ratingField: {
    width: "100px",
    padding: "10px 12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },
  ratingScale: {
    color: "#666",
    fontSize: "16px",
  },
  commentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  commentLabel: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#444",
  },
  commentField: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  reviewButtonsContainer: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  submitReviewButton: {
    padding: "12px 25px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteReviewButton: {
    padding: "12px 25px",
    backgroundColor: "#fff",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  reviewMessageBox: {
    marginTop: "20px",
    padding: "10px 15px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "6px",
    fontSize: "14px",
  },
  loginPrompt: {
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px dashed #dee2e6",
  },
};

export default Book;
export {
  GET_BOOK_DETAILS,
  ADD_REVIEW,
};