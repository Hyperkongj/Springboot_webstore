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
    $phone: String!
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
      phone: $phone
      isSeller: $isSeller
      billing: $billing
      shipping: $shipping
    ) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isSeller
        phone
        billing {
          street
          city
          state
          zip
          country
        }
        shipping {
          street
          city
          state
          zip
          country
        }
      }
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
    phone: "",
    isSeller: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const [signup] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: value && !emailRegex.test(value) ? "Invalid email format." : "",
      }));
    }

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) {
        return; // Prevent input update if it's invalid
      }
      setErrors((prev) => ({
        ...prev,
        phone: value.length > 0 && value.length < 10 ? "Phone number must be 10 digits." : "",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (errors.email || errors.phone) {
      return; // Prevent submission if there are validation errors
    }

    try {
      const response = await signup({ variables: { ...formData } });
      if (response.data.signup.success) {
        navigate("/login");
      } else {
        setErrors((prev) => ({ ...prev, form: response.data.signup.message }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: "An error occurred during sign-up." }));
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
        {errors.email && <p style={styles.error}>{errors.email}</p>}
        
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
        {errors.phone && <p style={styles.error}>{errors.phone}</p>}

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isSeller"
            checked={formData.isSeller}
            onChange={handleChange}
          />
          Is Seller
        </label>
        <button
          type="submit"
          style={styles.button}
          disabled={errors.email || errors.phone}
        >
          Sign Up
        </button>
        {errors.form && <p style={styles.error}>{errors.form}</p>}
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
    cursor: "pointer",
  },
  checkboxLabel: { fontSize: "14px", margin: "10px 0", textAlign: "left" },
  error: { color: "red", marginTop: "5px", fontSize: "14px" },
};

export default SignUpScreen;
