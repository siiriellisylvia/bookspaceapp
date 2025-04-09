import { Link, redirect } from "react-router";
import BookCard from "../components/BookCard";
import Book, { type BookType } from "../models/Book";
import { Input } from "~/components/ui/input";
import type { Route } from "../+types/root";
import { authenticateUser } from "../services/auth.server";
import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  await authenticateUser(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const genres = url.searchParams.getAll("genre"); // Get multiple selected genres

  const query: any = {};
  if (genres.length) query.genres = { $all: genres }; // Only books that contain ALL selected genres
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { genres: { $regex: search, $options: "i" } },
    ];
  }

  const books = await Book.find(query).lean();

  return Response.json({ books });
}

export default function BooksPage({
  loaderData,
}: {
  loaderData: { books: BookType[] };
}) {
  const { books } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const selectedGenres = searchParams.getAll("genre"); // Get all selected genres

  return (
    <section className="flex flex-col mx-auto px-2 lg:px-40 py-2 lg:py-10">
      {/* search and filter section */}
      <div className="flex flex-col justify-between items-center gap-4">
        {/* search input */}
        <Input
          placeholder="Search books"
          value={search}
          className="lg:w-1/2"
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("search", e.target.value);
            setSearchParams(newParams);
          }}
        />
      </div>

      {/* books */}
      <section className="flex flex-wrap justify-center gap-4">
        {books.length ? (
          books.map((book) => (
            <Link key={book._id.toString()} to={`/books/${book._id}`}>
              <BookCard book={book} />
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center">No books found.</p>
        )}
      </section>
    </section>
  );
}
