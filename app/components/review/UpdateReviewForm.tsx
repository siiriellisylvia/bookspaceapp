import { useFetcher } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
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
    formData.append("action", "deleteReview");
    fetcher.submit(formData, {
      method: "post",
      action: `/books/${bookId}/review`,
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
        <fetcher.Form method="post" action={`/books/${bookId}/review`}>
          <input type="hidden" name="reviewId" value={review._id} />
          <input type="hidden" name="rating" value={editContent.rating} />
          <div className="flex justify-between items-center">
            <label className="font-semibold text-primary-beige">
              Edit your review
            </label>
            <span className="text-xs text-primary-beige-80">Posted: {formattedDate}</span>
          </div>
          <div className="flex gap-1 mt-2 justify-end">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setEditContent({ ...editContent, rating: num })}
                className=" text-primary-burgundy dark:text-primary-beige"
              >
                {num <= editContent.rating ? (
                  <AiFillStar size={20} />
                ) : (
                  <AiOutlineStar size={20} />
                )}
              </button>
            ))}
          </div>
          <textarea
            name="comment"
            value={editContent.comment}
            onChange={(e) =>
              setEditContent({ ...editContent, comment: e.target.value })
            }
            className="w-full border p-2 rounded-md mt-4 text-primary-beige"
          />

          <div className="flex flex-col justify-end gap-2 mt-4">
            <div className="flex gap-2 justify-end">
              <Button type="submit" name="action" value="updateReview">
                Update
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
              <AlertDialogAction onClick={handleDeleteReview}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
