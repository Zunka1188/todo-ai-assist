
import React from 'react';
import { Wallet, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip 
} from 'recharts';
import { cn } from '@/lib/utils';

const SpendingWidget = () => {
  // Sample spending data for the month
  const spendingData = [
    { name: 'Week 1', amount: 120 },
    { name: 'Week 2', amount: 240 },
    { name: 'Week 3', amount: 180 },
    { name: 'Week 4', amount: 320 },
  ];

  // Calculate total spending and comparison to previous month
  const totalSpending = spendingData.reduce((sum, item) => sum + item.amount, 0);
  const previousMonthSpending = 780; // This would come from real data
  const difference = totalSpending - previousMonthSpending;
  const percentageChange = ((difference / previousMonthSpending) * 100).toFixed(1);
  const isIncrease = difference > 0;

  return (
    <Card className="metallic-card shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-todo-purple" />
          <h3 className="font-medium">Spending</h3>
        </div>
        <Link to="/spending" className="text-sm text-todo-purple flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <h3 className="text-xl font-bold dark:text-white">${totalSpending}</h3>
            <div className={cn(
              "text-xs flex items-center mt-1",
              isIncrease ? "text-red-500" : "text-green-500"
            )}>
              {isIncrease ? (
                <>
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +{percentageChange}%
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {percentageChange}%
                </>
              )}
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest Spending</p>
            <h3 className="text-xl font-bold dark:text-white">Week 4</h3>
            <p className="text-xs text-muted-foreground mt-1">
              $320 in last week
            </p>
          </div>
        </div>
        
        <div className="h-[140px] mt-4">
          <ChartContainer
            config={{
              spending: {
                label: "Spending",
                theme: {
                  light: "#9b87f5",
                  dark: "#b19dff" // Brighter in dark mode for better visibility
                }
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={spendingData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tick={{ fill: 'var(--foreground)' }}
                  dy={5}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: 'var(--foreground)' }}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium dark:text-white">
                                {payload[0].payload.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Spending
                              </span>
                            </div>
                            <div className="flex items-center justify-end">
                              <span className="font-bold text-xs dark:text-white">
                                ${payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="var(--color-spending)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingWidget;
