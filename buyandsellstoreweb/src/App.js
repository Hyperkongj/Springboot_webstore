import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import Books from "./screens/BooksScreen";
import Book from "./screens/BookDetailScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import WishlistScreen from "./screens/WishlistScreen";
import SellerDashboard from "./screens/SellerDashboard";
import SellerHome from "./screens/SellerHome";
import ManageInventory from "./screens/ManageInventory";

// GraphQL Apollo Client setup
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

const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: from([cleanTypenameLink, httpLink]),
  cache: new InMemoryCache(),
});

// Reusable Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useUserContext();
  return user ? children : <Navigate to="/login" replace />;
};

// Layout Wrapper to hide header on public pages
const Layout = ({ children }) => {
  const { user } = useUserContext();
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/signup", "/forgotpassword", "/reset-password"];

  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && user && <Header />}
      {children}
    </>
  );
};

// All routes
const AppRoutes = () => (
  <Layout>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignUpScreen />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Optional Seller public access */}
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/manageinventory" element={<ManageInventory />} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/sellerHome" element={<ProtectedRoute><SellerHome /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path="/book/:id" element={<ProtectedRoute><Book /></ProtectedRoute>} />
      <Route path="/homeitems" element={<ProtectedRoute><HomeItemsScreen /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistScreen /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartScreen /></ProtectedRoute>} />
      <Route path="/checkoutScreen" element={<ProtectedRoute><CheckoutScreen /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </Layout>
);
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

// Root App
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
