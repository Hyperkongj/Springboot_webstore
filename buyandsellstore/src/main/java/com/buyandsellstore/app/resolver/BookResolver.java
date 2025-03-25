package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.model.Book;
<<<<<<< Updated upstream
import com.buyandsellstore.app.repository.BookRepository;
=======
import com.buyandsellstore.app.model.Review;
>>>>>>> Stashed changes
import com.buyandsellstore.app.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class BookResolver {

    @Autowired
    private BookService bookService;

    // Queries
    @QueryMapping
    public List<Book> books() {
        return bookService.getAllBooks();
    }

    @QueryMapping
    public Book book(@Argument String id) {
        return bookService.getBookById(id);
    }

    // Mutations for Reviews

    @MutationMapping
    public Book addReview(@Argument String bookId, @Argument Review review) {
        return bookService.addReview(bookId, review);
    }

    @MutationMapping
    public Book updateReview(@Argument String bookId, @Argument String reviewer, @Argument Review updatedReview) {
        return bookService.updateReview(bookId, reviewer, updatedReview);
    }

    @MutationMapping
    public Book deleteReview(@Argument String bookId, @Argument String reviewer) {
        return bookService.deleteReview(bookId, reviewer);
    }
}
