from datetime import date
import hashlib
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User, Profile, JobPosting

app = FastAPI(title="Zero Notice Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str
    company_email: Optional[EmailStr] = None

class AuthResponse(BaseModel):
    username: str
    role: str
    user_id: int
    token: str
    profile_complete: bool

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileRequest(BaseModel):
    full_name: str
    linkedin_url: Optional[str] = None
    last_company: Optional[str] = None
    company_email: Optional[EmailStr] = None
    last_working_day: Optional[date] = None
    expected_salary: Optional[str] = None
    location: Optional[str] = None
    status: str = "Immediate Joiner"
    is_active: bool = False
    company_name: Optional[str] = None

class ProfileResponse(BaseModel):
    full_name: Optional[str] = None
    linkedin_url: Optional[str] = None
    last_company: Optional[str] = None
    company_email: Optional[str] = None
    last_working_day: Optional[date] = None
    expected_salary: Optional[str] = None
    location: Optional[str] = None
    status: str
    is_active: bool
    company_name: Optional[str] = None

class JobPostingRequest(BaseModel):
    recruiter_id: int
    title: str
    description: str
    location: str
    salary_range: str
    is_active: bool = True

class JobPostingResponse(BaseModel):
    id: int
    recruiter_id: int
    title: str
    description: str
    location: str
    salary_range: str
    is_active: bool

class CandidateResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    location: Optional[str] = None
    expected_salary: Optional[str] = None
    status: str
    linkedin_url: Optional[str] = None

class CandidateSearchResponse(BaseModel):
    candidates: List[CandidateResponse]

class JobListResponse(BaseModel):
    jobs: List[JobPostingResponse]

    class Config:
        orm_mode = True


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def user_response(user: User, profile: Optional[Profile]) -> dict:
    return {
        "username": user.username,
        "role": user.role,
        "user_id": user.id,
        "token": f"token-{user.id}",
        "profile_complete": bool(profile and profile.full_name),
    }


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_profile_for_user(db: Session, user_id: int):
    return db.query(Profile).filter(Profile.user_id == user_id).first()


@app.post("/api/signup", response_model=AuthResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    if get_user_by_username(db, request.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hash_password(request.password),
        role=request.role.upper(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(user_id=user.id, company_email=request.company_email or None)
    db.add(profile)
    db.commit()

    return user_response(user, profile)


@app.post("/api/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(db, request.username)
    if not user or user.hashed_password != hash_password(request.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    profile = get_profile_for_user(db, user.id)
    return user_response(user, profile)


@app.get("/api/profile/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = get_profile_for_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return {
        "full_name": profile.full_name,
        "linkedin_url": profile.linkedin_url,
        "last_company": profile.last_company,
        "company_email": profile.company_email,
        "last_working_day": profile.last_working_day,
        "expected_salary": profile.expected_salary,
        "location": profile.location,
        "status": profile.status,
        "is_active": profile.is_active,
        "company_name": profile.company_name,
    }


@app.post("/api/profile/{user_id}")
def update_profile(user_id: int, request: ProfileRequest, db: Session = Depends(get_db)):
    profile = get_profile_for_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    profile.full_name = request.full_name
    profile.linkedin_url = request.linkedin_url
    profile.last_company = request.last_company
    profile.company_email = request.company_email
    profile.last_working_day = request.last_working_day
    profile.expected_salary = request.expected_salary
    profile.location = request.location
    profile.status = request.status
    profile.is_active = request.is_active
    profile.company_name = request.company_name
    db.commit()
    return {"message": "Profile updated"}


@app.post("/api/verify-email/{user_id}")
def verify_email(user_id: int, db: Session = Depends(get_db)):
    profile = get_profile_for_user(db, user_id)
    if not profile or not profile.company_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company email required for verification")

    allowed_domains = ["company.com", "enterprise.com", "business.com"]
    email_domain = profile.company_email.split('@')[-1].lower()
    if email_domain in allowed_domains:
        user = get_user_by_id(db, user_id)
        user.is_verified = True
        db.commit()
        return {"message": "Company email verified successfully."}

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to verify company email domain")


@app.post("/api/jobs", response_model=JobPostingResponse)
def post_job(request: JobPostingRequest, db: Session = Depends(get_db)):
    recruiter = get_user_by_id(db, request.recruiter_id)
    if not recruiter or recruiter.role != "RECRUITER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only recruiter accounts may post jobs")

    job = JobPosting(
        recruiter_id=request.recruiter_id,
        title=request.title,
        description=request.description,
        location=request.location,
        salary_range=request.salary_range,
        is_active=request.is_active,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@app.get("/api/jobs", response_model=List[JobPostingResponse])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobPosting).filter(JobPosting.is_active == True).all()
    return jobs


@app.get("/api/candidates", response_model=List[CandidateResponse])
def search_candidates(
    location: Optional[str] = None,
    salary_range: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Profile).filter(Profile.is_active == True)
    if location:
        query = query.filter(Profile.location.ilike(f"%{location}%"))
    if salary_range:
        query = query.filter(Profile.expected_salary.ilike(f"%{salary_range}%"))
    if status:
        query = query.filter(Profile.status == status)

    candidates = query.all()
    return [
        CandidateResponse(
            id=c.id,
            user_id=c.user_id,
            full_name=c.full_name,
            location=c.location,
            expected_salary=c.expected_salary,
            status=c.status,
            linkedin_url=c.linkedin_url,
        )
        for c in candidates
    ]


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}
