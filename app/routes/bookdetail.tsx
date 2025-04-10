import type { Route } from "../+types/root";
import Book, { type BookType } from "../models/Book";
import User from "../models/User";
import {
  AiOutlineStar,
  AiOutlineBook,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai"; // Star & book icons
import { FaBookmark, FaRegBookmark } from "react-icons/fa"; // Bookmark icons
import BookCard from "~/components/BookCard";
import { getRecommendedBooks } from "~/utils/getRecommendedBooks";
import { useState } from "react";
import { redirect, useFetcher } from "react-router";
import { getAuthUser } from "~/services/auth.server";
import { Button } from "~/components/ui/button";

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

  const isBookmarked = currentUser.bookCollection.some(
    (entry) => entry.bookId?.toString() === book._id.toString(),
  );

  const recommendedBooks = await getRecommendedBooks(book);

  return Response.json({ book, recommendedBooks, isBookmarked });
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
  };
}) {
  const { book, recommendedBooks, isBookmarked } = loaderData;
  const fetcher = useFetcher();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const maxChars = 250;
  const truncatedDescription = truncateText(book.description, maxChars);

  return (
    <div className="flex flex-col items-center p-4 md:p-10 max-w-3xl mx-auto">
      <div className="relative w-full max-w-sm">
        <img
          src={book.coverImage?.url}
          alt={book.title}
          className="w-full rounded-lg shadow-lg"
        />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {book.title}
      </h1>
      <h2 className="text-lg text-gray-600">by {book.author.join(", ")}</h2>

      <div className="flex items-center gap-6 mt-4 text-gray-700">
        <div className="flex items-center gap-1">
          <AiOutlineStar size={20} className="text-yellow-500" />
          <span className="text-lg">{book.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <AiOutlineBook size={20} />
          <span className="text-lg">{book.pageCount}</span>
        </div>
        <div className="text-lg">{book.genres[0]}</div>
        <fetcher.Form method="post" action={`/books/${book._id}/bookmark`}>
          <Button
            type="submit"
            variant="default"
            className="p-2 bg-primary-burgundy hover:bg-primary-burgundy/80"
            disabled={fetcher.state !== "idle"}
          >
            {isBookmarked ? (
              <><FaBookmark className="fill-primary-off-white" size={24} /><p>Bookmarked</p></>
            ) : (
              <><FaRegBookmark size={24} /><p>Bookmark</p></>
            )}
          </Button>
        </fetcher.Form>
      </div>

      <div className="mt-6 w-full">
        <h3 className="text-xl font-semibold">Description</h3>
        {book.description.length > maxChars ? (
          <div>
            <p
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 cursor-pointer hover:text-gray-600"
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
              <BookCard key={rBook._id.toString()} book={rBook} />
            ))
          ) : (
            <p className="text-gray-500">No similar books found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
