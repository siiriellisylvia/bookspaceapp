import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  
  const chartData = [
    { 
      name: "progress", 
      value: actualPercentage, 
      fill: "hsl(var(--chart-1))" 
    },
  ];

  const chartConfig = {
    value: {
      label: "Progress",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <h2>Daily goal</h2>
        <p className="text-sm">
          {actualPercentage >= 100
            ? "Well done, you've reached your goal today!"
            : `You are ${actualPercentage}% of the way to your daily goal, keep going!`}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-primary-beige-10 last:fill-primary-dark"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} className="fill-primary-beige"/>
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-primary-beige text-4xl font-bold"
                        >
                          {todayMinutes}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-primary-beige"
                        >
                          of {goalMinutes} min
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
