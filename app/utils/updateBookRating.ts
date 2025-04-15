import Book from "~/models/Book";
import Review from "~/models/Review";

/**
 * Updates a book's average rating and ratings count based on all reviews
 * @param bookId - The ID of the book to update
 * @returns The updated book with new rating and ratingsCount
 */
export async function updateBookRating(bookId: string) {
  try {
    // Get all reviews for this book
    const reviews = await Review.find({ book: bookId });
    
    // Calculate the new values
    const ratingsCount = reviews.length;
    
    // Calculate average rating if there are reviews, otherwise set to 0
    let rating = 0;
    if (ratingsCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      rating = parseFloat((totalRating / ratingsCount).toFixed(1)); // Round to 1 decimal place
    }
    
    // Update the book document
    const updatedBook = await Book.findByIdAndUpdate(
      bookId, 
      { rating, ratingsCount },
      { new: true } // Return the updated document
    );
    
    return updatedBook;
  } catch (error) {
    console.error("Error updating book rating:", error);
    throw error;
  }
}