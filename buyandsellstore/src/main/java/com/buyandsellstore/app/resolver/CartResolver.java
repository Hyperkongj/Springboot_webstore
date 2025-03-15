package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.ResponseMessage;
import com.buyandsellstore.app.model.CartItem;
import com.buyandsellstore.app.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class CartResolver {
    @Autowired
    private CartService cartService;

    @QueryMapping(name = "cartItems")
    public List<CartItem> getCartItems(@Argument(name = "id") String userId) {
        // Retrieve cart items for the user

        List<CartItem> cartItems = cartService.getAllCartItemsForUser(userId);
        //System.out.println("getCartItems query called with: " + userId);
        // Ensure an empty list is returned if the user has no cart items
        return cartItems != null ? cartItems : new ArrayList<>();
    }
    @MutationMapping
    public ResponseMessage addToCart(
            @Argument String userId,
            @Argument String itemId,
            @Argument String type
    ) {
        //System.out.println("addToCart mutation called with: " + userId + ", " + itemId + ", " + type);
        return cartService.addToCart(userId, itemId, type);
    }

    @MutationMapping
    public ResponseMessage removeFromCart(
            @Argument String userId,
            @Argument String itemId,
            @Argument String type
    ) {
        //System.out.println("removeFromCart mutation called with: " + userId + ", " + itemId + ", " + type);
        return cartService.removeFromCart(userId, itemId, type);
    }
}
