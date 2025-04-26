import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useUserContext } from '../context/UserContext';
import '../styles/Inventory.css';

// Book Query
const GET_BOOKS_BY_SELLER = gql`
  query GetBooksBySellerId($sellerId: String!) {
    getBooksBySellerId(sellerId: $sellerId) {
      id
      title
      type
      author
      price
      imageUrl
      description
      ratings
      sellerId
      totalQuantity
      reviews {
        reviewer
        comment
        rating
      }
    }
  }
`;

// HomeItem Query
const GET_HOME_ITEMS_BY_SELLER = gql`
  query GetHomeItemsBySellerId($sellerId: String!) {
    getHomeItemsBySellerId(sellerId: $sellerId) {
      id
      title
      type
      description
      price
      imageUrl
      manufacturer
      ratings
      reviews {
        reviewer
        comment
        rating
      }
      sellerId
      totalQuantity
    }
  }
`;

const Inventory = () => {
  const { user } = useUserContext();
  const sellerId = user?.id;

  const { loading: loadingBooks, error: errorBooks, data: dataBooks } = useQuery(GET_BOOKS_BY_SELLER, {
    variables: { sellerId },
    skip: !sellerId,
  });

  const { loading: loadingHomeItems, error: errorHomeItems, data: dataHomeItems } = useQuery(GET_HOME_ITEMS_BY_SELLER, {
    variables: { sellerId },
    skip: !sellerId,
  });

  if (!sellerId) {
    return <p>Loading user information...</p>;
  }

  if (loadingBooks || loadingHomeItems) return <p>Loading inventory...</p>;
  if (errorBooks) return <p>Error loading books: {errorBooks.message}</p>;
  if (errorHomeItems) return <p>Error loading home items: {errorHomeItems.message}</p>;

  return (
    <div className="inventory-container">
      <h1 className="inventory-title">Inventory</h1>

      {/* Books Section */}
      <h2 className="inventory-subtitle">Books</h2>
      {dataBooks.getBooksBySellerId.length === 0 ? (
        <p>No books found for this seller.</p>
      ) : (
        <div className="inventory-grid">
          {dataBooks.getBooksBySellerId.map((book) => (
            <div className="inventory-card" key={book.id}>
              {book.totalQuantity < 20 && <div className="low-stock-badge">Low Stock</div>}
              <img src={book.imageUrl} alt={book.title} className="inventory-image" />
              <h3 className="inventory-card-title">{book.title}</h3>
              <p className="inventory-card-subtitle">Author: {book.author}</p>
              <p>Price: ${book.price.toFixed(2)}</p>
              <p className={book.totalQuantity < 20 ? 'low-stock-text' : ''}>
                Quantity: {book.totalQuantity}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Home Items Section */}
      <h2 className="inventory-subtitle">Home Items</h2>
      {dataHomeItems.getHomeItemsBySellerId.length === 0 ? (
        <p>No home items found for this seller.</p>
      ) : (
        <div className="inventory-grid">
          {dataHomeItems.getHomeItemsBySellerId.map((item) => (
            <div className="inventory-card" key={item.id}>
              {item.totalQuantity < 20 && <div className="low-stock-badge">Low Stock</div>}
              <img src={item.imageUrl} alt={item.title} className="inventory-image" />
              <h3 className="inventory-card-title">{item.title}</h3>
              <p className="inventory-card-subtitle">Manufacturer: {item.manufacturer}</p>
              <p>Price: ${item.price.toFixed(2)}</p>
              <p className={item.totalQuantity < 20 ? 'low-stock-text' : ''}>
                Quantity: {item.totalQuantity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
