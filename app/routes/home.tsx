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

  // Ensure bookCollection is correctly structured, remove undefined books,
  // and filter out finished books and books with no progress
  const bookCollection = user.bookCollection
    .map((entry) => ({
      book: entry.bookId || null, // Ensure we don't crash on undefined
      progress: entry.progress,
      status: entry.status || "bookmarked",
    }))
    .filter(
      (entry) =>
        entry.book !== null &&
        entry.status !== "finished" &&
        entry.progress !== undefined &&
        entry.progress > 0,
    ); // Remove finished books, invalid books, and books with no progress

  return Response.json({
    bookCollection,
    userName: user.name || "Reader",
  });
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();
  const { bookCollection, userName } = loaderData;

  return (
    <div className="flex flex-col gap-4 px-2 py-20 md:py-10 items-center max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome back, {userName}!</h1>
      <h2>Currently reading</h2>
      {bookCollection.length === 0 ? (
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
            {bookCollection.map((entry) =>
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
    </div>
  );
}
