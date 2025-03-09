import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
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
          type
          street
          city
          state
          zip
          country
        }
        shipping {
          type
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


const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login: setUser } = useUserContext(); // Access login from UserContext
  const [login, { loading }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error message

    try {
      const response = await login({ variables: { username, password } });

      if (response.data.login.success) {
        // Set user data in context
        setUser(response.data.login.user);

        navigate("/home"); // Redirect to home screen
      } else {
        setErrorMessage(response.data.login.message); // Display error message
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {errorMessage && <p style={styles.error}>{errorMessage}</p>} {/* Error message */}
      <p style={styles.signupText}>
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          style={styles.signupButton}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    padding: "10px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: { color: "red", marginTop: "10px" }, // Error message styling
  signupText: { marginTop: "15px", fontSize: "14px", color: "#333" },
  signupButton: {
    background: "none",
    border: "none",
    color: "#007BFF",
    textDecoration: "underline",
    cursor: "pointer",
    padding: "0",
  },
};

export default LoginScreen;
