"use client";

import React, { Suspense, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { ChairModel, CHAIR_MODEL_PATH } from "@/components/three/ChairModel";

interface EditorialChairCanvasProps {
  className?: string;
  modelUrl?: string;
}

const emptySubscribe = () => () => {};

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Isolated, high-performance static 3D Chair Canvas.
 * Renders the authentic photogrammetry GLB chair model inside the central editorial card.
 * Features subtle tactile drag rotation with gentle spring snap-back to the editorial three-quarter angle.
 * Zero ScrollTrigger bindings, zero scroll animation coupling, zero impact on the hero sequence.
 */
export function EditorialChairCanvas({
  className = "",
  modelUrl = CHAIR_MODEL_PATH,
}: EditorialChairCanvasProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const hasWebGL = useSyncExternalStore(emptySubscribe, isWebGLAvailable, () => false);

  if (!isClient) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-7 h-7 rounded-full border-2 border-[#191816]/20 border-t-[#191816] animate-spin" />
      </div>
    );
  }

  if (!hasWebGL) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-6 text-center ${className}`}>
        <p className="font-sans text-xs text-[#6B665E]">3D Hardware Acceleration Unavailable</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.13, 2.18], fov: 36 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.4} color="#FFFDF9" />
        <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFF8F0" castShadow />
        <directionalLight position={[-4, -1, -2]} intensity={0.5} color="#E8E1D5" />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#FFF9F0" />

        <Suspense fallback={null}>
          <PresentationControls
            global={false}
            cursor={true}
            snap={true}
            speed={1.6}
            zoom={1}
            rotation={[0.06, -0.24, 0]}
            polar={[-0.1, 0.15]}
            azimuth={[-0.5, 0.5]}
          >
            <ChairModel modelUrl={modelUrl} scale={1.06} />
          </PresentationControls>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default EditorialChairCanvas;
