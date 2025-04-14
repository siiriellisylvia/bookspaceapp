import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

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

  const chartConfig = {
    actual: {
      label: "Minutes Read",
      color: "var(--chart-1)",
    }

  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-auto"
    >
      <BarChart 
        data={data} 
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >

        <XAxis 
          dataKey="period" 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          tickLine={false} 
          axisLine={false}
          tick={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
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
        {/* Only show the actual reading minutes as bars */}
        <Bar
          dataKey="actual"
          name="actual"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
