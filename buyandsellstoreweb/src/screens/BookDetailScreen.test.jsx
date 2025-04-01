import React from "react";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { gql } from "@apollo/client";
import Book, { GET_BOOK_DETAILS } from "./BookDetailScreen";

// ✅ Mock useUserContext to return a logged-in user
jest.mock("../context/UserContext", () => {
  const actual = jest.requireActual("../context/UserContext");
  return {
    ...actual,
    useUserContext: () => ({
      user: {
        id: "placeholder-id",
        username: "testuser",
      },
    }),
  };
});

// ✅ VIEW_CART query (manually defined)
const VIEW_CART = gql`
  query GetCartItems($userId: ID!) {
    cartItems(id: $userId) {
      itemId
      type
      name
      quantity
      price
      imageUrl
    }
  }
`;

// ✅ Apollo mock data
const mocks = [
  {
    request: {
      query: GET_BOOK_DETAILS,
      variables: { id: "book123" },
    },
    result: {
      data: {
        book: {
          id: "book123",
          title: "Mock Book",
          author: "Test Author",
          price: 9.99,
          imageUrl: "/mock.jpg",
          ratings: 4.5,
          reviews: [],
        },
      },
    },
  },
  {
    request: {
      query: VIEW_CART,
      variables: { userId: "placeholder-id" },
    },
    result: {
      data: {
        cartItems: [],
      },
    },
  },
];

// ✅ Test using helper to wrap all providers
const renderWithProviders = (ui) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={["/book/book123"]}>
        <Routes>
          <Route path="/book/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

test("renders Add Your Review section for logged-in user", async () => {
  renderWithProviders(<Book />);

  // Wait for the heading in the review section
  const heading = await screen.findByRole("heading", {
    name: /add your review/i,
  });
  expect(heading).toBeInTheDocument();

  expect(screen.getByPlaceholderText(/write a review/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/rating/i)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /add review/i })
  ).toBeInTheDocument();
});
