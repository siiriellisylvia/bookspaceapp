import { Card } from "../ui/card";

interface WeeklyInsightsProps {
  weeklyMinutesRead: number;
  weeklyPagesRead: number;
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
  weeklyPagesRead,
  weeklyBooksRead, 
  readingGoal,
  currentWeek 
}: WeeklyInsightsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-center font-sans!">Minutes read this week</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {weeklyMinutesRead}
          </p>
          <p className="text-center mt-0">
            That's approximately {Math.round(weeklyMinutesRead / 60)} hours
            this week!
          </p>
          <p className="text-center text-sm mt-0">
            Week: {currentWeek.start} - {currentWeek.end}
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-center font-sans!">Books read this week</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {weeklyBooksRead}
          </p>
          <p className="text-center mt-0">
            {weeklyBooksRead === 0 
              ? "Start reading to track your weekly progress!" 
              : weeklyBooksRead === 1 
                ? "You've started reading a book this week!" 
                : `You've read multiple books this week!`}
          </p>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-center font-sans!">Pages read this week</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {weeklyPagesRead}
          </p>
          <p className="text-center mt-0">
            {weeklyPagesRead === 0 
              ? "No pages read yet this week." 
              : weeklyPagesRead === 1 
                ? "You've read one page this week!" 
                : `Keep up the good work!`}
          </p>
        </Card>
      </div>
    </>
  );
}