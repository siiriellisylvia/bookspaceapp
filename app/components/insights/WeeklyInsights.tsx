import { Card } from "../ui/card";

interface WeeklyInsightsProps {
  weeklyMinutesRead: number;
  weeklyBooksRead: number;
  readingGoal: {
    type: string;
    frequency: string;
    target: number;
    isActive: boolean;
  } | null;
  currentWeek: {
    start: string;
    end: string;
  };
}

export function WeeklyInsights({ 
  weeklyMinutesRead, 
  weeklyBooksRead, 
  readingGoal,
  currentWeek 
}: WeeklyInsightsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-center mb-1">Weekly reading time</h2>
          <p className="text-3xl! font-bold text-center">
            {weeklyMinutesRead} minutes
          </p>
          <p className="text-center mt-2">
            That's approximately {Math.round(weeklyMinutesRead / 60)} hours
            this week!
          </p>
          <p className="text-center text-sm mt-2">
            Week: {currentWeek.start} - {currentWeek.end}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-center mb-2">Books read this week</h2>
          <p className="text-3xl! font-bold text-center">
            {weeklyBooksRead}
          </p>
          <p className="text-center mt-2">
            {weeklyBooksRead === 0 
              ? "Start reading to track your weekly progress!" 
              : weeklyBooksRead === 1 
                ? "You've started reading a book this week!" 
                : `You've read multiple books this week!`}
          </p>
        </Card>
      </div>

    </>
  );
}