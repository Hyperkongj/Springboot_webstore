package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.dto.UploadHomeItemResponse;
import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.HomeItem;
import com.buyandsellstore.app.service.HomeItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

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
    /*this method is only used by user of type seller
    i.e. if isSeller flag for the user is true
    */
    @MutationMapping
    public UploadHomeItemResponse uploadHomeItem(@Argument String title,
                                                 @Argument String description,
                                                 @Argument int totalQuantity,
                                                 @Argument double price,
                                                 @Argument String imageUrl,
                                                 @Argument String manufacturer,
                                                 @Argument String sellerId,
                                                 @Argument String type) {

        // Check if seller already uploaded a home item
        HomeItem existingItem = homeItemService.findByTitleAndSellerId(title, sellerId);
        if (existingItem != null) {
            return new UploadHomeItemResponse(false, "Seller has already uploaded an item. Duplicate uploads are not allowed.", null);
        }

        // Optional: Also prevent duplicate by manufacturer
        HomeItem byManufacturer = homeItemService.findByManufacturer(manufacturer);
        if (byManufacturer != null && byManufacturer.getSellerId().equals(sellerId)) {
            return new UploadHomeItemResponse(false, "Duplicate item by the same manufacturer and seller is not allowed.", null);
        }

        HomeItem homeItem = new HomeItem(title, type, description, price, imageUrl, manufacturer, sellerId, totalQuantity);
        homeItem.setReviews(new ArrayList<>());
        return new UploadHomeItemResponse(true, "Upload successful", homeItemService.save(homeItem));
    }


    @QueryMapping
    public List<HomeItem> homeItems() {
        return homeItemService.getAllHomeItems();
    }

    @QueryMapping
    public HomeItem homeItem(@Argument String id) {
        return homeItemService.getHomeItemById(id);
    }

    @QueryMapping
    public List<HomeItem> getHomeItemsBySellerId(@Argument String sellerId) {
        return homeItemService.findBySellerId(sellerId);
    }
}
