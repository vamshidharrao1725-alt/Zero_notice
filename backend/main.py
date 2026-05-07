from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="React FastAPI App")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    token: str

@app.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    # Dummy authentication logic
    if credentials.username == "admin" and credentials.password == "password":
        return {"message": "Login successful", "token": "fake-jwt-token-12345"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password",
    )

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running!"}
