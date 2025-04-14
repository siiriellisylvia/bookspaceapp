import type { Route } from "./+types/home";
import User, { type UserType } from "../models/User";
import { Link, redirect, useLoaderData } from "react-router";
import BookCard from "~/components/BookCard";
import { type BookType } from "../models/Book";
import { getAuthUserId } from "../services/auth.server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { getPopularBooks, getRandomBooks } from "~/utils/getRecommendedBooks";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import springBgImage from "~/assets/spring-bg-books.png";

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

  // Books with status "reading"
  const currentlyReading = user.bookCollection
    .map((entry) => ({
      book: entry.bookId || null,
      progress: entry.progress || 0,
      status: entry.status || "not_started",
    }))
    .filter((entry) => entry.book !== null && entry.status === "reading");

  // Books that are bookmarked (using isBookmarked flag)
  const bookmarkedBooks = user.bookCollection
    .map((entry) => ({
      book: entry.bookId || null,
      progress: entry.progress || 0,
      isBookmarked: entry.isBookmarked || false,
    }))
    .filter((entry) => entry.book !== null && entry.isBookmarked === true);

  // If user has no books in collection, get popular books
  let popularBooks: BookType[] = [];
  if (currentlyReading.length === 0 && bookmarkedBooks.length === 0) {
    popularBooks = await getPopularBooks(6);
  }

  // Get random books for discovery
  const randomBooks = await getRandomBooks(6);

  return Response.json({
    currentlyReading,
    bookmarkedBooks,
    popularBooks,
    randomBooks,
    userName: user.name || "Reader",
  });
}

export default function Home({
  loaderData,
}: {
  loaderData: {
    book: BookType;
    currentlyReading: { book: BookType; progress: number }[];
    bookmarkedBooks: { book: BookType; progress: number }[];
    popularBooks: BookType[];
    randomBooks: BookType[];
    userName: string;
  };
}) {
  const {
    currentlyReading,
    bookmarkedBooks,
    popularBooks,
    randomBooks,
    userName,
  } = loaderData;
  const hasBooks = currentlyReading.length > 0 || bookmarkedBooks.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-20 md:py-10 items-center max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {userName}!</h1>
      <Card
        className="w-full mb-4 overflow-hidden"
        style={{
          backgroundImage: `url(${springBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <CardContent className="relative w-1/2 ml-auto">
          <h2 className="w-1/3 text-2xl! text-primary-burgundy!">
            Spring favourites
          </h2>
        </CardContent>
      </Card>

      {/* Discover new books section - always visible */}
      <div className="w-full">
        <h2 className="mb-2 text-center">Discover books for the season</h2>
        {randomBooks.length === 0 ? (
          <p>No books available at the moment.</p>
        ) : (
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              containScroll: "trimSnaps",
              skipSnaps: false,
            }}
          >
            <CarouselContent>
              {randomBooks.map((book) => (
                <CarouselItem
                  key={book._id.toString()}
                  className="basis-1/3.5 lg:basis-1/4"
                >
                  <BookCard book={book} progress={undefined} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>

      {hasBooks ? (
        <>
          <h2>Currently reading</h2>
          {currentlyReading.length === 0 ? (
            <p>No books in your collection yet.</p>
          ) : (
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                containScroll: "trimSnaps",
                skipSnaps: false,
              }}
            >
              <CarouselContent>
                {currentlyReading.map((entry) =>
                  entry.book ? (
                    <CarouselItem
                      key={entry.book._id.toString()}
                      className="basis-1/3.5 lg:basis-1/4"
                    >
                      <BookCard book={entry.book} progress={entry.progress} />
                    </CarouselItem>
                  ) : null,
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
          <h2>Bookmarked</h2>
          {bookmarkedBooks.length === 0 ? (
            <p>No bookmarked books yet.</p>
          ) : (
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                containScroll: "trimSnaps",
                skipSnaps: false,
              }}
            >
              <CarouselContent>
                {bookmarkedBooks.map((entry) =>
                  entry.book ? (
                    <CarouselItem
                      key={entry.book._id.toString()}
                      className="basis-1/3.5 lg:basis-1/4"
                    >
                      {/* Explicitly passing undefined for progress to ensure no progress bar is displayed */}
                      <BookCard book={entry.book} progress={undefined} />
                    </CarouselItem>
                  ) : null,
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </>
      ) : (
        <>
          <h2>Popular books</h2>
          {popularBooks.length === 0 ? (
            <p>No recommendations available at the moment.</p>
          ) : (
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                containScroll: "trimSnaps",
                skipSnaps: false,
              }}
            >
              <CarouselContent>
                {popularBooks.map((book) => (
                  <CarouselItem
                    key={book._id.toString()}
                    className="basis-1/3.5 lg:basis-1/4"
                  >
                    <BookCard book={book} progress={undefined} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
          <p className="text-center mt-2">
            Start adding books to your collection to keep track of your reading
            progress!
          </p>
          <Link to="/books" className="mt-2">
            <Button variant="default">See all books</Button>
          </Link>
        </>
      )}
    </div>
  );
}
