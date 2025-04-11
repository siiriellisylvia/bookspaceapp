import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book from "~/models/Book";
import { X } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await authenticateUser(request);
  if (!currentUser) {
    throw redirect("/signin");
  }

  const book = await Book.findById(params.bookId);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  return Response.json({
    currentUser,
    book,
  });
}

export default function FinishReadingSession({
  loaderData,
}: {
  loaderData: {
    book: any;
    currentUser: any;
  };
}) {
  const { book } = loaderData;
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState("30");
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
