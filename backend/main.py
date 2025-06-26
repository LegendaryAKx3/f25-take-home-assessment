from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests
import uuid
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    # This should probably go in an env file if I remember to do that later
    key = os.getenv("API_KEY")
    url = "http://api.weatherstack.com/current"
    date = request.date
    location = request.location
    
    try:
        # The API only allows current weather data for free tier, so forced to ignore the date
        response = requests.post(url, params={
            "access_key": key,
            "query": location,},
            timeout=5)
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

    weather_data = {
        "date": date,
        "location": location,
        "notes": request.notes,
        "weather_info": response.json()
    }

    # Generate a unique id and store weather data
    id = str(uuid.uuid4())
    weather_storage[id] = weather_data
    return WeatherResponse(id=id)

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)