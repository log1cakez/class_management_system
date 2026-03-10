"use client";

import { useBackground } from "@/contexts/BackgroundContext";

export default function BackgroundLayer() {
  const { backgroundUrl, isVideo } = useBackground();

  return (
    <div className="absolute inset-0 z-0">
      {isVideo ? (
        <video
          src={backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}
    </div>
  );
}
