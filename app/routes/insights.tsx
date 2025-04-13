import type { Route } from "../+types/root";
import { authenticateUser} from "~/services/auth.server";
import User from "~/models/User";
import Book from "~/models/Book";
import { Card } from "~/components/ui/card";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await authenticateUser(request);
  if (!currentUserId) {
    throw redirect("/signin");
  }
  const user = await User.findById(currentUserId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Calculate total reading minutes
  let totalMinutesRead = 0;

  // Track reading minutes per book
  const booksReadingData = await Promise.all(
    user.bookCollection.map(async (bookEntry) => {
      // Sum minutes for each book
      const bookMinutes = bookEntry.readingSessions.reduce(
        (total, session) => total + (session.minutesRead || 0),
        0,
      );

      totalMinutesRead += bookMinutes;

      // Fetch book details
      const book = await Book.findById(bookEntry.bookId);

      return {
        bookId: bookEntry.bookId,
        title: book ? book.title : "Unknown Book",
        author: book ? book.author.join(", ") : "Unknown Author",
        minutes: bookMinutes,
        coverImage: book?.coverImage?.url,
      };
    }),
  );

  // Sort books by reading time (highest first)
  const sortedBooks = [...booksReadingData]
    .filter((book) => book.minutes > 0) // Only include books with reading time
    .sort((a, b) => b.minutes - a.minutes);

  return Response.json({
    totalMinutesRead,
    totalBooksRead: sortedBooks.length,
  });
}

export default function Insights({
  loaderData,
}: {
  loaderData: {
    totalMinutesRead: number;
    topBooks: { title: string; author: string; minutes: number }[];
    totalBooksRead: number;
  };
}) {
    const { totalMinutesRead, totalBooksRead } = loaderData;


  return (
    <div className="container mx-auto py-20 px-2">
      <h1 className="mb-8 text-center">Reading insights</h1>

      <Card className="bg-primary-dark text-primary-beige">
          <h2 className="text-center mb-2">Total reading time</h2>
          <p className="text-4xl! font-bold text-center text-primary-burgundy">
            {totalMinutesRead} minutes
          </p>
          <p className="text-center text-primary-beige mt-2">
            That's approximately {Math.round(totalMinutesRead / 60)} hours of
            reading!
          </p>
        </Card>

        <Card className="bg-primary-dark text-primary-beige mt-2">
          <h2 className="text-center mb-2">Books read</h2>
          <p className="text-4xl! font-bold text-center text-primary-burgundy">
            {totalBooksRead}
          </p>
          <p className="text-center text-muted-foreground mt-2">
            Keep going to expand your reading journey!
          </p>
        </Card>

    </div>
  );
}
