import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import "../styles/HomeItems.css";

const GET_HOME_ITEMS = gql`
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
`;

const HomeItemsScreen = () => {
  const { loading, error, data } = useQuery(GET_HOME_ITEMS);

  if (loading) return <p>Loading home items...</p>;
  if (error) return <p>Error loading items: {error.message}</p>;

  return (
    <div className="home-items-container">
      <h2>🏠 Home Items</h2>
      <div className="home-items-grid">
        {data.homeItems.map((item) => (
          <Link
            to={`/home-item/${item.id}`}
            key={item.id}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="home-item-card">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="home-item-image"
              />
              <h3 className="home-item-title">{item.title}</h3>
              <p className="home-item-price">${item.price.toFixed(2)}</p>
              <p className="home-item-manufacturer">By {item.manufacturer}</p>
              <p className="home-item-rating">⭐ {item.ratings}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeItemsScreen;
