import type { Route } from "../+types/root";
import { authenticateUser } from "~/services/auth.server";
import User from "~/models/User";
import Book from "~/models/Book";
import { Card } from "~/components/ui/card";
import { redirect } from "react-router";
import {
  addDays,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ReadingGoalChart,
  type ReadingPeriodData,
} from "~/components/ReadingGoalChart";
import { TestChart } from "../components/TestChart";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { ProgressChart } from "~/components/ProgressChart";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await authenticateUser(request);
  if (!currentUserId) {
    throw redirect("/signin");
  }
  const user = await User.findById(currentUserId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Calculate total reading minutes
  let totalMinutesRead = 0;

  // Track reading minutes per book
  const booksReadingData = await Promise.all(
    user.bookCollection.map(async (bookEntry) => {
      // Sum minutes for each book
      const bookMinutes = bookEntry.readingSessions.reduce(
        (total, session) => total + (session.minutesRead || 0),
        0,
      );

      totalMinutesRead += bookMinutes;

      // Fetch book details
      const book = await Book.findById(bookEntry.bookId);

      return {
        bookId: bookEntry.bookId,
        title: book ? book.title : "Unknown Book",
        author: book ? book.author.join(", ") : "Unknown Author",
        minutes: bookMinutes,
        coverImage: book?.coverImage?.url,
      };
    }),
  );

  // Sort books by reading time (highest first)
  const sortedBooks = [...booksReadingData]
    .filter((book) => book.minutes > 0) // Only include books with reading time
    .sort((a, b) => b.minutes - a.minutes);

  // Get reading goal data (or null if no goal exists)
  const readingGoal = user.readingGoal || null;

  // Prepare data for the goal vs. actual chart
  const today = new Date();

  // Calculate today's reading progress
  const todayStart = startOfDay(today);
  const todayEnd = addDays(todayStart, 1);
  
  // Sum all reading sessions within today
  const todayMinutesRead = user.bookCollection.reduce((total, bookEntry) => {
    const sessionMinutes = bookEntry.readingSessions.reduce(
      (subtotal, session) => {
        if (
          session.startTime &&
          isWithinInterval(new Date(session.startTime), { 
            start: todayStart, 
            end: todayEnd 
          })
        ) {
          return subtotal + (session.minutesRead || 0);
        }
        return subtotal;
      },
      0,
    );
    return total + sessionMinutes;
  }, 0);
  
  // Calculate daily goal in minutes
  let dailyGoalMinutes = 0;
  if (readingGoal && readingGoal.isActive) {
    // Convert goal to minutes if needed
    dailyGoalMinutes = readingGoal.type === 'hours' 
      ? readingGoal.target * 60 
      : (readingGoal.type === 'minutes' ? readingGoal.target : 0);
      
    // Adjust goal based on frequency
    if (readingGoal.frequency === 'weekly') {
      dailyGoalMinutes = Math.round(dailyGoalMinutes / 7);
    } else if (readingGoal.frequency === 'monthly') {
      dailyGoalMinutes = Math.round(dailyGoalMinutes / 30);
    }
  }
  
  // Calculate completion percentage
  const completionPercentage = dailyGoalMinutes > 0 
    ? Math.round((todayMinutesRead / dailyGoalMinutes) * 100) 
    : 0;

  // Only include reading goals comparison chart if a goal exists and is for minutes or hours
  let periodicReadingData: ReadingPeriodData[] = [];
  if (
    readingGoal &&
    (readingGoal.type === "minutes" || readingGoal.type === "hours")
  ) {
    // Normalize goal to minutes if the goal is in hours
    const goalInMinutes =
      readingGoal.type === "hours"
        ? readingGoal.target * 60
        : readingGoal.target;

    // Calculate intervals based on frequency
    const intervals = [];
    if (readingGoal.frequency === "daily") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        intervals.push({
          start: startOfDay(date),
          end: addDays(startOfDay(date), 1),
          label: format(date, "EEE"),
        });
      }
    } else if (readingGoal.frequency === "weekly") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = startOfWeek(subWeeks(today, i));
        intervals.push({
          start,
          end: addDays(start, 7),
          label: `Week ${4 - i}`,
        });
      }
    } else if (readingGoal.frequency === "monthly") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        intervals.push({
          start: startOfMonth(date),
          end: startOfMonth(addDays(date, 32)),
          label: format(date, "MMM"),
        });
      }
    }

    // Calculate actual reading minutes for each interval
    periodicReadingData = intervals.map((interval) => {
      // Sum all reading sessions within this interval
      const minutesRead = user.bookCollection.reduce((total, bookEntry) => {
        const sessionMinutes = bookEntry.readingSessions.reduce(
          (subtotal, session) => {
            if (
              session.startTime &&
              isWithinInterval(new Date(session.startTime), interval)
            ) {
              return subtotal + (session.minutesRead || 0);
            }
            return subtotal;
          },
          0,
        );
        return total + sessionMinutes;
      }, 0);

      return {
        period: interval.label,
        actual: minutesRead,
        goal: goalInMinutes,
      };
    });
  }

  return Response.json({
    totalMinutesRead,
    totalBooksRead: sortedBooks.length,
    readingGoal,
    periodicReadingData,
    todayMinutesRead,
    dailyGoalMinutes,
    completionPercentage,
  });
}

export default function Insights({
  loaderData,
}: {
  loaderData: {
    totalMinutesRead: number;
    totalBooksRead: number;
    readingGoal: {
      type: string;
      frequency: string;
      target: number;
      isActive: boolean;
    } | null;
    periodicReadingData: ReadingPeriodData[];
    todayMinutesRead: number;
    dailyGoalMinutes: number;
    completionPercentage: number;
  };
}) {
  const { 
    totalMinutesRead, 
    totalBooksRead, 
    readingGoal, 
    periodicReadingData,
    todayMinutesRead,
    dailyGoalMinutes,
    completionPercentage
  } = loaderData;

  return (
    <div className="mx-auto py-20 px-4 md:px-40">
      <h1 className="mb-8 text-center">Reading insights</h1>
      <ProgressChart 
        todayMinutes={todayMinutesRead} 
        goalMinutes={dailyGoalMinutes} 
        completionPercentage={completionPercentage}
      />
      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg">Reading goal progress</h2>
      </div>
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all-time">All time</TabsTrigger>
        </TabsList>
        <TabsContent value="all-time">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="text-center mb-1">Total reading time</h2>
              <p className="text-3xl! font-bold text-center">
                {totalMinutesRead} minutes
              </p>
              <p className="text-center text-primary-beige mt-2">
                That's approximately {Math.round(totalMinutesRead / 60)} hours
                of reading!
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-center mb-2">Books read</h2>
              <p className="text-3xl! font-bold text-center">
                {totalBooksRead}
              </p>
              <p className="text-center mt-2">
                Keep going to expand your reading journey!
              </p>
            </Card>
          </div>

          {readingGoal &&
            readingGoal.isActive &&
            (readingGoal.type === "minutes" || readingGoal.type === "hours") &&
            periodicReadingData.length > 0 && (
              <Card>
                <h2 className="mb-4 text-center">
                  Reading goal progress
                </h2>
                <p className="text-center text-muted-foreground mb-4">
                  Your goal: {readingGoal.target} {readingGoal.type}{" "}
                  {readingGoal.frequency}
                </p>
                <ReadingGoalChart data={periodicReadingData} />
              </Card>
            )}
        </TabsContent>
        <TabsContent value="monthly">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
