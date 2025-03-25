package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.OrderResponse;
import com.buyandsellstore.app.model.Address;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.model.Order;
import com.buyandsellstore.app.model.Payment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderServiceTest {
    @Autowired
    private OrderService orderService;

    private OrderResponse createOrderBeforeTest(){
        List<CartItem> cartItemList = new ArrayList<>();
        cartItemList.add(new CartItem("1","test","test",2,8.99,"test"));
        OrderResponse orderResponse = orderService.createOrder("junitTestUser",cartItemList,8.99f,new Address("test","test","test","TX",123,"USA"),
                new Address("test","test","test","TX",123,"USA"),new Payment("123456789012","25/25","123"));
        return orderResponse;
    }

    private long deleteOrderAfterTest(){
        long count = orderService.removeOrderByUserId("junitTestUser");
        return count;
    }

    @Test
    void testOrderPlacement() {
        OrderResponse orderResponse = createOrderBeforeTest();
        assertNotNull(orderResponse);
        assertTrue(orderResponse.isSuccess());
        long count = deleteOrderAfterTest();
        assertNotEquals(0,count);
    }


    @Test
    void testOrderHistoryRetrieval() {
        OrderResponse orderResponse = createOrderBeforeTest();
        List<Order> orders = orderService.getOrdersByUserId("junitTestUser");
        assertNotNull(orders);
        assertTrue(orders.size() > 0);
        long count = deleteOrderAfterTest();
    }
}
