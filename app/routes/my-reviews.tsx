import { getAuthUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import { redirect, useNavigate, Link, useLoaderData } from "react-router";
import Review from "~/models/Review";
import type { ReviewType } from "~/models/Review";
import type { BookType } from "~/models/Book";
import { Separator } from "~/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

// Define a type that includes the populated book data
type ReviewWithBook = Omit<ReviewType, "book"> & {
  book: BookType & { _id: string };
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }
  try {
    // Get all reviews by the current user with populated book data
    const reviews = await Review.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate<{ book: BookType & { _id: string } }>("book")
      .lean();

    console.log("Found reviews:", reviews.length);

    // Convert ObjectId to string and handle nested objects
    const serializedReviews = reviews.map((review) => ({
      ...review,
      _id: review._id.toString(),
      book: {
        ...review.book,
        _id: (review.book as BookType & { _id: string })._id.toString(),
      },
    }));

    return Response.json({
      user,
      reviews: serializedReviews,
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    return Response.json({ reviews: [] });
  }
}

export default function MyReviewsPage() {
  // Use useLoaderData hook to get data from the loader
  const { reviews } = useLoaderData<{ reviews: ReviewWithBook[] }>();

  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? "text-primary-burgundy dark:text-primary-beige fill-primary-burgundy dark:fill-primary-beige"
                : "text-primary-beige-20 dark:text-primary-beige-20"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <main className="h-screen px-4 pt-20 pb-6 max-w-4xl mx-auto">
      <div className="w-full flex justify-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden absolute left-4 top-20"
        >
          <ChevronLeft />
        </Button>
        <h1>My reviews</h1>
      </div>
      <div>
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <p>You haven't written any reviews yet.</p>
            <Link to="/books">
              <Button variant="default">Browse books</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {reviews.map((review, index) => (
              <div key={review._id.toString()} className="mb-4">
                <div className="flex gap-4 items-start py-4">
                  <div className="flex-shrink-0 w-20">
                    <Link to={`/books/${review.book._id}`}>
                      <img
                        src={
                          review.book.coverImage?.url ||
                          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop"
                        }
                        alt={review.book.title}
                        className="w-20 h-28 object-cover rounded-md shadow-sm"
                      />
                    </Link>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between">
                      <Link
                        to={`/books/${review.book._id}`}
                        className="text-lg font-semibold font-heading text-primary-dark dark:text-primary-beige"
                      >
                        {review.book.title}
                      </Link>
                    </div>
                    <div className="flex items-center mb-2">
                      {renderStars(review.rating)}
                      <span className="ml-auto text-right text-primary-burgundy dark:text-primary-beige-80 text-sm">
                        {formatDate(review.createdAt?.toString() || "")}
                      </span>
                    </div>
                    <p className="text-primary-dark dark:text-primary-beige-80 text-sm mb-3 line-clamp-3">
                      {review.comment}
                    </p>
                  </div>
                </div>
                {index < reviews.length - 1 && (
                  <Separator/>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
