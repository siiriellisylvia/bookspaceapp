import mongoose, { Schema, Types, model, type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

// Define User schema
const userSchema = new Schema(
  {
    image: { type: String }, // Optional user profile image
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Ensures emails are unique
    },
    name: { type: String },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false, // Prevents password from being returned in queries
    },
    favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // References favorite books
    favoriteGenres: { type: [String], default: [] }, // Stores user's favorite genres
    favoriteAuthors: { type: [String], default: [] }, // Stores user's favorite authors
    bookCollection: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        progress: { type: Number, default: 0 },
        isBookmarked: { type: Boolean, default: false },
        status: { 
          type: String, 
          enum: ['not_started', 'reading', 'finished'], 
          default: 'not_started' 
        },
        readingSessions: [{
          startTime: { type: Date, default: null },
          endTime: { type: Date, default: null },
          pagesRead: { type: Number, default: 0 },
          minutesRead: { type: Number, default: 0 }
        }],
        _id: false, // prevent Mongoose from creating an automatic _id for each entry
      },
    ],
    readingGoal: {
      type: { type: String, enum: ['minutes', 'hours', 'pages', 'books'], default: 'minutes' },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      target: { type: Number, default: 0 },
      isActive: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }, // Adds createdAt & updatedAt fields
);

// Middleware: Hash password before saving to the database
// pre save password hook
userSchema.pre("save", async function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next(); // continue
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    user.password = await bcrypt.hash(user.password, salt); // Hash password
    next(); // Continue saving
  } catch (error: any) {
    next(error as mongoose.CallbackError); // Pass error to Mongoose
  }
});

// Infer TypeScript type for the schema
export type UserType = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

// Create and export User model
const User = model<UserType>("User", userSchema);
export default User;
