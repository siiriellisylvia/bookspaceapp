import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book from "~/models/Book";
import User from "~/models/User";
import { X } from "lucide-react";
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
    (entry) => entry.bookId?.toString() === params.bookId
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
    <div className="flex flex-col items-center px-4 py-20 max-w-md mx-auto">
      <div className="w-full flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <X />
        </Button>
      </div>

      <form method="post" className="w-full">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-xl font-semibold font-sans mx-auto">
            Finish reading session
          </p>

          <h1 className="text-lg font-medium">What page did you stop on?</h1>
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setPageNumber((prev) => String(Math.max(1, Number(prev) - 10)))
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
          <p>of {book.pageCount} pages read</p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row gap-4 text-sm w-full justify-between">
            <label className="block text-sm font-medium">Reading time</label>
            <div className="flex flex-row gap-2">
              <input
                type="number"
                name="minutesRead"
                value={minutesRead}
                onChange={(e) => setMinutesRead(e.target.value)}
                min="1"
                className="w-15 text-center border-none focus:outline-none"
              />
              minutes
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div>Date</div>
            <div>{formattedDate}</div>
          </div>
          <div className="flex justify-between text-sm">
            <div>Time</div>
            <div>{formattedTime}</div>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Save
          </Button>
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
    // If the book is not in the collection, add it
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    user.bookCollection.push({
      bookId: bookObjectId,
      progress: pageNumber,
      isCurrentlyReading: true,
      readingSessions: [
        {
          startTime: new Date(Date.now() - minutesRead * 60 * 1000), // Approximate start time
          endTime: new Date(),
          pagesRead: pageNumber,
          minutesRead: minutesRead,
        },
      ],
    });
  } else {
    // Add a new reading session to the existing book entry
    user.bookCollection[bookIndex].readingSessions.push({
      startTime: new Date(Date.now() - minutesRead * 60 * 1000), // Approximate start time
      endTime: new Date(),
      pagesRead: pageNumber - (user.bookCollection[bookIndex].progress || 0),
      minutesRead: minutesRead,
    });

    // Update the overall progress to the current page
    user.bookCollection[bookIndex].progress = pageNumber;
  }

  await user.save();

  // Redirect back to the book detail page
  return redirect(`/books/${bookId}`);
}
