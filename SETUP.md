# 🚀 Opimaze - Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- Git

## 🏗️ Architecture Overview
```
Frontend (React + TypeScript) ↔ Anthropic Claude API ↔ Python Backend (OR-Tools) ↔ Supabase Database
```

## 📦 Installation Steps

### 1. Clone and Setup Frontend
```bash
# Navigate to project directory
cd cronos-ai-dash

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file:
```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_PYTHON_BACKEND_URL=http://localhost:5000
```

### 3. Setup Python Backend
```bash
# Create Python environment
cd python-backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Start Services

**Terminal 1 - Python Backend:**
```bash
cd python-backend
python app.py
# Server will run on http://localhost:5000
```

**Terminal 2 - React Frontend:**
```bash
cd cronos-ai-dash
npm run dev
# App will run on http://localhost:8080
```

## 🔑 API Keys Setup

### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account and get API key
3. Add to `.env` file

### Supabase (Already Configured)
- Database is pre-configured
- Tables: employees, products, materials, resources, assignments, constraints, schedules

## 🧪 Testing the Application

### 1. Upload Sample Data
- Go to "Data Management" tab
- Upload CSV files for employees, products, materials, resources

### 2. Chat with AI
- Go to "AI Assistant" tab
- Try: "Optimize my production schedule for next week"
- Try: "Add employee availability constraints"

### 3. View Schedule
- Go to "Production Schedule" tab
- See calendar view of optimized assignments

### 4. Analytics
- Go to "Analytics" tab
- View performance metrics and charts

## 🔧 Key Features Working

✅ **Data Upload**: CSV/Excel file processing  
✅ **AI Chat**: Real Anthropic Claude API integration  
✅ **Optimization**: Python OR-Tools backend  
✅ **Calendar**: Interactive schedule visualization  
✅ **Analytics**: Production performance dashboards  
✅ **Export**: Excel export functionality  

## 🚀 Deployment Options

### Option 1: Lovable.dev
1. Push changes to repository
2. Deploy through Lovable interface
3. Configure environment variables in Lovable settings

### Option 2: Local Development
Follow the setup steps above for local testing

## 📊 Sample Data Structure

### Employees CSV
```csv
employee_id,name,department,shift,available_monday,available_tuesday,available_wednesday
EMP001,John Doe,Production,morning,true,true,true
EMP002,Jane Smith,Assembly,afternoon,true,false,true
```

### Products CSV
```csv
product_code,name,batch_time,batch_size,demand_units,priority,materials_needed
PROD001,Widget A,4,50,100,1,Material A; Material B
PROD002,Widget B,6,30,75,2,Material C
```

## 🐛 Troubleshooting

### Python Backend Issues
```bash
# Check if OR-Tools is installed
pip list | grep ortools

# Reinstall if needed
pip install --upgrade ortools
```

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Key Issues
- Verify API key in `.env` file
- Check Anthropic account credits
- Ensure correct environment variable names

## 🎯 Hackathon Demo Flow

1. **Upload Data** → Upload employee and product CSV files
2. **AI Optimization** → Ask: "Create an optimized production schedule considering employee availability and product priorities"
3. **View Results** → Check calendar for generated schedule
4. **Export** → Download optimized schedule as Excel
5. **Analytics** → Show performance metrics and utilization charts