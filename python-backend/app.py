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
    """Optimize a production schedule with detailed task breakdown"""
    try:
        data = request.get_json()
        employees = data.get('employees', [])
        products = data.get('products', [])
        resources = data.get('resources', [])
        constraints = data.get('constraints', [])
        
        if not ORTOOLS_AVAILABLE:
            return jsonify({'error': 'OR-Tools not available'}), 500
        
        # Enhanced scheduling optimization using CP-SAT
        model = cp_model.CpModel()
        
        # Variables for detailed task breakdown
        task_assignments = {}
        
        # Create detailed task phases for each product
        task_phases = {
            'setup': {'duration': 0.5, 'description': 'Setup and preparation'},
            'production': {'duration': 1.0, 'description': 'Main production phase'},
            'quality_check': {'duration': 0.25, 'description': 'Quality control inspection'},
            'packaging': {'duration': 0.25, 'description': 'Packaging and labeling'}
        }
        
        # Create assignment variables for each task phase
        for emp in employees:
            for prod in products:
                batch_time = prod.get('batch_time', 2)
                for day in range(7):  # Week schedule
                    for hour in range(8, 17):  # 8 AM to 5 PM
                        for phase_name, phase_info in task_phases.items():
                            var_name = f'assign_{emp["employee_id"]}_{prod["product_code"]}_{day}_{hour}_{phase_name}'
                            task_assignments[(emp["employee_id"], prod["product_code"], day, hour, phase_name)] = model.NewBoolVar(var_name)
        
        # Constraints
        # Each employee can only work on one task at a time
        for emp in employees:
            for day in range(7):
                for hour in range(8, 17):
                    # Get all valid variables for this time slot
                    slot_vars = []
                    for prod in products:
                        for phase in task_phases.keys():
                            var = task_assignments.get((emp["employee_id"], prod["product_code"], day, hour, phase))
                            if var is not None:
                                slot_vars.append(var)
                    
                    if slot_vars:
                        model.Add(sum(slot_vars) <= 1)
        
        # Priority-based objective: Higher priority products scheduled first
        objective_terms = []
        for emp in employees:
            for prod in products:
                priority_weight = 10 - prod.get('priority', 5)  # Higher priority = higher weight
                for day in range(7):
                    for hour in range(8, 17):
                        for phase in task_phases.keys():
                            var = task_assignments.get((emp["employee_id"], prod["product_code"], day, hour, phase))
                            if var is not None:
                                objective_terms.append(priority_weight * var)
        
        if objective_terms:
            model.Maximize(sum(objective_terms))
        
        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 30  # 30 second timeout
        status = solver.Solve(model)
        
        schedule = []
        task_breakdown = {}
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            for (emp_id, prod_code, day, hour, phase), var in task_assignments.items():
                if solver.Value(var) == 1:
                    # Find the product and employee details
                    product = next((p for p in products if p['product_code'] == prod_code), None)
                    employee = next((e for e in employees if e['employee_id'] == emp_id), None)
                    
                    phase_info = task_phases[phase]
                    duration_hours = phase_info['duration']
                    
                    start_date = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
                    start_date += timedelta(days=day)
                    end_date = start_date + timedelta(hours=duration_hours)
                    
                    # Ensure timezone-aware datetime for Supabase
                    from datetime import timezone
                    start_date = start_date.replace(tzinfo=timezone.utc)
                    end_date = end_date.replace(tzinfo=timezone.utc)
                    
                    # Create detailed task description
                    task_description = f"""
🔧 {phase_info['description']}
📦 Product: {product.get('name', prod_code) if product else prod_code}
👤 Assigned to: {employee.get('name', emp_id) if employee else emp_id}
🏢 Department: {employee.get('department', 'Unknown') if employee else 'Unknown'}
⚡ Priority: {product.get('priority', 'N/A') if product else 'N/A'}
⏱️ Duration: {duration_hours}h
📋 Phase: {phase.replace('_', ' ').title()}
                    """.strip()
                    
                    schedule.append({
                        'employee_id': emp_id,
                        'product_code': prod_code,
                        'start_time': start_date.isoformat(),
                        'end_time': end_date.isoformat(),
                        'status': 'scheduled',
                        'notes': task_description,
                        'task_phase': phase,
                        'task_description': phase_info['description'],
                        'duration_hours': duration_hours
                    })
                    
                    # Track task breakdown for analytics
                    date_key = start_date.strftime('%Y-%m-%d')
                    if date_key not in task_breakdown:
                        task_breakdown[date_key] = []
                    
                    task_breakdown[date_key].append({
                        'employee': employee.get('name', emp_id) if employee else emp_id,
                        'product': product.get('name', prod_code) if product else prod_code,
                        'phase': phase,
                        'start_time': start_date.strftime('%H:%M'),
                        'duration': duration_hours,
                        'priority': product.get('priority', 'N/A') if product else 'N/A'
                    })
        
        return jsonify({
            'success': True,
            'schedule': schedule,
            'task_breakdown': task_breakdown,
            'optimization_stats': {
                'total_assignments': len(schedule),
                'solver_status': solver.StatusName(status),
                'solve_time_seconds': solver.WallTime(),
                'employees_utilized': len(set(s['employee_id'] for s in schedule)),
                'products_scheduled': len(set(s['product_code'] for s in schedule)),
                'days_covered': len(set(datetime.fromisoformat(s['start_time']).date() for s in schedule))
            },
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