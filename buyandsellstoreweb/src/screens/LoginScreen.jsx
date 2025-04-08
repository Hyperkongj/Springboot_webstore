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
  const [isSellerMode, setIsSellerMode] = useState(false);
  const { login: setUser } = useUserContext();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await login({ variables: { username, password } });

      if (response.data.login.success) {
        const user = response.data.login.user;

        if (user.isSeller && !isSellerMode) {
          setErrorMessage("This account is registered as a seller. Please check 'Login as Seller' to continue.");
          return;
        } else if (!user.isSeller && isSellerMode) {
          setErrorMessage("This is a user account, not a seller. Uncheck 'Login as Seller' to continue.");
          return;
        }

        setUser(user);

        if (user.isSeller) {
          localStorage.setItem("sellerId", user.id);
          navigate("/seller-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        setErrorMessage(response.data.login.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: isSellerMode ? "#000" : "#fff",
        color: isSellerMode ? "#fff" : "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", gap: "20px" }}>
            <label style={{ fontSize: "14px", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!isSellerMode}
                onChange={() => setIsSellerMode(false)}
                style={{ marginRight: "6px" }}
              />
              Login as User
            </label>

            <label style={{ fontSize: "14px", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isSellerMode}
                onChange={() => setIsSellerMode(true)}
                style={{ marginRight: "6px" }}
              />
              Login as Seller
            </label>
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <p style={styles.forgotPassword}>
          <button onClick={() => navigate("/forgotpassword")} style={styles.forgotPasswordButton}>
            Forgot Password?
          </button>
        </p>
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} style={styles.signupButton}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    width: "90%",
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  forgotPassword: {
    marginTop: "15px",
    fontSize: "14px",
  },
  forgotPasswordButton: {
    background: "none",
    border: "none",
    color: "#007BFF",
    textDecoration: "underline",
    cursor: "pointer",
    padding: "0",
    fontSize: "14px",
  },
  signupText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#333",
  },
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
