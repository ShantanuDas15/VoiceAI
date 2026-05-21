import { useEffect, useRef } from "react";

export function useWaveform(stream: MediaStream | null, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    
    // Polyfill for standard AudioContext
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const data = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      const c = canvas.getContext("2d");
      if (!c) return;

      c.clearRect(0, 0, canvas.width, canvas.height);
      c.strokeStyle = "#818cf8"; // indigo-400
      c.lineWidth = 3;
      c.lineCap = "round";
      c.beginPath();
      
      const sliceWidth = canvas.width / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = v * (canvas.height / 2);

        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }

        x += sliceWidth;
      }
      c.stroke();
    };
    
    draw();
    
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ctx.close();
    };
  }, [stream, canvasRef]);
}
