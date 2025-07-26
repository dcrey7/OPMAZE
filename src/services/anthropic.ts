import Anthropic from '@anthropic-ai/sdk';
import { executePythonScript, optimizeScheduleWithORTools } from './python-backend';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  // For browser usage, you'll need to proxy requests through your backend
  dangerouslyAllowBrowser: true
});

export interface OptimizationRequest {
  userPrompt: string;
  csvData: any[];
  constraints: any[];
  employees: any[];
  products: any[];
  materials: any[];
  resources: any[];
}

export interface OptimizationResponse {
  content: string;
  schedule?: any[];
  constraints?: any;
  pythonScript?: string;
  executionResult?: any;
}

export const optimizeSchedule = async (request: OptimizationRequest): Promise<OptimizationResponse> => {
  try {
    const systemPrompt = `You are an expert production scheduler and operations research specialist. You help optimize manufacturing and production schedules using constraint programming and operations research techniques.

Your task is to:
1. Analyze the user's requirements and data
2. Generate a Python script using OR-Tools for optimization
3. Create an optimized schedule based on constraints
4. Provide clear explanations of the optimization approach

Available data:
- Employees: ${JSON.stringify(request.employees.slice(0, 3))}... (${request.employees.length} total)
- Products: ${JSON.stringify(request.products.slice(0, 3))}... (${request.products.length} total)
- Materials: ${JSON.stringify(request.materials.slice(0, 3))}... (${request.materials.length} total)
- Resources: ${JSON.stringify(request.resources.slice(0, 3))}... (${request.resources.length} total)
- Current Constraints: ${JSON.stringify(request.constraints)}

Respond with:
1. Analysis of the optimization problem
2. Recommended constraints and objectives
3. A Python script using OR-Tools that can be executed
4. Expected schedule structure

Format your response with clear sections for each part.`;

    const userMessage = `${request.userPrompt}

Data to optimize:
${JSON.stringify(request.csvData)}

Please create an optimized production schedule considering:
- Employee availability and skills
- Resource capacity constraints
- Material requirements and availability
- Production priorities and deadlines
- Efficiency and cost optimization

Generate a Python script using OR-Tools that I can execute to get the optimized schedule.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const responseContent = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract Python script from response if present
    const pythonScriptMatch = responseContent.match(/```python\n([\s\S]*?)\n```/);
    const pythonScript = pythonScriptMatch ? pythonScriptMatch[1] : undefined;

    let executionResult = null;
    let schedule = null;

    // If Python script was generated, try to execute it
    if (pythonScript) {
      try {
        executionResult = await executePythonScript(pythonScript, {
          employees: request.employees,
          products: request.products,
          materials: request.materials,
          resources: request.resources,
          constraints: request.constraints
        });

        if (executionResult.success && executionResult.result) {
          schedule = executionResult.result;
        }
      } catch (error) {
        console.error('Failed to execute Python script:', error);
        // Continue without execution results
      }
    } else {
      // Fallback to direct OR-Tools optimization
      try {
        const optimizationResult = await optimizeScheduleWithORTools({
          employees: request.employees,
          products: request.products,
          resources: request.resources,
          constraints: request.constraints
        });

        if (optimizationResult.success) {
          schedule = optimizationResult.schedule;
          executionResult = optimizationResult;
        }
      } catch (error) {
        console.error('Failed to run OR-Tools optimization:', error);
      }
    }

    return {
      content: responseContent,
      pythonScript,
      constraints: extractConstraints(responseContent),
      schedule,
      executionResult
    };

  } catch (error: any) {
    console.error('Anthropic API Error:', error);
    throw new Error(`Failed to optimize schedule: ${error.message}`);
  }
};

const extractConstraints = (content: string): any => {
  // Simple constraint extraction logic
  const constraints: any = {};
  
  if (content.includes('employee availability')) {
    constraints.employee_availability = true;
  }
  if (content.includes('resource capacity')) {
    constraints.resource_capacity = true;
  }
  if (content.includes('priority')) {
    constraints.priority_ordering = true;
  }
  if (content.includes('deadline')) {
    constraints.deadline_constraints = true;
  }
  
  return constraints;
};

// Simple chat function for general questions
export const chatWithAI = async (message: string, context?: any): Promise<string> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in production scheduling, operations research, and manufacturing optimization. You help users understand scheduling concepts, define constraints, and optimize their production processes.

Be helpful, clear, and technical when appropriate. If asked about specific optimization techniques, provide detailed explanations.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${message}` : message
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not process your request.';

  } catch (error: any) {
    console.error('Anthropic Chat Error:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};