import { Card } from "../ui/card";

interface MonthlyInsightsProps {
  monthlyMinutesRead: number;
  monthlyBooksRead: number;
  readingGoal: {
    type: string;
    frequency: string;
    target: number;
    isActive: boolean;
  } | null;
  currentMonth: string;
}

export function MonthlyInsights({ 
  monthlyMinutesRead, 
  monthlyBooksRead, 
  readingGoal,
  currentMonth 
}: MonthlyInsightsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-center mb-1">Monthly reading time</h2>
          <p className="text-3xl! font-bold text-center">
            {monthlyMinutesRead} minutes
          </p>
          <p className="text-center mt-2">
            That's approximately {Math.round(monthlyMinutesRead / 60)} hours
            this month!
          </p>
          <p className="text-center text-sm mt-2">
            Month: {currentMonth}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-center mb-2">Books read this month</h2>
          <p className="text-3xl! font-bold text-center">
            {monthlyBooksRead}
          </p>
          <p className="text-center mt-2">
            {monthlyBooksRead === 0 
              ? "Start reading to track your monthly progress!" 
              : monthlyBooksRead === 1 
                ? "You've started reading a book this month!" 
                : `You've read multiple books this month!`}
          </p>
        </Card>
      </div>

    </>
  );
}