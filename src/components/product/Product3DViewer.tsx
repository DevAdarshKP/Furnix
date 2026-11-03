"use client";

import React, { Suspense, useState, useRef } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, ContactShadows, useGLTF } from "@react-three/drei";
import { Rotate3D, Eye } from "lucide-react";
import { ProductDetail } from "@/lib/products";

function ModelScene({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const cloned = React.useMemo(() => scene.clone(true), [scene]);

  return (
    <group position={[0, -0.05, 0]}>
      <Center top={false}>
        <primitive object={cloned} scale={1.12} />
      </Center>
      <ContactShadows
        position={[0, -0.48, 0]}
        opacity={0.35}
        scale={2.6}
        blur={2.4}
        far={1.2}
        color="#231F1A"
      />
    </group>
  );
}

interface Product3DViewerProps {
  product: ProductDetail;
}

export function Product3DViewer({ product }: Product3DViewerProps) {
  const [viewMode, setViewMode] = useState<"3d" | "photo">(product.is3D ? "3d" : "photo");
  const [isRotating, setIsRotating] = useState(false);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Main Display Stage with Warm Studio Lighting and Soft Shadow */}
      <div className="relative w-full aspect-[4/4.5] max-w-[540px] rounded-3xl bg-[#F4EFEA]/80 border border-[#E8E2D8]/70 shadow-[inset_0_2px_12px_rgba(0,0,0,0.015)] flex items-center justify-center overflow-hidden">
        
        {viewMode === "3d" && product.is3D && product.modelUrl ? (
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas
              camera={{ position: [1.6, 0.7, 2.2], fov: 38 }}
              className="w-full h-full"
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={1.15} />
              <directionalLight position={[4, 5, 3]} intensity={1.5} castShadow />
              <directionalLight position={[-4, 3, -2]} intensity={0.65} color="#F5EFE6" />
              <directionalLight position={[0, -3, 2]} intensity={0.35} color="#DDD4C7" />
              
              <Suspense
                fallback={
                  <mesh>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#DDD5C7" wireframe />
                  </mesh>
                }
              >
                <ModelScene modelUrl={product.modelUrl} />
              </Suspense>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.95}
                autoRotate={isRotating}
                autoRotateSpeed={1.5}
                dampingFactor={0.06}
              />
            </Canvas>

            {/* Hint overlay */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-sans font-medium text-[#141210]/70 border border-black/5 pointer-events-none">
              <Rotate3D className="w-3.5 h-3.5 text-[#141210]" />
              <span>Drag to rotate 360°</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full p-8 sm:p-12 flex items-center justify-center">
            {/* Soft Studio Floor Radial Drop-Shadow */}
            <div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[radial-gradient(ellipse_at_center,_rgba(35,31,26,0.18)_0%,_transparent_72%)] filter blur-md pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative w-full h-full flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 340px, (max-width: 1024px) 460px, 540px"
                className="object-contain pointer-events-none select-none drop-shadow-sm"
                priority
              />
            </div>
          </div>
        )}

        {/* View Toggle Badges (Only shown when 3D is available) */}
        {product.is3D && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-white/85 backdrop-blur-md p-1 rounded-full border border-black/5 shadow-xs z-10">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "3d"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "text-[#141210]/60 hover:text-[#141210]"
              }`}
            >
              <Rotate3D className="w-3.5 h-3.5" />
              <span>3D Orbit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("photo")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "photo"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "text-[#141210]/60 hover:text-[#141210]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Studio View</span>
            </button>
          </div>
        )}
      </div>

      {/* Subtle bottom caption */}
      <div className="mt-3 text-center">
        <span className="font-sans text-[11px] text-[#8C8477] uppercase tracking-wider font-medium">
          {product.subtitle}
        </span>
      </div>
    </div>
  );
}

useGLTF.preload("/models/arm_chair__furniture.glb");
