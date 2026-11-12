# PromisePay

AI-powered agreement, delivery-verification and payment platform built for PayPal AI Hackathon 2026.

## Prerequisites
- Node.js 18+
- Python 3.10+

## Quick Start

### Backend
1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

