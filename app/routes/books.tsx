import { Link } from "react-router";
import BookCard from "../components/BookCard";
import Book, { type BookType } from "../models/Book";
import { authenticateUser } from "../services/auth.server";
import type { Route } from "./+types/books";

export async function loader({ request }: Route.LoaderArgs) {
  await authenticateUser(request);

  const books = await Book.find().lean();
  return Response.json({ books });
}

export default function BooksPage({
  loaderData,
}: {
  loaderData: { books: BookType[] };
}) {
  const { books } = loaderData;

  return (
    <section className="flex flex-wrap gap-4 ">
      {books.map((book) => (
        <Link key={book._id.toString()} to={`/books/${book._id}`}>
          <BookCard book={book} />
        </Link>
      ))}
    </section>
  );
}
