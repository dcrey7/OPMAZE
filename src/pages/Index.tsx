import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataUploader from "@/components/DataUploader";
import ChatWindow from "@/components/ChatWindow";
import CalendarView from "@/components/CalendarView";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Database, MessageCircle, Calendar, BarChart3 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("data");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Cronos AI Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Production Scheduling & Resource Management
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Production Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Upload CSV/Excel files to manage employees, products, materials, and resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>AI Scheduling Assistant</CardTitle>
                <CardDescription>
                  Chat with AI to define scheduling constraints and optimization parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatWindow />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Production Schedule</CardTitle>
                <CardDescription>
                  View and edit your production schedule in calendar format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Monitor resource utilization, on-time delivery, and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
