package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.OrderResponse;
import com.buyandsellstore.app.model.Address;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.model.Payment;
import com.buyandsellstore.app.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    public OrderResponse createOrder(String userId, List<CartItem> items, float totalPrice, Address billing, Address shipping, Payment payment) {
        try {
            // Create a new order
            Order order = new Order();
            order.setId(UUID.randomUUID().toString());
            order.setUserId(userId);
            order.setItems(items);
            order.setTotalPrice(totalPrice);
            order.setBilling(billing);
            order.setShipping(shipping);
            order.setPayment(payment);
            order.setCreatedAt(new Date());

            // Save order to the repository
            orderRepository.save(order);

            // Return success response
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
}
