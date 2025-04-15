import { Link, useLoaderData, redirect, useNavigate } from "react-router";
import type { Route } from "../+types/root";
import { getAuthUser } from "../services/auth.server";
import { type BookType } from "../models/Book";
import Book from "../models/Book";
import { type UserType } from "../models/User";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { renderStars } from "../utils/renderStars";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }

  // Get bookmarked books from user's book collection
  const bookmarkedBookIds = user.bookCollection
    .filter(item => item.isBookmarked)
    .map(item => item.bookId);

  if (bookmarkedBookIds.length === 0) {
    return Response.json({ user, bookmarkedBooks: [] });
  }

  // Get the actual book objects for the bookmarked books
  const bookmarkedBooks = await Book.find({
    _id: { $in: bookmarkedBookIds },
  });

  // Map books with their progress and status from user collection
  const booksWithUserData = bookmarkedBooks.map((book) => {
    const userBookEntry = user.bookCollection.find(
      (item) => item.bookId?.toString() === book._id.toString(),
    );

    return {
      ...book.toObject(),
      progress: userBookEntry?.progress || 0,
      status: userBookEntry?.status || "not_started",
      isBookmarked: true,
    };
  });

  return Response.json({ user, bookmarkedBooks: booksWithUserData });
}

export default function MyBookmarksPage() {
  const { bookmarkedBooks } = useLoaderData<{
    user: UserType;
    bookmarkedBooks: (BookType & {
      status: string;
      progress: number;
      isBookmarked: boolean;
    })[];
  }>();

  const navigate = useNavigate();

  return (
    <main className="min-h-screen py-20 px-4 md:py-10 md:px-40">
      <div className="w-full flex justify-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden absolute left-4 top-20"
        >
          <ChevronLeft />
        </Button>
        <h1>My bookmarks</h1>
      </div>
      <div className="px-4 max-w-4xl mx-auto">
        {bookmarkedBooks.length === 0 ? (
          <div className="text-center py-10">
            <p className="mb-4">
              You haven't bookmarked any books yet.
            </p>
            <Link to="/books">
              <Button variant="default">Browse books</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookmarkedBooks.map((book, index) => (
              <div key={book._id.toString()}>
                <div className="flex gap-4 items-center py-4">
                  <Link
                    to={`/books/${book._id}`}
                    className="flex-shrink-0 w-20"
                  >
                    <img
                      src={
                        book.coverImage?.url ||
                        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop"
                      }
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-md shadow-sm"
                    />
                  </Link>
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <Link to={`/books/${book._id}`}>
                        <h3 className="text-lg font-semibold font-heading">
                          {book.title}
                        </h3>
                      </Link>
                    </div>
                    <p className="text-sm">
                      by {book.author}
                    </p>
                    {book.status === "reading" && (
                      <div className="mt-1">
                        <div className="w-full bg-primary-beige-20 dark:bg-primary-beige-10 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary-burgundy dark:bg-primary-beige h-2 rounded-full"
                            style={{
                              width: `${(book.progress / (book.pageCount || 100)) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs">
                            {book.progress} of {book.pageCount} pages read so far
                          </span>
                        </div>
                      </div>
                    )}
                    {book.rating > 0 && (
                      <div className="mt-2">
                        {renderStars(book.rating)}
                      </div>
                    )}
                    <div className="mt-3">
                      <Link to={`/books/${book._id}`}>
                        <Button variant="default">View book</Button>
                      </Link>
                    </div>
                  </div>
                </div>
                {index < bookmarkedBooks.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}