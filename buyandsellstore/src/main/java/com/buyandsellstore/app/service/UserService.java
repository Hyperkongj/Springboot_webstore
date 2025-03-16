package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getPassword().equals(password) ? user : null; // Ideally hash the password
    }

    public AuthResponse createUser(User user) {
//        System.out.println(user.toString());
//        System.out.println(user.getUsername());
        if (userRepository.existsByUsername(user.getUsername())) {
            return new AuthResponse(false, "Username already exists!", null);
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return new AuthResponse(false, "Email already exists!", null);
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            return new AuthResponse(false, "Phone number already exists!", null);
        }
        return new AuthResponse(true, "User successfully added to DB!", userRepository.save(user));
    }
}
