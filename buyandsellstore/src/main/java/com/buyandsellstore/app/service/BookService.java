package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.model.Review;
import com.buyandsellstore.app.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElse(null);
    }

    // Add a review to a book
    public Book addReview(String bookId, Review newReview) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            List<Review> reviews = book.getReviews();
            if (reviews == null) reviews = new ArrayList<>();
            reviews.add(newReview);
            book.setReviews(reviews);
            bookRepository.save(book);
        }
        return book;
    }

    // Update a review by reviewer name
    public Book updateReview(String bookId, String reviewer, Review updatedReview) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null && book.getReviews() != null) {
            for (Review review : book.getReviews()) {
                if (review.getReviewer().equalsIgnoreCase(reviewer)) {
                    review.setComment(updatedReview.getComment());
                    review.setRating(updatedReview.getRating());
                    break;
                }
            }
            bookRepository.save(book);
        }
        return book;
    }

    // Delete a review by reviewer name
    public Book deleteReview(String bookId, String reviewer) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null && book.getReviews() != null) {
            book.getReviews().removeIf(review -> review.getReviewer().equalsIgnoreCase(reviewer));
            bookRepository.save(book);
        }
        return book;
    }
}
