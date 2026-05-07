from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # "CANDIDATE" or "RECRUITER"
    is_verified = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="user", uselist=False)
    jobs_posted = relationship("JobPosting", back_populates="recruiter")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String, index=True)
    linkedin_url = Column(String, nullable=True)
    status = Column(String, default="Immediate Joiner")
    is_active = Column(Boolean, default=False)

    # Specifics for candidates
    last_company = Column(String, nullable=True)
    company_email = Column(String, nullable=True)  # Used for verification
    last_working_day = Column(Date, nullable=True)
    expected_salary = Column(String, nullable=True)
    location = Column(String, nullable=True)
    company_name = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(String)
    location = Column(String)
    salary_range = Column(String)
    is_active = Column(Boolean, default=True)

    recruiter = relationship("User", back_populates="jobs_posted")
