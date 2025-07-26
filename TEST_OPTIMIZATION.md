# 🧪 Testing Opimaze Optimization

## Step-by-Step Test Process

### 1. Reset Database
- Go to **Data Management** tab
- Click **🔄 "Reset & Insert Demo Data"** 
- Wait for "✅ Database Reset Complete!" message

### 2. Test Optimization
- Go to **AI Assistant** tab  
- Click **📊 "Weekly Optimization"** button
- Wait for AI response and optimization to complete

### 3. Check Results
- **Calendar Tab**: Should show detailed task chunks with descriptions
- **Analytics → Optimization Tab**: Should show optimization statistics
- **Console**: Check for any error messages (F12 → Console)

## Expected Results

### Calendar Events Should Show:
- 🔧 Setup and preparation (0.5h)
- 🏭 Main production phase (1.0h) 
- 🔍 Quality control inspection (0.25h)
- 📦 Packaging and labeling (0.25h)

### Analytics Should Show:
- Total Tasks: ~60+ assignments
- Employees Used: 4
- Products Scheduled: 4
- Days Covered: 7
- Solver Status: OPTIMAL

## Troubleshooting

### If "Failed to save optimized schedule" error:
1. Check browser console (F12) for detailed error
2. Verify both servers are running:
   - Frontend: http://localhost:8080
   - Python Backend: http://localhost:5000/health
3. Try "Reset & Insert Demo Data" again
4. Ensure Anthropic API key is valid in .env file

### If Calendar is empty:
1. Check Analytics → Optimization tab for results
2. Verify optimization completed successfully
3. Try refreshing the Calendar tab

### If Python backend errors:
1. Restart Python backend: `python app.py`
2. Check OR-Tools is installed: `pip list | grep ortools`
3. Verify no port conflicts on 5000

## Quick Debug Commands

```bash
# Test Python backend
curl http://localhost:5000/health

# Test optimization directly
curl -X POST http://localhost:5000/optimize-schedule \
  -H "Content-Type: application/json" \
  -d '{"employees":[{"employee_id":"EMP001","name":"John"}],"products":[{"product_code":"PROD001","name":"Widget","priority":1}],"resources":[],"constraints":[]}'
```