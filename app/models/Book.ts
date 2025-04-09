import { Schema, model, Types, type InferSchemaType } from "mongoose";

// Define the schema for the Book collection in MongoDB
const bookSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    author: { type: [String], required: [true, "Author is required"] },
    description: { type: String, required: [true, "Description is required"] },
    releaseYear: { type: Number, required: [true, "Release year is required"] },
    slug: { type: String, required: [true, "Slug is required"], unique: true },
    pageCount: { type: Number, required: [true, "Page count is required"] },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    moods: { type: [String], default: [] },
    genres: {
      type: [String],
      required: [true, "At least one genre is required"],
    },
    coverImage: {
      url: { type: String, required: [true, "Cover image URL is required"] },
      width: {
        type: Number,
        required: [true, "Cover image width is required"],
      },
      height: {
        type: Number,
        required: [true, "Cover image height is required"],
      },
    },
  },
  { timestamps: true }, // Automatically add `createdAt` and `updatedAt` timestamps
);

// Infer TypeScript type for the schema
export type BookType = InferSchemaType<typeof bookSchema> & {
  _id: Types.ObjectId;
};

// Create a Mongoose model for the Book schema
const Book = model<BookType>("Book", bookSchema);

// Export the Book model for use in other parts of the app
export default Book;
