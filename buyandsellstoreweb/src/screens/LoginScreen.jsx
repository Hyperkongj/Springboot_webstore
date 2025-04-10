import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import styled, { ThemeProvider } from "styled-components";

const lightTheme = {
  background: "#f4f6f8",
  cardBg: "#ffffff",
  text: "#121212",
  inputBg: "#ffffff",
  inputBorder: "#ccc",
  buttonBg: "#007BFF",
  buttonText: "#ffffff",
  link: "#007BFF",
  error: "#d9534f",
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
  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";
  const { login: setUser } = useUserContext();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await login({ variables: { username, password } });
      if (response.data.login.success) {
        setUser(response.data.login.user);
        navigate("/home");
      } else {
        setErrorMessage(response.data.login.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <PageWrapper>
        <ThemeToggle onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </ThemeToggle>
        <Card>
          <Title>Login</Title>
          <form onSubmit={handleLogin}>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          {errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>}
          <Links>
            <LinkButton onClick={() => navigate("/forgotpassword")}>
              Forgot Password?
            </LinkButton>
            <p>
              Don’t have an account?{" "}
              <LinkButton onClick={() => navigate("/signup")}>Sign Up</LinkButton>
            </p>
          </Links>
        </Card>
      </PageWrapper>
    </ThemeProvider>
  );
};

export default LoginScreen;

// ------------------ Styled Components ------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
  transition: background-color 0.3s ease;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h1`
  margin-bottom: 24px;
  font-size: 28px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttonBg};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMsg = styled.p`
  margin-top: 15px;
  color: ${({ theme }) => theme.error};
  font-size: 14px;
`;

const Links = styled.div`
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.link};
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.link};
`;

