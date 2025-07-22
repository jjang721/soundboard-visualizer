import { useState, useEffect } from "react";
import p5 from "p5";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);


 const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  setFile(selectedFile);
  setResult(null);
  setError(null);
  setAudioSrc(URL.createObjectURL(selectedFile)); // 🔊 make audio playable
};

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/analyze-audio/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (!result) return;

  const sketch = (p) => {
    let angle = 0;
    let beatTimer = 0;
    let beatInterval = 60 / result.tempo; // seconds per beat
    let lastTime = 0;

    p.setup = () => {
      p.createCanvas(500, 500);
      p.angleMode(p.DEGREES);
      lastTime = p.millis();
    };

    p.draw = () => {
      const now = p.millis();
      const deltaTime = (now - lastTime) / 1000; // in seconds
      lastTime = now;
      beatTimer += deltaTime;

      // Pulse on beat
      const pulse = beatTimer >= beatInterval ? 1 : 0;
      if (pulse) beatTimer = 0;

      p.background(10);
      p.translate(p.width / 2, p.height / 2);
      p.noStroke();

      const chroma = result.chroma;
      const maxRadius = 160;
      const baseSize = 25;

      for (let i = 0; i < 12; i++) {
        const a = (360 / 12) * i + angle;
        const energy = chroma[i] || 0;

        const r = maxRadius + energy * 60 * (pulse ? 1.3 : 1); // pulse boost
        const x = r * p.cos(a);
        const y = r * p.sin(a);

        p.fill(255 * energy, 100 + 100 * energy, 255 - 200 * energy);
        p.ellipse(x, y, baseSize + energy * 50, baseSize + energy * 50);
      }

      angle += 0.1; // slow rotation
    };
  };

  const canvas = new p5(sketch, document.getElementById("visualizer"));
  return () => canvas.remove();
}, [result]);


  return (
  <div style={{ padding: "2rem", fontFamily: "Arial" }}>
    <h1>🎧 Soundboard Visualizer</h1>

    <input type="file" accept="audio/*" onChange={handleFileChange} />
    <button
      onClick={handleUpload}
      disabled={loading || !file}
      style={{ marginLeft: "1rem" }}
    >
      {loading ? "Analyzing..." : "Upload"}
    </button>

    {/* 🔊 Add this block right here! */}
    {audioSrc && (
      <div style={{ marginTop: "1rem" }}>
        <audio controls autoPlay src={audioSrc} />
      </div>
    )}

    {error && <p style={{ color: "red" }}>❌ {error}</p>}

    {result && (
      <div style={{ marginTop: "2rem" }}>
        <h3>📊 Analysis Result</h3>
        <p><strong>Tempo:</strong> {result.tempo.toFixed(2)} BPM</p>
        <p><strong>Chroma Features:</strong></p>
        <ul>
          {result.chroma.map((val, i) => (
            <li key={i}>Pitch {i}: {val.toFixed(3)}</li>
          ))}
        </ul>
      </div>
    )}

    <div id="visualizer" style={{ marginTop: "3rem" }}></div>
  </div>
);
}