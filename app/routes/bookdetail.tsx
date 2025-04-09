import type { Route } from "../+types/root";
import Book, { type BookType } from "../models/Book";
import { AiOutlineStar, AiOutlineBook } from "react-icons/ai"; // Star & book icons
import { FaBookmark } from "react-icons/fa"; // Bookmark icon

// Loader to fetch book data from MongoDB
export async function loader({ request, params }: Route.LoaderArgs) {
  const book = await Book.findById(params.id);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }
  return Response.json({ book });
}

// Book Detail Component
export default function BookDetail({
  loaderData,
}: {
  loaderData: { book: BookType };
}) {
  const { book } = loaderData;

  return (
    <div className="flex flex-col items-center p-4 md:p-10 max-w-3xl mx-auto">
      <div className="relative w-full max-w-sm">
        <img
          src={book.coverImage?.url}
          alt={book.title}
          className="w-full rounded-lg shadow-lg"
        />
      </div>
      <button className="absolute top-2 right-2 text-gray-600 hover:text-black">
        <FaBookmark size={24} />
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-center mt-4">
        {book.title}
      </h1>
      <h2 className="text-lg text-gray-600">by {book.author.join(", ")}</h2>

      <div className="flex items-center gap-6 mt-4 text-gray-700">
        <div className="flex items-center gap-1">
          <AiOutlineStar size={20} className="text-yellow-500" />
          <span className="text-lg">{book.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <AiOutlineBook size={20} />
          <span className="text-lg">{book.pageCount}</span>
        </div>
        <div className="text-lg">{book.genres[0]}</div>
      </div>

      <div className="mt-6 w-full">
        <h3 className="text-xl font-semibold">Description</h3>
        <p className="text-gray-700 mt-2">{book.description}</p>
      </div>
    </div>
  );
}
