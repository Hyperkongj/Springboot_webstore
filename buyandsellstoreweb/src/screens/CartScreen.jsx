import React, { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

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

const CartScreen = () => {
  const { user } = useUserContext(); // Get the user from UserContext
  const userId = user?.id; // Extract userId from the user object
  const navigate = useNavigate();

  const { loading, error, data, refetch } = useQuery(VIEW_CART, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  const [addToCart] = useMutation(ADD_TO_CART);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  const [cartMessages, setCartMessages] = useState({});
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  if (!userId) {
    return <p>Error: User not logged in or user ID is missing.</p>;
  }

  if (loading) return <p>Loading your cart...</p>;
  if (error) return <p>Error loading cart: {error.message}</p>;

  const cartItems = data?.cartItems || [];

  const handleAddToCart = async (itemId, type) => {
    try {
      const response = await addToCart({
        variables: { userId, itemId, type },
      });
      const message = response.data.addToCart.message || "Item added to cart!";
      setCartMessages((prev) => ({ ...prev, [itemId]: message }));
      refetch();
    } catch (err) {
      console.error("Error adding item to cart:", err.message);
      setCartMessages((prev) => ({ ...prev, [itemId]: "Failed to add item." }));
    }
  };

  const handleRemoveFromCart = async (itemId, type) => {
    try {
      const response = await removeFromCart({
        variables: { userId, itemId, type },
      });
      const message =
        response.data.removeFromCart.message || "Item removed from cart!";
      setCartMessages((prev) => ({ ...prev, [itemId]: message }));
      refetch();
    } catch (err) {
      console.error("Error removing item from cart:", err.message);
      setCartMessages((prev) => ({
        ...prev,
        [itemId]: "Failed to remove item.",
      }));
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* <Header /> */}
      <div style={styles.container}>
        <h1>Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty. Start shopping!</p>
        ) : (
          <div style={styles.cartList}>
            <ul style={styles.list}>
              {cartItems.map((item, index) => (
                <li key={index} style={styles.listItem}>
                  <div style={styles.itemDetails}>
                    <img
                      src={`${item.imageUrl}`}
                      alt={item.name}
                      style={styles.itemImage}
                    />
                    <div>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <p>Type: {item.type}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price.toFixed(2)}</p>
                      <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                      {cartMessages[item.itemId] && (
                        <p
                          style={{
                            color: "green",
                            fontWeight: "bold",
                            marginTop: "8px",
                          }}
                        >
                          {cartMessages[item.itemId]}
                        </p>
                      )}
                      <div style={styles.cartButtons}>
                        <button
                          onClick={() =>
                            handleRemoveFromCart(item.itemId, item.type)
                          }
                          style={styles.cartButton}
                        >
                          -
                        </button>
                        <span style={styles.cartQuantity}>{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleAddToCart(item.itemId, item.type)
                          }
                          style={styles.cartButton}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <h2 style={styles.totalPrice}>
              Total Price: ${totalPrice.toFixed(2)}
            </h2>
            <button
              onClick={() =>
                navigate("/CheckoutScreen", {
                  state: { cartItems, totalPrice }, // Pass cart items and total price via state
                })
              }
              style={styles.button}
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
  },
  cartList: {
    marginTop: "20px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  listItem: {
    borderBottom: "1px solid #ddd",
    padding: "10px 0",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  itemDetails: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  itemImage: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "5px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
  },
  itemName: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  cartButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  cartButton: {
    padding: "5px 10px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  button: {
    padding: "5px 10px",
    background: "#ffd700", // Updated to yellow
    color: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  cartQuantity: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  totalPrice: {
    marginTop: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#007BFF",
  },
};

export default CartScreen;
