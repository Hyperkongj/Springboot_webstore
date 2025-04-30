import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useUserContext } from '../context/UserContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import styled from 'styled-components';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Filler
);

// GraphQL queries
const GET_SELLER_STATS = gql`
  query getSellerStatistics($sellerId: ID!) {
    getSellerStatistics(sellerId: $sellerId) {
      totalBuyers
      totalPurchases
      totalRevenue
      purchasedBooks {
        id
        title
        author
        price
        imageUrl
      }
    }
  }
`;
// Add these GraphQL queries to SalesAnalytics.jsx
// Update the GraphQL queries in SalesAnalytics.jsx

const GET_SELLER_ANALYTICS = gql`
  query GetSellerSalesAnalytics($sellerId: ID!, $timeFrame: String) {
    getSellerSalesAnalytics(sellerId: $sellerId, timeFrame: $timeFrame) {
      totalBuyers
      totalPurchases
      totalRevenue
      averageOrderValue
    }
  }
`;

const GET_TOP_PRODUCTS = gql`
  query GetTopSellingProducts($sellerId: ID!, $timeFrame: String, $metric: String, $limit: Int) {
    getTopSellingProducts(sellerId: $sellerId, timeFrame: $timeFrame, metric: $metric, limit: $limit) {
      id
      name
      type
      quantity
      revenue
      imageUrl
    }
  }
`;

const GET_CATEGORY_SALES = gql`
  query GetSalesByCategory($sellerId: ID!, $timeFrame: String) {
    getSalesByCategory(sellerId: $sellerId, timeFrame: $timeFrame) {
      categories {
        name
        count
        revenue
      }
    }
  }
`;

const GET_REVENUE_OVER_TIME = gql`
  query GetRevenueOverTime($sellerId: ID!, $timeFrame: String, $groupBy: String) {
    getRevenueOverTime(sellerId: $sellerId, timeFrame: $timeFrame, groupBy: $groupBy) {
      timeLabels
      revenueValues
    }
  }
`;
const GET_SOLD_ITEMS = gql`
  query GetSoldItemsBySellerId($sellerId: String!) {
    getSoldItemsBySellerId(sellerId: $sellerId) {
      itemId
      type
      name
      quantity
      price
      imageUrl
      createdAt
    }
  }
`;

const SalesAnalytics = () => {
  const { user } = useUserContext();
  const sellerId = user?.id;
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch seller statistics
  const { 
    data: statsData, 
    loading: statsLoading 
  } = useQuery(GET_SELLER_STATS, {
    variables: { sellerId },
    skip: !sellerId,
  });

  // Fetch sold items with details
  const { 
    data: itemsData, 
    loading: itemsLoading 
  } = useQuery(GET_SOLD_ITEMS, {
    variables: { sellerId },
    skip: !sellerId,
  });

  // Inside your SalesAnalytics component:
// Replace the existing queries with these:

const { 
    data: analyticsData, 
    loading: analyticsLoading 
  } = useQuery(GET_SELLER_ANALYTICS, {
    variables: { sellerId, timeFrame: timeFilter },
    skip: !sellerId,
  });
  
  const { 
    data: topProductsData, 
    loading: productsLoading 
  } = useQuery(GET_TOP_PRODUCTS, {
    variables: { 
      sellerId, 
      timeFrame: timeFilter, 
      metric: selectedMetric,
      limit: 5
    },
    skip: !sellerId,
  });
  
  const { 
    data: categorySalesData, 
    loading: categoriesLoading 
  } = useQuery(GET_CATEGORY_SALES, {
    variables: { sellerId, timeFrame: timeFilter },
    skip: !sellerId,
  });
  
  const { 
    data: revenueTimeData, 
    loading: revenueLoading 
  } = useQuery(GET_REVENUE_OVER_TIME, {
    variables: { 
      sellerId, 
      timeFrame: timeFilter,
      groupBy: timeFilter === 'week' ? 'daily' : 'monthly'
    },
    skip: !sellerId,
  });

  const [salesData, setSalesData] = useState({
    dailyRevenue: [],
    topProducts: [],
    salesByCategory: [],
    revenueGrowth: []
  });

  useEffect(() => {
    if (itemsData?.getSoldItemsBySellerId) {
      processSalesData(itemsData.getSoldItemsBySellerId);
    }
  }, [itemsData, timeFilter, dateRange]);

  const processSalesData = (items) => {
    // Filter items based on time filter
    const filteredItems = filterItemsByTime(items);
    
    // Process daily revenue data
    const dailyRevenueData = processDailyRevenue(filteredItems);
    
    // Process top products by quantity or revenue
    const topProductsData = processTopProducts(filteredItems);
    
    // Process sales by category
    const categoryData = processSalesByCategory(filteredItems);
    
    // Process revenue growth over time
    const growthData = processRevenueGrowth(filteredItems);
    
    setSalesData({
      dailyRevenue: dailyRevenueData,
      topProducts: topProductsData,
      salesByCategory: categoryData,
      revenueGrowth: growthData
    });
  };

  const filterItemsByTime = (items) => {
    if (timeFilter === 'all') return items;
    
    const now = new Date();
    let cutoffDate;
    
    switch(timeFilter) {
      case 'today':
        cutoffDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'custom':
        if (dateRange.startDate && dateRange.endDate) {
          return items.filter(item => {
            const itemDate = new Date(item.createdAt);
            return itemDate >= new Date(dateRange.startDate) && 
                  itemDate <= new Date(dateRange.endDate);
          });
        }
        return items;
      default:
        return items;
    }
    
    return items.filter(item => new Date(item.createdAt) >= cutoffDate);
  };

  const processDailyRevenue = (items) => {
    const dailyData = {};
    
    items.forEach(item => {
      const date = new Date(item.createdAt).toLocaleDateString();
      const revenue = item.price * item.quantity;
      
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += revenue;
    });
    
    // Convert to array format for ChartJS
    return {
      labels: Object.keys(dailyData),
      values: Object.values(dailyData)
    };
  };

  const processTopProducts = (items) => {
    // Group by product name and sum quantities/revenue
    const products = {};
    
    items.forEach(item => {
      if (!products[item.name]) {
        products[item.name] = {
          quantity: 0,
          revenue: 0,
          imageUrl: item.imageUrl
        };
      }
      
      products[item.name].quantity += item.quantity;
      products[item.name].revenue += item.price * item.quantity;
    });
    
    // Convert to array and sort
    const productArray = Object.entries(products).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
      imageUrl: data.imageUrl
    }));
    
    // Sort based on selected metric
    const sortedProducts = productArray.sort((a, b) => 
      selectedMetric === 'revenue' 
        ? b.revenue - a.revenue 
        : b.quantity - a.quantity
    ).slice(0, 5); // Get top 5
    
    return sortedProducts;
  };

  const processSalesByCategory = (items) => {
    const categories = {
      books: { count: 0, revenue: 0 },
      home: { count: 0, revenue: 0 }
    };
    
    items.forEach(item => {
      if (categories[item.type]) {
        categories[item.type].count += item.quantity;
        categories[item.type].revenue += item.price * item.quantity;
      }
    });
    
    return {
      labels: Object.keys(categories),
      values: Object.values(categories).map(cat => cat.count),
      revenue: Object.values(categories).map(cat => cat.revenue)
    };
  };

  const processRevenueGrowth = (items) => {
    // For revenue growth, group by month
    const monthlyData = {};
    
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const revenue = item.price * item.quantity;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += revenue;
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
    
    return {
      labels: sortedMonths,
      values: sortedMonths.map(month => monthlyData[month])
    };
  };

  if (statsLoading || itemsLoading) {
    return (
      <LoadingWrapper>
        <Spinner />
        <p>Loading sales data...</p>
      </LoadingWrapper>
    );
  }

// Replace the stats data with analyticsData
const stats = analyticsData?.getSellerSalesAnalytics || {
    totalBuyers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };
  
  // Update chart data
  const revenueChartData = {
    labels: revenueTimeData?.getRevenueOverTime.timeLabels || [],
    datasets: [
      {
        label: 'Revenue Over Time',
        data: revenueTimeData?.getRevenueOverTime.revenueValues || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  // Display the top products
  const topProducts = topProductsData?.getTopSellingProducts || [];

  const categoryChartData = {
    labels: salesData.salesByCategory.labels,
    datasets: [
      {
        label: 'Sales by Category',
        data: salesData.salesByCategory.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const growthChartData = {
    labels: salesData.revenueGrowth.labels,
    datasets: [
      {
        label: 'Monthly Revenue Growth',
        data: salesData.revenueGrowth.values,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>📊 Sales Analytics Dashboard</DashboardTitle>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Time Period:</FilterLabel>
            <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </Select>
          </FilterGroup>

          {timeFilter === 'custom' && (
            <DateRangeContainer>
              <DateInput
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <span>to</span>
              <DateInput
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </DateRangeContainer>
          )}
          
          <FilterGroup>
            <FilterLabel>Metric:</FilterLabel>
            <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="revenue">Revenue</option>
              <option value="quantity">Quantity</option>
            </Select>
          </FilterGroup>
        </FilterContainer>
      </DashboardHeader>

      {/* Stats Overview Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatContent>
            <StatValue>{stats.totalBuyers}</StatValue>
            <StatLabel>Total Buyers</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>🛒</StatIcon>
          <StatContent>
            <StatValue>{stats.totalPurchases}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatContent>
            <StatValue>${stats.totalRevenue?.toFixed(2)}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon>📈</StatIcon>
          <StatContent>
            <StatValue>${stats.totalRevenue > 0 ? (stats.totalRevenue / stats.totalPurchases).toFixed(2) : '0.00'}</StatValue>
            <StatLabel>Average Order Value</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Charts */}
      <ChartGrid>
        <ChartCard fullWidth>
          <ChartHeading>Daily Revenue</ChartHeading>
          <ChartContainer>
            <Bar 
              data={revenueChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } }
                }
              }}
            />
          </ChartContainer>
        </ChartCard>

        <ChartCard>
          <ChartHeading>Sales by Category</ChartHeading>
          <ChartContainer>
            <Pie 
              data={categoryChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false },
                }
              }}
            />
          </ChartContainer>
        </ChartCard>

        <ChartCard>
          <ChartHeading>Revenue Growth</ChartHeading>
          <ChartContainer>
            <Line 
              data={growthChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } }
                }
              }}
            />
          </ChartContainer>
        </ChartCard>
      </ChartGrid>

      {/* Top Products */}
      <Section>
        <SectionTitle>Top Performing Products</SectionTitle>
        <TopProductsGrid>
          {salesData.topProducts.map((product, index) => (
            <ProductCard key={index}>
              <ProductRank>{index + 1}</ProductRank>
              <ProductImage src={product.imageUrl} alt={product.name} />
              <ProductDetails>
                <ProductName>{product.name}</ProductName>
                <ProductStat>
                  {selectedMetric === 'revenue' 
                    ? `$${product.revenue.toFixed(2)} Revenue` 
                    : `${product.quantity} Units Sold`}
                </ProductStat>
              </ProductDetails>
            </ProductCard>
          ))}
        </TopProductsGrid>
      </Section>

      {/* Recent Sales */}
      <Section>
        <SectionTitle>Recent Sales</SectionTitle>
        <RecentSalesTable>
          <thead>
            <tr>
              <TableHeader>Date</TableHeader>
              <TableHeader>Product</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Total</TableHeader>
            </tr>
          </thead>
          <tbody>
            {itemsData?.getSoldItemsBySellerId.slice(0, 10).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <ProductCellContent>
                    <SmallProductImage src={item.imageUrl} alt={item.name} />
                    <span>{item.name}</span>
                  </ProductCellContent>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </RecentSalesTable>
      </Section>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  padding: 30px;
  max-width: 1300px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  margin-bottom: 30px;
`;

const DashboardTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 20px;
  color: #1e293b;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: #64748b;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #1e293b;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-right: 20px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 5px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  grid-column: ${props => props.fullWidth ? '1 / span 2' : 'auto'};
`;

const ChartHeading = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #334155;
`;

const ChartContainer = styled.div`
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #334155;
`;

const TopProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  position: relative;
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ProductRank = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  width: 32px;
  height: 32px;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const ProductDetails = styled.div`
  text-align: center;
  width: 100%;
`;

const ProductName = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #334155;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductStat = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const RecentSalesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 500;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
`;

const ProductCellContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SmallProductImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 5px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default SalesAnalytics;