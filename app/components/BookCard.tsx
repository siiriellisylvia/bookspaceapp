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
    <Link to={`/books/${book._id}`} className="flex justify-center">
    <div className="flex flex-col w-24 sm:w-28 md:w-36 lg:w-40 text-wrap">
      <img
        src={
          book.coverImage?.url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        className="w-full h-36 sm:h-40 md:h-48 lg:h-60 object-cover rounded-sm shadow-md"
        alt={book.title}
      />
      {progress !== undefined && (
        <div className="my-2">
          <div className="w-full bg-primary-beige dark:bg-primary-beige-20 rounded-full h-2">
            <div
              className="bg-primary-burgundy dark:bg-primary-beige h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      <p className="text-xs sm:text-sm md:text-base break-words">{book.title}</p>
    </div>
    </Link>
  );
}
