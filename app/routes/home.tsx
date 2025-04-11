import type { Route } from "./+types/home";
import User, { type UserType } from "../models/User";
import { Link, redirect } from "react-router";
import BookCard from "~/components/BookCard";
import { type BookType } from "../models/Book";
import { getAuthUserId } from "../services/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const authUserId = await getAuthUserId(request);

  // Redirect to signin if user is not authenticated
  if (!authUserId) {
    throw redirect("/signin");
  }

  // Fetch user with bookCollection
  const user = await User.findById(authUserId)
    .populate("bookCollection.bookId") // Ensure bookId gets populated
    .lean();

  if (!user) {
    throw new Response("User Not Found", { status: 404 });
  }

  // Ensure bookCollection is correctly structured and remove undefined books
  const bookCollection = user.bookCollection
    .map((entry) => ({
      book: entry.bookId || null, // Ensure we don't crash on undefined
      progress: entry.progress,
    }))
    .filter((entry) => entry.book !== null); // Remove invalid books

  return Response.json({ bookCollection });
}

export default function Home({
  loaderData,
}: {
  loaderData: {
    user: UserType;
    book: BookType;
    authUserId: string;
    bookCollection: { book: BookType; progress: number }[];
  };
}) {
  const { bookCollection } = loaderData;

  return (
    <div className="flex flex-col gap-4 px-2 py-20 md:py-10 items-center max-w-4xl mx-auto">
      <h2>Your book collection</h2>
      {bookCollection.length === 0 ? (
        <p>No books in your collection yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {bookCollection.map((entry, index) =>
            entry.book ? (
              <BookCard book={entry.book} progress={entry.progress} />
            ) : (
              <p key={index} className="text-red-500">
                Error: Book not found
              </p> // 🔍 Debugging
            ),
          )}
        </div>
      )}
    </div>
  );
}
