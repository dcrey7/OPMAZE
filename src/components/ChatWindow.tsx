import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  constraints?: any;
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
    setInputMessage("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual AI API call to Claude via lovable.dev
      // For now, simulate AI response with scheduling logic
      const aiResponse = await simulateAIResponse(inputMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        constraints: aiResponse.constraints,
      };

      setMessages(prev => [...prev, aiMessage]);

      // If constraints were generated, save them to database
      if (aiResponse.constraints) {
        await saveConstraints(aiResponse.constraints);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userInput: string): Promise<{content: string, constraints?: any}> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = userInput.toLowerCase();
    
    if (input.includes('constraint') || input.includes('rule')) {
      return {
        content: "I can help you define scheduling constraints. Here are some common types:\n\n• **Employee Availability**: Ensure workers are only scheduled during their available hours\n• **Machine Capacity**: Limit concurrent jobs per machine\n• **Material Dependencies**: Schedule based on material availability\n• **Priority Ordering**: Higher priority jobs scheduled first\n\nWhat specific constraint would you like to add?",
        constraints: {
          type: 'general_info',
          description: 'Constraint types overview'
        }
      };
    }
    
    if (input.includes('employee') || input.includes('worker')) {
      return {
        content: "I'll create employee availability constraints. This ensures workers are only assigned tasks during their available shifts and days.\n\nConstraint added: Employee availability matching",
        constraints: {
          type: 'employee_availability',
          description: 'Match employee assignments with their availability',
          parameters: {
            enforce_availability: true,
            check_shift_times: true
          }
        }
      };
    }
    
    if (input.includes('machine') || input.includes('resource')) {
      return {
        content: "I'll set up machine capacity constraints. This prevents overbooking of equipment and ensures realistic scheduling.\n\nConstraint added: Machine capacity limits",
        constraints: {
          type: 'machine_capacity',
          description: 'Limit concurrent jobs per machine based on capacity',
          parameters: {
            respect_capacity: true,
            allow_queue: true
          }
        }
      };
    }
    
    if (input.includes('priority') || input.includes('urgent')) {
      return {
        content: "I'll implement priority-based scheduling. Higher priority jobs will be scheduled before lower priority ones.\n\nConstraint added: Priority-based ordering",
        constraints: {
          type: 'priority_ordering',
          description: 'Schedule high priority jobs first',
          parameters: {
            priority_weight: 0.8,
            strict_ordering: false
          }
        }
      };
    }
    
    if (input.includes('optimize') || input.includes('schedule')) {
      return {
        content: "I can help optimize your production schedule using various algorithms:\n\n• **Minimize Makespan**: Reduce total completion time\n• **Maximize Utilization**: Keep resources busy\n• **Balance Workload**: Even distribution across workers\n• **Meet Deadlines**: Prioritize on-time delivery\n\nWhich optimization goal is most important for your production?",
      };
    }

    return {
      content: "I understand you're looking for help with production scheduling. I can assist with:\n\n• Setting up scheduling constraints\n• Optimizing resource allocation\n• Managing employee availability\n• Balancing workloads\n• Meeting production deadlines\n\nWhat specific aspect would you like to focus on?",
    };
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
                      {message.constraints && (
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
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send. The AI will help you define scheduling constraints and optimization parameters.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;