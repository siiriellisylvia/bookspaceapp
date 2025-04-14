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

  const formData = await request.formData();
  const action = formData.get("action");

  if (bookIndex !== -1) {
    // Book is already in the collection
    if (action === "setCurrentlyReading") {
      // Update status to reading
      user.bookCollection[bookIndex].status = "reading";
    } else {
      // Toggle bookmark status
      user.bookCollection[bookIndex].isBookmarked = !user.bookCollection[bookIndex].isBookmarked;
      
      // Check if we should remove the book from collection
      const shouldRemove = !user.bookCollection[bookIndex].isBookmarked && 
                           user.bookCollection[bookIndex].status === "not_started" && 
                           user.bookCollection[bookIndex].progress === 0 &&
                           (!user.bookCollection[bookIndex].readingSessions || 
                            user.bookCollection[bookIndex].readingSessions.length === 0);
      
      if (shouldRemove) {
        user.bookCollection.splice(bookIndex, 1);
      }
    }
  } else {
    // Book is not in the collection, add it
    const newEntry = {
      bookId: bookObjectId,
      progress: 0,
      isBookmarked: action !== "setCurrentlyReading",
      status: action === "setCurrentlyReading" ? "reading" : "not_started",
      readingSessions: []
    };
    
    user.bookCollection.push(newEntry);
  }

  await user.save();

  // Find the current state after updates
  const updatedUser = await User.findById(authUserId);
  const updatedBookEntry = updatedUser?.bookCollection.find(
    (entry) => entry.bookId?.toString() === bookId
  );
  
  // Return the updated state to the client
  return Response.json({
    isBookmarked: updatedBookEntry?.isBookmarked || false,
    readingStatus: updatedBookEntry?.status || "not_started",
    inCollection: !!updatedBookEntry
  });
}
