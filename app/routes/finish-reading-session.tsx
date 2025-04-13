import { useState, useEffect } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book from "~/models/Book";
import User from "~/models/User";
import { ChevronLeft } from "lucide-react";
import mongoose from "mongoose";

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUserId = await authenticateUser(request);
  if (!currentUserId) {
    throw redirect("/signin");
  }

  const book = await Book.findById(params.bookId);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  // Get the user with populated book collection
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new Response("User Not Found", { status: 404 });
  }

  // Find the book in the user's collection
  const bookCollectionEntry = user.bookCollection.find(
    (entry) => entry.bookId?.toString() === params.bookId,
  );

  // Get the current progress (page number) for the book
  const currentPage = bookCollectionEntry?.progress || 0;

  // If there's no progress yet, we'll default to page 1
  const initialPageNumber = currentPage > 0 ? currentPage : 1;

  return Response.json({
    currentUser: user,
    book,
    initialPageNumber,
  });
}

export default function FinishReadingSession({
  loaderData,
}: {
  loaderData: {
    book: any;
    currentUser: any;
    initialPageNumber: number;
  };
}) {
  const { book, initialPageNumber } = loaderData;
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(String(initialPageNumber));
  const [minutesRead, setMinutesRead] = useState("15");
  const [searchParams] = useSearchParams();

  // Read the minutesRead from query parameter or sessionStorage
  useEffect(() => {
    // 1. First try to get the value from URL parameters
    const minutesFromTimer = searchParams.get("minutesRead");

    // 2. If URL param doesn't exist or is invalid, try sessionStorage
    let minutesValue = null;
    if (minutesFromTimer && !isNaN(Number(minutesFromTimer))) {
      minutesValue = String(Number(minutesFromTimer));
    } else {
      try {
        const storedMinutes = sessionStorage.getItem("minutesRead");
        if (storedMinutes && !isNaN(Number(storedMinutes))) {
          minutesValue = storedMinutes;
          // Clear the value from storage after using it
          sessionStorage.removeItem("minutesRead");
        }
      } catch (e) {}
    }

    // 3. Update the state if we have a valid value
    if (minutesValue) {
      setMinutesRead(minutesValue);
    }
  }, [searchParams]);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <div className="flex flex-col h-screen py-20 px-2 md:px-40 md:py-10 md:w-1/2 mx-auto">
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

      <form
        method="post"
        className="flex flex-col flex-1 md:pb-12 w-full mx-auto"
      >
        <div className="flex flex-col gap-8 flex-1">
          {/* Page number section */}

          <section className="flex flex-col gap-4 mx-auto">
            <div className="text-center mb-8">
              <p>Finish reading session</p>
              <h1>What page did you stop on?</h1>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPageNumber((prev) =>
                    String(Math.max(1, Number(prev) - 10)),
                  )
                }
                disabled={Number(pageNumber) <= 10}
              >
                -10
              </Button>
              <input
                type="number"
                name="pageNumber"
                value={pageNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = Number(value);
                  if (numValue <= book.pageCount) {
                    setPageNumber(value);
                  }
                }}
                className="w-20 text-center text-3xl border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
                max={book.pageCount}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPageNumber((prev) =>
                    String(Math.min(book.pageCount, Number(prev) + 10)),
                  )
                }
                disabled={Number(pageNumber) >= book.pageCount}
              >
                +10
              </Button>
            </div>
            <p className="text-center">of {book.pageCount} pages read</p>
          </section>

          {/* Reading details section */}
          <section className="flex flex-col gap-6 p-5 rounded-lg border border-primary-beige dark:border-primary-beige">
            <div className="flex flex-row gap-4 text-sm w-full justify-between">
              <label className="block text-sm font-medium">Reading time</label>
              <div className="flex flex-row gap-2">
                <input
                  type="number"
                  name="minutesRead"
                  value={minutesRead}
                  onChange={(e) => setMinutesRead(e.target.value)}
                  min="1"
                  className="w-16 text-center border-none bg-transparent focus:outline-none"
                />
                minutes
              </div>
            </div>
            <div className="flex justify-between text-sm border-t border-primary-beige dark:border-primary-beige pt-3">
              <div>Date</div>
              <div>{formattedDate}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Time</div>
              <div>{formattedTime}</div>
            </div>
          </section>

          {/* Spacer to push button to bottom when needed */}
          <div className="flex-grow"></div>

          {/* Submit button section */}
          <section className="mt-auto">
            <Button type="submit" className="w-full py-6 text-lg">
              Save
            </Button>
          </section>
        </div>
      </form>
    </div>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const currentUser = await authenticateUser(request);
  if (!currentUser) {
    throw redirect("/signin");
  }

  const bookId = params.bookId as string;
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  const user = await User.findById(currentUser);
  if (!user) {
    throw new Response("User Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const minutesRead = Number(formData.get("minutesRead") || "0");
  const pageNumber = Number(formData.get("pageNumber") || "0");

  // Find the book in the user's collection
  const bookIndex = user.bookCollection.findIndex(
    (entry) => entry.bookId?.toString() === bookId,
  );

  if (bookIndex === -1) {
    // The book should already be in the collection at this point
    // If not found, redirect to the book detail page with an error
    return redirect(`/books/${bookId}?error=Book+not+in+collection`);
  }

  // Get the current book entry
  const bookEntry = user.bookCollection[bookIndex];
  
  // Check if this is the first reading session
  const isFirstReadingSession = bookEntry.readingSessions.length === 0;
  
  // Add a new reading session to the existing book entry
  bookEntry.readingSessions.push({
    startTime: new Date(Date.now() - minutesRead * 60 * 1000), // Approximate start time
    endTime: new Date(),
    pagesRead: pageNumber - (bookEntry.progress || 0),
    minutesRead: minutesRead,
  });

  // Update the overall progress to the current page
  bookEntry.progress = pageNumber;
  
  // Update the status based on progress
  if (pageNumber >= book.pageCount) {
    bookEntry.status = 'finished';
  } else if (isFirstReadingSession) {
    // Only set to reading if this was the first reading session
    bookEntry.status = 'reading';
  }
  // Otherwise, keep the existing status

  await user.save();

  // Redirect back to the book detail page
  return redirect(`/books/${bookId}`);
}
