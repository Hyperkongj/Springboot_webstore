package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.OrderResponse;
import com.buyandsellstore.app.model.*;
import com.buyandsellstore.app.repository.CartRepository;
import com.buyandsellstore.app.repository.HomeItemRepository;
import com.buyandsellstore.app.repository.OrderRepository;
import com.buyandsellstore.app.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.buyandsellstore.app.dto.SellerStats;

import java.util.*;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    public SellerStats getSellerStats(String sellerId) {
        List<Order> allOrders = orderRepository.findAll();

        Set<String> uniqueBuyers = new HashSet<>();
        int totalPurchases = 0;
        double totalRevenue = 0.0;
        List<String> purchasedBooks = new ArrayList<>();

        for (Order order : allOrders) {
            boolean sellerInOrder = false;

            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    totalPurchases += item.getQuantity();
                    totalRevenue += item.getQuantity() * item.getPrice();
                    purchasedBooks.add(item.getProductName());
                    sellerInOrder = true;
                }
            }

            if (sellerInOrder) {
                uniqueBuyers.add(order.getUserId());
            }
        }

        return new SellerStats(uniqueBuyers.size(), totalPurchases, totalRevenue, new ArrayList<Book>());
    }

    @Autowired
    private BookService bookService; // Make sure this exists or inject BookRepository

    @Autowired
    private BookRepository bookRepository; // Needed to look up sellerId from books

    @Autowired
    private HomeItemRepository homeItemRepository; // Needed to look up sellerId from books

    @Autowired
    private CartService cartService;

    public OrderResponse createOrder(String userId, List<CartItem> items, float totalPrice,
                                     Address billing, Address shipping, Payment payment) {
        try {
            // Create a processed list with sellerIds injected
            List<CartItem> processedItems = new java.util.ArrayList<>();

            for (CartItem item : items) {
                if ("book".equalsIgnoreCase(item.getType())) {
                    bookRepository.findById(item.getItemId()).ifPresent(book -> {
                        item.setSellerId(book.getSellerId());
                        processedItems.add(item);
                    });
                } else if ("home".equalsIgnoreCase(item.getType())) {
                    homeItemRepository.findById(item.getItemId()).ifPresent(homeItem -> {
                        item.setSellerId(homeItem.getSellerId());
                        processedItems.add(item);
                    });
                } else {
                    // If not book or home, still add it (optional fallback)
                    processedItems.add(item);
                }
            }

            // Now create the order using processedItems
            Order order = new Order();
            order.setId(UUID.randomUUID().toString());
            order.setUserId(userId);
            order.setItems(processedItems); // ✅ Use processedItems
            order.setTotalPrice(totalPrice);
            order.setBilling(billing);
            order.setShipping(shipping);
            order.setPayment(payment);
            order.setCreatedAt(new Date());

            // Save the order and clear the cart
            orderRepository.save(order);
            cartService.removeFromCart(userId, null, null);

            return new OrderResponse(true, "Order created successfully", order);
        } catch (Exception e) {
            e.printStackTrace();
            return new OrderResponse(false, "Failed to create order: " + e.getMessage(), null);
        }
    }


    public List<Order> getOrdersByUserId(String userId) {
        List<Order> orderList = orderRepository.findByUserId(userId);
        if (orderList.isEmpty()) {
            return null;
        }else {
            return orderList;
        }
    }

    public long removeOrderByUserId(String userId) {
        return orderRepository.removeByUserId(userId);
    }


    public List<SoldItem> getSoldItemsBySellerId(String sellerId){
        List<Order> allOrders = orderRepository.findAll();
        List<SoldItem> soldItems = new ArrayList<>();
        for (Order order : allOrders) {
            for (CartItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    SoldItem soldItem = new SoldItem(
                            item.getItemId(),
                            item.getType(),
                            item.getName(),
                            item.getQuantity(),
                            item.getPrice(),
                            item.getImageUrl(),
                            item.getSellerId(),
                            order.getCreatedAt() // from the Order's createdAt
                    );
                    soldItems.add(soldItem); // ✅ Add every matching item separately
                }
            }
        }
        return soldItems;
    }
}
