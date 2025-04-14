import { useFetcher } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { Button } from "~/components/ui/button";

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

  useEffect(() => {
    // Scroll to the form when it's mounted
    if (formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
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

  return (
    <Card className="mb-3 p-4 shadow-sm w-full" ref={formRef}>
      <CardContent>
        <fetcher.Form method="post" action={`/books/${bookId}/review`}>
          <input type="hidden" name="reviewId" value={review._id} />
          <input type="hidden" name="rating" value={editContent.rating} />
          <label className="font-semibold text-primary-beige">Edit</label>
          <textarea
            name="comment"
            value={editContent.comment}
            onChange={(e) =>
              setEditContent({ ...editContent, comment: e.target.value })
            }
            className="w-full border p-2 rounded-md mt-2 text-primary-beige"
          />
          <div className="flex gap-1 justify-end mt-2">
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
          <div className="flex gap-2 mt-2">
            <Button type="submit" name="action" value="updateReview">
              Update
            </Button>
            <Button
              type="submit"
              name="action"
              value="deleteReview"
              variant="link"
            >
              Delete review
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
