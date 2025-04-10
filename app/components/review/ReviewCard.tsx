import { Card, CardContent } from "~/components/ui/card";
import { AiFillStar } from "react-icons/ai";
import { FaThumbsUp, FaThumbsDown, FaEdit } from "react-icons/fa";
import { Button } from "~/components/ui/button";

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

  return (
    <Card key={review._id} className="mb-3 p-4 shadow-sm bg-transparent">
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gray-200" />
          <div>
            <p className="font-semibold">{review.user.name}</p>
            <div className="flex gap-1 text-primary-burgundy dark:text-primary-beige">
              {/* Create an array with length equal to review.rating and map over it */}
              {[...Array(review.rating)].map((_, i) => (
                <AiFillStar key={i} size={16} />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-gray-700">{review.comment}</p>
        <div className="flex items-center gap-4 mt-2">
          <button className="text-gray-500 hover:text-blue-500 flex items-center gap-1">
            <FaThumbsUp size={16} /> 12
          </button>
          <button className="text-gray-500 hover:text-red-500 flex items-center gap-1">
            <FaThumbsDown size={16} /> 3
          </button>
          {isOwner && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(review)}
              className="ml-auto flex items-center gap-1"
            >
              <FaEdit size={16} />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
