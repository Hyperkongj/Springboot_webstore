package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.service.HomeItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;

@Controller
public class HomeItemResolver {

    @Autowired
    private HomeItemService homeItemService;

    //    UploadHomeItem(title: String!
//            description: String!
//            totalQuantity: Int!
//            price: Float!
//            imageUrl: String!
//            manufacturer: String!
//            sellerId: String!
//            type: String!
//    ): Book
//
    @MutationMapping
    public HomeItem uploadHomeItem(@Argument String title,
                                   @Argument String description,
                                   @Argument int totalQuantity,
                                   @Argument double price,
                                   @Argument String imageUrl,
                                   @Argument String manufacturer,
                                   @Argument String sellerId,
                                   @Argument String type) {

        HomeItem homeItem = new HomeItem(title, type, description, price, imageUrl, manufacturer, sellerId, totalQuantity);
        homeItem.setReviews(new ArrayList<>());
        return homeItemService.save(homeItem);
    }

}
