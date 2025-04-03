import React from 'react';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReceiptList from '@/components/features/spending/ReceiptList';

const SpendingPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/');
  };

  // Sample spending data for different time periods
  const monthlyData = [
    { name: 'Week 1', amount: 120 },
    { name: 'Week 2', amount: 240 },
    { name: 'Week 3', amount: 180 },
    { name: 'Week 4', amount: 320 },
  ];

  const yearlyData = [
    { name: 'Jan', amount: 460 },
    { name: 'Feb', amount: 520 },
    { name: 'Mar', amount: 480 },
    { name: 'Apr', amount: 580 },
    { name: 'May', amount: 620 },
    { name: 'Jun', amount: 720 },
    { name: 'Jul', amount: 650 },
    { name: 'Aug', amount: 700 },
    { name: 'Sep', amount: 680 },
    { name: 'Oct', amount: 550 },
    { name: 'Nov', amount: 530 },
    { name: 'Dec', amount: 490 },
  ];

  const categoryData = [
    { name: 'Groceries', amount: 320 },
    { name: 'Transport', amount: 180 },
    { name: 'Entertainment', amount: 140 },
    { name: 'Utilities', amount: 220 },
    { name: 'Shopping', amount: 280 },
  ];

  // Calculate total spending
  const totalMonthly = monthlyData.reduce((sum, item) => sum + item.amount, 0);
  const totalYearly = yearlyData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Spending Analytics" 
          subtitle="Track and analyze your spending"
          className="py-0"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-medium">Overview</h3>
            </CardHeader>
            <CardContent className="pb-4">
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monthly" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spending</p>
                      <h3 className="text-2xl font-bold dark:text-white">${totalMonthly}</h3>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Highest Week</p>
                      <h3 className="text-2xl font-bold dark:text-white">Week 4</h3>
                    </div>
                  </div>
                  
                  <div className="h-[300px] mt-4">
                    <ChartContainer
                      config={{
                        spending: {
                          label: "Spending",
                          theme: {
                            light: "#9b87f5",
                            dark: "#b19dff"
                          }
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={monthlyData} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis 
                            dataKey="name"
                            tick={{ fill: 'var(--foreground)' }}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                            tick={{ fill: 'var(--foreground)' }}
                            width={60}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">
                                          {payload[0].payload.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          Spending
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-end">
                                        <span className="font-bold text-xs">
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
                            name="Amount"
                          />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="yearly" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Spending</p>
                      <h3 className="text-2xl font-bold dark:text-white">${totalYearly}</h3>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Highest Month</p>
                      <h3 className="text-2xl font-bold dark:text-white">Jun</h3>
                    </div>
                  </div>
                  
                  <div className="h-[300px] mt-4">
                    <ChartContainer
                      config={{
                        spending: {
                          label: "Spending",
                          theme: {
                            light: "#9b87f5",
                            dark: "#b19dff"
                          }
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={yearlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis 
                            dataKey="name"
                            tick={{ fill: 'var(--foreground)' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            fontSize={12}
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                            tick={{ fill: 'var(--foreground)' }}
                            width={60}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">
                                          {payload[0].payload.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          Spending
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-end">
                                        <span className="font-bold text-xs">
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
                            name="Amount"
                          />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-medium">Spending by Category</h3>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    spending: {
                      label: "Spending",
                      theme: {
                        light: "#9b87f5",
                        dark: "#b19dff"
                      }
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={categoryData} 
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis 
                        type="number"
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fill: 'var(--foreground)' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name"
                        tick={{ fill: 'var(--foreground)' }}
                        width={80}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium">
                                      {payload[0].payload.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Category
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-end">
                                    <span className="font-bold text-xs">
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
                        radius={[0, 4, 4, 0]} 
                        name="Amount"
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Tab Content */}
        <TabsContent value="receipts" className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan Receipt
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Receipt
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-medium">Recent Receipts</h3>
            </CardHeader>
            <CardContent>
              <ReceiptList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpendingPage;
