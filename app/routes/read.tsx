import { redirect } from "react-router";
import CountdownTimer from "~/components/CountdownTimer";
import { Button } from "~/components/ui/button";
import { getAuthUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book, { type BookType } from "~/models/Book";
import { X } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await getAuthUser(request);
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

  return (
    <div className="flex flex-col gap-2 px-2 py-20 items-center justify-center h-screen">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
      <X />
      <Button variant="outline">Finish reading session</Button>
      </div>

      <p className="text-2xl font-bold">{book.title}</p>
      <img
        src={book.coverImage?.url}
        alt={book.title}
        className="w-1/2 rounded-lg"
      />
      <CountdownTimer />
    </div>
  );
}
