import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const GET_HOME_ITEM_DETAILS = gql`
  query GetHomeItem($id: ID!) {
    homeItem(id: $id) {
      id
      title
      type
      description
      price
      imageUrl
      manufacturer
      ratings
      totalQuantity
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

const HomeItem = () => {
  const { id } = useParams();
  const { user } = useUserContext();

  const { loading, error, data } = useQuery(GET_HOME_ITEM_DETAILS, {
    variables: { id },
  });

  const [addToCart, { loading: addLoading }] = useMutation(ADD_TO_CART);
  const [removeFromCart, { loading: removeLoading }] = useMutation(REMOVE_FROM_CART);

  const [cartMessage, setCartMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    // Optional: You can fetch cart quantity here if needed
  }, []);

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to add items to the cart.");
      return;
    }
    try {
      const response = await addToCart({
        variables: { userId: user.id, itemId: id, type: "home" },
      });
      setCartQuantity(cartQuantity + 1);
      setCartMessage(response.data.addToCart.message || "Item added to cart!");
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user || !user.id) {
      setCartMessage("Please log in to manage your cart.");
      return;
    }
    try {
      const response = await removeFromCart({
        variables: { userId: user.id, itemId: id, type: "home" },
      });
      setCartQuantity(Math.max(0, cartQuantity - 1));
      setCartMessage(response.data.removeFromCart.message || "Item removed from cart.");
    } catch (err) {
      console.error(err);
      setCartMessage("Failed to remove from cart.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading item: {error.message}</p>;

  const item = data?.homeItem;
  if (!item) return <p>Item not found.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.bookDetails}>
        <img
          src={item.imageUrl}
          alt={item.title}
          style={styles.bookImage}
        />
        <div style={styles.bookInfo}>
          <h1>{item.title}</h1>
          <p><strong>Type:</strong> {item.type}</p>
          <p><strong>Manufacturer:</strong> {item.manufacturer}</p>
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
          <p><strong>Ratings:</strong> {item.ratings.toFixed(1)} / 5</p>
          <p><strong>Available Quantity:</strong> {item.totalQuantity}</p>
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
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  bookDetails: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  bookImage: {
    width: "250px",
    height: "250px",
    objectFit: "contain",
  },
  bookInfo: { maxWidth: "600px" },
  cartButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
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
};

export default HomeItem;
