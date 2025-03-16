package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.Address;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class UserResolver {
    @Autowired
    UserService userService;

    @QueryMapping
    public String hello(){
        return "Hello Chitra";
    }
    @MutationMapping
    public AuthResponse login(@Argument String username, @Argument String password) {
        // Validate input arguments
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return new AuthResponse(false, "Username or password cannot be empty.", null);
        }

        try {
            // Authenticate the user
            User user = userService.authenticate(username, password);

            if (user == null) {
                return new AuthResponse(false, "Invalid credentials.", null);
            }

            // Successful login
            return new AuthResponse(true, "Login successful!", user);
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception for debugging purposes
            return new AuthResponse(false, "An error occurred during login. Please try again.", null);
        }
    }

    @MutationMapping
    public AuthResponse signup(@Argument String username, @Argument String email, @Argument String password, @Argument String firstName,
                               @Argument String lastName, @Argument String phone, @Argument boolean isSeller, @Argument List<Address> billing, @Argument List<Address> shipping) {

        // Convert AddressInput to Address model
        return userService.createUser(new User(username, email, password, firstName, lastName, phone, isSeller));
//        createdUser.setBilling(billing);
//        createdUser.setBilling(shipping);
//        if (createdUser != null) {
//            return new AuthResponse(true, "Account created successfully!", createdUser);
//        } else {
//            return new AuthResponse(false, "User already exists.", null);
//        }
    }


}
