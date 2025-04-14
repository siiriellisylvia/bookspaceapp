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

  // Get top 10 genres
  const genreStats = await Book.aggregate([
    { $unwind: "$genres" },
    { $group: { _id: "$genres", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const popularGenres = genreStats.map((g) => g._id);

  return Response.json({ books, popularGenres });
}

export default function BooksPage({
  loaderData,
}: {
  loaderData: { books: BookType[]; popularGenres: string[] };
}) {
  const { books, popularGenres } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const selectedGenres = searchParams.getAll("genre"); // Get all selected genres

  // update search params when a genre is toggled
  const toggleGenre = (genre: string) => {
    const newParams = new URLSearchParams(searchParams);
    const genres = newParams.getAll("genre");

    if (genres.includes(genre)) {
      newParams.delete("genre", genre); // Remove if already selected
    } else {
      newParams.append("genre", genre); // Add if not selected
    }

    setSearchParams(newParams);
  };

  return (
    <section className="flex flex-col mx-auto px-2 py-20 md:px-40 md:py-10">
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

        {/* genre toggles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {popularGenres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* books */}
      <section className="flex flex-wrap justify-center gap-4">
        {books.length ? (
          books.map((book) => <BookCard book={book} />)
        ) : (
          <p className="col-span-full text-center">No books found.</p>
        )}
      </section>
    </section>
  );
}
