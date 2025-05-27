
# 🛒 Buy & Sell Store: E-Commerce Platform

<div align="center">
  
![Buy & Sell Store](https://img.shields.io/badge/Buy%20%26%20Sell-Store-blue?style=for-the-badge&logo=shopify)

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?style=flat-square&logo=graphql&logoColor=white)](https://graphql.org/)

*A modern e-commerce platform for  buying and selling books and home items *

[Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Demo](#live-demo) • [Installation](#installation) • [Screenshots](#screenshots) • [API Documentation](#api-documentation) • [Contributors](#contributors)

</div>

<img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-banner.png" alt="Platform Showcase" width="100%">

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td width="33%" align="center">
        <h3>👤 User Features</h3>
        <ul align="left">
          <li>User/Seller Registration</li>
          <li>Authentication & Password Reset</li>
          <li>Profile Management</li>
          <li>Multiple Address Support</li>
        </ul>
      </td>
      <td width="33%" align="center">
        <h3>🛍️ Shopping Features</h3>
        <ul align="left">
          <li>Product Browsing & Search</li>
          <li>Shopping Cart Management</li>
          <li>Wishlist & Favorites</li>
          <li>Secure Checkout Process</li>
        </ul>
      </td>
      <td width="33%" align="center">
        <h3>💼 Seller Dashboard</h3>
        <ul align="left">
          <li>Product Management</li>
          <li>Inventory Tracking</li>
          <li>Sales Analytics</li>
          <li>Revenue Reporting</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

## 🚀 Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <h3>Backend</h3>
        <p>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="Spring Boot" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" alt="GraphQL" width="40" height="40"/>
        </p>
        <p>Spring Boot 3.4.3 • MongoDB • GraphQL • JWT Auth • Maven</p>
      </td>
      <td align="center" width="50%">
        <h3>Frontend</h3>
        <p>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40"/>&nbsp;
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apollo/apollo-original.svg" alt="Apollo" width="40" height="40"/>
        </p>
        <p>React 19.0 • Apollo Client • React Router • Chart.js • Styled Components</p>
      </td>
    </tr>
  </table>
</div>

## 🏗️ Architecture

<div align="center">
  <img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-architecture.png" alt="Architecture Diagram" width="80%">
</div>

The application follows a modern client-server architecture with:

- **Backend**: RESTful & GraphQL APIs built with Spring Boot
- **Database**: MongoDB for flexible document storage
- **Frontend**: React SPA with Apollo Client for GraphQL integration
- **Authentication**: Token-based auth with password reset capability
- **File Storage**: Local file system for product images

## 🎮 Live Demo

> **Try it out**: [Buy & Sell Store Demo](https://yourdemolink.com)
> 
> **Test Accounts**:
> - User: `test@example.com` / Password: `Test123!`
> - Seller: `seller@example.com` / Password: `Sell123!`

## ⚙️ Installation

<details>
<summary>Prerequisites</summary>

- Java 17 or higher
- Node.js 14+ and npm
- MongoDB 4.4+
- Maven 3.6+

</details>

<details>
<summary>Backend Setup</summary>

```bash
# Clone the repository
git clone https://github.com/yourusername/buyandsellstore.git
cd buyandsellstore

# Navigate to backend directory
cd buyandsellstore

# Build and run with Maven
mvn clean install
mvn spring-boot:run

# The server will start on http://localhost:8080
```

</details>

<details>
<summary>Frontend Setup</summary>

```bash
# Navigate to frontend directory
cd buyandsellstoreweb

# Install dependencies
npm install

# Start development server
npm start

# The application will be available at http://localhost:3000
```

</details>

<details>
<summary>Environment Configuration</summary>

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GRAPHQL_URL=http://localhost:8080/graphql
```

</details>

## 📱 Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-home.png" alt="Home Screen" width="100%"></td>
      <td><img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-product.png" alt="Product Details" width="100%"></td>
    </tr>
    <tr>
      <td><img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-cart.png" alt="Shopping Cart" width="100%"></td>
      <td><img src="https://raw.githubusercontent.com/raihanrms/Storage/main/ecommerce-dashboard.png" alt="Seller Dashboard" width="100%"></td>
    </tr>
  </table>
</div>

## 📊 API Documentation

Our GraphQL API provides a flexible way to query and manipulate data. Here are some key operations:

<details>
<summary>Authentication</summary>

```graphql
# User Login
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
    }
  }
}

# User Registration
mutation Signup(
  $username: String!,
  $email: String!,
  $password: String!,
  $firstName: String!,
  $lastName: String!,
  $phone: String!,
  $isSeller: Boolean!
) {
  signup(
    username: $username,
    email: $email,
    password: $password,
    firstName: $firstName,
    lastName: $lastName,
    phone: $phone,
    isSeller: $isSeller
  ) {
    success
    message
    user {
      id
      username
    }
  }
}
```

</details>

<details>
<summary>Products</summary>

```graphql
# Query All Books
query GetBooks {
  books {
    id
    title
    author
    price
    imageUrl
    ratings
  }
}

# Query Home Items
query GetHomeItems {
  homeItems {
    id
    title
    price
    imageUrl
    manufacturer
    ratings
  }
}
```

</details>

<details>
<summary>Shopping Cart</summary>

```graphql
# Add to Cart
mutation AddToCart($userId: ID!, $itemId: ID!, $type: String!) {
  addToCart(userId: $userId, itemId: $itemId, type: $type) {
    success
    message
  }
}

# View Cart
query GetCartItems($userId: ID!) {
  cartItems(id: $userId) {
    itemId
    type
    name
    quantity
    price
    imageUrl
  }
}
```

</details>

## 🧪 Testing

The project includes comprehensive test coverage:

- Backend: JUnit 5 tests with Mockito for services and controllers
- Frontend: React Testing Library for component tests

```bash
# Run backend tests
cd buyandsellstore
mvn test

# Run frontend tests
cd buyandsellstoreweb
npm test
```

## 🤝 Contributors

<div align="center">
  <a href="https://github.com/contributor1">
    <img src="https://github.com/identicons/contributor1.png" width="50px" alt="Contributor 1" style="border-radius:50%"/>
  </a>
  <a href="https://github.com/contributor2">
    <img src="https://github.com/identicons/contributor2.png" width="50px" alt="Contributor 2" style="border-radius:50%"/>
  </a>
  <a href="https://github.com/contributor3">
    <img src="https://github.com/identicons/contributor3.png" width="50px" alt="Contributor 3" style="border-radius:50%"/>
  </a>
</div>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    <a href="https://github.com/yourusername/buyandsellstore/issues/new">Report Bug</a> •
    <a href="https://github.com/yourusername/buyandsellstore/issues/new">Request Feature</a>
  </p>
  
  <p>Made with ❤️ by Group 3 - CS5394 Software Development</p>
  
  <p>
    <a href="https://github.com/yourusername/buyandsellstore/stargazers">
      <img src="https://img.shields.io/github/stars/yourusername/buyandsellstore?style=social" alt="Stars">
    </a>
    <a href="https://github.com/yourusername/buyandsellstore/network/members">
      <img src="https://img.shields.io/github/forks/yourusername/buyandsellstore?style=social" alt="Forks">
    </a>
  </p>
</div>
```

