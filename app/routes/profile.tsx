import { Form, redirect, Link, useSubmit } from "react-router";
import type { Route } from "../+types/root";
import { type UserType } from "../models/User";
import { getAuthUser } from "../services/auth.server";
import {
  FaBookmark,
  FaQuoteLeft,
  FaBook,
  FaStar,
  FaChartLine,
} from "react-icons/fa";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import Book, { type BookType } from "../models/Book";
import { logoutUser } from "../services/auth.server";
import BookCard from "~/components/BookCard";
import User from "~/models/User";
import { Card } from "~/components/ui/card";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }
  const userBooks = await Book.find({
    _id: { $in: user.bookCollection.map((item) => item.bookId) },
  });

  return Response.json({ user, userBooks });
}

export default function ProfilePage({
  loaderData,
}: {
  loaderData: { user: UserType; userBooks: BookType[] };
}) {
  const { user, userBooks } = loaderData;
  const submit = useSubmit();
  const [showDeleteGoalDialog, setShowDeleteGoalDialog] = useState(false);

  const handleDeleteGoal = () => {
    submit({ _action: "deleteGoal" }, { method: "post" });
  };

  // Format reading goal for display
  const showReadingGoal = () => {
    if (!user.readingGoal || !user.readingGoal.isActive) {
      return (
        <Card>
          <p className="mb-3">No reading goal set yet</p>
          <Link to="/reading-goals">
            <Button>Set a reading goal</Button>
          </Link>
        </Card>
      );
    }

    const { target, type, frequency } = user.readingGoal;

    return (
      <Card>
        <div className="mb-3 flex items-center justify-center gap-2 text-xl font-bold">
          <span>{target}</span>
          <span>{type}</span>
          <span>{frequency}</span>
        </div>
        <div className="flex justify-center gap-2">
          <Link to="/reading-goals">
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteGoalDialog(true)}
          >
            Delete
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <main className="flex flex-col items-center px-2 py-20 md:px-40 md:py-10 h-screen mx-4 lg:mx-60">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={user.image || "https://avatar.iran.liara.run/public"}
            alt={user.name || "User"}
            className="w-24 h-24 rounded-full border-1 border-primary-burgundy shadow-md"
          />
        </div>
        <h1>{user.name}</h1>
      </div>

      {/* Reading Goal displayed above accordion */}
      <div className="w-full my-6 max-w-md mx-auto">
        {user.readingGoal && user.readingGoal.isActive && (
          <div className="flex items-center justify-between mb-2">
            <p className="flex items-center gap-2">
              <FaChartLine />
              Reading goal
            </p>
          </div>
        )}
        {showReadingGoal()}
      </div>

      <div className="w-full mt-2">
        <Accordion
          type="single"
          collapsible
          className="w-full md:w-1/2 mx-auto"
        >
          <AccordionItem value="saved-books">
            <AccordionTrigger className="flex gap-2 font-sans text-sm">
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
            <AccordionTrigger className="flex items-center gap-2 font-sans text-sm">
              <FaQuoteLeft />
              My Notes & Quotes
            </AccordionTrigger>
            <AccordionContent>
              <p>Feature coming soon...</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="my-books">
            <AccordionTrigger className="flex items-center gap-2 font-sans text-sm">
              <FaBook />
              My Books
            </AccordionTrigger>
            <AccordionContent>
              <p>You haven't added any books yet.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="my-reviews">
            <AccordionTrigger className="flex items-center gap-2 font-sans text-sm">
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
        <input type="hidden" name="_action" value="logout" />
        <Button className="mt-4" type="submit">
          Log Out
        </Button>
      </Form>

      <AlertDialog open={showDeleteGoalDialog} onOpenChange={setShowDeleteGoalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reading goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your reading goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await getAuthUser(request);
  if (!userId) {
    throw redirect("/signin");
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "deleteGoal") {
    // Find user and remove reading goal
    const user = await User.findById(userId);
    if (user) {
      user.readingGoal = {
        type: "minutes",
        frequency: "daily",
        target: 0,
        isActive: false,
        createdAt: new Date(),
      };
      await user.save();
    }
    return null;
  } else {
    return logoutUser(request);
  }
}
