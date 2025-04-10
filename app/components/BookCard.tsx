import type { BookType } from "~/models/Book";
import { Link } from "react-router";

export default function BookCard({ book }: { book: BookType }) {
  return (
    <Link to={`/books/${book._id}`}>
      <div className="flex flex-col w-48 text-wrap">
        <img
          src={
            book.coverImage?.url ||
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          className="w-48 h-72 object-cover"
          alt={book.title}
        />
        <p>{book.title}</p>
      </div>
    </Link>
  );
}
