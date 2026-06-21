"""
Pydantic schemas for API request/response validation.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")
    name: Optional[str] = Field(None, description="User display name")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class CreatePresentationRequest(BaseModel):
    title: Optional[str] = Field(None, description="Presentation title")
    type: Optional[str] = Field("free", description="Presentation type")
    audience: Optional[str] = Field("manager", description="Target audience")
    style: Optional[str] = Field("business", description="Visual style")
    language: Optional[str] = Field("ru", description="Presentation language")
    source_text: Optional[str] = Field(None, description="Raw text content")
    source_file_id: Optional[str] = Field(None, description="Uploaded file ID")
    slides_count: Optional[int] = Field(10, ge=1, le=50, description="Number of slides to generate")


class UpdatePresentationRequest(BaseModel):
    title: Optional[str] = Field(None, description="Presentation title")
    type: Optional[str] = Field(None, description="Presentation type")
    audience: Optional[str] = Field(None, description="Target audience")
    style: Optional[str] = Field(None, description="Visual style")
    language: Optional[str] = Field(None, description="Presentation language")
    presentation_json: Optional[dict] = Field(None, description="Full presentation JSON")
