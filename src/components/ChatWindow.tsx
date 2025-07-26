import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Clock, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { chatWithAI, optimizeSchedule } from "@/services/anthropic";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  constraints?: any;
  pythonScript?: string;
  isOptimization?: boolean;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI scheduling assistant. I can help you define constraints and optimize your production schedule. What would you like to work on today?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      let aiResponse: any;
      const isOptimizationRequest = currentInput.toLowerCase().includes('optimize') || 
                                   currentInput.toLowerCase().includes('schedule') ||
                                   currentInput.toLowerCase().includes('generate schedule');

      if (isOptimizationRequest) {
        // Load all data for optimization
        const [employeesRes, productsRes, materialsRes, resourcesRes, constraintsRes] = await Promise.all([
          supabase.from('employees').select('*'),
          supabase.from('products').select('*'),
          supabase.from('materials').select('*'),
          supabase.from('resources').select('*'),
          supabase.from('constraints').select('*').eq('active', true)
        ]);

        const optimizationRequest = {
          userPrompt: currentInput,
          csvData: [], // Add any specific CSV data if uploaded
          constraints: constraintsRes.data || [],
          employees: employeesRes.data || [],
          products: productsRes.data || [],
          materials: materialsRes.data || [],
          resources: resourcesRes.data || []
        };

        aiResponse = await optimizeSchedule(optimizationRequest);
      } else {
        // Regular chat
        aiResponse = { content: await chatWithAI(currentInput) };
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        constraints: aiResponse.constraints,
        pythonScript: aiResponse.pythonScript,
        isOptimization: isOptimizationRequest,
      };

      setMessages(prev => [...prev, aiMessage]);

      // If constraints were generated, save them to database
      if (aiResponse.constraints) {
        await saveConstraints(aiResponse.constraints);
      }

      // If schedule was optimized, save assignments to database
      if (aiResponse.schedule && aiResponse.schedule.length > 0) {
        await saveOptimizedSchedule(aiResponse.schedule, aiResponse.executionResult);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const saveConstraints = async (constraints: any) => {
    try {
      const { error } = await supabase
        .from('constraints')
        .insert({
          constraint_type: constraints.type,
          description: constraints.description,
          parameters: constraints.parameters || {},
          priority: 1,
          active: true
        });

      if (error) throw error;

      toast({
        title: "Constraint Saved",
        description: "New scheduling constraint has been added to your system.",
      });
    } catch (error: any) {
      console.error('Error saving constraints:', error);
    }
  };

  const saveOptimizedSchedule = async (schedule: any[], optimizationResults?: any) => {
    try {
      // Clear existing scheduled assignments to replace with optimized ones
      await supabase.from('assignments').delete().eq('status', 'scheduled');

      // Clean the schedule data to match database schema
      const cleanedSchedule = schedule.map(item => ({
        employee_id: item.employee_id,
        product_code: item.product_code,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status || 'scheduled',
        notes: item.notes || ''
      }));

      console.log('Attempting to insert schedule:', cleanedSchedule.slice(0, 2)); // Log first 2 items for debugging

      // Insert new optimized assignments
      const { error } = await supabase
        .from('assignments')
        .insert(cleanedSchedule);

      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }

      // Store optimization results for analytics
      if (optimizationResults?.optimization_stats) {
        localStorage.setItem('optimizationStats', JSON.stringify({
          ...optimizationResults.optimization_stats,
          task_breakdown: optimizationResults.task_breakdown,
          timestamp: new Date().toISOString()
        }));
      }

      toast({
        title: "🎯 Schedule Optimized!",
        description: `${schedule.length} detailed tasks scheduled across ${optimizationResults?.optimization_stats?.days_covered || 'multiple'} days. Check Calendar & Analytics!`,
      });

      // Trigger both calendar and analytics refresh
      window.dispatchEvent(new CustomEvent('scheduleUpdated'));
      window.dispatchEvent(new CustomEvent('analyticsUpdated'));
      
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Schedule Save Error",
        description: `Database error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {message.sender === 'ai' ? (
                      <Bot className="h-4 w-4 mt-1 text-accent" />
                    ) : (
                      <User className="h-4 w-4 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      {message.isOptimization && (
                        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-xs">
                          <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                            <Zap className="h-3 w-3" />
                            Optimization Complete - Check Calendar Tab
                          </div>
                        </div>
                      )}
                      {message.pythonScript && (
                        <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs">
                          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300 mb-1">
                            <AlertTriangle className="h-3 w-3" />
                            Python Script Generated
                          </div>
                          <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto max-h-32">
                            {message.pythonScript}
                          </pre>
                        </div>
                      )}
                      {message.constraints && !message.isOptimization && (
                        <div className="mt-2 p-2 bg-accent/20 rounded text-xs">
                          <div className="flex items-center gap-1 text-accent">
                            <AlertTriangle className="h-3 w-3" />
                            Constraint Added
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-accent" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about scheduling constraints, optimization goals, or resource management..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          <p>Press Enter to send. Try these optimization prompts:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <button 
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
              onClick={() => setInputMessage("Optimize my production schedule for this week with detailed task breakdown")}
            >
              📊 Weekly Optimization
            </button>
            <button 
              className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
              onClick={() => setInputMessage("Create a priority-based schedule that maximizes efficiency")}
            >
              🎯 Priority Scheduling
            </button>
            <button 
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800"
              onClick={() => setInputMessage("Balance workload across all employees and minimize overtime")}
            >
              ⚖️ Load Balancing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;