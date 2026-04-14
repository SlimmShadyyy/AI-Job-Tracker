# 🚀 AI-Integrated Job Tracker (MERN Stack)

A sophisticated full-stack application built to streamline the job search process using Google Gemini AI. Features include a dynamic Kanban board, AI-powered job description parsing, resume bullet point generation, and real-time streaming cover letters.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, TanStack Query, Lucide React
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose)
- **AI:** Google Generative AI (Gemini 2.5 Flash)
- **Deployment:** Vercel (Frontend) & Render (Backend)

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=[https://ai-job-tracker-rouge.vercel.app](https://ai-job-tracker-rouge.vercel.app)
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=[https://ai-job-tracker-backend-gqep.onrender.com](https://ai-job-tracker-backend-gqep.onrender.com)
```

## How to Run Locally
### 1. Clone the repository
```
git clone <yhttps://github.com/SlimmShadyyy/AI-Job-Tracker.git>
cd ai-job-tracker
```

### 2. Setup Backend
```
cd backend
npm install
npm run dev
```

### 3. Setup Frontend
```
cd ../frontend
npm install
npm run dev
```


## 🧠 Key Development Decisions
### 1. Structured AI Outputs (Schema Enforcement)
    To prevent the application from crashing due to inconsistent AI formatting, I implemented Google Gemini Structured Outputs. By defining a strict SchemaType, the backend forces the AI to return mathematically valid JSON. This eliminates the need for messy regex cleaning and prevents SyntaxError during JSON.parse.

### 2. Real-time Streaming Architecture
    Instead of making the user wait for a complete cover letter, I utilized the Gemini Content Stream API.

    Frontend: Used the native fetch API and ReadableStreamDefaultReader to update the UI chunk-by-chunk.

    Backend: Configured specific headers (Transfer-Encoding: chunked, Cache-Control: no-cache) to prevent Render's proxy from buffering the response, ensuring a "live-typing" effect.

### 3. Optimistic UI Updates
    Using TanStack Query (React Query), I implemented optimistic updates for the Kanban board. When a user drags a job card, the UI updates instantly before the server confirms the change. If the server fails, the UI rolls back automatically, providing a snappy, low-latency user experience.

### 4. Automatic Persistence (Auto-Save)
    To minimize user friction, I integrated an auto-save hook at the end of the cover letter stream. Once the reader.read() returns done: true, the frontend immediately triggers a PATCH request to MongoDB. This ensures generated content is secured without requiring manual save actions.

### 5. Deployment & CORS Configuration
    To handle the transition from localhost to production:
    
    Implemented a dynamic API_URL fallback logic in both Axios and Fetch instances.

Configured a flexible CORS whitelist on the backend that prioritizes the FRONTEND_URL environment variable to ensure secure communication between Vercel and Render.
