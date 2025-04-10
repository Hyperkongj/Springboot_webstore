import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
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

const lightTheme = {
  background: "#f4f6f8",
  cardBg: "#ffffff",
  text: "#121212",
  inputBg: "#ffffff",
  inputBorder: "#ccc",
  buttonBg: "#007BFF",
  buttonText: "#ffffff",
  link: "#007BFF",
  error: "#e63946",
};

const darkTheme = {
  background: "#121212",
  cardBg: "#1e1e1e",
  text: "#ffffff",
  inputBg: "#2c2c2c",
  inputBorder: "#444",
  buttonBg: "#1a73e8",
  buttonText: "#ffffff",
  link: "#66b2ff",
  error: "#ff6b6b",
};

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
          setErrorMessage("This is a user account. Uncheck 'Login as Seller' to continue.");
          return;
        }

        setUser(user);
        if (user.isSeller) {
          localStorage.setItem("sellerId", user.id);
          navigate("/sellerHome");
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

  const theme = isSellerMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <Card>
          <Title>Login</Title>
          <Form onSubmit={handleLogin}>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ToggleGroup>
              <label>
                <input
                  type="checkbox"
                  checked={!isSellerMode}
                  onChange={() => setIsSellerMode(false)}
                />
                Login as User
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={isSellerMode}
                  onChange={() => setIsSellerMode(true)}
                />
                Login as Seller
              </label>
            </ToggleGroup>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>
          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
          <LinkText onClick={() => navigate("/forgotpassword")}>
            Forgot Password?
          </LinkText>
          <LinkText>
            Don’t have an account?{" "}
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </LinkText>
        </Card>
      </Wrapper>
    </ThemeProvider>
  );
};

export default LoginScreen;

export const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.background};
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  padding: 40px;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 24px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background-color: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  border-radius: 8px;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttonBg};
  }
`;

export const Button = styled.button`
  padding: 12px;
  background-color: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    opacity: 0.95;
  }
`;

export const ToggleGroup = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 6px;
  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.error};
  font-size: 14px;
  margin-top: 10px;
`;

export const LinkText = styled.p`
  margin-top: 15px;
  font-size: 14px;
  color: ${({ theme }) => theme.link};
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.link};
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
  }
  cursor: pointer;
`;