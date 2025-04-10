import { useEffect, useState } from "react";
import UpdateReviewForm from "./UpdateReviewForm";
import { Button } from "~/components/ui/button";
import { useFetcher } from "react-router";
import CreateReviewCard from "./CreateReviewCard";
import ReviewCard from "./ReviewCard";
import type { ReviewType } from "~/models/Review";

export default function ReviewList({
  reviews,
  currentUser,
  book,
  userHasReviewed,
}: {
  reviews: any[];
  currentUser: string;
  book: any;
  userHasReviewed: boolean;
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);
  const [isCreatingReview, setIsCreatingReview] = useState(false);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  return (
    <div className="flex flex-col mt-6 w-full">
      <h3 className="text-center">Reviews</h3>
      <div className="mt-4 w-full mx-auto">
        {/* Center the create-review button */}
        {!userHasReviewed && (
          <div className="flex justify-center">
            {isCreatingReview ? (
              <CreateReviewCard
                bookId={book._id}
                onCancel={() => setIsCreatingReview(false)}
                onCreate={(newReview) => {
                  // Immediately update the list with the new review
                  setLocalReviews((prev) => [newReview, ...prev]);
                }}
              />
            ) : (
              <Button onClick={() => setIsCreatingReview(true)}>
                Write a review
              </Button>
            )}
          </div>
        )}
        {/* Render each review */}
        {localReviews.map((review) => (
          <div key={review._id} className="w-full">
            {editingReview && editingReview._id === review._id ? (
              <UpdateReviewForm
                review={review}
                bookId={book._id}
                onCancel={() => setEditingReview(null)}
                onUpdate={(result) => {
                  if (result.deleted) {
                    setLocalReviews((prev) =>
                      prev.filter((r) => r._id !== result.reviewId),
                    );
                  } else if (result.review) {
                    setLocalReviews((prev) =>
                      prev.map((r) =>
                        r._id === result.review._id ? result.review : r,
                      ),
                    );
                  }
                  setEditingReview(null);
                }}
              />
            ) : (
              <ReviewCard
                review={review}
                bookId={book._id}
                currentUser={currentUser}
                onEdit={(rev) => setEditingReview(rev)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
