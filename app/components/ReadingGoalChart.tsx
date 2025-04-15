import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Cell } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

// This is a wacky way to do this, and not fully based on documentation,
// need to research how to do this better 

// Define types for our chart data
export type ReadingPeriodData = {
  period: string;
  actual: number;
  goal: number;
};

interface ReadingGoalChartProps {
  data: ReadingPeriodData[];
}

export function ReadingGoalChart({ data }: ReadingGoalChartProps) {
  // Get goal value from the first data point (should be consistent across all periods)
  const goalValue = data.length > 0 ? data[0].goal : 0;

  // Process data to include goal status for each entry
  const processedData = data.map((item) => ({
    ...item,
    // Add boolean flags to identify goal status for each entry
    goalReached: item.actual >= item.goal,
    goalNotReached: item.actual < item.goal,
  }));

  // Configure chart with goal status labels
  const chartConfig = {
    goalReached: {
      label: "Goal reached",
      color: "var(--chart-1)",
    },
    goalNotReached: {
      label: "Goal not reached",
      color: "var(--chart-2)",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-auto">
      <BarChart
        data={processedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="period" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tick={false} />

        {/* Show minutes read in tooltip */}
        <ChartTooltip
          content={
            <ChartTooltipContent className="text-primary-accent" formatter={(value) => `${value} minutes`} />
          }
        />

        {/* Legend showing only goal reached/not reached status */}
        <ChartLegend content={<ChartLegendContent />} />

        {/* Add a horizontal reference line for the goal */}
        <ReferenceLine
          y={goalValue}
          stroke="var(--chart-1)"
          strokeWidth={1}
          strokeDasharray="3"
          label={{
            value: `${goalValue}m`,
            position: "left",
            fill: "var(--chart-1)",
            fontSize: 14,
            fontWeight: "bold",
          }}
        />

        {/* Bar with conditional coloring based on goal reached status */}
        <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.goalReached
                  ? "var(--color-goalReached)"
                  : "var(--color-goalNotReached)"
              }
              name={entry.goalReached ? "goalReached" : "goalNotReached"}
            />
          ))}
        </Bar>

        {/* Hidden bars to provide legend items - with 0 values so they don't affect the chart */}
        <Bar
          dataKey="goalReached"
          name="goalReached"
          fill="var(--color-goalReached)"
          legendType="square"
          hide
        />
        <Bar
          dataKey="goalNotReached"
          name="goalNotReached"
          fill="var(--color-goalNotReached)"
          legendType="square"
          hide
        />
      </BarChart>
    </ChartContainer>
  );
}
