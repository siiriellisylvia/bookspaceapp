import { useState } from "react";
import { Link, useLoaderData, redirect, useNavigate } from "react-router";
import type { Route } from "../+types/root";
import { getAuthUser } from "../services/auth.server";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { type BookType } from "../models/Book";
import Book from "../models/Book";
import { type UserType } from "../models/User";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }

  // Get user's book collection and filter by status
  const userBooks = await Book.find({
    _id: { $in: user.bookCollection.map((item) => item.bookId) },
  });

  // Map books with their progress and status from user collection
  const booksWithStatus = userBooks.map((book) => {
    const userBookEntry = user.bookCollection.find(
      (item) => item.bookId?.toString() === book._id.toString(),
    );

    return {
      ...book.toObject(),
      progress: userBookEntry?.progress || 0,
      status: userBookEntry?.status || "not_started",
      isBookmarked: userBookEntry?.isBookmarked || false,
    };
  });

  return Response.json({ user, books: booksWithStatus });
}

export default function MyBooksPage() {
  const { books } = useLoaderData<{
    user: UserType;
    books: (BookType & {
      status: string;
      progress: number;
      isBookmarked: boolean;
    })[];
  }>();
  const [activeTab, setActiveTab] = useState("current");

  const navigate = useNavigate();
  // Filter books by status
  const currentBooks = books.filter((book) => book.status === "reading");
  const finishedBooks = books.filter((book) => book.status === "finished");

  return (
    <main className="min-h-screen py-20 px-4 md:py-10 md:px-40">
      <div className="w-full flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden"
        >
          <ChevronLeft />
        </Button>
      </div>
      <div className="px-4 max-w-4xl mx-auto">
        <Tabs
          defaultValue="current"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6 bg-primary-off-white dark:bg-primary-dark border border-primary-beige dark:border-primary-beige-20 rounded-lg">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="finished">Finished</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="current" className="w-full">
            {currentBooks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-primary-dark dark:text-primary-beige mb-4">
                  You don't have any books marked as currently reading.
                </p>
                <Link to="/books">
                  <button className="bg-primary-burgundy text-white dark:bg-primary-beige dark:text-primary-dark px-4 py-2 rounded-md">
                    Browse books
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {currentBooks.map((book) => (
                  <div
                    key={book._id.toString()}
                    className="flex gap-4 items-center border-b border-primary-beige-20 pb-4"
                  >
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
                        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-beige">
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-sm text-primary-burgundy dark:text-primary-beige-80">
                        by {book.author}
                      </p>
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
                          <span className="text-xs text-primary-burgundy dark:text-primary-beige-80">
                            {book.progress} of {book.pageCount} pages
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link to={`/books/${book._id}/read`}>
                          <Button variant="default">Reading mode</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finished" className="w-full">
            {finishedBooks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-primary-dark dark:text-primary-beige mb-4">
                  You don't have any books marked as finished yet.
                </p>
                <Link to="/books">
                  <Button variant="default">Browse books</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {finishedBooks.map((book) => (
                  <div
                    key={book._id.toString()}
                    className="flex gap-4 items-center border-b border-primary-beige-20 pb-4"
                  >
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
                        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-beige">
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-sm text-primary-burgundy dark:text-primary-beige-80">
                        by {book.author}
                      </p>
                      <div className="mt-1">
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (book.rating || 0)
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
                      </div>
                      <div className="mt-3">
                        <Link to={`/books/${book._id}/read`}>
                          <Button variant="default">Reading mode</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
