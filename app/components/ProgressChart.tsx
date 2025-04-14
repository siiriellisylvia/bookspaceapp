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
  todayMinutes?: number;
  goalMinutes?: number;
  completionPercentage?: number;
}

export function ProgressChart({ todayMinutes = 0, goalMinutes = 60, completionPercentage = 0 }: ProgressChartProps) {
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

  const remainingMinutes = goalMinutes - todayMinutes;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <h2>Daily goal</h2>
        <p className="text-sm">
          {actualPercentage >= 100
            ? "Well done, you've reached your goal today!"
            : `You are just ${remainingMinutes} minutes away from your daily goal, keep going!`}
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
              {todayMinutes}
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
        <p className="text-center">{todayMinutes} minutes out of {goalMinutes} minutes read today</p>
      </CardContent>
    </Card>
  );
}
