package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.SellerStats;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.model.SoldItem;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.repository.HomeItemRepository;
import com.buyandsellstore.app.repository.OrderRepository;
import com.buyandsellstore.app.service.SellerAnalyticsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class SellerResolver {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private HomeItemRepository homeItemRepository;
    
    @Autowired
    private SellerAnalyticsService sellerAnalyticsService;

    @QueryMapping(name = "getSellerStatistics")
    public SellerStats getSellerStatistics(@Argument String sellerId) {
        List<Order> allOrders = orderRepository.findAll();

        int totalPurchases = 0;
        double totalRevenue = 0.0;
        Set<String> uniqueBuyers = new HashSet<>();
        List<Book> purchasedBooks = new ArrayList<>();

        for (Order order : allOrders) {
            boolean buyerAdded = false;

            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    totalPurchases += item.getQuantity();
                    totalRevenue += item.getQuantity() * item.getPrice();

                    if ("book".equalsIgnoreCase(item.getType())) {
                        bookRepository.findById(item.getItemId()).ifPresent(purchasedBooks::add);
                    }

                    if (!buyerAdded) {
                        uniqueBuyers.add(order.getUserId());
                        buyerAdded = true;
                    }
                }
            }
        }

        return new SellerStats(uniqueBuyers.size(), totalPurchases, totalRevenue, purchasedBooks);
    }
    
    @QueryMapping(name = "getSellerSalesAnalytics") 
    public Map<String, Object> getSellerSalesAnalytics(@Argument String sellerId, @Argument String timeFrame) {
        return sellerAnalyticsService.getSellerSalesAnalytics(sellerId, timeFrame);
    }
    
    @QueryMapping(name = "getTopSellingProducts")
    public List<Map<String, Object>> getTopSellingProducts(
            @Argument String sellerId, 
            @Argument String timeFrame,
            @Argument String metric,
            @Argument Integer limit) {
        return sellerAnalyticsService.getTopSellingProducts(sellerId, timeFrame, metric, limit);
    }
    
    @QueryMapping(name = "getSalesByCategory")
    public Map<String, Object> getSalesByCategory(@Argument String sellerId, @Argument String timeFrame) {
        return sellerAnalyticsService.getSalesByCategory(sellerId, timeFrame);
    }
    
    @QueryMapping(name = "getRevenueOverTime")
    public Map<String, Object> getRevenueOverTime(
            @Argument String sellerId, 
            @Argument String timeFrame,
            @Argument String groupBy) {
        return sellerAnalyticsService.getRevenueOverTime(sellerId, timeFrame, groupBy);
    }
}