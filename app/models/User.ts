import mongoose, { Schema, model, type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

// Define User schema
const userSchema = new Schema(
  {
    image: { type: String }, // Optional user profile image
    mail: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Ensures emails are unique
    },
    name: { type: String, required: [true, "Name is required."] }, // Name is required
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false, // Prevents password from being returned in queries
    },
    favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // References favorite books
    favoriteGenres: { type: [String], default: [] }, // Stores user's favorite genres
    favoriteAuthors: { type: [String], default: [] }, // Stores user's favorite authors
    ownedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // Books the user owns
    reviews: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        }, // Reference to reviewed book
        rating: { type: Number, min: 1, max: 5, required: true }, // Rating between 1-5
        comment: { type: String }, // Optional review comment
        createdAt: { type: Date, default: Date.now }, // Auto-generated timestamp
      },
    ],
  },
  { timestamps: true }, // Adds createdAt & updatedAt fields
);

// Middleware: Hash password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is unchanged

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next(); // Continue saving
  } catch (error: any) {
    next(error as mongoose.CallbackError); // Pass error to Mongoose
  }
});

// Infer TypeScript type for the schema
export type UserType = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Create and export User model
const User = model<UserType>("User", userSchema);
export default User;
