import "./App.css";
import React from "react";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";

import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  from,
} from "@apollo/client";
import { UserProvider} from "./context/UserContext"; // Import UserProvider and useUserContext
import omitDeep from "omit-deep-lodash"; //
import ForgotPassword from "./screens/ForgotPasswordScreen";
import ResetPassword from "./screens/ResetPasswordScreen";

// Middleware to remove __typename from all requests
const cleanTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = omitDeep(operation.variables, "__typename"); //
  }
  return forward(operation);
});

// Define GraphQL API endpoint
const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql", //
  credentials: "include",
});

// Initialize Apollo Client with middleware
const client = new ApolloClient({
  link: from([cleanTypenameLink, httpLink]), //
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  </ApolloProvider>
);
export default App;
