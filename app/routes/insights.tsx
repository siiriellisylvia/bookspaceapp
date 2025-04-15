import type { Route } from "../+types/root";
import { authenticateUser } from "~/services/auth.server";
import User from "~/models/User";
import Book from "~/models/Book";
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
  endOfMonth,
  endOfWeek,
} from "date-fns";
import {
  ReadingGoalChart,
  type ReadingPeriodData,
} from "~/components/ReadingGoalChart";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { WeeklyInsights } from "~/components/insights/WeeklyInsights";
import { MonthlyInsights } from "~/components/insights/MonthlyInsights";
import { AllTimeInsights } from "~/components/insights/AllTimeInsights";
import { ProgressChart } from "~/components/ProgressChart";
import { Card, CardContent } from "~/components/ui/card";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserId = await authenticateUser(request);
  if (!currentUserId) {
    throw redirect("/signin");
  }
  const user = await User.findById(currentUserId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Calculate total reading minutes and pages
  let totalMinutesRead = 0;
  let totalPagesRead = 0;

  // Track reading minutes per book
  const booksReadingData = await Promise.all(
    user.bookCollection.map(async (bookEntry) => {
      // Sum minutes and pages for each book
      const bookMinutes = bookEntry.readingSessions.reduce(
        (total, session) => total + (session.minutesRead || 0),
        0,
      );

      const bookPages = bookEntry.readingSessions.reduce(
        (total, session) => total + (session.pagesRead || 0),
        0,
      );

      totalMinutesRead += bookMinutes;
      totalPagesRead += bookPages;

      // Fetch book details
      const book = await Book.findById(bookEntry.bookId);

      return {
        bookId: bookEntry.bookId,
        title: book ? book.title : "Unknown Book",
        author: book ? book.author.join(", ") : "Unknown Author",
        minutes: bookMinutes,
        pages: bookPages,
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
            end: todayEnd,
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
    dailyGoalMinutes =
      readingGoal.type === "hours"
        ? readingGoal.target * 60
        : readingGoal.type === "minutes"
        ? readingGoal.target
        : 0;

    // Adjust goal based on frequency
    if (readingGoal.frequency === "weekly") {
      dailyGoalMinutes = Math.round(dailyGoalMinutes / 7);
    } else if (readingGoal.frequency === "monthly") {
      dailyGoalMinutes = Math.round(dailyGoalMinutes / 30);
    }
  }

  // Calculate completion percentage
  const completionPercentage =
    dailyGoalMinutes > 0
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

  // Calculate weekly reading stats (Monday-Sunday of current week)
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday as end of week

  // Calculate weekly minutes read, pages read, and books read
  let weeklyMinutesRead = 0;
  let weeklyPagesRead = 0;
  const weeklyReadBooks = new Set();

  user.bookCollection.forEach((bookEntry) => {
    bookEntry.readingSessions.forEach((session) => {
      if (
        session.startTime &&
        isWithinInterval(new Date(session.startTime), {
          start: currentWeekStart,
          end: currentWeekEnd,
        })
      ) {
        weeklyMinutesRead += session.minutesRead || 0;
        weeklyPagesRead += session.pagesRead || 0;
        if (session.minutesRead && session.minutesRead > 0) {
          weeklyReadBooks.add(bookEntry.bookId);
        }
      }
    });
  });

  // Calculate monthly reading stats (current month)
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  // Calculate monthly minutes read, pages read, and books read
  let monthlyMinutesRead = 0;
  let monthlyPagesRead = 0;
  const monthlyReadBooks = new Set();

  user.bookCollection.forEach((bookEntry) => {
    bookEntry.readingSessions.forEach((session) => {
      if (
        session.startTime &&
        isWithinInterval(new Date(session.startTime), {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        monthlyMinutesRead += session.minutesRead || 0;
        monthlyPagesRead += session.pagesRead || 0;
        if (session.minutesRead && session.minutesRead > 0) {
          monthlyReadBooks.add(bookEntry.bookId);
        }
      }
    });
  });

  // Calculate appropriate time period reading for the selected goal frequency
  let periodMinutesRead = 0;
  let periodGoalMinutes = 0;

  if (readingGoal && readingGoal.isActive) {
    // Convert goal to minutes if needed
    const rawGoalMinutes =
      readingGoal.type === "hours"
        ? readingGoal.target * 60
        : readingGoal.type === "minutes"
        ? readingGoal.target
        : 0;

    // Set the target minutes based on frequency without dividing
    periodGoalMinutes = rawGoalMinutes;

    // Calculate actual reading minutes based on the goal frequency
    if (readingGoal.frequency === "daily") {
      // For daily goals, use today's reading
      periodMinutesRead = todayMinutesRead;
    } else if (readingGoal.frequency === "weekly") {
      // For weekly goals, sum up the week's reading minutes
      periodMinutesRead = weeklyMinutesRead;
    } else if (readingGoal.frequency === "monthly") {
      // For monthly goals, sum up the month's reading minutes
      periodMinutesRead = monthlyMinutesRead;
    }
  }

  // Calculate completion percentage based on the appropriate period
  const periodCompletionPercentage =
    periodGoalMinutes > 0
      ? Math.round((periodMinutesRead / periodGoalMinutes) * 100)
      : 0;

  return Response.json({
    totalMinutesRead,
    totalPagesRead,
    totalBooksRead: sortedBooks.length,
    readingGoal,
    periodicReadingData,
    todayMinutesRead,
    dailyGoalMinutes,
    completionPercentage,
    periodMinutesRead,
    periodGoalMinutes,
    periodCompletionPercentage,
    weeklyMinutesRead,
    weeklyPagesRead,
    weeklyBooksRead: weeklyReadBooks.size,
    monthlyMinutesRead,
    monthlyPagesRead,
    monthlyBooksRead: monthlyReadBooks.size,
    currentWeek: {
      start: format(currentWeekStart, "MMM d"),
      end: format(currentWeekEnd, "MMM d, yyyy"),
    },
    currentMonth: format(today, "MMMM yyyy"),
  });
}

export default function Insights({
  loaderData,
}: {
  loaderData: {
    totalMinutesRead: number;
    totalPagesRead: number;
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
    periodMinutesRead: number;
    periodGoalMinutes: number;
    periodCompletionPercentage: number;
    weeklyMinutesRead: number;
    weeklyPagesRead: number;
    weeklyBooksRead: number;
    monthlyMinutesRead: number;
    monthlyPagesRead: number;
    monthlyBooksRead: number;
    currentWeek: {
      start: string;
      end: string;
    };
    currentMonth: string;
  };
}) {
  const {
    totalMinutesRead,
    totalPagesRead,
    totalBooksRead,
    readingGoal,
    periodicReadingData,
    periodMinutesRead,
    periodGoalMinutes,
    periodCompletionPercentage,
    weeklyMinutesRead,
    weeklyPagesRead,
    weeklyBooksRead,
    monthlyMinutesRead,
    monthlyPagesRead,
    monthlyBooksRead,
    currentWeek,
    currentMonth,
  } = loaderData;

  return (
    <div className="mx-auto py-20 px-4 md:px-40">
      <h1 className="mb-8 text-center">Reading insights</h1>
      <div className="flex flex-col gap-4">
        <ProgressChart
          minutesRead={periodMinutesRead}
          goalMinutes={periodGoalMinutes}
          completionPercentage={periodCompletionPercentage}
          goalFrequency={readingGoal?.frequency || "daily"}
          showGoal={!!readingGoal?.isActive}
        />
        {readingGoal &&
          readingGoal.isActive &&
          (readingGoal.type === "minutes" || readingGoal.type === "hours") &&
          periodicReadingData.length > 0 && (
            <Card>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <h2>Reading goal progress</h2>
                  <ReadingGoalChart data={periodicReadingData} />
                </div>
              </CardContent>
            </Card>
          )}

        <div className="flex items-center justify-between">
          <h2>Your reading habits in numbers</h2>
        </div>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All time</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="mt-4">
            <WeeklyInsights
              weeklyMinutesRead={weeklyMinutesRead}
              weeklyPagesRead={weeklyPagesRead}
              weeklyBooksRead={weeklyBooksRead}
              readingGoal={readingGoal}
              currentWeek={currentWeek}
            />
          </TabsContent>
          <TabsContent value="monthly" className="mt-4">
            <MonthlyInsights
              monthlyMinutesRead={monthlyMinutesRead}
              monthlyPagesRead={monthlyPagesRead}
              monthlyBooksRead={monthlyBooksRead}
              readingGoal={readingGoal}
              currentMonth={currentMonth}
            />
          </TabsContent>
          <TabsContent value="all-time" className="mt-4">
            <AllTimeInsights
              totalMinutesRead={totalMinutesRead}
              totalPagesRead={totalPagesRead}
              totalBooksRead={totalBooksRead}
              readingGoal={readingGoal}
              periodicReadingData={periodicReadingData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
