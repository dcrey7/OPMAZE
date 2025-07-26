from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import io
import traceback
from datetime import datetime, timedelta
import pandas as pd

# OR-Tools imports
try:
    from ortools.sat.python import cp_model
    from ortools.linear_solver import pywraplp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False
    print("OR-Tools not installed. Install with: pip install ortools")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'ortools_available': ORTOOLS_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/execute-optimization', methods=['POST'])
def execute_optimization():
    """Execute a Python optimization script using OR-Tools"""
    try:
        data = request.get_json()
        python_script = data.get('script', '')
        input_data = data.get('data', {})
        
        if not python_script:
            return jsonify({'error': 'No Python script provided'}), 400
        
        if not ORTOOLS_AVAILABLE:
            return jsonify({'error': 'OR-Tools not available on this server'}), 500
        
        # Create a safe execution environment
        safe_globals = {
            '__builtins__': {
                'print': print,
                'len': len,
                'range': range,
                'enumerate': enumerate,
                'zip': zip,
                'min': min,
                'max': max,
                'sum': sum,
                'abs': abs,
                'round': round,
                'int': int,
                'float': float,
                'str': str,
                'bool': bool,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'set': set,
            },
            'datetime': datetime,
            'timedelta': timedelta,
            'pd': pd,
            'json': json,
            'cp_model': cp_model,
            'pywraplp': pywraplp,
            'input_data': input_data,
            'result': None
        }
        
        # Capture stdout
        old_stdout = sys.stdout
        sys.stdout = captured_output = io.StringIO()
        
        try:
            # Execute the script
            exec(python_script, safe_globals)
            output = captured_output.getvalue()
            
            # Get the result
            result = safe_globals.get('result', None)
            
            return jsonify({
                'success': True,
                'result': result,
                'output': output,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            error_output = captured_output.getvalue()
            return jsonify({
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc(),
                'output': error_output
            }), 500
            
        finally:
            sys.stdout = old_stdout
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

@app.route('/optimize-schedule', methods=['POST'])
def optimize_schedule():
    """Optimize a production schedule using a predefined OR-Tools algorithm"""
    try:
        data = request.get_json()
        employees = data.get('employees', [])
        products = data.get('products', [])
        resources = data.get('resources', [])
        constraints = data.get('constraints', [])
        
        if not ORTOOLS_AVAILABLE:
            return jsonify({'error': 'OR-Tools not available'}), 500
        
        # Simple scheduling optimization using CP-SAT
        model = cp_model.CpModel()
        
        # Variables
        assignments = {}
        
        # Create assignment variables
        for emp in employees:
            for prod in products:
                for day in range(7):  # Week schedule
                    for hour in range(8, 18):  # 8 AM to 6 PM
                        var_name = f'assign_{emp["employee_id"]}_{prod["product_code"]}_{day}_{hour}'
                        assignments[(emp["employee_id"], prod["product_code"], day, hour)] = model.NewBoolVar(var_name)
        
        # Constraints
        # Each employee can only work on one product at a time
        for emp in employees:
            for day in range(7):
                for hour in range(8, 18):
                    model.Add(
                        sum(assignments.get((emp["employee_id"], prod["product_code"], day, hour), 0) 
                            for prod in products) <= 1
                    )
        
        # Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        schedule = []
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            for (emp_id, prod_code, day, hour), var in assignments.items():
                if solver.Value(var) == 1:
                    start_date = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
                    start_date += timedelta(days=day)
                    end_date = start_date + timedelta(hours=2)  # 2-hour slots
                    
                    schedule.append({
                        'employee_id': emp_id,
                        'product_code': prod_code,
                        'start_time': start_date.isoformat(),
                        'end_time': end_date.isoformat(),
                        'status': 'scheduled'
                    })
        
        return jsonify({
            'success': True,
            'schedule': schedule,
            'solver_status': solver.StatusName(status),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)