import { authenticateUser } from "~/services/auth.server";
import Book from "~/models/Book";
import User from "~/models/User";
import type { Route } from "../+types/root";
import mongoose from "mongoose";

export async function action({ request, params }: Route.ActionArgs) {
  const authUserId = await authenticateUser(request);
  if (!authUserId) return new Response("Unauthorized", { status: 401 });

  const bookId = params.id as string;
  const book = await Book.findById(bookId);
  if (!book) return new Response("Book Not Found", { status: 404 });

  const user = await User.findById(authUserId);
  if (!user) return new Response("User Not Found", { status: 404 });

  // Ensure bookId is an ObjectId
  const bookObjectId = new mongoose.Types.ObjectId(bookId);

  // Check if the book is already in bookCollection
  const bookIndex = user.bookCollection.findIndex(
    (entry) => entry.bookId?.toString() === bookId,
  );

  let isBookmarked;

  if (bookIndex !== -1) {
    // Remove book from collection (Unbookmark)
    user.bookCollection.splice(bookIndex, 1);
    isBookmarked = false;
  } else {
    // Add book to collection with default progress (Bookmark)
    user.bookCollection.push({
      bookId: bookObjectId,
      progress: 0,
    });
    isBookmarked = true;
  }

  await user.save();

  // Return the updated state to the client
  return Response.json({ isBookmarked });
}
