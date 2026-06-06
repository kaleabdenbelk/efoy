'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  facingMode: 'user' | 'environment';
  onCapture: (data: { uri: string; base64: string }) => void;
  onSimulate: () => void;
  statusText?: string;
  overlayType?: 'face' | 'food';
}

export function CameraCapture({
  facingMode,
  onCapture,
  onSimulate,
  statusText,
  overlayType = 'face',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      setIsLoading(true);
      setError(null);
      try {
        const constraints = {
          video: {
            facingMode: facingMode === 'user' ? 'user' : 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error('Camera access failed:', err);
        setError('Camera access denied or unavailable. Please use Simulation Mode.');
        setIsLoading(false);
      }
    }

    startCamera();

    // Cleanup: turn off webcam LED light on unmount
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to high-performance JPEG Base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const base64Data = dataUrl.split(',')[1]; // Strip metadata prefix

        onCapture({
          uri: dataUrl,
          base64: base64Data,
        });
      }
    } catch (err) {
      console.error('Error drawing frame to canvas:', err);
      onSimulate();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto font-sans">
      {/* Video Viewfinder */}
      <div className="relative w-full h-80 rounded-3xl overflow-hidden glass-panel flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 z-10">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs text-muted font-mono">Syncing optical feed...</span>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3 bg-slate-950/95 z-10">
            <span className="text-stress text-sm font-semibold font-mono">{error}</span>
            <button
              onClick={onSimulate}
              className="mt-2 px-4 py-2 glass-panel hover:bg-white/5 text-slate-200 rounded-xl text-xs font-bold font-mono transition"
            >
              Force Simulation Mode
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}

        {/* Ambient Overlay for Aesthetic Scan Effect */}
        <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

        {/* Framing Guides */}
        {overlayType === 'face' ? (
          <div className="absolute h-64 w-48 border border-primary/40 rounded-full bg-primary/5 flex items-center justify-center pointer-events-none">
            <div className="h-60 w-44 border border-dashed border-primary/60 rounded-full" />
          </div>
        ) : (
          <div className="absolute h-56 w-56 border-2 border-dashed border-primary/40 rounded-full bg-primary/5 flex items-center justify-center pointer-events-none">
            <span className="text-primary/50 text-[10px] font-semibold uppercase tracking-widest font-mono">
              Align Plate
            </span>
          </div>
        )}

        {/* Status indicator banner */}
        {statusText && (
          <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-2xl p-3 flex items-center gap-3 z-10">
            <RefreshCw className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
            <span className="text-slate-200 text-xs font-mono leading-normal text-left">
              {statusText}
            </span>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="w-full flex flex-col gap-3">
        {!error && !isLoading && (
          <button
            onClick={handleCapture}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/80 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-primary/10"
          >
            <Camera className="h-5 w-5" strokeWidth={2.5} />
            {overlayType === 'face' ? 'Scan Facial Stress' : 'Analyze Plate'}
          </button>
        )}

        <button
          onClick={onSimulate}
          className="w-full h-12 bg-transparent hover:bg-white/5 border border-transparent hover:border-border rounded-xl flex items-center justify-center transition text-muted hover:text-slate-200 text-sm font-semibold font-mono"
        >
          Skip / Simulate Scan (Ideal for Stage)
        </button>
      </div>
    </div>
  );
}
