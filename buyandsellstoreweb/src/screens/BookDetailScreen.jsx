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

<<<<<<< Updated upstream
=======
// New mutation for adding a wishlist item
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

// New query to read wishlist items from cache (used for updating the cache)
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

>>>>>>> Stashed changes
const Book = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  
  const { loading, error, data, refetch } = useQuery(GET_BOOK_DETAILS, {
    variables: { id },
  });

  const { data: cartData, refetch: refetchCart } = useQuery(VIEW_CART, {
    variables: { userId: user?.id || "placeholder-id" }, // ✅ always runs
  });
    
  //Mutations
  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART);
  const [removeFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART);
<<<<<<< Updated upstream
=======
  const [addReview] = useMutation(ADD_REVIEW);
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);


  // Updated mutation for adding to wishlist with cache update logic
  const [addWishlistItem, { loading: wishlistLoading }] = useMutation(
    ADD_WISHLIST_ITEM,
    {
      update(cache, { data: { addWishlistItem } }) {
        try {
          // Read the current wishlist from the cache for the logged-in user
          const existing = cache.readQuery({
            query: GET_WISHLIST_ITEMS,
            variables: { userId: user.id },
          });
          if (existing && existing.wishlistItems) {
            // Write back the new wishlist array including the new item
            cache.writeQuery({
              query: GET_WISHLIST_ITEMS,
              variables: { userId: user.id },
              data: {
                wishlistItems: [...existing.wishlistItems, addWishlistItem],
              },
            });
          }
        } catch (e) {
          // If the cache is empty or the query hasn't been run yet,
          // no update is needed.
          console.warn("Cache update skipped:", e);
        }
      },
      onCompleted() {
        setWishlistMessage("Book added to wishlist!");
      },
      onError(err) {
        console.error("Wishlist error:", err);
        setWishlistMessage("Failed to add book to wishlist.");
      },
    }
  );

  //Hooks
>>>>>>> Stashed changes
  const [cartMessage, setCartMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  //const existingReview = book.reviews.find((r) => r.reviewer === user?.username);




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

<<<<<<< Updated upstream
  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>Error loading book details: {error.message}</p>;
=======
  // Handler for adding a book to the wishlist
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
  
>>>>>>> Stashed changes

  //if (loading) return <p>Loading book details...</p>;
  //if (error) return <p>Error loading book details: {error.message}</p>;

<<<<<<< Updated upstream
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
=======
  const book = data?.book;
  const existingReview = book?.reviews?.find((r) => r.reviewer === user?.username);

  // Now hooks
  useEffect(() => {
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating);
    } else {
      setComment("");
      setRating("");
    }
  }, [existingReview]);
  
  //const book = data?.book;

return (
  <div style={styles.container}>
    {loading ? (
      <p>Loading book details...</p>
    ) : error ? (
      <p>Error loading book details: {error.message}</p>
    ) : book ? (
      <>
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

            <div style={styles.wishlistSection}>
              <button
                onClick={handleAddToWishlist}
                style={styles.wishlistButton}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? "Adding..." : "Add to Wishlist"}
              </button>
              {wishlistMessage && (
                <p style={styles.wishlistMessage}>{wishlistMessage}</p>
              )}
            </div>
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

        {user && (
          <form onSubmit={handleSubmitReview} style={{ marginTop: 20 }}>
            <h3>{existingReview ? "Update" : "Add"} Your Review</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a review"
              required
            />
            <br />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (0-5)"
              required
            />
            <br />
            <button type="submit">
              {existingReview ? "Update Review" : "Add Review"}
            </button>
            {existingReview && (
              <button type="button" onClick={handleDeleteReview}>
                Delete Review
              </button>
            )}
            {reviewMessage && <p>{reviewMessage}</p>}
          </form>
        )}
      </>
    ) : (
      <p>Book not found.</p>
    )}
  </div>
);

>>>>>>> Stashed changes
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
