package com.buyandsellstore.app.repository;

import com.buyandsellstore.app.model.HomeItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HomeItemRepository extends MongoRepository<HomeItem, String> {

    HomeItem findByType(String type);
}
