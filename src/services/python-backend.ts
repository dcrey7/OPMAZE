const PYTHON_BACKEND_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:5000';

export interface ExecutionResult {
  success: boolean;
  result?: any;
  output?: string;
  error?: string;
  traceback?: string;
}

export interface ScheduleOptimizationResult {
  success: boolean;
  schedule?: any[];
  solver_status?: string;
  error?: string;
}

export const executePythonScript = async (script: string, data: any = {}): Promise<ExecutionResult> => {
  try {
    console.log('Executing Python script via:', `${PYTHON_BACKEND_URL}/execute-optimization`);
    
    const response = await fetch(`${PYTHON_BACKEND_URL}/execute-optimization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script,
        data
      })
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Python execution result:', result);
    return result;
  } catch (error: any) {
    console.error('Python execution error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to Python backend'
    };
  }
};

export const optimizeScheduleWithORTools = async (data: {
  employees: any[];
  products: any[];
  resources: any[];
  constraints: any[];
}): Promise<ScheduleOptimizationResult> => {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/optimize-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to optimize schedule');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Schedule optimization error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to Python backend'
    };
  }
};

export const checkPythonBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy' && data.ortools_available;
    }
    
    return false;
  } catch (error) {
    console.error('Python backend health check failed:', error);
    return false;
  }
};