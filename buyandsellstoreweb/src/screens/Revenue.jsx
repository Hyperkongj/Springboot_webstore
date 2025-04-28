import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useUserContext } from "../context/UserContext";
import "../styles/Revenue.css"; // ✅ Import the CSS file

const GET_SOLD_ITEMS_BY_SELLER_ID = gql`
  query GetSoldItemsBySellerId($sellerId: String!) {
    getSoldItemsBySellerId(sellerId: $sellerId) {
      itemId
      type
      name
      quantity
      price
      imageUrl
      sellerId
      createdAt
    }
  }
`;

const Revenue = () => {
  const { user } = useUserContext();
  const sellerId = user?.id;

  const { loading, error, data, refetch } = useQuery(GET_SOLD_ITEMS_BY_SELLER_ID, {
    variables: { sellerId },
    skip: !sellerId,
    fetchPolicy: "network-only", // always go to backend for latest data
  });

  const [filteredItems, setFilteredItems] = useState([]);
  const [yearFilter, setYearFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    if (sellerId) {
      refetch(); // 🔥 force refresh from server when sellerId available
    }
  }, [sellerId, refetch]);

  useEffect(() => {
    if (data?.getSoldItemsBySellerId) {
      setFilteredItems(data.getSoldItemsBySellerId);
    }
  }, [data]);

  const applyFilters = () => {
    let items = data?.getSoldItemsBySellerId || [];

    if (yearFilter) {
      items = items.filter((item) => {
        const itemYear = new Date(item.createdAt).getFullYear();
        return itemYear.toString() === yearFilter;
      });
    }

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      items = items.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= start && createdAt <= end;
      });
    }

    setFilteredItems(items);
  };

  const totalRevenue = filteredItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!sellerId) return <p>Loading user...</p>;
  if (loading) return <p>Loading revenue data...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="revenue-container">
      <h1>Revenue Dashboard</h1>

      {/* Total Revenue Card */}
      <div className="revenue-card">
        <div>
          <h2>💵 Total Revenue</h2>
          <p>Updated based on applied filters</p>
        </div>
        <div className="revenue-amount">
          ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <h3>Filters</h3>
        <input
          type="text"
          placeholder="Filter by Year (e.g., 2025)"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      {/* Items */}
      <div className="items-grid">
        {filteredItems.map((item) => (
          <div key={item.itemId} className="item-card">
            <img src={item.imageUrl} alt={item.name} />
            <h4>{item.name}</h4>
            <p>Quantity Sold: {item.quantity}</p>
            <p>Price: ${item.price}</p>
            <p>
              Ordered At: {new Date(item.createdAt).toLocaleDateString("en-US")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Revenue;
