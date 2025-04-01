package com.buyandsellstore.app.service;

import com.buyandsellstore.app.model.Book;
import com.buyandsellstore.app.repository.BookRepository;
import com.buyandsellstore.app.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {
    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    private Book book;

    @BeforeEach
    public void setup() {
        book = new Book();
        book.setId("1");
    }

    @Test
    public void testGetAllBooks() {
        List<Book> books = Arrays.asList(book);
        when(bookRepository.findAll()).thenReturn(books);

        List<Book> result = bookService.getAllBooks();
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(bookRepository, times(1)).findAll();
    }

    @Test
    public void testGetBookById() {
        when(bookRepository.findById("1")).thenReturn(Optional.of(book));

        Book result = bookService.getBookById("1");
        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(bookRepository, times(1)).findById("1");
    }
}
