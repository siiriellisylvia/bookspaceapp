import { Schema, model, Types, type InferSchemaType } from "mongoose";

// Define the schema for the Review collection in MongoDB
const reviewSchema = new Schema(
  {
    book: {
      type: Types.ObjectId,
      ref: "Book", // link to books collection
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User", // link to users collection
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating between 1-5 is required"],
      min: 1, // Minimum rating is 1
      max: 5, // Maximum rating is 5
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
    },
  },
  { timestamps: true }, // Automatically add `createdAt` and `updatedAt`
);

export type ReviewType = InferSchemaType<typeof reviewSchema> & {
  _id: Types.ObjectId | string;
};

const Review = model<ReviewType>("Review", reviewSchema);

export default Review;
