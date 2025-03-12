package com.buyandsellstore.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a user stored in the "users" collection.
 */
@Document(collection = "users")
public class User {

    @Id
    private String id; // Unique identifier for MongoDB

    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String firstName;
    private String lastName;
    private int phone;
    private boolean isSeller;

    private List<Address> billing = new ArrayList<>();
    private List<Address> shipping = new ArrayList<>();

    // Optional: if using a separate token mechanism, consider removing this field
    private String resetToken;

    public User() {
    }

    // Constructor without billing and shipping addresses
    public User(String username, String email, String password, String firstName, String lastName, int phone,
            boolean isSeller) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.isSeller = isSeller;
    }

    // Constructor with billing and shipping addresses
    public User(String username, String email, String password, String firstName, String lastName, int phone,
            boolean isSeller,
            List<Address> billing, List<Address> shipping) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.isSeller = isSeller;
        this.billing = billing;
        this.shipping = shipping;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getPhone() {
        return phone;
    }

    public void setPhone(int phone) {
        this.phone = phone;
    }

    public boolean isSeller() {
        return isSeller;
    }

    public void setSeller(boolean seller) {
        isSeller = seller;
    }

    public List<Address> getBilling() {
        return billing;
    }

    public void setBilling(List<Address> billing) {
        this.billing = billing;
    }

    public List<Address> getShipping() {
        return shipping;
    }

    public void setShipping(List<Address> shipping) {
        this.shipping = shipping;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone=" + phone +
                ", isSeller=" + isSeller +
                ", billing=" + billing +
                ", shipping=" + shipping +
                ", resetToken='" + resetToken + '\'' +
                '}';
    }
}
