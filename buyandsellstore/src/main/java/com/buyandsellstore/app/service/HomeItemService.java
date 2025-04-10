package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.repository.HomeItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeItemService {

    @Autowired
    private HomeItemRepository homeItemRepository;

    public List<HomeItem> getAllHomeItems() {
        return homeItemRepository.findAll();
    }

    public HomeItem getHomeItemById(String id) {
        return homeItemRepository.findById(id).orElse(null);
    }
    public HomeItem getHomeItemByType(String type) {
        return homeItemRepository.findByType(type);
    }

    public HomeItem save(HomeItem homeItem){
        return homeItemRepository.save(homeItem);
    }

}
