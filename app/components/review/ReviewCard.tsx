import { Card, CardContent } from "~/components/ui/card";
import { AiFillStar } from "react-icons/ai";
import { Button } from "~/components/ui/button";
import { PencilLine } from "lucide-react";

export default function ReviewCard({
  review,
  bookId,
  currentUser,
  onEdit,
}: {
  review: any;
  bookId: string;
  currentUser: string;
  onEdit: (review: any) => void;
}) {
  // Determine if this review was written by the current user
  const isOwner = review.user._id.toString() === currentUser;

  // Format the date
  const formattedDate = review.createdAt 
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';

  return (
    <Card key={review._id} className="mb-3 p-4 shadow-sm">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-primary-beige" />
          <div className="flex flex-col gap-2">
            <div className="flex items-start flex-col gap-2">
              <p className="font-semibold">{review.user.name}</p>
              <span className="text-xs text-primary-burgundy dark:text-primary-beige-80">{formattedDate}</span>
            </div>
            <div className="flex gap-2 text-primary-burgundy dark:text-primary-beige">
              {/* Create an array with length equal to review.rating and map over it */}
              {[...Array(review.rating)].map((_, i) => (
                <AiFillStar key={i} size={20} />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-primary-beige-80">{review.comment}</p>
        <div className="flex items-center gap-4 mt-2">
          {isOwner && (
            <Button
              type="button"
              variant="default"
              onClick={() => onEdit(review)}
              className="ml-auto flex items-center gap-3"
            >
              <PencilLine size={16} />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
