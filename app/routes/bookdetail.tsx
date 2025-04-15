import type { Route } from "../+types/root";
import Book, { type BookType } from "../models/Book";
import type { UserType } from "../models/User";
import {
  AiOutlineBook,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai"; // Book icons
import { FaBookmark, FaRegBookmark, FaBookOpen, FaBook } from "react-icons/fa"; // Bookmark icons
import { ChevronLeft } from "lucide-react"; // Import back arrow icon
import BookCard from "~/components/BookCard";
import { getRecommendedBooks } from "~/utils/getBooks";
import { useState } from "react";
import { redirect, useFetcher, Link, useNavigate } from "react-router";
import { getAuthUser } from "~/services/auth.server";
import { Button } from "~/components/ui/button";
import Review from "~/models/Review";
import ReviewList from "~/components/review/ReviewList";
import { renderStars } from "../utils/renderStars";

// Loader to fetch book data from MongoDB
export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await getAuthUser(request);
  if (!currentUser) {
    throw redirect("/signin");
  }

  const book = await Book.findById(params.id);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  const bookCollectionEntry = currentUser.bookCollection.find(
    (entry) => entry.bookId?.toString() === book._id.toString(),
  );
  const isBookmarked = bookCollectionEntry?.isBookmarked || false;
  const readingStatus = bookCollectionEntry?.status || "not_started";
  const hasReadingSessions =
    (bookCollectionEntry?.readingSessions || []).length > 0;
  const progress = bookCollectionEntry?.progress || 0;
  const progressPercent =
    progress && book.pageCount ? (progress / book.pageCount) * 100 : 0;
  const isFinished = readingStatus === "finished";
  const isReading = readingStatus === "reading";
  const isInCollection = !!bookCollectionEntry;

  const recommendedBooks = await getRecommendedBooks(book);

  const reviews = await Review.find({ book: params.id })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  // If a user is missing, replace `null` with "Deleted User"
  const processedReviews = reviews.map((review) => ({
    ...review,
    user: review.user
      ? { _id: (review.user as any)._id, name: (review.user as any).name } // keep _id if user exists
      : { _id: "deleted", name: "Deleted User" }, // provide fallback _id for deleted users
  }));

  // Check if the auth user has already reviewed the book
  const userHasReviewed = reviews.some(
    (review) =>
      review.user &&
      (review.user as any)._id.toString() === currentUser._id.toString(),
  );

  return Response.json({
    book,
    recommendedBooks,
    reviews: processedReviews,
    userHasReviewed,
    isBookmarked,
    readingStatus,
    isReading,
    progress,
    hasReadingSessions,
    progressPercent,
    currentUser,
    isFinished,
    isInCollection,
  });
}

// Helper function to truncate text without breaking words
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  let truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated + "...";
}

// Book Detail Component
export default function BookDetail({
  loaderData,
}: {
  loaderData: {
    book: BookType;
    recommendedBooks: BookType[];
    isBookmarked: boolean;
    readingStatus: string;
    isReading: boolean;
    reviews: any[];
    userHasReviewed: boolean;
    currentUser: UserType;
    progress: number;
    hasReadingSessions: boolean;
    progressPercent: number;
    isFinished: boolean;
    isInCollection: boolean;
  };
}) {
  const {
    book,
    recommendedBooks,
    isBookmarked,
    readingStatus,
    isReading,
    reviews,
    userHasReviewed,
    currentUser,
    progress,
    hasReadingSessions,
    progressPercent,
    isFinished,
    isInCollection,
  } = loaderData;
  const fetcher = useFetcher();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const maxChars = 250;
  const truncatedDescription = truncateText(book.description, maxChars);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 py-20 md:px-4 md:p-10 max-w-full sm:max-w-xl lg:max-w-2xl mx-auto">
      <div className="w-full flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden"
        >
          <ChevronLeft />
        </Button>
      </div>
      <div className="relative w-full">
        <img
          src={book.coverImage?.url}
          alt={book.title}
          className="w-1/2 md:w-full rounded-lg shadow-lg mx-auto"
        />
        {isInCollection && hasReadingSessions && (
          <div className="mt-2">
            <div className="w-1/2 md:w-full mx-auto bg-primary-beige dark:bg-primary-beige-20 rounded-full h-2">
              <div
                className="bg-primary-burgundy dark:bg-primary-beige h-2 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-center mt-1">
              {progress} of {book.pageCount} pages read
            </p>
          </div>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {book.title}
      </h1>
      <h2 className="dark:text-primary-beige-80!">
        by {book.author.join(", ")}
      </h2>

      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="flex items-center gap-6 text-primary-beige">
          <div className="flex items-center gap-1">
            {renderStars(book.rating)}
            <span className="text-sm md:text-lg">{book.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <AiOutlineBook size={20} />
            <span className="text-sm md:text-lg">{book.pageCount}</span>
          </div>
          <div className="text-sm md:text-lg">{book.genres[0]}</div>
        </div>

        <div className="flex gap-2 mt-2">
          <fetcher.Form method="post" action={`/books/${book._id}/bookmark`}>
            <Button
              type="submit"
              variant="default"
              disabled={fetcher.state !== "idle"}
              className="text-xs md:text-sm"
            >
              {isBookmarked ? (
                <FaBookmark size={24} />
              ) : (
                <FaRegBookmark size={24} />
              )}
              {isBookmarked ? "" : "Bookmark"}
            </Button>
          </fetcher.Form>

          {!isFinished && (
            <Link to={`/books/${book._id}/read`}>
              <Button
                variant="default"
                className="flex items-center gap-2 text-xs md:text-sm"
                onClick={() => {
                  // Set status to reading when clicking the read button
                  if (!isReading) {
                    fetcher.submit(
                      { action: "setCurrentlyReading" },
                      { method: "post", action: `/books/${book._id}/bookmark` },
                    );
                  }
                }}
              >
                {hasReadingSessions || isReading ? (
                  <FaBookOpen size={20} />
                ) : (
                  <FaBook size={20} />
                )}
                {hasReadingSessions || isReading ? "Continue" : "Read"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 w-full">
        <h3 className="text-xl font-semibold">Description</h3>
        {book.description.length > maxChars ? (
          <div>
            <p
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 cursor-pointer hover:text-primary-burgundy"
            >
              {isDescriptionExpanded ? book.description : truncatedDescription}
            </p>
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="flex items-center mt-2 cursor-pointer"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
              {isDescriptionExpanded ? (
                <AiOutlineUp size={16} className="ml-1" />
              ) : (
                <AiOutlineDown size={16} className="ml-1" />
              )}
            </button>
          </div>
        ) : (
          <p className="mt-2">{book.description}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 mt-6">
        <h3 className="text-xl font-semibold">You might also like</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {recommendedBooks.length > 0 ? (
            recommendedBooks.map((rBook: BookType) => (
              <BookCard
                key={rBook._id.toString()}
                book={rBook}
                progress={undefined}
              />
            ))
          ) : (
            <p className="text-primary-beige">No similar books found.</p>
          )}
        </div>
      </div>
      
      <div className="w-full mt-6">
        <ReviewList
          reviews={reviews}
          book={book}
          userHasReviewed={userHasReviewed}
          currentUser={currentUser._id.toString()}
        />
      </div>
    </div>
  );
}
