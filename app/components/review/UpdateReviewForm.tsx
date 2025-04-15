import { useFetcher } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { AiFillStar } from "react-icons/ai";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export default function UpdateReviewForm({
  review,
  bookId,
  onCancel,
  onUpdate,
}: {
  review: any;
  bookId: string;
  onCancel: () => void;
  onUpdate: (updatedReview: any) => void;
}) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLDivElement>(null);
  const [editContent, setEditContent] = useState({
    comment: review.comment,
    rating: review.rating,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get errors from fetcher data
  const errors = fetcher.data?.errors || {};
  const generalError = fetcher.data?.error;

  // Format error messages for better user display
  const formatErrorMessage = (message: string) => {
    if (message.includes("Path `rating`") && message.includes("minimum")) {
      return "Rating between 1-5 is required";
    }
    return message;
  };

  useEffect(() => {
    // Scroll to the form when it's mounted
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  useEffect(() => {
    console.log(
      "Update form fetcher state:",
      fetcher.state,
      "data:",
      fetcher.data,
    );
    if (fetcher.data?.success) {
      if (fetcher.data.deleted) {
        // For deletion, send an object indicating deletion and reviewId.
        onUpdate({ deleted: true, reviewId: review._id });
      } else if (fetcher.data.review) {
        // For update, send an object with a review property.
        onUpdate({ review: fetcher.data.review });
      }
      onCancel();
    }
  }, [fetcher.data, onCancel, onUpdate, review._id]);

  const handleDeleteReview = () => {
    const formData = new FormData();
    formData.append("reviewId", review._id);
    fetcher.submit(formData, {
      method: "post",
      action: `/books/${bookId}/delete-review`,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check if rating is valid
    if (!editContent.rating || editContent.rating < 1 || editContent.rating > 5) {
      // Create a local error state to show the validation message
      const formData = new FormData(event.currentTarget);
      fetcher.submit(formData, {
        method: "post", 
        action: `/books/${bookId}/edit-review`
      });
      return;
    }
    
    // Otherwise proceed with normal form submission
    fetcher.submit(event.currentTarget, {
      method: "post",
      action: `/books/${bookId}/edit-review`
    });
  };

  // Format the date
  const formattedDate = review.createdAt 
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';

  return (
    <Card className="mb-3 p-4 shadow-sm w-full" ref={formRef}>
      <CardContent>
        <fetcher.Form method="post" action={`/books/${bookId}/edit-review`} onSubmit={handleSubmit}>
          <input type="hidden" name="reviewId" value={review._id} />
          <input type="hidden" name="rating" value={editContent.rating} />
          
          <div className="flex justify-between items-center">
            <label className="font-semibold text-primary-beige">
              Edit your review
            </label>
            <span className="text-xs text-primary-beige-80">Posted: {formattedDate}</span>
          </div>
          
          {/* Display general error message if any */}
          {generalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mt-2">
              {generalError}
            </div>
          )}
          
          <div className="flex gap-1 mt-2 justify-end">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setEditContent({ ...editContent, rating: num })}
                className={`${
                  num <= editContent.rating 
                    ? "text-primary-burgundy dark:text-primary-beige" 
                    : "text-primary-beige-20 dark:text-primary-beige-20"
                }`}
              >
                <AiFillStar size={20} />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {formatErrorMessage(errors.rating)}
            </p>
          )}
          
          <textarea
            name="comment"
            value={editContent.comment}
            onChange={(e) =>
              setEditContent({ ...editContent, comment: e.target.value })
            }
            className={`w-full border p-2 rounded-md mt-4 text-primary-beige ${
              errors.comment ? "border-primary-destructive" : ""
            }`}
          />
          {errors.comment && (
            <p className="text-xs mt-1">{errors.comment}</p>
          )}

          <div className="flex flex-col justify-end gap-2 mt-4">
            <div className="flex gap-2 justify-end">
              <Button 
                type="submit" 
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "Updating..." : "Update"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              className="flex justify-end"
              onClick={() => setShowDeleteDialog(true)}
              disabled={fetcher.state === "submitting"}
            >
              Delete review
            </Button>
          </div>
        </fetcher.Form>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteReview}
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
