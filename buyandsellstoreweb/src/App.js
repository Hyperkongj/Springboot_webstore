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
import HomeItemsScreen from "./screens/HomeItemsScreen";
import Header from "./components/Header";
import CartScreen from "./screens/CartScreen";
// Import the books list and detail components
import Books from "./screens/BooksScreen"; // List of books
import Book from "./screens/BookDetailScreen"; // Book detail view
import CheckoutScreen from "./screens/CheckoutScreen";
import ProfileScreen from "./screens/ProfileScreen"
// NEW: Import your new Wishlist screen
import WishlistScreen from "./screens/WishlistScreen"; // <-- ADD THIS

// Clean __typename from variables
const cleanTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = omitDeep(operation.variables, "__typename");
  }
  return forward(operation);
});

// GraphQL link configuration
const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
  credentials: "include",
});

// Apollo client
const client = new ApolloClient({
  link: from([cleanTypenameLink, httpLink]),
  cache: new InMemoryCache(),
});

// Protected Route component to check authentication
const ProtectedRoute = ({ children }) => {
  const { user } = useUserContext();
  return user ? children : <Navigate to="/login" replace />;
};

// Separated AppRoutes for better control
const AppRoutes = () => {
  const { user } = useUserContext();

  return (
    <>
      {/* Render Header only if the user is logged in */}
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
          element={user ? <Books /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/homeitems"
          element={user ? <HomeItemsScreen /> : <Navigate to="/login" replace />}
        />
        {/* Book Detail Route */}
        <Route
          path="/book/:id"
          element={user ? <Book /> : <Navigate to="/login" replace />}
        />

        {/* NEW: Wishlist (Protected) */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistScreen />
            </ProtectedRoute>
          }
        />

         {/* NEW: Profile (Protected) */}
         <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />



        {/* Catch-all: redirect based on login */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkoutScreen"
          element={
            <ProtectedRoute>
              <CheckoutScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

// App component
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
