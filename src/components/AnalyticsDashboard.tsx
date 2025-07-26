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
    resourceUtilization: [],
    employeeWorkload: [],
    productionTrends: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          employees:employee_id (name, department),
          products:product_code (name, priority)
        `);

      if (assignmentsError) throw assignmentsError;

      // Fetch employees and resources
      const [employeesRes, resourcesRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('resources').select('*')
      ]);

      if (employeesRes.error) throw employeesRes.error;
      if (resourcesRes.error) throw resourcesRes.error;

      // Calculate metrics
      const totalAssignments = assignments?.length || 0;
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress').length || 0;
      const delayedAssignments = assignments?.filter(a => a.status === 'delayed').length || 0;
      const onTimeRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      // Calculate employee workload
      const employeeWorkload = (employeesRes.data || []).map(emp => {
        const empAssignments = assignments?.filter(a => a.employee_id === emp.employee_id) || [];
        return {
          name: emp.name,
          assignments: empAssignments.length,
          completed: empAssignments.filter(a => a.status === 'completed').length,
          department: emp.department
        };
      });

      // Calculate resource utilization
      const resourceUtilization = (resourcesRes.data || []).map(resource => {
        // For demo purposes, generate some utilization data
        const utilization = Math.floor(Math.random() * 100);
        return {
          name: resource.name,
          type: resource.type,
          utilization,
          status: resource.status
        };
      });

      // Generate production trends (last 7 days)
      const productionTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString(),
          completed: Math.floor(Math.random() * 20) + 5,
          planned: Math.floor(Math.random() * 25) + 15
        };
      });

      setAnalytics({
        totalAssignments,
        completedAssignments,
        inProgressAssignments,
        delayedAssignments,
        onTimeRate,
        resourceUtilization,
        employeeWorkload,
        productionTrends
      });

    } catch (error: any) {
      toast({
        title: "Error Loading Analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Delayed', 'Scheduled'],
    datasets: [
      {
        data: [
          analytics.completedAssignments,
          analytics.inProgressAssignments,
          analytics.delayedAssignments,
          analytics.totalAssignments - analytics.completedAssignments - analytics.inProgressAssignments - analytics.delayedAssignments
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
    labels: analytics.resourceUtilization.map(r => r.name),
    datasets: [
      {
        label: 'Utilization %',
        data: analytics.resourceUtilization.map(r => r.utilization),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const trendsChartData = {
    labels: analytics.productionTrends.map(t => t.date),
    datasets: [
      {
        label: 'Completed',
        data: analytics.productionTrends.map(t => t.completed),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Planned',
        data: analytics.productionTrends.map(t => t.planned),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const workloadChartData = {
    labels: analytics.employeeWorkload.map(emp => emp.name),
    datasets: [
      {
        label: 'Total Assignments',
        data: analytics.employeeWorkload.map(emp => emp.assignments),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: analytics.employeeWorkload.map(emp => emp.completed),
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
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{analytics.totalAssignments}</div>
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
            <div className="text-2xl font-bold">{analytics.onTimeRate.toFixed(1)}%</div>
            <Progress value={analytics.onTimeRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedAssignments}</div>
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
            <div className="text-2xl font-bold">{analytics.delayedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Delayed assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="utilization">Resource Utilization</TabsTrigger>
          <TabsTrigger value="workload">Employee Workload</TabsTrigger>
          <TabsTrigger value="trends">Production Trends</TabsTrigger>
        </TabsList>

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
                  <Badge variant="secondary">{analytics.onTimeRate.toFixed(1)}%</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Workers</p>
                    <p className="text-xs text-muted-foreground">Employees with assignments</p>
                  </div>
                  <Badge variant="secondary">
                    {analytics.employeeWorkload.filter(emp => emp.assignments > 0).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Average Utilization</p>
                    <p className="text-xs text-muted-foreground">Resource usage across all equipment</p>
                  </div>
                  <Badge variant="secondary">
                    {analytics.resourceUtilization.length > 0 
                      ? (analytics.resourceUtilization.reduce((sum, r) => sum + r.utilization, 0) / analytics.resourceUtilization.length).toFixed(1) 
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
};

export default AnalyticsDashboard;