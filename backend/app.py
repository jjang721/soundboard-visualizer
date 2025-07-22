from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import librosa
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # <-- your frontend port!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-audio/")
async def analyze_audio(file: UploadFile = File(...)):
    # Load audio using librosa
    y, sr = librosa.load(file.file, sr=22050)

    # Extract tempo and chroma
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1).tolist()

    # Return only serializable values (no file objects!)
    return {
        "tempo": float(tempo),
        "chroma": chroma
    }
