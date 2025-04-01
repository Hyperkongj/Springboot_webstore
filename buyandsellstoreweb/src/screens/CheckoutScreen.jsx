import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useUserContext } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $userId: ID!
    $items: [CartItemInput!]!
    $totalPrice: Float!
    $billing: Address
    $shipping: Address
    $payment: PaymentInput!
  ) {
    createOrder(
      userId: $userId
      items: $items
      totalPrice: $totalPrice
      billing: $billing
      shipping: $shipping
      payment: $payment
    ) {
      success
      message
      order {
        id
        totalPrice
        createdAt
        items {
          itemId
          type
          name
          quantity
          price
          imageUrl
        }
      }
    }
  }
`;

const CheckoutScreen = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cartItems, totalPrice } = state || {};

  const [billingAddress, setBillingAddress] = useState(user.billing?.[0] || {});
  const [shippingAddress, setShippingAddress] = useState(user.shipping?.[0] || {});
  const [creditCard, setCreditCard] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({ cardNumber: "", expiry: "", cvv: "" });

  const [createOrder] = useMutation(CREATE_ORDER);

  //Format Card Number: Add spaces every 4 digits
  const formatCardNumber = (value) => {
    return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  };

  //Validate Card Number (16 digits)
  const handleCardNumberChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 16);

    const formattedValue = numericValue.replace(/(.{4})/g, "$1 ").trim();

    setCreditCard({ ...creditCard, cardNumber: formattedValue });

    const isValid = numericValue.length === 16;
    setErrors({ ...errors, cardNumber: isValid ? "" : "Card number must be 16 digits" });
  };

  //Validate Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    setCreditCard({ ...creditCard, expiry: value });

    const [month, year] = value.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!month || !year || month < 1 || month > 12) {
      setErrors({ ...errors, expiry: "Invalid expiry format (MM/YY)" });
    } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setErrors({ ...errors, expiry: "Card has expired" });
    } else {
      setErrors({ ...errors, expiry: "" });
    }
  };

  //Validate CVV (3 or 4 digits)
  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCreditCard({ ...creditCard, cvv: value });

    const isValid = value.length === 3 || value.length === 4;
    setErrors({ ...errors, cvv: isValid ? "" : "CVV must be 3 or 4 digits" });
  };

  const handlePlaceOrder = async () => {
    if (errors.cardNumber || errors.expiry || errors.cvv) {
      alert("Please fix validation errors before placing an order.");
      return;
    }

    try {
      const sanitizedBilling = { ...billingAddress };
      const sanitizedShipping = { ...shippingAddress };
      delete sanitizedBilling.__typename;
      delete sanitizedShipping.__typename;

      const response = await createOrder({
        variables: {
          userId: user.id,
          items: cartItems.map((item) => ({
            itemId: item.itemId,
            type: item.type,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
          totalPrice,
          billing: sanitizedBilling,
          shipping: sanitizedShipping,
          payment: {
            cardNumber: creditCard.cardNumber.replace(/\s/g, ""), // Remove spaces before sending
            expiry: creditCard.expiry,
            cvv: creditCard.cvv,
          },
        },
      });

      if (response.data.createOrder.success) {
        alert("Order placed successfully!");
        navigate("/order", { state: { order: response.data.createOrder.order } });
      } else {
        alert("Failed to place order: " + response.data.createOrder.message);
      }
    } catch (error) {
      console.error("Error placing order:", error.message);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Checkout</h1>

      {/* Shipping Address Selection */}
      <div style={styles.section}>
        <h2>Shipping Address</h2>
        <select
          value={JSON.stringify(shippingAddress)}
          onChange={(e) => setShippingAddress(JSON.parse(e.target.value))}
          style={styles.select}
        >
          {user.shipping.map((address, index) => (
            <option key={index} value={JSON.stringify(address)}>
              {`${address.type}: ${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Details */}
      <div style={styles.section}>
        <h2>Payment Details</h2>
        <input
          type="text"
          placeholder="Card Number"
          value={creditCard.cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          style={styles.input}
        />
        {errors.cardNumber && <p style={styles.error}>{errors.cardNumber}</p>}

        <input
          type="text"
          placeholder="Expiry (MM/YY)"
          value={creditCard.expiry}
          onChange={handleExpiryChange}
          style={styles.input}
        />
        {errors.expiry && <p style={styles.error}>{errors.expiry}</p>}

        <input
          type="password"
          placeholder="CVV"
          value={creditCard.cvv}
          onChange={handleCVVChange}
          style={styles.input}
        />
        {errors.cvv && <p style={styles.error}>{errors.cvv}</p>}
      </div>

      <button onClick={handlePlaceOrder} style={styles.button}>Place Order</button>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
  },
  section: { marginBottom: "20px" },
  input: {
    padding: "10px",
    margin: "10px 0",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    width: "300px",
  },
  select: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  button: {
    padding: "10px 20px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "-10px",
    marginBottom: "10px",
  },
};

export default CheckoutScreen;