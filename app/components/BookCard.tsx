import { Link } from "react-router";
import type { BookType } from "~/models/Book";

export default function BookCard({
  book,
  progress,
}: {
  book: BookType;
  progress?: number;
}) {
  const progressPercent =
    progress && book.pageCount ? (progress / book.pageCount) * 100 : 0;


  return (
    <Link to={`/books/${book._id}`}>
    <div className="flex flex-col w-30 lg:w-48 text-wrap">
      <img
        src={
          book.coverImage?.url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        className=" w-30 lg:w-48 h-45 lg:h-72 object-cover rounded-sm shadow-md"
        alt={book.title}
      />
      {progress !== undefined && (
        <div className="my-2">
          <div className="w-full bg-primary-beige rounded-full h-2">
            <div
              className="bg-primary-blue h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      <p>{book.title}</p>
    </div>
    </Link>
  );
}
