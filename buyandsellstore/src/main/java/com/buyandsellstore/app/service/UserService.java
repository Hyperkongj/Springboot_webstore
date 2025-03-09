package com.buyandsellstore.app.service;

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

    public User createUser(User user) {
//        System.out.println(user.toString());
//        System.out.println(user.getUsername());
//        if (userRepository.existsByUsername(user.getUsername())) {
//            return null;
//        }
        return userRepository.save(user);
    }
}
