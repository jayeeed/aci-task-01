# Project Chimera - Agent Module

## Mission Brief
Project Chimera is a critical deep-space communication interface designed to assist a lone astronaut on the CHIMERA-01 probe. The system provides a secure, reliable, and intelligent chat interface powered by **Google Gemini AI**, capable of analyzing both text and visual data to provide multispectral diagnosis and guidance.

## Architecture & Tech Stack

### Backend (Mission Control Core)
- **Framework:** FastAPI (Python)
- **Database:** SQLite (SQLAlchemy ORM)
- **AI Core:** Google Gemini API (Multimodal capabilities)
- **Authentication:** JWT (OAuth2 scheme)

### Frontend (Astronaut Interface)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS (Deep Space Dark Mode)
- **HTTP Client:** Axios

---

## Deployment Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

Configure Environment Variables:
Create a `.env` file in `backend/` with the following:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_security_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DB_URL=sqlite:///./data.db
```

Launch the Mission Control Server:
```bash
uvicorn main:app --reload
```
Server runs at `http://localhost:8000`.

### 2. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Interface:
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

---

## Operational Manual

1.  **Authentication**:
    *   **Sign Up**: Create a new Personnel ID (account).
    *   **Login**: Authenticate using your secure credentials to access the uplink.
2.  **Multimodal Communication**:
    *   Type text commands or queries into the terminal input.
    *   Upload visual data (images) via the specialized upload button for AI analysis.
    *   The system maintains a full history of the communication log ("Memory Recall").
3.  **Status**:
    *   Green "SYSTEM_ONLINE" indicator confirms active connection.
    *   "Code Red" status is default for current mission parameters.
