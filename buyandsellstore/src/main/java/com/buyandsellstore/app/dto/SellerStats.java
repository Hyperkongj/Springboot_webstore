package com.buyandsellstore.app.dto;

import com.buyandsellstore.app.model.Book;
import java.util.List;

public class SellerStats {
    private int totalBuyers;
    private int totalPurchases;
    private double totalRevenue;
    private List<Book> purchasedBooks; // ✅ changed type from String to Book

    public SellerStats(int totalBuyers, int totalPurchases, double totalRevenue, List<Book> purchasedBooks) {
        this.totalBuyers = totalBuyers;
        this.totalPurchases = totalPurchases;
        this.totalRevenue = totalRevenue;
        this.purchasedBooks = purchasedBooks;
    }

    // Getters and Setters
    public int getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(int totalBuyers) { this.totalBuyers = totalBuyers; }

    public int getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(int totalPurchases) { this.totalPurchases = totalPurchases; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public List<Book> getPurchasedBooks() { return purchasedBooks; }
    public void setPurchasedBooks(List<Book> purchasedBooks) { this.purchasedBooks = purchasedBooks; }
}
