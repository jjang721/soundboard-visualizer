import { useEffect } from "react";
import p5 from "p5";

export default function App() {
  useEffect(() => {
    const sketch = (p) => {
      let t = 0;
      p.setup = () => {
        p.createCanvas(800, 600);
        p.background(0);
      };

      p.draw = () => {
        p.background(0, 30);  // fading trail
        for (let i = 0; i < 10; i++) {
          let x = p.width * p.noise(t + i);
          let y = p.height * p.noise(t + i + 5);
          let r = 50 * p.noise(t + i + 10);
          p.fill(100 + 155 * p.noise(t), 255, 200);
          p.ellipse(x, y, r, r);
        }
        t += 0.01;
      };
    };

    new p5(sketch, document.getElementById("p5-container"));
  }, []);

  return <div id="p5-container"></div>;
}