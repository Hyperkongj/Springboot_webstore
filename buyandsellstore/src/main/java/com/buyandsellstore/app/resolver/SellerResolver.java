package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.SellerStats;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.repository.OrderRepository;
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
}
