"""Data models for Building Scanner application."""

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class BuildingType(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL_OFFICE = "commercial-office"
    COMMERCIAL_HOTEL = "commercial-hotel"
    COMMERCIAL_MEDICAL = "commercial-medical"
    COMMERCIAL_RETAIL = "commercial-retail"
    COMMERCIAL_WAREHOUSE = "commercial-warehouse"
    MIXED = "mixed"
    MISC = "misc"


class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AddressInput(BaseModel):
    """Input model for a single address."""
    street_number: str
    street_name: str
    zip_code: str


class VisionAnalysisResult(BaseModel):
    """Result from OpenAI Vision analysis."""
    building_type: BuildingType
    wwr_estimate: int  # 0-100 percentage
    confidence: Confidence
    reasoning: str


class BuildingResult(BaseModel):
    """Complete result for a single building."""
    street_number: str
    street_name: str
    zip_code: str
    state: Optional[str] = None
    county: Optional[str] = None
    building_type: Optional[BuildingType] = None
    wwr_estimate: Optional[int] = None
    confidence: Optional[Confidence] = None
    reasoning: Optional[str] = None
    images_folder: Optional[str] = None
    error: Optional[str] = None


class JobStatus(BaseModel):
    """Status of a processing job."""
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    total_addresses: int
    processed_addresses: int
    current_address: Optional[str] = None
    results: Optional[List[BuildingResult]] = None
    error: Optional[str] = None


class UploadResponse(BaseModel):
    """Response when uploading a CSV file."""
    job_id: str
    message: str
    total_addresses: int
