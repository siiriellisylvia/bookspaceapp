import { useState, useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

export default function CreateReviewCard({
  bookId,
  onCancel,
  onCreate,
}: {
  bookId: string;
  onCancel: () => void;
  onCreate: (newReview: any) => void;
}) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const fetcher = useFetcher();
  const formRef = useRef<HTMLDivElement>(null);

  const errors = fetcher.data?.errors || {};
  const generalError = fetcher.data?.error;

  const formatErrorMessage = (message: string) => {
    if (message.includes("Path `rating`") && message.includes("minimum")) {
      return "Rating between 1-5 is required";
    }
    return message;
  };

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  useEffect(() => {
    console.log("Fetcher state:", fetcher.state, "Fetcher data:", fetcher.data);
    if (fetcher.data?.success && fetcher.data.review) {
      console.log("New review response:", fetcher.data.review);
      onCreate(fetcher.data.review);
      onCancel();
    }
  }, [fetcher.data, onCancel, onCreate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    fetcher.submit(formData, {
      method: "post",
      action: `/books/${bookId}/review`
    });
  };

  return (
    <Card className="mb-3 p-4 shadow-sm bg-transparent w-full" ref={formRef}>
      <CardContent>
        <fetcher.Form method="post" action={`/books/${bookId}/review`} onSubmit={handleSubmit}>
          <label className="font-semibold text-primary-beige">
            Write a review
          </label>

          {generalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mt-2">
              {generalError}
            </div>
          )}

          <div className="flex gap-1 justify-end mt-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className=" text-primary-burgundy dark:text-primary-beige"
              >
                {rating !== null && num <= rating ? (
                  <AiFillStar size={20} />
                ) : (
                  <AiOutlineStar size={20} />
                )}
              </button>
            ))}
          </div>
          {(errors.rating || rating === null && fetcher.data?.errors) && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {formatErrorMessage(errors.rating || "Rating between 1-5 is required")}
            </p>
          )}

          <textarea
            name="comment"
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`w-full border p-2 rounded-md mt-2 text-primary-burgundy dark:text-primary-beige ${
              errors.comment ? "border-red-500" : ""
            }`}
          />
          {errors.comment && (
            <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
          )}

          <input type="hidden" name="rating" value={rating || ""} />
          <div className="flex gap-2 justify-end mt-4">
            <Button 
              type="submit"
              disabled={fetcher.state === "submitting"}
            >
              {fetcher.state === "submitting" ? "Submitting..." : "Submit review"}
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
