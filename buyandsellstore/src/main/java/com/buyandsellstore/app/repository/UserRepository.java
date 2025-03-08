package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    
}
