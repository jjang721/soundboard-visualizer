from fastapi import FastAPI, UploadFile, File
import librosa
import numpy as np

app = FastAPI()

@app.post("/analyze-audio/")
async def analyze_audio(file: UploadFile = File(...)):
    y, sr = librosa.load(file.file, sr=22050)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr).mean(axis=1).tolist()
    return {
        "tempo": tempo,
        "chroma": chroma
    }
