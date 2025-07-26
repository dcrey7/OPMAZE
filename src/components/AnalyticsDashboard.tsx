import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Factory, Clock, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface Analytics {
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  delayedAssignments: number;
  onTimeRate: number;
  resourceUtilization: any[];
  employeeWorkload: any[];
  productionTrends: any[];
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalAssignments: 0,
    completedAssignments: 0,
    inProgressAssignments: 0,
    delayedAssignments: 0,
    onTimeRate: 0,
    resourceUtilization: [
      { name: 'CNC Machine', type: 'Manufacturing', utilization: 75, status: 'available' },
      { name: 'Assembly Line', type: 'Assembly', utilization: 60, status: 'available' }
    ],
    employeeWorkload: [
      { name: 'John Smith', assignments: 0, completed: 0, department: 'Production' },
      { name: 'Sarah Johnson', assignments: 0, completed: 0, department: 'Assembly' }
    ],
    productionTrends: [
      { date: '1/20', completed: 8, planned: 12 },
      { date: '1/21', completed: 12, planned: 15 },
      { date: '1/22', completed: 10, planned: 14 },
      { date: '1/23', completed: 15, planned: 18 },
      { date: '1/24', completed: 14, planned: 16 },
      { date: '1/25', completed: 16, planned: 20 },
      { date: '1/26', completed: 18, planned: 22 }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading analytics data...');
      
      // Fetch assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*');

      if (assignmentsError) {
        console.error('Database error:', assignmentsError);
        setError('Failed to load assignments from database');
        return;
      }

      console.log('Assignments loaded:', assignments?.length || 0);

      // Calculate basic metrics
      const totalAssignments = assignments?.length || 0;
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress').length || 0;
      const delayedAssignments = assignments?.filter(a => a.status === 'delayed').length || 0;
      const onTimeRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      // Update analytics with real data
      setAnalytics(prev => ({
        ...prev,
        totalAssignments,
        completedAssignments,
        inProgressAssignments,
        delayedAssignments,
        onTimeRate
      }));

    } catch (error: any) {
      console.error('Analytics error:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    // Listen for analytics updates from optimization
    const handleAnalyticsUpdate = () => {
      loadAnalytics();
    };

    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate);
    
    return () => {
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
    };
  }, []);

  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Delayed', 'Scheduled'],
    datasets: [
      {
        data: [
          analytics.completedAssignments || 0,
          analytics.inProgressAssignments || 0,
          analytics.delayedAssignments || 0,
          Math.max(0, (analytics.totalAssignments || 0) - (analytics.completedAssignments || 0) - (analytics.inProgressAssignments || 0) - (analytics.delayedAssignments || 0))
        ],
        backgroundColor: [
          '#10B981',
          '#F59E0B', 
          '#EF4444',
          '#3B82F6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const utilizationChartData = {
    labels: (analytics.resourceUtilization || []).map(r => r.name || 'Unknown'),
    datasets: [
      {
        label: 'Utilization %',
        data: (analytics.resourceUtilization || []).map(r => r.utilization || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const trendsChartData = {
    labels: (analytics.productionTrends || []).map(t => t.date || 'Unknown'),
    datasets: [
      {
        label: 'Completed',
        data: (analytics.productionTrends || []).map(t => t.completed || 0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Planned',
        data: (analytics.productionTrends || []).map(t => t.planned || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const workloadChartData = {
    labels: (analytics.employeeWorkload || []).map(emp => emp.name || 'Unknown'),
    datasets: [
      {
        label: 'Total Assignments',
        data: (analytics.employeeWorkload || []).map(emp => emp.assignments || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: (analytics.employeeWorkload || []).map(emp => emp.completed || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Error</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Production tasks scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.onTimeRate || 0).toFixed(1)}%</div>
            <Progress value={analytics.onTimeRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks finished successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.delayedAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Delayed assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="utilization">Resource Utilization</TabsTrigger>
          <TabsTrigger value="workload">Employee Workload</TabsTrigger>
          <TabsTrigger value="trends">Production Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="optimization" className="space-y-4">
          {(() => {
            const optimizationStats = localStorage.getItem('optimizationStats');
            if (!optimizationStats) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Optimization Results
                    </CardTitle>
                    <CardDescription>
                      No optimization has been run yet. Go to AI Assistant and ask to optimize your schedule.
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            }

            const stats = JSON.parse(optimizationStats);
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Optimization Results
                    </CardTitle>
                    <CardDescription>
                      Latest optimization completed on {new Date(stats.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">📊 Total Tasks</Label>
                        <p className="text-2xl font-bold text-primary">{stats.total_assignments}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">👥 Employees Used</Label>
                        <p className="text-2xl font-bold text-green-600">{stats.employees_utilized}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">📦 Products Scheduled</Label>
                        <p className="text-2xl font-bold text-blue-600">{stats.products_scheduled}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">📅 Days Covered</Label>
                        <p className="text-2xl font-bold text-orange-600">{stats.days_covered}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">⚡ Solver Status</Label>
                      <Badge variant="secondary">{stats.solver_status}</Badge>
                      <p className="text-xs text-muted-foreground">
                        Solved in {stats.solve_time_seconds?.toFixed(3) || 0}s
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>📋 Daily Task Breakdown</CardTitle>
                    <CardDescription>
                      Detailed view of optimized tasks by day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {stats.task_breakdown && Object.entries(stats.task_breakdown).map(([date, tasks]: [string, any[]]) => (
                        <div key={date} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2">📅 {new Date(date).toLocaleDateString()}</h4>
                          <div className="space-y-1">
                            {tasks.map((task, index) => (
                              <div key={index} className="text-xs bg-muted p-2 rounded flex justify-between">
                                <span>
                                  <strong>{task.employee}</strong> - {task.product} ({task.phase})
                                </span>
                                <span className="text-muted-foreground">
                                  {task.start_time} ({task.duration}h)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Assignment Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all production assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Pie 
                    data={statusChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Important production performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Completion Rate</p>
                    <p className="text-xs text-muted-foreground">Tasks completed vs. total</p>
                  </div>
                  <Badge variant="secondary">{(analytics.onTimeRate || 0).toFixed(1)}%</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Workers</p>
                    <p className="text-xs text-muted-foreground">Employees with assignments</p>
                  </div>
                  <Badge variant="secondary">
                    {(analytics.employeeWorkload || []).filter(emp => (emp.assignments || 0) > 0).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Average Utilization</p>
                    <p className="text-xs text-muted-foreground">Resource usage across all equipment</p>
                  </div>
                  <Badge variant="secondary">
                    {(analytics.resourceUtilization || []).length > 0 
                      ? ((analytics.resourceUtilization || []).reduce((sum, r) => sum + (r.utilization || 0), 0) / (analytics.resourceUtilization || []).length).toFixed(1) 
                      : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Resource Utilization
              </CardTitle>
              <CardDescription>
                Equipment and machinery usage percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar 
                  data={utilizationChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Workload Distribution
              </CardTitle>
              <CardDescription>
                Assignment distribution across team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar 
                  data={workloadChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Production Trends
              </CardTitle>
              <CardDescription>
                Daily production completion vs. planning over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line 
                  data={trendsChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  } catch (renderError: any) {
    console.error('Analytics render error:', renderError);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Component Error</h3>
          <p className="text-muted-foreground">Analytics component failed to render</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
};

export default AnalyticsDashboard;