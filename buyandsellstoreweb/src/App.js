// App.js

import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  from,
} from "@apollo/client";

import omitDeep from "omit-deep-lodash";
import { UserProvider, useUserContext } from "./context/UserContext";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPassword from "./screens/ForgotPasswordScreen";
import ResetPassword from "./screens/ResetPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import BooksScreen from "./screens/BooksScreen";
import HomeItemsScreen from "./screens/HomeItemsScreen";
import Header from "./components/Header";

// Clean __typename
const cleanTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = omitDeep(operation.variables, "__typename");
  }
  return forward(operation);
});

// GraphQL link
const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
  credentials: "include",
});

// Apollo client
const client = new ApolloClient({
  link: from([cleanTypenameLink, httpLink]),
  cache: new InMemoryCache(),
});

// 🔸 Separated AppRoutes for better control
const AppRoutes = () => {
  const { user } = useUserContext();

  return (
    <>
      {/* Only show Header if user is logged in */}
      {user && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={user ? <HomeScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/books"
          element={user ? <BooksScreen /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/homeitems"
          element={user ? <HomeItemsScreen /> : <Navigate to="/login" replace />}
        />

        {/* Catch-all: redirect based on login */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />
      </Routes>
    </>
  );
};

// 🔸 App component
const App = () => (
  <ApolloProvider client={client}>
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  </ApolloProvider>
);

export default App;
