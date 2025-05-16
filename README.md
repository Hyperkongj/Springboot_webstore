# 🛒 Buy & Sell Store: E-Commerce Platform

<div align="center">
  
![Buy & Sell Store](https://img.shields.io/badge/Buy%20%26%20Sell-Store-blue?style=for-the-badge&logo=shopify)

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?style=flat-square&logo=graphql&logoColor=white)](https://graphql.org/)

*A modern e-commerce platform for buying and selling books and home items*

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
cd target
java -jar latest snapshot file something like  

# The server will start on http://localhost:8080
