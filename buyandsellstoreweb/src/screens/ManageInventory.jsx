import React, { useState } from "react";
import styled from "styled-components";
import { gql, useMutation } from "@apollo/client";
import { useUserContext } from "../context/UserContext"; // 👈 added this

const UPLOAD_BOOK = gql`
  mutation UploadBook(
    $title: String!
    $author: String!
    $price: Float!
    $imageUrl: String!
    $description: String!
    $sellerId: String!
  ) {
    uploadBook(
      title: $title
      author: $author
      price: $price
      imageUrl: $imageUrl
      description: $description
      sellerId: $sellerId
    ) {
      id
      title
    }
  }
`;

const ManageInventory = () => {
  const { user } = useUserContext(); // 👈 get user from context

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    imageUrl: "",
    description: "",
    type: "books",
    subcategory: "",
  });

  const [uploadBook] = useMutation(UPLOAD_BOOK);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Seller ID missing. Please log in again.");
      return;
    }

    await uploadBook({
      variables: {
        title: form.title,
        author: form.author,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
        description: form.description,
        sellerId: user.id, // 👈 set sellerId from context
      },
    });

    setForm({
      title: "",
      author: "",
      price: "",
      imageUrl: "",
      description: "",
      type: "books",
      subcategory: "",
    });
  };

  return (
    <Wrapper>
      <Card>
        <Title>📤 Upload Book</Title>
        <Form onSubmit={handleSubmit}>
          <Input name="title" placeholder="Book Title" value={form.title} onChange={handleChange} required />
          <Input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
          <Input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
          <Input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} required />
          <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />

          <Select name="type" value={form.type} onChange={handleChange}>
            <option value="books">Books</option>
            <option value="home">Home Item</option>
          </Select>

          {form.type === "home" && (
            <Select name="subcategory" value={form.subcategory} onChange={handleChange}>
              <option value="">-- Select Subcategory --</option>
              <option value="kitchen">Kitchen</option>
              <option value="livingroom">Living Room</option>
            </Select>
          )}

          {form.imageUrl && (
            <ImagePreview>
              <img src={form.imageUrl} alt="Preview" />
            </ImagePreview>
          )}

          <SubmitButton type="submit">Upload</SubmitButton>
        </Form>
      </Card>
    </Wrapper>
  );
};

export default ManageInventory;

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 50px 20px;
  background-color: ${({ theme }) => theme.background || "#f0f2f5"};
  min-height: 100vh;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.cardBg || "#ffffff"};
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px;
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  font-size: 28px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

export const Textarea = styled.textarea`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  min-height: 80px;
`;

export const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
`;

export const SubmitButton = styled.button`
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

export const ImagePreview = styled.div`
  text-align: center;
  img {
    max-width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin-top: 10px;
  }
`;
