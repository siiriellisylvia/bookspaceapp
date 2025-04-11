import { redirect } from "react-router";
import CountdownTimer from "~/components/CountdownTimer";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book, { type BookType } from "~/models/Book";
import { X } from "lucide-react";
import { useNavigate } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await authenticateUser(request);
  if (!currentUser) {
    throw redirect("/signin");
  }

  const book = await Book.findById(params.id);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  console.log("currently reading book", book);
  return Response.json({
    currentUser,
    book,
  });
}

export default function ReadMode({
  loaderData,
}: {
  loaderData: {
    book: BookType;
  };
}) {
  const { book } = loaderData;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 px-2 py-20 md:py-5 items-center justify-center h-screen">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden"
        >
          <X />
        </Button>
        <Button onClick={() => navigate(`/books/${book._id}/finish-reading-session`)} variant="outline" className="md:ml-auto">Finish reading session</Button>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {book.title}
      </h1>
      <img
        src={book.coverImage?.url}
        alt={book.title}
        className="w-1/2 rounded-lg md:w-1/5"
      />
      <CountdownTimer />
    </div>
  );
}
