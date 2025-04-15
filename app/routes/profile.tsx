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
  FaChevronRight,
} from "react-icons/fa";
import { Button } from "../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Separator } from "../components/ui/separator";
import Book, { type BookType } from "../models/Book";
import { logoutUser } from "../services/auth.server";
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
        <Card className="p-4">
          <p className="mb-3">No reading goal set yet</p>
          <Link to="/reading-goals">
            <Button>Set a reading goal</Button>
          </Link>
        </Card>
      );
    }

    const { target, type, frequency } = user.readingGoal;

    return (
      <Card className="p-4">
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
    <main className="flex flex-col items-center px-4 py-20 mx-auto max-w-4xl min-h-screen">
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={user.image || "https://avatar.iran.liara.run/public"}
            alt={user.name || "User"}
            className="w-24 h-24 rounded-full border-1 border-primary-burgundy shadow-md"
          />
        </div>
        <h1>{user.name}</h1>
      </div>

      {/* Reading Goal section */}
      <div className="w-full mb-6 max-w-md">
        {user.readingGoal && user.readingGoal.isActive && (
          <div className="flex items-center mb-2">
            <FaChartLine className="mr-2" />
            <span className="text-sm">Reading goal</span>
          </div>
        )}
        {showReadingGoal()}
      </div>

      {/* Navigation links replacing accordion */}
      <div className="w-full max-w-md">
        <Link to="/saved-books" className="w-full">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 font-sans text-sm">
              <FaBookmark className="text-primary-beige" />
              <span>Saved Books</span>
            </div>
            <FaChevronRight className="text-sm text-gray-400" />
          </div>
        </Link>
        <Separator />

        <Link to="/my-books" className="w-full">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 font-sans text-sm">
              <FaBook className="text-primary-beige" />
              <span>My Books</span>
            </div>
            <FaChevronRight className="text-sm text-primary-beige" />
          </div>
        </Link>
        <Separator />

        <Link to="/my-reviews" className="w-full">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 font-sans text-sm">
              <FaStar className="text-primary-beige" />
              <span>My Reviews</span>
            </div>
            <FaChevronRight className="text-sm text-primary-beige" />
          </div>
        </Link>
        <Separator />
      </div>

      <Form method="post" className="mt-6 mb-8">
        <input type="hidden" name="_action" value="logout" />
        <Button type="submit">Log Out</Button>
      </Form>

      <AlertDialog
        open={showDeleteGoalDialog}
        onOpenChange={setShowDeleteGoalDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reading goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your reading goal? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal}>
              Delete
            </AlertDialogAction>
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
