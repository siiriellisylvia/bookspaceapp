import { Form, redirect } from "react-router";
import type { Route } from "../+types/root";
import User, { type UserType } from "../models/User";
import { getAuthUser } from "../services/auth.server";
import { FaBookmark, FaQuoteLeft, FaBook, FaStar } from "react-icons/fa";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import Book, { type BookType } from "../models/Book";
import { logoutUser } from "../services/auth.server";
import BookCard from "~/components/BookCard";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }
  const userBooks = await Book.find({
    _id: { $in: user.bookCollection.map((item) => item.bookId) },
  }).lean();

  return { user, userBooks };
}

export default function ProfilePage({
  loaderData,
}: {
  loaderData: { user: UserType; userBooks: BookType[] };
}) {
  const { user, userBooks } = loaderData;

  return (
    <main className="flex flex-col items-center mt-20 h-screen mx-4 lg:mx-60">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={user.image || "https://avatar.iran.liara.run/public"}
            alt={user.name || "User"}
            className="w-24 h-24 rounded-full border-1 border-primary-burgundy shadow-md"
          />
        </div>
        <h1>{user.email}</h1>
      </div>
      <div className="w-full mt-6">
        <Accordion type="single" collapsible className="w-1/2 mx-auto">
          <AccordionItem value="saved-books">
            <AccordionTrigger className="flex gap-2">
              <FaBookmark />
              Saved Books
            </AccordionTrigger>
            <AccordionContent>
              {userBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBooks.map((book) => (
                    <BookCard key={book._id.toString()} book={book} />
                  ))}
                </div>
              ) : (
                <p>No saved books yet.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes-quotes">
            <AccordionTrigger className="flex items-center gap-2">
              <FaQuoteLeft />
              My Notes & Quotes
            </AccordionTrigger>
            <AccordionContent>
              <p>Feature coming soon...</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="my-books">
            <AccordionTrigger className="flex items-center gap-2">
              <FaBook />
              My Books
            </AccordionTrigger>
            <AccordionContent>
              <p>You haven't added any books yet.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="my-reviews">
            <AccordionTrigger className="flex items-center gap-2">
              <FaStar />
              My Reviews
            </AccordionTrigger>
            <AccordionContent>
              <p>No reviews yet.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Form method="post">
        <Button className="mt-4" type="submit">
          Log Out
        </Button>
      </Form>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  return logoutUser(request);
}
