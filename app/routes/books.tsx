import { Link, redirect } from "react-router";
import BookCard from "../components/BookCard";
import Book, { type BookType } from "../models/Book";
import { Input } from "~/components/ui/input";
import type { Route } from "../+types/root";
import { authenticateUser } from "../services/auth.server";
import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Star, Search, ChevronDown } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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

  // Local state for client-side filtering
  const [minRating, setMinRating] = useState(0);

  // Client-side filtering for rating (server doesn't support this via URL params)
  const filteredBooks = books.filter((book) => book.rating >= minRating);

  // Toggle genre selection
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

  // Reset all filters
  const resetFilters = () => {
    const newParams = new URLSearchParams();
    if (search) newParams.set("search", search);
    setSearchParams(newParams);
    setMinRating(0);
  };

  return (
    <section className="flex flex-col mx-auto px-2 py-20 md:px-40 md:py-10">
      {/* Filter controls - full width in flex-col */}
      <div className="flex flex-col w-full space-y-4 mb-6">
        <h1 className="text-center text-2xl font-bold">Books</h1>

        {/* Search - full width */}
        <div className="w-full relative">
          <Search className="absolute left-0 top-0 m-2.5 h-4 w-4 text-primary-beige-80" />

          <Input
            placeholder="Search books by title, author, or genre"
            className="pl-9"
            value={search}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("search", e.target.value);
              setSearchParams(newParams);
            }}
          />
        </div>

        {/* Genre - full width */}
        <div className="w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedGenres.length === 0
                  ? "All Genres"
                  : `${selectedGenres.length} selected`}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Genres</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {popularGenres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={genre}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={() => toggleGenre(genre)}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Rating - full width */}
        <div className="w-full">
          <div className="flex items-center">
            <Slider
              value={[minRating]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(value) => setMinRating(value[0])}
              className="flex-1"
            />
            <div className="ml-4 flex items-center">
              <span className="mr-1">{minRating.toFixed(1)}</span>
              <Star className="h-4 w-4 fill-primary-beige" />
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        <div className="flex justify-end w-full">
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={selectedGenres.length === 0 && minRating === 0 && !search}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
          {selectedGenres.length > 0 &&
            ` in ${selectedGenres.length} selected ${selectedGenres.length === 1 ? "genre" : "genres"}`}
          {minRating > 0 && ` with rating over ${minRating.toFixed(1)}`}
        </p>
      </div>

      {/* Book grid - centered with consistent spacing and larger vertical gap */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 mx-auto">
        {filteredBooks.length ? (
          filteredBooks.map((book) => (
            <div key={book._id.toString()} className="flex justify-center">
              <BookCard book={book} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-12">
            <p className="text-muted-foreground">
              No books match your filters.
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
