import { Card } from "../ui/card";
import { ReadingGoalChart, type ReadingPeriodData } from "../ReadingGoalChart";

interface AllTimeInsightsProps {
  totalMinutesRead: number;
  totalBooksRead: number;
  readingGoal: {
    type: string;
    frequency: string;
    target: number;
    isActive: boolean;
  } | null;
  periodicReadingData: ReadingPeriodData[];
}

export function AllTimeInsights({ 
  totalMinutesRead, 
  totalBooksRead, 
  readingGoal,
  periodicReadingData 
}: AllTimeInsightsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-center mb-1">Total reading time</h2>
          <p className="text-3xl! font-bold text-center">
            {totalMinutesRead} minutes
          </p>
          <p className="text-center mt-2">
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

    </>
  );
}