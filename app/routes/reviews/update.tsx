// filepath: c:\Users\siiri\BAU\awu-re-exam-siiriellisylvia\app\routes\reviews\update.tsx
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
  const comment = formData.get("comment") as string;
  const rating = Number(formData.get("rating"));
  const reviewId = formData.get("reviewId") as string;
  
  try {
    // Check ownership before updating
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

    // Store the book ID before updating the review
    const bookId = review.book.toString();

    // Use Mongoose's validate function to trigger validation rules from the model
    review.comment = comment;
    review.rating = rating;
    
    await review.validate(); // This will validate without saving
    await Review.findByIdAndUpdate(reviewId, { comment, rating });
    
    // Update the book's overall rating after review update
    await updateBookRating(bookId);
    
    const updatedReview = await Review.findById(reviewId)
      .populate("user", "name")
      .lean();

    return Response.json({ success: true, review: updatedReview });
  } catch (error: any) {
    console.error("Error updating review:", error);
    
    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const errors: Record<string, string> = {};
      
      // Extract error messages from each field
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      
      return Response.json({ success: false, errors }, { status: 400 });
    }
    
    return Response.json(
      { success: false, error: "Failed to update review. Please try again." },
      { status: 500 }
    );
  }
}

// This route doesn't need to render anything as it's only an API endpoint
export default function UpdateReview() {
  return null;
}