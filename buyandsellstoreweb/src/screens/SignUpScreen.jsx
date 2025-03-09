import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const SIGNUP_MUTATION = gql`
  mutation Signup(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $phone: Int!
    $isSeller: Boolean!
    $billing: [Address]
    $shipping: [Address] 
  ) {
    signup(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      isSeller: $isSeller
      phone: $phone
      billing: $billing
      shipping: $shipping
    ) {
      success
      message
    }
  }
`;

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: 1234567891,
    isSeller: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [signup] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        setErrorMessage("Phone number must be up to 10 digits.");
        return;
      } else {
        setErrorMessage(""); // Clear the error if valid
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signup({ variables: { ...formData } });
      if (response.data.signup.success) {
        navigate("/login");
      } else {
        setErrorMessage(response.data.signup.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred during sign-up.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isSeller"
            checked={formData.isSeller}
            onChange={handleChange}
          />
          Is Seller
        </label>
        <button type="submit" style={styles.button}>
          Sign Up
        </button>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "16px" },
  button: {
    padding: "10px",
    background: "#28A745",
    color: "#fff",
    border: "none",
  },
  checkboxLabel: { fontSize: "14px", margin: "10px 0", textAlign: "left" },
  error: { color: "red", marginTop: "10px" },
};

export default SignUpScreen;
