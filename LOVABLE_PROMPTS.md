# 🎯 Lovable.dev Prompts for Opimaze ERP AI App

## 📊 Database Setup & Dummy Data Generation

### 1. Generate Sample Employees Data
```
Create sample employee data in the Supabase 'employees' table with the following records:

INSERT INTO employees (employee_id, name, department, shift, available_monday, available_tuesday, available_wednesday) VALUES
('EMP001', 'John Smith', 'Production', 'morning', true, true, true),
('EMP002', 'Sarah Johnson', 'Assembly', 'afternoon', true, false, true),
('EMP003', 'Mike Chen', 'Quality Control', 'morning', false, true, true),
('EMP004', 'Lisa Rodriguez', 'Packaging', 'evening', true, true, false),
('EMP005', 'David Kim', 'Production', 'afternoon', true, true, true),
('EMP006', 'Emily Davis', 'Assembly', 'morning', true, false, true),
('EMP007', 'James Wilson', 'Maintenance', 'morning', true, true, true),
('EMP008', 'Anna Martinez', 'Quality Control', 'afternoon', false, true, true);
```

### 2. Generate Sample Products Data
```
Create sample product data in the Supabase 'products' table:

INSERT INTO products (product_code, name, batch_time, batch_size, demand_units, priority, materials_needed) VALUES
('PROD001', 'Premium Widget A', 4, 50, 200, 1, 'Steel, Plastic, Electronics'),
('PROD002', 'Standard Widget B', 3, 75, 150, 2, 'Aluminum, Rubber, Paint'),
('PROD003', 'Deluxe Component C', 6, 25, 100, 1, 'Titanium, Glass, Circuits'),
('PROD004', 'Basic Assembly D', 2, 100, 300, 3, 'Steel, Screws, Labels'),
('PROD005', 'Custom Part E', 8, 15, 50, 1, 'Carbon Fiber, Advanced Chips'),
('PROD006', 'Standard Kit F', 5, 40, 120, 2, 'Plastic, Wires, Manual');
```

### 3. Generate Sample Materials Data
```
Create sample materials data in the Supabase 'materials' table:

INSERT INTO materials (material_id, name, quantity_kg, cost_per_kg, expiry_date) VALUES
('MAT001', 'Steel Sheets', 500.0, 3.50, '2025-12-31'),
('MAT002', 'High-grade Plastic', 200.0, 2.25, '2025-06-30'),
('MAT003', 'Electronic Components', 50.0, 15.00, '2025-09-15'),
('MAT004', 'Aluminum Bars', 300.0, 4.75, '2025-11-30'),
('MAT005', 'Rubber Gaskets', 75.0, 8.50, '2025-03-31'),
('MAT006', 'Industrial Paint', 100.0, 12.00, '2025-08-15'),
('MAT007', 'Titanium Alloy', 25.0, 45.00, '2025-10-31'),
('MAT008', 'Tempered Glass', 40.0, 18.50, '2025-07-31');
```

### 4. Generate Sample Resources Data
```
Create sample resources/equipment data in the Supabase 'resources' table:

INSERT INTO resources (resource_id, name, type, capacity, status, maintenance_schedule) VALUES
('RES001', 'CNC Machine Alpha', 'Manufacturing', 2, 'available', '{"next_maintenance": "2025-02-15"}'),
('RES002', 'Assembly Line Beta', 'Assembly', 4, 'available', '{"next_maintenance": "2025-03-01"}'),
('RES003', 'Quality Scanner Gamma', 'Quality Control', 1, 'available', '{"next_maintenance": "2025-02-28"}'),
('RES004', 'Packaging Station Delta', 'Packaging', 3, 'maintenance', '{"next_maintenance": "2025-01-30"}'),
('RES005', 'CNC Machine Epsilon', 'Manufacturing', 2, 'available', '{"next_maintenance": "2025-03-15"}'),
('RES006', 'Paint Booth Zeta', 'Finishing', 1, 'available', '{"next_maintenance": "2025-04-01"}');
```

### 5. Generate Sample Assignments Data
```
Create sample production assignments in the Supabase 'assignments' table:

INSERT INTO assignments (employee_id, product_code, start_time, end_time, status, notes) VALUES
('EMP001', 'PROD001', '2025-01-27 08:00:00+00', '2025-01-27 12:00:00+00', 'scheduled', 'Priority production run'),
('EMP002', 'PROD002', '2025-01-27 13:00:00+00', '2025-01-27 16:00:00+00', 'scheduled', 'Standard assembly'),
('EMP003', 'PROD001', '2025-01-27 12:00:00+00', '2025-01-27 13:00:00+00', 'completed', 'Quality check passed'),
('EMP004', 'PROD003', '2025-01-28 09:00:00+00', '2025-01-28 15:00:00+00', 'scheduled', 'Deluxe component assembly'),
('EMP005', 'PROD004', '2025-01-28 14:00:00+00', '2025-01-28 16:00:00+00', 'in_progress', 'Basic assembly line'),
('EMP006', 'PROD002', '2025-01-29 08:00:00+00', '2025-01-29 11:00:00+00', 'scheduled', 'Morning shift production');
```

### 6. Generate Sample Constraints Data
```
Create sample scheduling constraints in the Supabase 'constraints' table:

INSERT INTO constraints (constraint_type, description, parameters, priority, active) VALUES
('employee_availability', 'Employees can only work during their assigned shifts', '{"enforce_shift_times": true}', 1, true),
('resource_capacity', 'Each resource has a maximum concurrent job limit', '{"respect_capacity": true}', 1, true),
('priority_ordering', 'High priority products should be scheduled first', '{"priority_weight": 0.8}', 2, true),
('material_availability', 'Check material stock before scheduling', '{"check_inventory": true}', 2, true),
('skill_matching', 'Match employee skills with product requirements', '{"require_certification": false}', 3, true);
```

## 🎨 UI Enhancement Prompts

### 7. Enhance Calendar View
```
Improve the calendar view component to:
1. Add color coding for different product types
2. Show employee names on assignments
3. Add drag-and-drop functionality for rescheduling
4. Include resource utilization indicators
5. Add filtering by employee, product, or status
```

### 8. Enhance Analytics Dashboard
```
Add more analytics charts to show:
1. Employee efficiency metrics
2. Resource utilization over time
3. Production bottleneck analysis
4. Cost optimization insights
5. Delay prediction indicators
```

### 9. Add Export Features
```
Enhance export functionality to:
1. Export schedule to Google Calendar format
2. Generate PDF reports with charts
3. Create CSV files with detailed metrics
4. Add email notifications for schedule changes
```

### 10. Improve AI Chat Interface
```
Enhance the AI chat to:
1. Add suggested prompts/quick actions
2. Show typing indicators
3. Add voice input capability
4. Include chat history persistence
5. Add optimization progress indicators
```

## 🚀 Demo Data for Hackathon

### Sample Optimization Prompts to Test:
1. "Create an optimized production schedule for next week considering employee availability and product priorities"
2. "Minimize production time while ensuring all high-priority products are completed first"
3. "Balance workload across all employees and maximize resource utilization"
4. "Schedule production to meet all deadlines while minimizing overtime costs"

### Expected Results:
- Optimized schedule showing 20-30 assignments across the week
- Calendar view with color-coded assignments
- Analytics showing 85%+ resource utilization
- No scheduling conflicts or constraint violations

## 📊 Performance Metrics to Display:
- Total assignments: 25+
- On-time completion rate: 90%+
- Resource utilization: 85%+
- Employee workload balance: ±10%
- Cost optimization: 15% reduction

This data will demonstrate the full capabilities of the Opimaze ERP AI optimization system for your hackathon presentation!