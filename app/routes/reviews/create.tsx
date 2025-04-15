// filepath: c:\Users\siiri\BAU\awu-re-exam-siiriellisylvia\app\routes\reviews\create.tsx
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
  
  try {
    const newReview = await Review.create({
      user: currentUserId,
      book: params.id, // Use the id from params
      comment,
      rating,
    });
    
    // Update the book's overall rating and ratings count
    if (!params.id) {
      throw new Response("Book ID is required", { status: 400 });
    }
    await updateBookRating(params.id);
    
    const populatedReview = await Review.findById(newReview._id)
      .populate("user", "name")
      .lean();
    return Response.json({ success: true, review: populatedReview });
  } catch (error: any) {
    console.error("Error creating review:", error);
    
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
      { success: false, error: "Failed to create review. Please try again." },
      { status: 500 }
    );
  }
}

// This route doesn't need to render anything as it's only an API endpoint
export default function CreateReview() {
  return null;
}