import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { getAuthUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import User from "~/models/User";
import { ChevronLeft} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user) {
    throw redirect("/signin");
  }

  return Response.json({ user });
}

export default function ReadingGoalsPage({
  loaderData,
}: {
  loaderData: {
    user: any;
  };
}) {
  const { user } = loaderData;
  const navigate = useNavigate();

  // Default values based on user's existing goal or sensible defaults
  const initialTarget = user.readingGoal?.target || 30;
  const initialType = user.readingGoal?.type || "minutes";
  const initialFrequency = user.readingGoal?.frequency || "daily";

  const [target, setTarget] = useState(String(initialTarget));
  const [goalType, setGoalType] = useState(initialType);
  const [frequency, setFrequency] = useState(initialFrequency);

  return (
    <div className="flex flex-col h-screen py-20 px-2 md:px-40 md:py-10">
      <div className="w-full flex items-center justify-between md:w-1/2 mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden"
        >
          <ChevronLeft />
        </Button>
      </div>

      <form
        method="post"
        className="flex flex-col flex-1 md:pb-12 w-full md:w-1/2 mx-auto"
      >
        <div className="flex flex-col gap-8 flex-1">
          <section className="flex flex-col gap-4 mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">What's Your Reading Goal?</h1>
              <p className="mt-4 text-lg">
                Whether it's finishing a book every week or diving deep into a
                long series, choose your reading goals, and we'll help you get
                there.
              </p>
            </div>

            {/* Goal target input */}
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setTarget((prev) => String(Math.max(1, Number(prev) - 10)))
                }
                disabled={Number(target) <= 10}
                className="rounded-full h-16 w-16"
              >
                -10
              </Button>
              <input
                type="number"
                name="target"
                value={target}
                onChange={(e) => {
                  const value = e.target.value;
                  if (Number(value) > 0) {
                    setTarget(value);
                  }
                }}
                className="w-20 text-center text-6xl border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setTarget((prev) => String(Number(prev) + 10))}
                className="rounded-full h-16 w-16"
              >
                +10
              </Button>
            </div>

            {/* Goal type selector using shadcn */}
            <div className="mt-6 w-1/2 mx-auto">
              <input type="hidden" name="goalType" value={goalType} />
              <Select
                defaultValue={goalType}
                onValueChange={(value) => setGoalType(value)}
              >
                <SelectTrigger className="w-full text-center h-14">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">minutes</SelectItem>
                  <SelectItem value="hours">hours</SelectItem>
                  <SelectItem value="pages">pages</SelectItem>
                  <SelectItem value="books">books</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency selector using shadcn Select */}
            <div className="mt-2 w-1/2 mx-auto">
              <input type="hidden" name="frequency" value={frequency} />
              <Select
                defaultValue={frequency}
                onValueChange={(value) => setFrequency(value)}
              >
                <SelectTrigger className="w-full text-center h-14">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">daily</SelectItem>
                  <SelectItem value="weekly">weekly</SelectItem>
                  <SelectItem value="monthly">monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Submit button section */}
          <section className="mt-auto flex items-center justify-center gap-4 mb-8">
            <Button
              type="submit"
              variant="default"
              className="w-1/2 mx-auto md:w-auto"
            >
              Set reading goal
            </Button>
          </section>
        </div>
      </form>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await getAuthUser(request);
  if (!userId) {
    throw redirect("/signin");
  }

  const formData = await request.formData();
  const target = Number(formData.get("target") || "0");
  const goalType = formData.get("goalType") as string;
  const frequency = formData.get("frequency") as string;

  // Validate inputs
  if (
    target <= 0 ||
    !["minutes", "hours", "pages", "books"].includes(goalType) ||
    !["daily", "weekly", "monthly"].includes(frequency)
  ) {
    return {
      error: "Invalid goal settings. Please try again.",
    };
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Response("User Not Found", { status: 404 });
    }

    // Update the user's reading goal
    user.readingGoal = {
      type: goalType as "minutes" | "hours" | "pages" | "books",
      frequency: frequency as "daily" | "weekly" | "monthly",
      target: target,
      isActive: true,
      createdAt: new Date(),
    };

    await user.save();

    // Redirect back to the profile page
    return redirect("/profile");
  } catch (error) {
    console.error("Error setting reading goal:", error);
    return {
      error: "Failed to save reading goal. Please try again.",
    };
  }
}
