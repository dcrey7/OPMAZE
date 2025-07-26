import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Factory, Clock, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SimpleAnalytics = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await supabase
        .from('assignments')
        .select('*');

      if (dbError) {
        throw dbError;
      }

      setAssignments(data || []);
    } catch (err: any) {
      console.error('Analytics error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <Button onClick={loadData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate basic metrics
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length;
  const delayedAssignments = assignments.filter(a => a.status === 'delayed').length;
  const onTimeRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  // Check for optimization stats
  const optimizationStats = localStorage.getItem('optimizationStats');
  const hasOptimization = !!optimizationStats;
  let stats = null;
  
  if (hasOptimization) {
    try {
      stats = JSON.parse(optimizationStats);
    } catch (e) {
      console.error('Failed to parse optimization stats:', e);
    }
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
            <div className="text-2xl font-bold">{totalAssignments}</div>
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
            <div className="text-2xl font-bold">{onTimeRate.toFixed(1)}%</div>
            <Progress value={onTimeRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Tasks finished successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Currently active tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {hasOptimization && stats ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Latest Optimization Results
            </CardTitle>
            <CardDescription>
              Completed on {new Date(stats.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_assignments}</div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.employees_utilized}</div>
                <p className="text-sm text-muted-foreground">Employees Used</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.products_scheduled}</div>
                <p className="text-sm text-muted-foreground">Products Scheduled</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.days_covered}</div>
                <p className="text-sm text-muted-foreground">Days Covered</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">Status: {stats.solver_status}</Badge>
              <Badge variant="outline">Solved in {(stats.solve_time_seconds || 0).toFixed(3)}s</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Optimization Results
            </CardTitle>
            <CardDescription>
              No optimization has been run yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Go to the AI Assistant tab and ask to optimize your production schedule to see detailed results here.
            </p>
            <Button variant="outline">
              Go to AI Assistant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Basic Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Production Summary</CardTitle>
          <CardDescription>Current status overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Completion Rate</span>
            <Badge variant="secondary">{onTimeRate.toFixed(1)}%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Active Tasks</span>
            <Badge variant="secondary">{inProgressAssignments}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Delayed Tasks</span>
            <Badge variant={delayedAssignments > 0 ? "destructive" : "secondary"}>
              {delayedAssignments}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Scheduled</span>
            <Badge variant="secondary">{totalAssignments}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAnalytics;