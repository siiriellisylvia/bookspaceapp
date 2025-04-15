import { Card } from "../ui/card";

interface MonthlyInsightsProps {
  monthlyMinutesRead: number;
  monthlyPagesRead: number;
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
  monthlyPagesRead,
  monthlyBooksRead, 
  readingGoal,
  currentMonth 
}: MonthlyInsightsProps) {
  return (
    <>
      <h3 className="text-center mb-2 font-sans!">{currentMonth}</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-center font-sans!">Minutes read</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {monthlyMinutesRead}
          </p>
          <p className="text-center mt-0">
            That's approximately {Math.round(monthlyMinutesRead / 60)} hours
            this month!
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-center font-sans!">Books read</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {monthlyBooksRead}
          </p>
          <p className="text-center mt-0">
            {monthlyBooksRead === 0 
              ? "Start reading to track your monthly progress!" 
              : monthlyBooksRead === 1 
                ? "You've started reading a book this month!" 
                : `You've read multiple books this month!`}
          </p>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-center font-sans!">Pages read</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {monthlyPagesRead}
          </p>
          <p className="text-center mt-0">
            {monthlyPagesRead === 0 
              ? "No pages read yet this month." 
              : monthlyPagesRead === 1 
                ? "You've read one page this month!" 
                : `Great progress this month!`}
          </p>
        </Card>
      </div>
    </>
  );
}