# A Story of LLMs Evolution

A Data Science & Data Visualization Project about how Large Language Models evolve through years.

## 🚀 Tech Stack

- **Backend:** Node.js, Express, MongoDB/Mongoose
- **Frontend:** React, Vite, D3.js, React Router DOM
- **Architecture:** MERN Stack
- **Styling:** CSS Modules, Dark Theme
- **Font:** Kelvinch

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **MongoDB** database (local or cloud - MongoDB Atlas)
- **npm** or **yarn** package manager
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd a-story-of-LLMs-evolution
```

### 2. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the `server` directory:
   ```bash
   # Create .env file
   MONGODB_URI="your_mongodb_connection_string_here"
   PORT=5001
   ```
   
   **Example MongoDB connection strings:**
   - Local: `MONGODB_URI="mongodb://localhost:27017/llm-database"`
   - MongoDB Atlas: `MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"`

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The backend server will run on `http://localhost:5001`

### 3. Frontend Setup

1. Open a **new terminal** and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
a-story-of-LLMs-evolution/
├── server/                 # Backend API
│   ├── models/            # Mongoose models
│   │   ├── LlmModel.js
│   │   └── BenchmarkModel.js
│   ├── routes/            # API routes
│   │   └── api.js
│   ├── .env              # Environment variables (create this)
│   ├── package.json
│   └── server.js
│
└── client/                # Frontend React App
    ├── public/
    │   └── fonts/        # Font files (Kelvinch)
    ├── src/
    │   ├── components/
    │   │   ├── Header/
    │   │   └── VisualizationChart/
    │   ├── pages/
    │   │   └── HomePage/
    │   ├── hooks/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🗄️ Database Collections

The backend expects the following MongoDB collections:

### 1. "LLM overall info"
Contains LLM information with fields:
- `name` (String) - LLM name
- `releaseDate` (Date) - Release date
- `organization` (String) - Organization/company
- `parameters` (Number) - Number of parameters in billions
- `architecture` (String) - Model architecture
- `description` (String) - Description

### 2. "Benchmark MD"
Contains benchmark data with fields:
- `llmName` (String) - Name of the LLM
- `benchmarkName` (String) - Name of the benchmark
- `score` (Number) - Benchmark score
- `metric` (String) - Metric type
- `date` (Date) - Date of benchmark

**Note:** If your collection names or field names differ, update the schemas in:
- `server/models/LlmModel.js`
- `server/models/BenchmarkModel.js`

## 🔌 API Endpoints

### Backend API (http://localhost:5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api/llms` | Fetch all LLM documents |
| GET | `/api/llms/:id` | Fetch a single LLM by ID |
| GET | `/api/benchmarks` | Fetch all benchmark data |
| GET | `/api/benchmarks/:llmName` | Fetch benchmarks for a specific LLM |

## 🎨 Features

- **Dark Theme UI** with Kelvinch font
- **Interactive Header** with navigation links
- **Timeline Visualization** of LLM evolution (D3.js)
- **Benchmark Performance** comparisons
- **RESTful API** for data access
- **Real-time data fetching** from MongoDB
- **Responsive Design**

## 🛠️ Development

### Backend Development
- Uses `nodemon` for auto-restart on file changes
- Server runs on port 5001 (configurable in `.env`)
- MongoDB connection with Mongoose

### Frontend Development
- Uses Vite for fast development
- Hot Module Replacement (HMR) enabled
- API proxy configured in `vite.config.js` to forward `/api` requests to backend
- Runs on port 3000

### Running Both Servers

You need to run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- ✅ Verify your MongoDB connection string in `server/.env`
- ✅ Ensure MongoDB is running (if local)
- ✅ Check network/firewall settings (if using MongoDB Atlas)
- ✅ Verify credentials are correct

### CORS Errors
- ✅ Backend has CORS enabled in `server/server.js`
- ✅ Vite proxy handles API requests automatically
- ✅ Check that backend is running on port 5001

### Empty Data / No Data Displayed
- ✅ Verify MongoDB collections exist and contain data
- ✅ Check collection names match exactly: `"LLM overall info"` and `"Benchmark MD"`
- ✅ Use MongoDB Compass or mongo shell to verify data structure
- ✅ Check browser console for API errors

### Port Already in Use
- ✅ Change `PORT` in `server/.env` for backend
- ✅ Change `port` in `client/vite.config.js` for frontend

### Font Not Loading
- ✅ Ensure `kelvinch.regular.otf` is in `client/public/fonts/`
- ✅ Check browser console for font loading errors
- ✅ Verify font path in `client/src/index.css`

## 📝 Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI="your_mongodb_connection_string"
PORT=5001
```

**⚠️ Important:** Never commit `.env` files to Git! They are already in `.gitignore`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 👥 Team

[Add your team members here]

---

**Happy Coding! 🚀**
