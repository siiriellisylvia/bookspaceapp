import { getAuthUser } from "~/services/auth.server";
import Review from "~/models/Review";
import type { Route } from "../+types/root";

export async function action({ request, params }: Route.ActionArgs) {
  // Get the full user object instead of just the ID
  const currentUser = await getAuthUser(request);
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const currentUserId = currentUser._id.toString();
  const formData = await request.formData();
  const actionType = formData.get("action");
  const reviewId = formData.get("reviewId");

  if (actionType === "createReview") {
    const newReview = await Review.create({
      user: currentUserId,
      book: params.id,
      comment: formData.get("comment"),
      rating: Number(formData.get("rating")),
    });
    const populatedReview = await Review.findById(newReview._id)
      .populate("user", "name")
      .lean();
    return Response.json({ success: true, review: populatedReview });
  } else if (actionType === "deleteReview") {
    // Check ownership before deleting
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

    await Review.findByIdAndDelete(reviewId);
    return Response.json({ success: true, deleted: true, reviewId });
  } else if (actionType === "updateReview") {
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

    await Review.findByIdAndUpdate(reviewId, {
      comment: formData.get("comment"),
      rating: Number(formData.get("rating")),
    });
    const updatedReview = await Review.findById(reviewId)
      .populate("user", "name")
      .lean();

    return Response.json({ success: true, review: updatedReview });
  }
}
