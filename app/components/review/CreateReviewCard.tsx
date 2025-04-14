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
  const [rating, setRating] = useState(0);
  const fetcher = useFetcher();
  const formRef = useRef<HTMLDivElement>(null);

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
    console.log("Fetcher state:", fetcher.state, "Fetcher data:", fetcher.data);
    if (fetcher.data?.success && fetcher.data.review) {
      console.log("New review response:", fetcher.data.review);
      onCreate(fetcher.data.review);
      onCancel();
    }
  }, [fetcher.data, onCancel, onCreate]);

  return (
    <Card className="mb-3 p-4 shadow-sm bg-transparent w-full" ref={formRef}>
      <CardContent>
        <fetcher.Form method="post" action={`/books/${bookId}/review`}>
          <input type="hidden" name="action" value="createReview" />
          <label className="font-semibold text-primary-beige ">
            Write a review
          </label>
          <textarea
            name="comment"
            placeholder="Write your review..."
            className="w-full border p-2 rounded-md mt-2 text-primary-beige"
          />
          <div className="flex gap-1 justify-start mt-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className=" text-primary-burgundy dark:text-primary-beige"
              >
                {num <= rating ? (
                  <AiFillStar size={20} />
                ) : (
                  <AiOutlineStar size={20} />
                )}
              </button>
            ))}
          </div>
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-2 mt-2">
            <Button type="submit">Submit Review</Button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}
