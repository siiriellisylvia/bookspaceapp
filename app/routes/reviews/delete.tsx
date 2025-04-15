// filepath: c:\Users\siiri\BAU\awu-re-exam-siiriellisylvia\app\routes\reviews\delete.tsx
import { getAuthUser } from "~/services/auth.server";
import Review from "~/models/Review";
import { updateBookRating } from "~/utils/updateBookRating";
import type { Route } from "../../+types/root";

export async function action({ request, params }: Route.ActionArgs) {
  // Get the full user object instead of just the ID
  const currentUser = await getAuthUser(request);
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const currentUserId = currentUser._id.toString();
  const formData = await request.formData();
  const reviewId = formData.get("reviewId") as string;
  
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return Response.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    // Verify the current user owns the review
    if (review.user.toString() !== currentUserId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Store the book ID before deleting the review
    const bookId = review.book.toString();

    await Review.findByIdAndDelete(reviewId);
    
    // Update the book's overall rating after review deletion
    await updateBookRating(bookId);
    
    return Response.json({ success: true, deleted: true, reviewId });
  } catch (error) {
    console.error("Error deleting review:", error);
    return Response.json(
      { success: false, error: "Failed to delete review. Please try again." },
      { status: 500 }
    );
  }
}

// This route doesn't need to render anything as it's only an API endpoint
export default function DeleteReview() {
  return null;
}