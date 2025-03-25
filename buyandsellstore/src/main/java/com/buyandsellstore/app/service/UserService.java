package com.buyandsellstore.app.service;

import com.buyandsellstore.app.dto.AuthResponse;
import com.buyandsellstore.app.model.User;
import com.buyandsellstore.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Autowire the PasswordEncoder bean defined in SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User existByUserName(String username){
        return userRepository.findByUsername(username);
    }

    /**
     * Authenticates a user by comparing the raw password with the stored hashed password.
     *
     * @param username    the username of the user
     * @param rawPassword the password provided by the user at login
     * @return the User if authentication succeeds, or null if it fails
     */
    public User authenticate(String username, String rawPassword) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return null;
        }
        // Use BCrypt to verify the password
        return passwordEncoder.matches(rawPassword, user.getPassword()) ? user : null;
    }

    /**
     * Creates a new user, ensuring the password is hashed before saving.
     *
     * @param user the user to be created
     * @return an AuthResponse indicating success or failure, plus the saved user if successful
     */
    public AuthResponse createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return new AuthResponse(false, "Username already exists!", null);
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return new AuthResponse(false, "Email already exists!", null);
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            return new AuthResponse(false, "Phone number already exists!", null);
        }

        // Hash the raw password before saving
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        User savedUser = userRepository.save(user);
        return new AuthResponse(true, "User successfully added to DB!", savedUser);
    }


}
