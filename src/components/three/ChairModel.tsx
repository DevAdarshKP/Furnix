"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useGLTF, Center, ContactShadows } from "@react-three/drei";
import { splitChairGeometryMaterials } from "@/lib/chairMaterialSplitter";

export interface ChairModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  modelUrl?: string;
  onLoaded?: (box: THREE.Box3, size: THREE.Vector3) => void;
  onUpholsteryMaterial?: (mat: THREE.MeshStandardMaterial) => void;
  onContactShadowGroup?: (group: THREE.Group) => void;
}

export const CHAIR_MODEL_PATH = "/models/arm_chair__furniture.glb";

/**
 * Reusable 3D Chair Model component.
 * Loads the photogrammetry GLTF/GLB model of the Shack15 Ferry Building Armchair.
 * Partitions geometry into upholstery and wooden legs material groups so that
 * colourways can be smoothly applied to upholstery while preserving natural wood legs.
 */
export function ChairModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  modelUrl = CHAIR_MODEL_PATH,
  onLoaded,
  onUpholsteryMaterial,
  onContactShadowGroup,
}: ChairModelProps) {
  const { scene } = useGLTF(modelUrl);

  const sceneRef = React.useRef<{
    clonedScene: THREE.Group;
    modelSize: THREE.Vector3;
    upholsteryMaterial: THREE.MeshStandardMaterial | null;
  } | null>(null);

  if (!sceneRef.current) {
    const cloned = scene.clone(true);
    let capturedUphMat: THREE.MeshStandardMaterial | null = null;

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = mesh.material as THREE.Material & {
            map?: THREE.Texture;
            needsUpdate?: boolean;
          };
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.generateMipmaps = true;
            mat.map.minFilter = THREE.LinearMipmapLinearFilter;
            mat.needsUpdate = true;
          }
        }

        // Partition geometry into upholstery and wooden legs material groups
        try {
          const { upholsteryMaterial } = splitChairGeometryMaterials(mesh);
          capturedUphMat = upholsteryMaterial;
          if (typeof window !== "undefined") {
            (window as any).__CHAIR_MESH = mesh;
            (window as any).__CHAIR_UPHOLSTERY_MAT = upholsteryMaterial;
          }
        } catch (e) {
          console.warn("[Furnix] Failed to split chair materials:", e);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);

    sceneRef.current = {
      clonedScene: cloned,
      modelSize: size,
      upholsteryMaterial: capturedUphMat,
    };
  }

  const { clonedScene, modelSize, upholsteryMaterial } = sceneRef.current;

  React.useEffect(() => {
    if (onLoaded) {
      const box = new THREE.Box3().setFromObject(clonedScene);
      onLoaded(box, modelSize);
    }
    if (onUpholsteryMaterial && upholsteryMaterial) {
      onUpholsteryMaterial(upholsteryMaterial);
    }
  }, [clonedScene, modelSize, upholsteryMaterial, onLoaded, onUpholsteryMaterial]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Furnix] Chair Model Loaded: Dimensions [X: ${modelSize.x.toFixed(2)}, Y: ${modelSize.y.toFixed(2)}, Z: ${modelSize.z.toFixed(2)}]`
      );
    }
  }, [modelSize]);

  const shadowGroupRef = React.useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (onContactShadowGroup && shadowGroupRef.current) {
      onContactShadowGroup(shadowGroupRef.current);
    }
  }, [onContactShadowGroup]);

  return (
    <group position={position} rotation={rotation} scale={scale} dispose={null}>
      <Center top={false}>
        <primitive object={clonedScene} />
      </Center>
      {/* Soft contact shadow tuned for warm architectural flooring, smoothly tapered beneath legs */}
      <group ref={shadowGroupRef}>
        <ContactShadows
          position={[0, -modelSize.y / 2 - 0.005, 0]}
          opacity={0.28}
          scale={2.4}
          blur={2.0}
          far={0.8}
          color="#25221E"
        />
      </group>
    </group>
  );
}

useGLTF.preload(CHAIR_MODEL_PATH);
