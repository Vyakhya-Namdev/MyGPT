// SoundWave.jsx
import React, { useEffect, useRef } from "react";
import "./SoundWave.css";

function SoundWave({ isRecording }) {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const dataArrayRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    if (!isRecording) {
      // Cleanup audio context and stream when not recording
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const startVisualization = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        dataArrayRef.current = dataArray;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
          animationRef.current = requestAnimationFrame(draw);

          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = canvas.width / dataArray.length;
          for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i];
            ctx.fillStyle = "#31c173"; // green color
            ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
          }
        };

        draw();
      } catch (error) {
        console.error("Error accessing microphone for visualization", error);
      }
    };

    startVisualization();

    // Cleanup on component unmount or isRecording change
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={32}
      style={{ width: "100%", height: "32px", backgroundColor: "transparent" }}
    />
  );
}

export default SoundWave;
