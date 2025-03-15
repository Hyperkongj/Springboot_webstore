package com.buyandsellstore.app.resolver;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class BookResolver {

    @Autowired
    private BookService bookService;

    @QueryMapping
    public List<Book> books() {
        // BookRepository extends MongoRepository or CrudRepository in Spring Data
        // MongoDB, the findAll() method is automatically provided by the framework. You
        // don't need to explicitly define it.
        return bookService.getAllBooks();
    }

    @QueryMapping
    public Book book(@Argument String id) {
        return bookService.getBookById(id);
    }

}
