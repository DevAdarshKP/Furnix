"use client";

import React, { Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ChairModel } from "./ChairModel";
import {
  screenToWorldCoordinate,
  calculateFitScale,
} from "@/lib/animation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getShowcaseProgress } from "@/lib/showcaseStore";
import { getChairColor } from "@/lib/customisationStore";

interface ChairSceneProps {
  className?: string;
  modelUrl?: string;
}

interface TargetMetrics {
  // Container A: Editorial ("Crafted for living")
  originDocX: number;
  originDocY: number;
  originWidth: number;
  originHeight: number;
  originScale: number;

  // Container B: Product Detail ("The Bolle Lounge Chair")
  destDocX: number;
  destDocY: number;
  destWidth: number;
  destHeight: number;
  destScale: number;

  // Container C: Atelier Statement Section ("Atelier creates timeless...")
  atelierDocX: number;
  atelierDocY: number;
  atelierWidth: number;
  atelierHeight: number;
  atelierScale: number;

  // Container E: Customisation Section ("Comfort, in your colour.")
  customDocX: number;
  customDocY: number;
  customWidth: number;
  customHeight: number;
  customScale: number;

  // Scroll journey triggers
  travelStart: number;              // Journey A -> B starts
  travelEnd: number;                // Journey A -> B reaches Container B
  travelBtoAtelierStart: number;    // Journey B -> Atelier starts
  travelBtoAtelierEnd: number;      // Journey B -> Atelier settles in Atelier container
  travelAtelierExit: number;        // Atelier begins exit (chair hides during Collection section)
  travelCustomStart: number;        // Customisation approach starts (chair smoothly emerges towards Container E)
  travelCustomEnd: number;          // Chair settles in Container E (Customisation)

  isMeasured: boolean;
}

/**
 * Single Persistent 3D Chair Controller.
 * Preserves the single continuous 3D chair model across key hero and detail destinations:
 * 1. "Crafted for living" Resting: Centered in Container A (#editorial-chair-target).
 * 2. Travel Journey 1 (A -> B): Visibly arcs across the page from Container A into Container B (#product-chair-target).
 * 3. Product Detail Showcase: Rests in Container B, executing the 6-state detailing sequence and returning to complete overview.
 * 4. Travel Journey 2 (B -> C): Smooth diagonal trajectory into the dark statement section squircle (#atelier-chair-target).
 * 5. Collection Section: Cleanly hidden from the viewport to allow all catalog products to display smoothly without overlay collisions.
 * 6. Customisation Section: Seamlessly rises into Container E (#customisation-chair-target) with interactive color customisation.
 */
function ContinuousChairController({ modelUrl }: { modelUrl?: string }) {
  const chairGroupRef = useRef<THREE.Group>(null);
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const { camera, size, gl, scene } = useThree();
  if (typeof window !== "undefined") {
    (window as any).__THREE_SCENE = scene;
  }
  const modelHeightRef = useRef(0.94);
  const upholsteryMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const currentUphColorRef = useRef<THREE.Color>(new THREE.Color("#FFB800"));

  const handleLoaded = React.useCallback((_box: THREE.Box3, sizeVec: THREE.Vector3) => {
    if (sizeVec.y > 0) {
      modelHeightRef.current = sizeVec.y;
    }
  }, []);

  const handleUpholsteryMaterial = React.useCallback(
    (mat: THREE.MeshStandardMaterial) => {
      upholsteryMaterialRef.current = mat;
    },
    []
  );

  const contactShadowGroupRef = useRef<THREE.Group | null>(null);
  const handleContactShadowGroup = React.useCallback(
    (group: THREE.Group) => {
      contactShadowGroupRef.current = group;
    },
    []
  );

  // Cinematic inertia damping refs for slow, silky-smooth 3D travel paths
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const currentScaleRef = useRef<number>(0.5);
  const currentRotRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const isPosInitializedRef = useRef<boolean>(false);

  // Perlin smootherstep for velvety, zero-jerk acceleration and deceleration
  const smootherstep = (min: number, max: number, value: number) => {
    const x = Math.max(0, Math.min(1, (value - min) / Math.max(1, max - min)));
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const metricsRef = useRef<TargetMetrics>({
    originDocX: 0,
    originDocY: 0,
    originWidth: 0,
    originHeight: 0,
    originScale: 0.5,

    destDocX: 0,
    destDocY: 0,
    destWidth: 0,
    destHeight: 0,
    destScale: 0.5,

    atelierDocX: 0,
    atelierDocY: 0,
    atelierWidth: 170,
    atelierHeight: 180,
    atelierScale: 0.25,

    customDocX: 0,
    customDocY: 0,
    customWidth: 540,
    customHeight: 540,
    customScale: 0.65,

    travelStart: 1800,
    travelEnd: 2700,
    travelBtoAtelierStart: 3800,
    travelBtoAtelierEnd: 4400,
    travelAtelierExit: 5000,
    travelCustomStart: 5800,
    travelCustomEnd: 6400,

    isMeasured: false,
  });

  // Helper to retrieve the active visible element (handles desktop vs mobile DOM presence)
  const getVisibleElement = React.useCallback((primaryId: string, fallbackId: string): HTMLElement | null => {
    if (typeof window === "undefined") return null;
    const isMobile = window.innerWidth < 1024;
    const primaryEl = document.getElementById(primaryId);
    const fallbackEl = document.getElementById(fallbackId);
    if (isMobile) {
      if (fallbackEl && fallbackEl.offsetParent !== null) return fallbackEl;
      if (primaryEl && primaryEl.offsetParent !== null) return primaryEl;
      return fallbackEl || primaryEl;
    } else {
      if (primaryEl && primaryEl.offsetParent !== null) return primaryEl;
      if (fallbackEl && fallbackEl.offsetParent !== null) return fallbackEl;
      return primaryEl || fallbackEl;
    }
  }, []);

  // Measure DOM bounds in document coordinates
  const measureTargets = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const originElem = getVisibleElement("editorial-chair-target", "editorial-chair-target-mobile");
    const destElem = getVisibleElement("product-chair-target", "product-chair-target-mobile");
    const atelierElem = getVisibleElement("atelier-chair-target", "atelier-chair-target-mobile");
    const customElem = getVisibleElement("customisation-chair-target", "customisation-chair-target");

    if (!originElem || !destElem) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const vh = window.innerHeight;

    const modelHeight = modelHeightRef.current || 0.94;

    const originRect = originElem.getBoundingClientRect();
    const destRect = destElem.getBoundingClientRect();

    const originDocX = originRect.left + scrollX;
    const originDocY = originRect.top + scrollY;
    const originWidth = originRect.width;
    const originHeight = originRect.height;

    const destDocX = destRect.left + scrollX;
    const destDocY = destRect.top + scrollY;
    const destWidth = destRect.width;
    const destHeight = destRect.height;

    // Measure Container C (Atelier Statement Section Center Container)
    let atelierDocX = 0;
    let atelierDocY = 0;
    let atelierWidth = 170;
    let atelierHeight = 180;

    if (atelierElem) {
      const atelierRect = atelierElem.getBoundingClientRect();
      atelierDocX = atelierRect.left + scrollX;
      atelierDocY = atelierRect.top + scrollY;
      atelierWidth = atelierRect.width || 170;
      atelierHeight = atelierRect.height || 180;
    } else {
      atelierDocY = destDocY + 800;
    }

    // Measure Container E (Customisation Section)
    let customDocX = 0;
    let customDocY = 0;
    let customWidth = 540;
    let customHeight = 540;

    if (customElem) {
      const customRect = customElem.getBoundingClientRect();
      customDocX = customRect.left + scrollX;
      customDocY = customRect.top + scrollY;
      customWidth = customRect.width || 540;
      customHeight = customRect.height || 540;
    } else {
      customDocY = atelierDocY + 1600;
    }

    // Proportional, balanced scaling leaving comfortable, visually balanced margins:
    // Container A (Editorial): 0.58 padding ensures complete chair, legs and arms fit comfortably without clipping
    // Container B (Product Detail): 0.59 padding ensures all 4 legs, arms, and backrest fit naturally
    // Container C (Atelier Section): 0.62 padding ensures snug, jewel-like fit inside the central rounded card
    // Container E (Customisation Section): 0.54 padding ensures prominent, sculptural presence with clear leg clearance
    const originScale = calculateFitScale(
      originHeight,
      modelHeight,
      0,
      camera as { position: { z: number }; fov: number },
      size.height,
      0.58
    );

    const destScale = calculateFitScale(
      destHeight,
      modelHeight,
      0,
      camera as { position: { z: number }; fov: number },
      size.height,
      0.59
    );

    const atelierScale = calculateFitScale(
      atelierHeight,
      modelHeight,
      0,
      camera as { position: { z: number }; fov: number },
      size.height,
      0.50
    );

    const customScale = calculateFitScale(
      customHeight,
      modelHeight,
      0,
      camera as { position: { z: number }; fov: number },
      size.height,
      0.54
    );

    const originCenterDocY = originDocY + originHeight / 2;
    const destCenterDocY = destDocY + destHeight / 2;

    const trackElem = document.getElementById("product-detail-track");
    const trackDocY = trackElem ? trackElem.getBoundingClientRect().top + scrollY : destDocY;
    const trackHeight = trackElem ? trackElem.offsetHeight : vh * 3.5;
    const trackScrollDist = Math.max(0, trackHeight - vh);

    // 1. Journey A -> B (Editorial -> Product Detail): 750px slow, visible glide
    const travelStart = originCenterDocY - vh * 0.25;
    const travelEnd = travelStart + 750;

    // 2. Journey B -> Atelier (Detailing unpins -> Atelier Statement Squircle): 750px slow, visible glide
    const travelBtoAtelierStart = trackDocY + trackScrollDist;
    const travelBtoAtelierEnd = travelBtoAtelierStart + 750;

    // 3. Atelier squircle settles and stays as long as Atelier is in view
    const atelierSectionEl = typeof document !== "undefined" ? document.getElementById("atelier-statement") : null;
    const atelierSectionDocY = atelierSectionEl ? atelierSectionEl.getBoundingClientRect().top + scrollY : atelierDocY;
    const atelierSectionHeight = atelierSectionEl ? atelierSectionEl.offsetHeight : 750;
    const travelAtelierExit = atelierSectionDocY + atelierSectionHeight - vh * 0.35;

    // 4. Customisation Entrance: Glide up into spotlight as user reaches Customisation section
    const customSectionEl = typeof document !== "undefined" ? document.getElementById("customisation") : null;
    const customSectionDocY = customSectionEl ? customSectionEl.getBoundingClientRect().top + scrollY : customDocY - 100;
    const travelCustomStart = customSectionDocY - vh * 0.55;
    const travelCustomEnd = customSectionDocY - vh * 0.05;

    // Ensure initial placement snaps cleanly without lag
    isPosInitializedRef.current = false;

    metricsRef.current = {
      originDocX,
      originDocY,
      originWidth,
      originHeight,
      originScale,
      destDocX,
      destDocY,
      destWidth,
      destHeight,
      destScale,
      atelierDocX,
      atelierDocY,
      atelierWidth,
      atelierHeight,
      atelierScale,
      customDocX,
      customDocY,
      customWidth,
      customHeight,
      customScale,
      travelStart,
      travelEnd,
      travelBtoAtelierStart,
      travelBtoAtelierEnd,
      travelAtelierExit,
      travelCustomStart,
      travelCustomEnd,
      isMeasured: true,
    };
  }, [camera, size.height, getVisibleElement]);

  useEffect(() => {
    measureTargets();

    const handleResize = () => {
      measureTargets();
    };

    const handleScroll = () => {
      if (!metricsRef.current.isMeasured) {
        measureTargets();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        measureTargets();
      });
    }

    // Tactile mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseOffsetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [measureTargets]);

  // Frame-by-frame continuous projection & visible trajectory across all 4 containers
  useFrame((_state, delta) => {
    if (typeof window !== "undefined") {
      (window as any).__FRAME_COUNT = ((window as any).__FRAME_COUNT || 0) + 1;
    }
    if (!chairGroupRef.current) return;

    const originElem = getVisibleElement("editorial-chair-target", "editorial-chair-target-mobile");
    const destElem = getVisibleElement("product-chair-target", "product-chair-target-mobile");
    const atelierElem = getVisibleElement("atelier-chair-target", "atelier-chair-target-mobile");
    const customElem = getVisibleElement("customisation-chair-target", "customisation-chair-target");

    if (!originElem || !destElem) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const scrollY = window.scrollY;

    const originRect = originElem.getBoundingClientRect();
    const destRect = destElem.getBoundingClientRect();
    const atelierRect = atelierElem ? atelierElem.getBoundingClientRect() : null;
    const customRect = customElem ? customElem.getBoundingClientRect() : null;

    const m = metricsRef.current;
    if (!m.isMeasured || m.originDocY === 0) {
      measureTargets();
    }

    // 1. Origin Visibility Check:
    // If none of the relevant containers have entered the viewport, hide the 3D chair.
    if (
      originRect.top >= vh &&
      destRect.top >= vh &&
      (!atelierRect || atelierRect.top >= vh) &&
      (!customRect || customRect.top >= vh)
    ) {
      chairGroupRef.current.visible = false;
      gl.domElement.style.clipPath = "none";
      return;
    }

    // 2. Post-Customisation Check: Hide chair if customisation section has scrolled far above viewport
    if (customRect && customRect.bottom < -200) {
      chairGroupRef.current.visible = false;
      gl.domElement.style.clipPath = "none";
      return;
    }

    chairGroupRef.current.visible = true;

    // Product Detail Scroll-Driven Material Showcase progress (0.0 -> 1.0)
    const showcaseP = reducedMotion ? 0 : getShowcaseProgress();

    let targetScreenX: number;
    let targetScreenY: number;
    let targetScale: number;
    let targetRotX: number;
    let targetRotY: number;
    let targetRotZ = 0;
    let targetZ = 0;
    let focusOffsetX = 0;
    let focusOffsetY = 0;
    let focusOffsetZ = 0;

    // Screen positions with optical adjustments
    const originScreenX = originRect.left + originRect.width / 2;
    const originScreenY = originRect.top + originRect.height * 0.44;

    const destScreenX = destRect.left + destRect.width * 0.50;
    const destScreenY = destRect.top + destRect.height * 0.44;

    const atelierScreenX = atelierRect ? atelierRect.left + atelierRect.width * 0.50 : vw * 0.50;
    const atelierScreenY = atelierRect ? atelierRect.top + atelierRect.height * 0.52 : vh * 0.50;

    const customScreenX = customRect ? customRect.left + customRect.width * 0.50 : vw * 0.50;
    const customScreenY = customRect ? customRect.top + customRect.height * 0.48 : vh * 0.50;

    // =========================================================================
    // STAGE 1: Resting in "Crafted for living" Container A
    // =========================================================================
    if (scrollY <= m.travelStart) {
      targetScreenX = originScreenX;
      targetScreenY = originScreenY;
      targetScale = m.originScale;
      targetRotX = 0.05;
      targetRotY = -0.22;
      targetRotZ = 0;
      targetZ = 0;

      // Clip to Container A rounded rect
      const top = Math.max(0, Math.round(originRect.top));
      const right = Math.max(0, Math.round(vw - originRect.right));
      const bottom = Math.max(0, Math.round(vh - originRect.bottom));
      const left = Math.max(0, Math.round(originRect.left));
      const radius = vw >= 1280 ? "3.2rem" : "2.8rem";
      gl.domElement.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`;
    }
    // =========================================================================
    // STAGE 2: Visible 3D Travel Journey from Container A to Container B
    // Slower, detailing and visible cinematic flight path
    // =========================================================================
    else if (scrollY < m.travelEnd) {
      const p = Math.min(1, Math.max(0, (scrollY - m.travelStart) / Math.max(1, m.travelEnd - m.travelStart)));
      const t = smootherstep(m.travelStart, m.travelEnd, scrollY);

      const linearX = THREE.MathUtils.lerp(originScreenX, destScreenX, t);
      const linearY = THREE.MathUtils.lerp(originScreenY, destScreenY, t);

      // Graceful 3D arc lifting forward into the room
      const arc = Math.sin(p * Math.PI);
      const arcY = -arc * (vh * 0.06);
      const arcX = vw < 768 ? 0 : -arc * (vw * 0.025);

      targetScreenX = linearX + arcX;
      targetScreenY = linearY + arcY;
      targetZ = reducedMotion ? 0 : arc * 0.48;

      targetScale = THREE.MathUtils.lerp(m.originScale, m.destScale, t);
      targetRotX = THREE.MathUtils.lerp(0.05, 0.08, t) + (reducedMotion ? 0 : arc * 0.04);
      // Expressive 3D yaw rotation revealing the sculptured curvature of the backrest mid-flight
      targetRotY = THREE.MathUtils.lerp(-0.22, -0.38, t) - (reducedMotion ? 0 : arc * 0.22);
      targetRotZ = reducedMotion ? 0 : arc * 0.04;

      // Unclipped continuous travel
      gl.domElement.style.clipPath = "none";
    }
    // =========================================================================
    // STAGE 3: Settled in Container B & Product Detail 6-State Component Showcase
    // =========================================================================
    else if (scrollY <= m.travelBtoAtelierStart) {
      const containerCenterX = destRect.left + destRect.width * 0.50;
      const containerCenterY = destRect.top + destRect.height * 0.50;
      const s0_targetY = destRect.top + destRect.height * 0.44;

      targetScreenX = containerCenterX;
      targetScreenY = s0_targetY;
      targetScale = m.destScale;
      targetRotX = 0.08;
      targetRotY = -0.38;
      targetRotZ = 0;
      targetZ = 0;

      let focusX = 0;
      let focusY = 0;
      let focusZ = 0;

      if (showcaseP > 0) {
        const isNarrow = vw < 768;

        const s0_zoom = 1.0;
        const s0_focus = [0.0, 0.0, 0.0];
        const s0_rot = [0.08, -0.38, 0.0];
        const s0_y = s0_targetY;

        const s1_zoom = isNarrow ? 1.20 : 1.26;
        const s1_focus = [0.0, 0.20, 0.04];
        const s1_rot = [0.05, -0.26, 0.0];
        const s1_y = containerCenterY;

        const s2_zoom = isNarrow ? 1.22 : 1.28;
        const s2_focus = [0.0, -0.02, 0.14];
        const s2_rot = [0.16, -0.24, 0.0];
        const s2_y = containerCenterY;

        const s3_zoom = isNarrow ? 1.20 : 1.26;
        const s3_focus = [0.12, 0.06, 0.10];
        const s3_rot = [0.06, -0.32, 0.0];
        const s3_y = containerCenterY;

        const s4_zoom = isNarrow ? 1.20 : 1.25;
        const s4_focus = [-0.04, -0.16, 0.10];
        const s4_rot = [0.04, -0.28, 0.0];
        const s4_y = containerCenterY;

        const s5_zoom = isNarrow ? 1.20 : 1.26;
        const s5_focus = [0.0, -0.14, 0.08];
        const s5_rot = [-0.08, -0.28, 0.0];
        const s5_y = containerCenterY;

        const lerpState = (
          zA: number, zB: number,
          fA: number[], fB: number[],
          rA: number[], rB: number[],
          yA: number, yB: number,
          tVal: number
        ) => {
          const t = Math.max(0, Math.min(1, tVal));
          const ease = t * t * (3 - 2 * t);
          return {
            zoom: THREE.MathUtils.lerp(zA, zB, ease),
            fx: THREE.MathUtils.lerp(fA[0], fB[0], ease),
            fy: THREE.MathUtils.lerp(fA[1], fB[1], ease),
            fz: THREE.MathUtils.lerp(fA[2], fB[2], ease),
            rx: THREE.MathUtils.lerp(rA[0], rB[0], ease),
            ry: THREE.MathUtils.lerp(rA[1], rB[1], ease),
            rz: THREE.MathUtils.lerp(rA[2], rB[2], ease),
            targetY: THREE.MathUtils.lerp(yA, yB, ease),
          };
        };

        const keyframes = [
          { zoom: s0_zoom, focus: s0_focus, rot: s0_rot, y: s0_y },
          { zoom: s1_zoom, focus: s1_focus, rot: s1_rot, y: s1_y },
          { zoom: s2_zoom, focus: s2_focus, rot: s2_rot, y: s2_y },
          { zoom: s3_zoom, focus: s3_focus, rot: s3_rot, y: s3_y },
          { zoom: s4_zoom, focus: s4_focus, rot: s4_rot, y: s4_y },
          { zoom: s5_zoom, focus: s5_focus, rot: s5_rot, y: s5_y },
          { zoom: s0_zoom, focus: s0_focus, rot: s0_rot, y: s0_y },
        ];

        const clampedP = Math.max(0, Math.min(1, showcaseP));
        const segFloat = clampedP * 6;
        const segment = Math.min(5, Math.floor(segFloat));
        const localT = segFloat - segment;
        const kA = keyframes[segment];
        const kB = keyframes[segment + 1];

        const activeProps = lerpState(
          kA.zoom, kB.zoom,
          kA.focus, kB.focus,
          kA.rot, kB.rot,
          kA.y, kB.y,
          localT
        );

        targetScreenX = containerCenterX;
        targetScreenY = activeProps.targetY;
        targetScale = m.destScale * activeProps.zoom;
        focusX = activeProps.fx;
        focusY = activeProps.fy;
        focusZ = activeProps.fz;
        targetRotX = activeProps.rx;
        targetRotY = activeProps.ry;
        targetRotZ = activeProps.rz;
      }

      // Clip to Container B rounded rect
      const top = Math.max(0, Math.round(destRect.top));
      const right = Math.max(0, Math.round(vw - destRect.right));
      const bottom = Math.max(0, Math.round(vh - destRect.bottom));
      const left = Math.max(0, Math.round(destRect.left));
      const radius = vw >= 1280 ? "3.6rem" : vw >= 1024 ? "3rem" : "2.4rem";
      gl.domElement.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`;

      // Calculate optical focus offset to position focus point at container center
      const euler = new THREE.Euler(targetRotX, targetRotY, targetRotZ, "XYZ");
      const focusVec = new THREE.Vector3(focusX, focusY, focusZ);
      const focusOffset = focusVec.applyEuler(euler).multiplyScalar(targetScale);
      focusOffsetX = focusOffset.x;
      focusOffsetY = focusOffset.y;
      focusOffsetZ = focusOffset.z;
    }
    // =========================================================================
    // STAGE 4: Travel B -> Atelier (Detailing Section to Atelier Center Container)
    // Slower, majestic 3D diagonal flight into the dark statement section
    // =========================================================================
    else if (scrollY < m.travelBtoAtelierEnd) {
      const p = Math.min(1, Math.max(0, (scrollY - m.travelBtoAtelierStart) / Math.max(1, m.travelBtoAtelierEnd - m.travelBtoAtelierStart)));
      const t = smootherstep(m.travelBtoAtelierStart, m.travelBtoAtelierEnd, scrollY);

      // Smooth diagonal trajectory from Container B (top right) to Atelier center squircle
      const linearX = THREE.MathUtils.lerp(destScreenX, atelierScreenX, t);
      const linearY = THREE.MathUtils.lerp(destScreenY, atelierScreenY, t);

      // 3D forward arc floating towards the viewer into the dark space
      const arc = Math.sin(p * Math.PI);
      const arcY = -arc * (vh * 0.06);
      const arcX = -arc * (vw * 0.03);

      targetScreenX = linearX + arcX;
      targetScreenY = linearY + arcY;
      targetZ = reducedMotion ? 0 : arc * 0.48;

      // Gradual scale down toward atelier container size
      targetScale = THREE.MathUtils.lerp(m.destScale, m.atelierScale, t);

      // Balanced orientation handoff into beauty frontal/slight 3/4 angle
      targetRotX = THREE.MathUtils.lerp(0.08, 0.05, t) + (reducedMotion ? 0 : arc * 0.035);
      // Gentle 3D rotation revealing the upholstery and wooden framing in flight
      targetRotY = THREE.MathUtils.lerp(-0.38, -0.22, t) + (reducedMotion ? 0 : arc * 0.24);
      targetRotZ = reducedMotion ? 0 : -arc * 0.04;

      // Unclipped during travel so chair is completely visible moving between sections
      gl.domElement.style.clipPath = "none";
    }
    // =========================================================================
    // STAGE 5: Settled in Container C (Atelier Section Small Center Container)
    // =========================================================================
    else if (scrollY < m.travelAtelierExit) {
      targetScreenX = atelierScreenX;
      targetScreenY = atelierScreenY;
      targetScale = m.atelierScale;
      targetRotX = 0.05;
      targetRotY = -0.22;
      targetRotZ = 0;
      targetZ = 0;

      // Clip to Container C rounded container boundary when settled
      if (atelierRect) {
        if (atelierRect.right <= 0 || atelierRect.left >= vw || atelierRect.bottom <= 0) {
          chairGroupRef.current.visible = false;
          gl.domElement.style.clipPath = "none";
        } else {
          chairGroupRef.current.visible = true;
          const top = Math.max(0, Math.round(atelierRect.top));
          const right = Math.max(0, Math.round(vw - atelierRect.right));
          const bottom = Math.max(0, Math.round(vh - atelierRect.bottom));
          const left = Math.max(0, Math.round(atelierRect.left));
          const radius = vw >= 1024 ? "1.75rem" : "1rem";
          gl.domElement.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`;
        }
      } else {
        gl.domElement.style.clipPath = "none";
      }
    }
    // =========================================================================
    // STAGE 6: Collection Section (Hide 3D chair from viewport for pristine catalog UX)
    // =========================================================================
    else if (scrollY < m.travelCustomStart) {
      // Hide the persistent 3D chair completely from the viewport during the Collections section
      // to give the collection gallery a clean, responsive, 100% bug-free experience (especially when new products are added)
      chairGroupRef.current.visible = false;
      gl.domElement.style.clipPath = "none";
      return;
    }
    // =========================================================================
    // STAGE 7: Entering Container E (Customisation Section Spotlight Entrance)
    // =========================================================================
    else if (scrollY < m.travelCustomEnd) {
      chairGroupRef.current.visible = true;
      const pCD = Math.min(1, Math.max(0, (scrollY - m.travelCustomStart) / Math.max(1, m.travelCustomEnd - m.travelCustomStart)));
      const tCD = smootherstep(m.travelCustomStart, m.travelCustomEnd, scrollY);

      const startY = customScreenY + vh * 0.14;
      const linearX = customScreenX;
      const linearY = THREE.MathUtils.lerp(startY, customScreenY, tCD);

      const arc = Math.sin(pCD * Math.PI);
      const arcY = -arc * (vh * 0.04);

      targetScreenX = linearX;
      targetScreenY = linearY + arcY;
      targetZ = reducedMotion ? 0 : arc * 0.25;

      targetScale = THREE.MathUtils.lerp(m.customScale * 0.85, m.customScale, tCD);
      targetRotX = THREE.MathUtils.lerp(0.04, 0.06, tCD);
      targetRotY = THREE.MathUtils.lerp(-0.24, -0.32, tCD);
      targetRotZ = 0;

      gl.domElement.style.clipPath = "none";
    }
    // =========================================================================
    // STAGE 8: Settled in Container E (Customisation Section)
    // =========================================================================
    else {
      chairGroupRef.current.visible = true;
      targetScreenX = customScreenX;
      targetScreenY = customScreenY;
      targetScale = m.customScale;
      targetRotX = 0.06;
      targetRotY = -0.32;
      targetRotZ = 0;
      targetZ = 0;

      gl.domElement.style.clipPath = "none";
    }

    // Default positioning for all un-focused stages
    const worldPos = screenToWorldCoordinate(
      targetScreenX,
      targetScreenY,
      targetZ,
      camera as { position: { z: number }; fov: number },
      size.width,
      size.height
    );

    const finalTargetPos = new THREE.Vector3(
      worldPos.x - focusOffsetX,
      worldPos.y - focusOffsetY,
      worldPos.z - focusOffsetZ
    );

    const parallaxX = mouseOffsetRef.current.x * 0.02;
    const parallaxY = -mouseOffsetRef.current.y * 0.015;

    // Luxurious frame-by-frame exponential inertia damping:
    // Prevents discrete mouse wheel notch jumping and guarantees smooth, cinematic momentum.
    const dampSpeed = 7.0;
    const dampFactor = reducedMotion ? 1 : Math.min(1, 1 - Math.exp(-delta * dampSpeed));

    if (!isPosInitializedRef.current || !chairGroupRef.current.visible) {
      currentPosRef.current.copy(finalTargetPos);
      currentScaleRef.current = targetScale;
      currentRotRef.current = {
        x: targetRotX + parallaxY,
        y: targetRotY + parallaxX,
        z: targetRotZ,
      };
      isPosInitializedRef.current = true;
    } else {
      currentPosRef.current.lerp(finalTargetPos, dampFactor);
      currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, targetScale, dampFactor);
      currentRotRef.current.x = THREE.MathUtils.lerp(currentRotRef.current.x, targetRotX + parallaxY, dampFactor);
      currentRotRef.current.y = THREE.MathUtils.lerp(currentRotRef.current.y, targetRotY + parallaxX, dampFactor);
      currentRotRef.current.z = THREE.MathUtils.lerp(currentRotRef.current.z, targetRotZ, dampFactor);
    }

    chairGroupRef.current.position.copy(currentPosRef.current);
    chairGroupRef.current.scale.setScalar(currentScaleRef.current);
    chairGroupRef.current.rotation.set(
      currentRotRef.current.x,
      currentRotRef.current.y,
      currentRotRef.current.z
    );

    // Remove unwanted flat shadow from customisation section only,
    // while strictly preserving shadows in Hero, Detailing, and Atelier sections.
    if (contactShadowGroupRef.current) {
      contactShadowGroupRef.current.visible = scrollY < m.travelCustomStart;
    }

    // 3D Chair Colour Customisation:
    // When chair rests in customisation section, interpolate upholstery to user-selected colourway
    // (Yellow, Light Green, Grey) in ~300ms.
    // When scrolled back up into Atelier / Detail / Editorial, smoothly restore original white tint (#FFFFFF).
    const activeColor = getChairColor();
    const destinationTint = new THREE.Color(activeColor.tintHex);
    const originalColor = new THREE.Color("#FFB800");

    const customMix =
      scrollY >= m.travelCustomStart
        ? scrollY >= m.travelCustomEnd
          ? 1.0
          : (scrollY - m.travelCustomStart) / Math.max(1, m.travelCustomEnd - m.travelCustomStart)
        : 0.0;

    const targetColor = originalColor.clone().lerp(destinationTint, customMix);
    currentUphColorRef.current.lerp(targetColor, 1 - Math.exp(-delta * 12));

    if (typeof window !== "undefined") {
      (window as any).__CHAIR_METRICS = {
        scrollY,
        travelBtoAtelierStart: m.travelBtoAtelierStart,
        travelBtoAtelierEnd: m.travelBtoAtelierEnd,
        travelAtelierExit: m.travelAtelierExit,
        travelCustomStart: m.travelCustomStart,
        travelCustomEnd: m.travelCustomEnd,
        customMix,
        activeColorId: activeColor.id,
        targetColor: targetColor.getHexString(),
        currentColor: currentUphColorRef.current.getHexString(),
      };
    }

    // Ensure upholsteryMaterialRef always points to the live mesh in the scene
    if (!upholsteryMaterialRef.current && chairGroupRef.current) {
      chairGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name === "Object_6") {
          const m = child as THREE.Mesh;
          if (Array.isArray(m.material) && m.material[0]) {
            upholsteryMaterialRef.current = m.material[0] as THREE.MeshStandardMaterial;
          }
        }
      });
    }

    if (upholsteryMaterialRef.current) {
      upholsteryMaterialRef.current.color.copy(currentUphColorRef.current);
    }
  });

  return (
    <group ref={chairGroupRef}>
      <ChairModel
        modelUrl={modelUrl}
        onLoaded={handleLoaded}
        onUpholsteryMaterial={handleUpholsteryMaterial}
        onContactShadowGroup={handleContactShadowGroup}
      />
    </group>
  );
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
 * Shared Persistent 3D Scene Host.
 * Renders the single persistent React Three Fiber canvas spanning the entire viewport at z-20.
 * Dynamic rounded-rect CSS clipPath is applied on the canvas element during container resting states
 * to guarantee zero model spill outside containers.
 */
export function ChairScene({ className = "", modelUrl }: ChairSceneProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const hasWebGL = useSyncExternalStore(emptySubscribe, isWebGLAvailable, () => false);

  if (!isClient || !hasWebGL) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-20 overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 36 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.domElement.style.pointerEvents = "none";
        }}
        className="w-full h-full pointer-events-none"
      >
        <ambientLight intensity={1.4} color="#FFFDF9" />
        <directionalLight position={[4, 5, 4]} intensity={1.5} color="#FFF8F0" />
        <directionalLight position={[-4, -1, -2]} intensity={0.5} color="#E8E1D5" />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#FFF9F0" />

        <Suspense fallback={null}>
          <ContinuousChairController modelUrl={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default ChairScene;
