import { Card } from "../ui/card";
import { ReadingGoalChart, type ReadingPeriodData } from "../ReadingGoalChart";

interface AllTimeInsightsProps {
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
}

export function AllTimeInsights({ 
  totalMinutesRead, 
  totalPagesRead,
  totalBooksRead, 
  readingGoal,
  periodicReadingData 
}: AllTimeInsightsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-center font-sans!">Minutes read all time</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {totalMinutesRead}
          </p>
          <p className="text-center mt-0">
            That's approximately {Math.round(totalMinutesRead / 60)} hours
            of reading!
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-center font-sans!">Books read all time</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {totalBooksRead}
          </p>
          <p className="text-center mt-0">
            Keep going to expand your reading journey!
          </p>
        </Card>
        
        <Card className="p-4">
          <h4 className="text-center font-sans!">Pages read all time</h4>
          <p className="text-3xl! font-bold text-center mt-0">
            {totalPagesRead}
          </p>
          <p className="text-center mt-0">
            {totalPagesRead === 0 
              ? "No pages recorded yet." 
              : totalPagesRead === 1 
                ? "You've just started your reading journey!" 
                : `That's ${Math.round(totalPagesRead / 300)} average books worth!`}
          </p>
        </Card>
      </div>
    </>
  );
}