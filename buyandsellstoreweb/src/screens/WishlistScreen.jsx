// src/screens/WishlistScreen.jsx
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { useQuery, useMutation, gql } from "@apollo/client";
import Header from "../components/Header";

// Change this to your server address if needed:
const API_BASE_URL = "http://localhost:8080";

// 1. Query to fetch wishlist items for the user
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

// 2. Mutation to remove an item from the wishlist
const REMOVE_WISHLIST_ITEM = gql`
  mutation removeWishlistItem($id: ID!) {
    removeWishlistItem(id: $id) {
      success
      message
    }
  }
`;

// 3. Mutation to add an item to the cart
const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $itemId: ID!, $type: String!) {
    addToCart(userId: $userId, itemId: $itemId, type: $type) {
      success
      message
    }
  }
`;

const WishlistScreen = () => {
  const { user } = useUserContext();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartMessage, setCartMessage] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");

  // Fetch the wishlist items
  const { data, loading, error, refetch } = useQuery(GET_WISHLIST_ITEMS, {
    variables: { userId: user?.id },
    skip: !user, // Don’t run if user is not logged in
  });

  // Remove from wishlist
  const [removeWishlistItem] = useMutation(REMOVE_WISHLIST_ITEM, {
    onCompleted: (data) => {
      setRemoveMessage(data.removeWishlistItem.message);
      refetch(); // Refresh the wishlist
    },
    onError: (err) => {
      console.error("Error removing wishlist item:", err);
      setRemoveMessage("Failed to remove item from wishlist.");
    },
  });

  // Add to cart
  const [addToCart, { loading: cartLoading }] = useMutation(ADD_TO_CART, {
    onCompleted: (data) => {
      setCartMessage(data.addToCart.message);
      // Optionally remove the item from the wishlist here if desired
    },
    onError: (err) => {
      console.error("Error adding to cart:", err);
      setCartMessage("Failed to add item to cart.");
    },
  });

  // Update local state whenever the query data changes
  useEffect(() => {
    if (data && data.wishlistItems) {
      setWishlistItems(data.wishlistItems);
    }
  }, [data]);

  // Handler to remove an item from the wishlist
  const handleRemove = async (id) => {
    try {
      await removeWishlistItem({ variables: { id } });
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  // Handler to add a wishlist item to the cart
  const handleAddToCart = async (item) => {
    if (!user || !user.id) {
      setCartMessage("Please log in to add items to the cart.");
      return;
    }
    try {
      await addToCart({
        variables: { userId: user.id, itemId: item.itemId, type: item.type },
      });
    } catch (err) {
      console.error("Error adding item to cart:", err);
    }
  };

  if (loading) return <p>Loading wishlist...</p>;
  if (error) return <p>Error loading wishlist items</p>;

  return (
    <div>
      {/* If you already render <Header /> in a parent component, remove or comment this out to avoid double headers */}
      

      <h1>Your Wishlist</h1>
      {removeMessage && <p style={{ color: "red" }}>{removeMessage}</p>}
      {cartMessage && <p style={{ color: "green" }}>{cartMessage}</p>}

      {wishlistItems.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {wishlistItems.map((item) => (
            <li
              key={item.id}
              style={{
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {/* FIX: Prepend API_BASE_URL to show image properly */}
              <img
                src={`${API_BASE_URL}${item.imageUrl}`}
                alt={item.name}
                width="100"
              />

              {/* Item details and action buttons */}
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontWeight: "bold" }}>{item.name}</p>

                {/* Button: Add to Cart */}
                <button
                  onClick={() => handleAddToCart(item)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#007BFF",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  disabled={cartLoading}
                >
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>

                {/* Button: Remove from Wishlist */}
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishlistScreen;
