package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.model.SoldItem;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.repository.HomeItemRepository;
import com.buyandsellstore.app.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SellerAnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private HomeItemRepository homeItemRepository;

    public Map<String, Object> getSellerSalesAnalytics(String sellerId, String timeFrame) {
        Map<String, Object> analytics = new HashMap<>();
        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = filterOrdersByTimeFrame(allOrders, timeFrame);
        
        int totalPurchases = 0;
        double totalRevenue = 0.0;
        Set<String> uniqueBuyers = new HashSet<>();
        
        for (Order order : filteredOrders) {
            boolean buyerAdded = false;
            
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    totalPurchases += item.getQuantity();
                    totalRevenue += item.getQuantity() * item.getPrice();
                    
                    if (!buyerAdded) {
                        uniqueBuyers.add(order.getUserId());
                        buyerAdded = true;
                    }
                }
            }
        }
        
        analytics.put("totalBuyers", uniqueBuyers.size());
        analytics.put("totalPurchases", totalPurchases);
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("averageOrderValue", totalPurchases > 0 ? totalRevenue / totalPurchases : 0);
        
        return analytics;
    }
    
    public List<Map<String, Object>> getTopSellingProducts(
            String sellerId, String timeFrame, String metric, Integer limit) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = filterOrdersByTimeFrame(allOrders, timeFrame);
        
        // Extract all items for this seller from the filtered orders
        List<CartItem> sellerItems = new ArrayList<>();
        for (Order order : filteredOrders) {
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    sellerItems.add(item);
                }
            }
        }
        
        // Group items by itemId and calculate metrics
        Map<String, Map<String, Object>> productMetrics = new HashMap<>();
        
        for (CartItem item : sellerItems) {
            String itemId = item.getItemId();
            String type = item.getType();
            
            if (!productMetrics.containsKey(itemId)) {
                Map<String, Object> metrics = new HashMap<>();
                metrics.put("id", itemId);
                metrics.put("name", item.getName());
                metrics.put("type", type);
                metrics.put("quantity", 0);
                metrics.put("revenue", 0.0);
                metrics.put("imageUrl", item.getImageUrl());
                
                productMetrics.put(itemId, metrics);
            }
            
            Map<String, Object> metrics = productMetrics.get(itemId);
            int currentQuantity = (int) metrics.get("quantity");
            double currentRevenue = (double) metrics.get("revenue");
            
            metrics.put("quantity", currentQuantity + item.getQuantity());
            metrics.put("revenue", currentRevenue + (item.getQuantity() * item.getPrice()));
        }
        
        // Convert to list and sort by the specified metric
        List<Map<String, Object>> productList = new ArrayList<>(productMetrics.values());
        
        if ("revenue".equals(metric)) {
            productList.sort((a, b) -> Double.compare((double) b.get("revenue"), (double) a.get("revenue")));
        } else {
            productList.sort((a, b) -> Integer.compare((int) b.get("quantity"), (int) a.get("quantity")));
        }
        
        // Apply limit
        int resultLimit = limit != null && limit > 0 ? limit : 5;
        return productList.stream().limit(resultLimit).collect(Collectors.toList());
    }
    
    public Map<String, Object> getSalesByCategory(String sellerId, String timeFrame) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = filterOrdersByTimeFrame(allOrders, timeFrame);
        
        Map<String, Map<String, Object>> categories = new HashMap<>();
        categories.put("books", createCategoryMetrics("books"));
        categories.put("home", createCategoryMetrics("home"));
        
        for (Order order : filteredOrders) {
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    String type = item.getType().toLowerCase();
                    
                    if (categories.containsKey(type)) {
                        Map<String, Object> metrics = categories.get(type);
                        int count = (int) metrics.get("count");
                        double revenue = (double) metrics.get("revenue");
                        
                        metrics.put("count", count + item.getQuantity());
                        metrics.put("revenue", revenue + (item.getQuantity() * item.getPrice()));
                    }
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("categories", categories);
        
        return result;
    }
    
    public Map<String, Object> getRevenueOverTime(String sellerId, String timeFrame, String groupBy) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> filteredOrders = filterOrdersByTimeFrame(allOrders, timeFrame);
        
        Map<String, Double> timeBasedRevenue = new HashMap<>();
        
        for (Order order : filteredOrders) {
            String timeKey = formatTimeKey(order.getCreatedAt(), groupBy);
            
            double orderRevenue = 0.0;
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    orderRevenue += item.getQuantity() * item.getPrice();
                }
            }
            
            if (orderRevenue > 0) {
                timeBasedRevenue.put(timeKey, 
                        timeBasedRevenue.getOrDefault(timeKey, 0.0) + orderRevenue);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("timeLabels", new ArrayList<>(timeBasedRevenue.keySet()));
        result.put("revenueValues", new ArrayList<>(timeBasedRevenue.values()));
        
        return result;
    }
    
    private Map<String, Object> createCategoryMetrics(String category) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("name", category);
        metrics.put("count", 0);
        metrics.put("revenue", 0.0);
        return metrics;
    }
    
    private String formatTimeKey(Date date, String groupBy) {
        if (date == null) return "unknown";
        
        LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        
        if ("daily".equals(groupBy)) {
            return localDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        } else if ("weekly".equals(groupBy)) {
            int weekOfYear = localDate.get(java.time.temporal.WeekFields.ISO.weekOfYear());
            return "Week " + weekOfYear + ", " + localDate.getYear();
        } else if ("monthly".equals(groupBy)) {
            return localDate.getMonth().toString() + " " + localDate.getYear();
        } else {
            // Default to monthly
            return localDate.getMonth().toString() + " " + localDate.getYear();
        }
    }
    
    private List<Order> filterOrdersByTimeFrame(List<Order> orders, String timeFrame) {
        if (timeFrame == null || "all".equalsIgnoreCase(timeFrame)) {
            return orders;
        }
        
        LocalDateTime cutoffDate;
        LocalDateTime now = LocalDateTime.now();
        
        switch (timeFrame.toLowerCase()) {
            case "today":
                cutoffDate = now.truncatedTo(ChronoUnit.DAYS);
                break;
            case "week":
                cutoffDate = now.minus(7, ChronoUnit.DAYS);
                break;
            case "month":
                cutoffDate = now.minus(30, ChronoUnit.DAYS);
                break;
            case "year":
                cutoffDate = now.minus(365, ChronoUnit.DAYS);
                break;
            default:
                return orders;
        }
        
        return orders.stream()
                .filter(order -> {
                    if (order.getCreatedAt() == null) return false;
                    LocalDateTime orderDate = order.getCreatedAt().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    return orderDate.isAfter(cutoffDate);
                })
                .collect(Collectors.toList());
    }
}