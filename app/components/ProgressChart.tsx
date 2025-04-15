import {
  Label,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
} from "../components/ui/card";
import { type ChartConfig, ChartContainer } from "../components/ui/chart";

// Define type for the ProgressChart props
interface ProgressChartProps {
  minutesRead?: number;
  goalMinutes?: number;
  completionPercentage?: number;
  goalFrequency?: string;
  showGoal?: boolean;
}

export function ProgressChart({ 
  minutesRead = 0, 
  goalMinutes = 60, 
  completionPercentage = 0,
  goalFrequency = "daily",
  showGoal = true
}: ProgressChartProps) {
  // If showGoal is false, don't render the component
  if (!showGoal) {
    return null;
  }

  // Calculate the completion percentage capped at 100%
  const actualPercentage = Math.min(completionPercentage, 100);
  
  // Create a simple data structure with a single data point
  const chartData = [
    {
      name: "Progress",
      value: actualPercentage,
    }
  ];
  
  // Simple chart config
  const chartConfig = {
    value: {
      label: "Reading Progress",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const remainingMinutes = goalMinutes - minutesRead;
  
  // Format the title and period based on goal frequency
  const goalTitle = `${goalFrequency.charAt(0).toUpperCase() + goalFrequency.slice(1)} goal`;
  const periodLabel = goalFrequency === "daily" ? "today" : 
                      goalFrequency === "weekly" ? "this week" : 
                      goalFrequency === "monthly" ? "this month" : "today";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <h2>{goalTitle}</h2>
        <p className="text-sm">
          {actualPercentage >= 100
            ? `Well done, you've reached your ${goalFrequency} goal ${periodLabel}!`
            : `You are just ${remainingMinutes} minutes away from your ${goalFrequency} goal, keep going!`}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            width={200}
            height={200}
            cx={100}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            barSize={10}
            data={chartData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              label={false}
              background={{fill: "rgba(255, 255, 255, 0.2)"}}
              dataKey="value"
              className="fill-primary-beige"
            />
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <text
              x={100}
              y={100}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary-beige text-4xl font-bold"
            >
              {minutesRead}
            </text>
            <text
              x={100}
              y={124}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary-beige"
            >
              of {goalMinutes} min
            </text>
          </RadialBarChart>
        </ChartContainer>
        <p className="text-center">{minutesRead} minutes out of {goalMinutes} minutes read {periodLabel}</p>
      </CardContent>
    </Card>
  );
}
