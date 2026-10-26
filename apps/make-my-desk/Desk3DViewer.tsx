import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  Rotate3d,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  Eye,
  Camera,
  Layers,
  Sliders,
  Move,
  Play,
  Square,
  RotateCw,
} from "lucide-react";
import {
  DeskPartOption,
  DeskItemPositions,
  DEFAULT_ITEM_POSITIONS,
} from "./catalog";
import { DeskBuildState, getPartOption } from "./engine";

interface Desk3DViewerProps {
  build: DeskBuildState;
  positions: DeskItemPositions;
  score: number;
  height?: number;
  onUpdatePosition?: (updater: (prev: DeskItemPositions) => DeskItemPositions) => void;
}

export const Desk3DViewer: React.FC<Desk3DViewerProps> = ({
  build,
  positions,
  score,
  height = 360,
  onUpdatePosition,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraView, setCameraView] = useState<"free" | "front" | "top" | "side">(() => {
    if (typeof window !== "undefined") {
      try {
        const v = new URLSearchParams(window.location.search).get("view");
        if (v === "front" || v === "top" || v === "side") return v;
      } catch {}
    }
    return "free";
  });
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // Demo motion loop: smoothly cycles height, depth, and 90° pivot
  useEffect(() => {
    if (!isDemoPlaying) return;
    const steps = [
      { height: 160, depth: 80, pivot: false },
      { height: 30, depth: -110, pivot: false },
      { height: 120, depth: 30, pivot: true },
      { height: 80, depth: 0, pivot: false },
    ];
    let stepIdx = 0;
    const timer = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      const target = steps[stepIdx];
      onUpdatePosition?.((p) => ({
        ...p,
        monitorHeight: target.height,
        monitorDepth: target.depth,
        monitorPivot: target.pivot,
      }));
    }, 1900);
    return () => clearInterval(timer);
  }, [isDemoPlaying, onUpdatePosition]);

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const isNightModeRef = useRef(isNightMode);
  isNightModeRef.current = isNightMode;

  const sceneStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    rootGroup: THREE.Group;
    deskGroup: THREE.Group;
    dirLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    screenLight?: THREE.SpotLight;
    pcLight?: THREE.PointLight;
    targetDistance: number;
    targetTheta: number; // yaw
    targetPhi: number;   // pitch
    distance: number;
    theta: number;
    phi: number;
    animId?: number;
  } | null>(null);

  // Mouse & Touch interaction state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef(0);

  const desk = getPartOption("desk", build.desk);
  const monitor = getPartOption("monitor", build.monitor);
  const arm = getPartOption("monitorArm", build.monitorArm);
  const chair = getPartOption("chair", build.chair);
  const km = getPartOption("keyboardMouse", build.keyboardMouse);
  const light = getPartOption("lightingMat", build.lightingMat);
  const acc = getPartOption("accessories", build.accessories);

  // Physical Dimensions (scaled: 1 unit = 100mm = 10cm)
  const deskWidthUnits = (desk?.deskWidth || 1400) / 100; // e.g. 14.0
  const deskDepthUnits = (desk?.deskDepth || 700) / 100;  // e.g. 7.0
  const deskHeightUnits = (desk?.deskHeight || 720) / 100; // e.g. 7.2
  const deskThickUnits = (desk?.deskThickness || 25) / 100; // e.g. 0.25
  const isMotionDesk = desk?.isMotionDesk || false;

  // Cleanup helper
  const disposeGroup = (group: THREE.Group) => {
    group.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    group.clear();
  };

  // 1. Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const heightPx = height;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 150);
    const initialTheta = cameraView === "side" ? Math.PI / 2 : cameraView === "front" ? 0 : cameraView === "top" ? 0 : 0.55;
    const initialPhi = cameraView === "side" ? 0.3 : cameraView === "front" ? 0.22 : cameraView === "top" ? Math.PI * 0.46 : 0.58;
    const initialDistance = cameraView === "side" ? 22 : cameraView === "front" ? 21 : cameraView === "top" ? 28 : 26;
    camera.position.set(
      initialDistance * Math.sin(initialTheta) * Math.cos(initialPhi),
      initialDistance * Math.sin(initialPhi) + deskHeightUnits * 0.5,
      initialDistance * Math.cos(initialTheta) * Math.cos(initialPhi)
    );
    camera.lookAt(0, deskHeightUnits * 0.7, 0);

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL initialization failed:", e);
      return;
    }
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ed, 1.4);
    dirLight.position.set(12, 22, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Subtle Room Floor for shadow projection
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const deskGroup = new THREE.Group();
    rootGroup.add(deskGroup);

    sceneStateRef.current = {
      scene,
      camera,
      renderer,
      rootGroup,
      deskGroup,
      dirLight,
      ambientLight,
      targetDistance: initialDistance,
      targetTheta: initialTheta,
      targetPhi: initialPhi,
      distance: initialDistance,
      theta: initialTheta,
      phi: initialPhi,
    };

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const state = sceneStateRef.current;
      if (!state) return;

      // Auto rotation
      if (autoRotateRef.current) {
        state.targetTheta += 0.005;
      }

      // Smooth camera interpolation
      state.theta += (state.targetTheta - state.theta) * 0.1;
      state.phi += (state.targetPhi - state.phi) * 0.1;
      state.distance += (state.targetDistance - state.distance) * 0.1;

      // Restrict phi (vertical tilt angle)
      state.phi = Math.max(0.08, Math.min(Math.PI * 0.48, state.phi));

      const camY = state.distance * Math.sin(state.phi) + deskHeightUnits * 0.5;
      const camRadius = state.distance * Math.cos(state.phi);
      state.camera.position.set(
        camRadius * Math.sin(state.theta),
        camY,
        camRadius * Math.cos(state.theta)
      );
      state.camera.lookAt(0, deskHeightUnits * 0.7, 0);

      // Light updates for Night Mode
      const night = isNightModeRef.current;
      if (night) {
        state.scene.background = new THREE.Color(0x0a0f1d);
        floorMat.color.setHex(0x0f172a);
        state.ambientLight.intensity = 0.25;
        state.dirLight.intensity = 0.35;
        if (state.screenLight) state.screenLight.intensity = 2.2;
        if (state.pcLight) state.pcLight.intensity = 3.5;
      } else {
        state.scene.background = null;
        floorMat.color.setHex(0xf1f5f9);
        state.ambientLight.intensity = 0.85;
        state.dirLight.intensity = 1.35;
        if (state.screenLight) state.screenLight.intensity = 0.5;
        if (state.pcLight) state.pcLight.intensity = 1.5;
      }

      state.renderer.render(state.scene, state.camera);
    };

    animate();
    sceneStateRef.current.animId = animId;

    // Handle Resize
    const handleResize = () => {
      if (!container || !sceneStateRef.current) return;
      const w = container.clientWidth || 400;
      sceneStateRef.current.camera.aspect = w / heightPx;
      sceneStateRef.current.camera.updateProjectionMatrix();
      sceneStateRef.current.renderer.setSize(w, heightPx);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (sceneStateRef.current) {
        disposeGroup(sceneStateRef.current.rootGroup);
        sceneStateRef.current.renderer.dispose();
      }
    };
  }, [height]);

  // 2. Build Realistic 3D Rig whenever build/positions change
  const buildScene = useCallback(() => {
    const state = sceneStateRef.current;
    if (!state) return;
    const { deskGroup, scene } = state;
    disposeGroup(deskGroup);

    // Remove existing dynamic lights
    if (state.screenLight) {
      scene.remove(state.screenLight);
      state.screenLight = undefined;
    }
    if (state.pcLight) {
      scene.remove(state.pcLight);
      state.pcLight = undefined;
    }

    const deskColor = desk?.color || "wood";
    const deskW = deskWidthUnits;
    const deskD = deskDepthUnits;
    const deskH = deskHeightUnits;
    const deskT = deskThickUnits;

    // Color definitions
    let topColor = 0xb8864d; // natural oak
    if (deskColor === "wood") {
      topColor = desk?.name.includes("월넛") ? 0x543217 : 0xb8864d;
    } else if (deskColor === "white") {
      topColor = 0xf8fafc;
    } else {
      topColor = 0x18181b;
    }

    const legColor = deskColor === "white" ? 0xe2e8f0 : 0x1e293b;

    // -------------------------------------------------------------
    // A. DESK (책상 상판 및 하부 다리)
    // -------------------------------------------------------------
    const topGeo = new THREE.BoxGeometry(deskW, deskT, deskD);
    const topMat = new THREE.MeshStandardMaterial({
      color: topColor,
      roughness: deskColor === "white" ? 0.25 : 0.45,
      metalness: deskColor === "black" ? 0.2 : 0.05,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(0, deskH, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Table Legs
    if (isMotionDesk) {
      // Modern Motorized T-Legs (2 heavy columns with floor feet)
      const colW = 0.7;
      const colD = 0.9;
      const footL = deskD * 0.85;

      const legGeo = new THREE.BoxGeometry(colW, deskH - deskT, colD);
      const legMat = new THREE.MeshStandardMaterial({
        color: legColor,
        roughness: 0.35,
        metalness: 0.6,
      });

      const footGeo = new THREE.BoxGeometry(colW * 1.3, 0.4, footL);

      // Left column & foot
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-deskW * 0.38, (deskH - deskT) / 2, 0);
      legL.castShadow = true;
      deskGroup.add(legL);

      const footLMesh = new THREE.Mesh(footGeo, legMat);
      footLMesh.position.set(-deskW * 0.38, 0.2, 0);
      footLMesh.castShadow = true;
      deskGroup.add(footLMesh);

      // Right column & foot
      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(deskW * 0.38, (deskH - deskT) / 2, 0);
      legR.castShadow = true;
      deskGroup.add(legR);

      const footRMesh = new THREE.Mesh(footGeo, legMat);
      footRMesh.position.set(deskW * 0.38, 0.2, 0);
      footRMesh.castShadow = true;
      deskGroup.add(footRMesh);

      // Under-desk Crossbar
      const barGeo = new THREE.BoxGeometry(deskW * 0.76, 0.35, 0.6);
      const barMesh = new THREE.Mesh(barGeo, legMat);
      barMesh.position.set(0, deskH - deskT - 0.2, 0);
      deskGroup.add(barMesh);
    } else {
      // 4 Clean Square Tubular Legs
      const legSize = 0.45;
      const legGeo = new THREE.BoxGeometry(legSize, deskH - deskT, legSize);
      const legMat = new THREE.MeshStandardMaterial({
        color: legColor,
        roughness: 0.4,
        metalness: 0.5,
      });

      const xOffsets = [-deskW / 2 + 0.6, deskW / 2 - 0.6];
      const zOffsets = [-deskD / 2 + 0.6, deskD / 2 - 0.6];

      xOffsets.forEach((x) => {
        zOffsets.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, (deskH - deskT) / 2, z);
          leg.castShadow = true;
          deskGroup.add(leg);
        });
      });
    }

    // -------------------------------------------------------------
    // A-2. DESK SHELF / RISER (데스크 쉘프 / 모니터 받침 선반)
    // -------------------------------------------------------------
    const shelf = getPartOption("deskShelf", build.deskShelf);
    const hasShelf = shelf && shelf.id !== "shelf_none";
    const shelfElevation = hasShelf ? 0.9 : 0;

    if (hasShelf) {
      const shelfW = Math.min(deskW - 1.2, shelf.id.includes("dual") ? 9.8 : 10.0);
      const shelfD = 2.3;
      const shelfT = 0.2;

      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(0, deskH + deskT / 2, -deskD * 0.18);
      deskGroup.add(shelfGroup);

      // Shelf Board Color
      let shelfColor = 0xb8864d;
      if (shelf.id.includes("wood")) {
        shelfColor = desk?.name.includes("월넛") ? 0x543217 : 0xb8864d;
      } else if (shelf.id.includes("aluminum")) {
        shelfColor = 0xd4d4d8;
      } else if (shelf.id.includes("felt")) {
        shelfColor = 0x475569;
      } else if (shelf.id.includes("acrylic")) {
        shelfColor = 0x38bdf8;
      } else if (deskColor === "white") {
        shelfColor = 0xf8fafc;
      } else if (deskColor === "black") {
        shelfColor = 0x27272a;
      }

      const boardMesh = new THREE.Mesh(
        new THREE.BoxGeometry(shelfW, shelfT, shelfD),
        new THREE.MeshStandardMaterial({
          color: shelfColor,
          metalness: shelf.id.includes("aluminum") ? 0.7 : 0.1,
          roughness: shelf.id.includes("aluminum") ? 0.3 : 0.6,
          transparent: shelf.id.includes("acrylic"),
          opacity: shelf.id.includes("acrylic") ? 0.75 : 1.0,
        })
      );
      boardMesh.position.set(0, shelfElevation, 0);
      boardMesh.castShadow = true;
      boardMesh.receiveShadow = true;
      shelfGroup.add(boardMesh);

      // Two Riser Metal Legs
      const riserMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.3,
      });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, shelfElevation, shelfD * 0.85), riserMat);
      legL.position.set(-shelfW / 2 + 0.35, shelfElevation / 2, 0);
      legL.castShadow = true;
      shelfGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, shelfElevation, shelfD * 0.85), riserMat);
      legR.position.set(shelfW / 2 - 0.35, shelfElevation / 2, 0);
      legR.castShadow = true;
      shelfGroup.add(legR);
    }

    // -------------------------------------------------------------
    // B. MONITOR & MONITOR ARM MOTION (모니터 및 모니터암 인터랙티브 3D 렌더링)
    // -------------------------------------------------------------
    const monSize = monitor?.monitorSize || 27;
    const monType = monitor?.monitorType || "single";
    const monOffsetX = (positions.monitorX || 0) / 100;
    const monHeightOffset = ((positions.monitorHeight ?? 80) / 100); // 0 ~ 2.0 units (0 ~ 20cm)
    const monDepthOffset = ((positions.monitorDepth || 0) / 100);   // -1.5 ~ +1.5 units (-15 ~ +15cm)
    const monAngleRad = ((positions.monitorAngle || 0) * Math.PI) / 180;
    const isPivot = !!positions.monitorPivot && monType !== "dual";

    // Monitor Base Elevation & Center Points
    const monBaseY = deskH + deskT / 2 + (hasShelf ? shelfElevation : 0);
    const monCenterY = monBaseY + 0.4 + monHeightOffset;
    const monCenterZ = -deskD * 0.22 + monDepthOffset;

    // Screen Dimensions in 3D Units
    let sW = 6.1; // 27"
    let sH = 3.5;
    if (monSize === 24) {
      sW = 5.3;
      sH = 3.0;
    } else if (monSize === 32) {
      sW = 7.1;
      sH = 4.1;
    } else if (monSize === 34) {
      sW = 8.1;
      sH = 3.5;
    }

    // In 90° portrait pivot mode: width & height swap
    const effectiveW = isPivot ? sH : sW;
    const effectiveH = isPivot ? sW : sH;

    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(monOffsetX, monCenterY, monCenterZ);
    monitorGroup.rotation.y = monAngleRad;
    deskGroup.add(monitorGroup);

    // Bezel & Screen Material
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.8,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: isPivot ? 0x064e3b : 0x0284c7,
      emissive: isPivot ? 0x059669 : 0x0369a1,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.1,
    });

    // Monitor Frame & Screen Construction
    const monPivotSub = new THREE.Group();
    monPivotSub.position.set(0, effectiveH / 2, 0);
    monitorGroup.add(monPivotSub);

    if (monType === "dual") {
      // Dual 24" Monitors Angled Inward
      [-2.8, 2.8].forEach((xPos, idx) => {
        const subMon = new THREE.Group();
        subMon.position.set(xPos, 0, 0);
        subMon.rotation.y = idx === 0 ? 0.18 : -0.18;

        const frame = new THREE.Mesh(new THREE.BoxGeometry(5.3, 3.0, 0.25), bezelMat);
        frame.castShadow = true;
        subMon.add(frame);

        const scr = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 2.8), screenMat);
        scr.position.z = 0.13;
        subMon.add(scr);

        monPivotSub.add(subMon);
      });
    } else if (monType === "ultrawide") {
      // 34" Curved Ultrawide
      const frame = new THREE.Mesh(new THREE.BoxGeometry(effectiveW, effectiveH, 0.3), bezelMat);
      frame.castShadow = true;
      monPivotSub.add(frame);

      const scr = new THREE.Mesh(new THREE.PlaneGeometry(effectiveW - 0.2, effectiveH - 0.2), screenMat);
      scr.position.z = 0.16;
      monPivotSub.add(scr);
    } else {
      // Single 27" / 32" (with 90° pivot capability)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(effectiveW, effectiveH, 0.28), bezelMat);
      frame.castShadow = true;
      monPivotSub.add(frame);

      const scr = new THREE.Mesh(new THREE.PlaneGeometry(effectiveW - 0.2, effectiveH - 0.2), screenMat);
      scr.position.z = 0.15;
      monPivotSub.add(scr);
    }

    // Target VESA mount point (center back of monitor in deskGroup space)
    const targetVesaX = monOffsetX;
    const targetVesaY = monCenterY + effectiveH / 2;
    const targetVesaZ = monCenterZ - 0.16;

    // Helper: draw an arm link between two 3D points
    const drawLink = (
      p1: { x: number; y: number; z: number },
      p2: { x: number; y: number; z: number },
      thickness: number,
      mat: THREE.Material
    ) => {
      const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
      const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
      const dir = new THREE.Vector3().subVectors(v2, v1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness * 1.15, len), mat);
      mesh.position.copy(mid);
      mesh.lookAt(v2);
      mesh.castShadow = true;
      deskGroup.add(mesh);
      return mesh;
    };

    const hasArm = arm && arm.id !== "arm_none";

    if (!hasArm) {
      // -------------------------------------------------------------
      // Case A: 모니터 번들 기본 스탠드 (상판 공간 차지)
      // -------------------------------------------------------------
      const standBaseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.6,
        roughness: 0.4,
      });

      // Flat rectangular stand base on desk or shelf surface
      const standBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8), standBaseMat);
      standBase.position.set(monOffsetX, monBaseY + 0.06, monCenterZ);
      standBase.castShadow = true;
      standBase.receiveShadow = true;
      deskGroup.add(standBase);

      // Upright vertical neck
      const neckH = Math.max(0.6, targetVesaY - monBaseY);
      const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.5, neckH, 0.4), standBaseMat);
      standNeck.position.set(monOffsetX, monBaseY + neckH / 2, monCenterZ - 0.2);
      standNeck.castShadow = true;
      deskGroup.add(standNeck);
    } else {
      // -------------------------------------------------------------
      // Case B: 가스스프링 모니터암 (유연한 3D 관절 기구학 모델링)
      // -------------------------------------------------------------
      const armColor =
        arm.id.includes("bma2") && deskColor === "white"
          ? 0xf8fafc
          : arm.id.includes("ergotron")
          ? 0xd4d4d8
          : 0x27272a;

      const armMat = new THREE.MeshStandardMaterial({
        color: armColor,
        metalness: arm.id.includes("ergotron") ? 0.9 : 0.75,
        roughness: arm.id.includes("ergotron") ? 0.2 : 0.35,
      });

      // Clamp mounted at the rear edge of desk
      const clampX = monOffsetX * 0.7; // slight offset for natural elbow folding
      const clampY = deskH + deskT / 2;
      const clampZ = -deskD / 2 + 0.35;

      // Heavy C-Clamp bracket
      const clampBracket = new THREE.Mesh(new THREE.BoxGeometry(0.9, deskT + 0.6, 0.9), armMat);
      clampBracket.position.set(clampX, clampY - deskT / 2 + 0.15, clampZ);
      clampBracket.castShadow = true;
      deskGroup.add(clampBracket);

      // Under-desk screw knob
      const screwKnob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 })
      );
      screwKnob.position.set(clampX, clampY - deskT - 0.3, clampZ);
      deskGroup.add(screwKnob);

      // Swivel Base Turret on top of clamp
      const baseTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.7, 24), armMat);
      baseTurret.position.set(clampX, clampY + 0.35, clampZ);
      baseTurret.castShadow = true;
      deskGroup.add(baseTurret);

      if (monType === "dual") {
        // Dual Monitor Arm: Central pole with dual branching articulating arms
        const poleHeight = 2.6;
        const mainPole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, poleHeight, 16), armMat);
        mainPole.position.set(clampX, clampY + poleHeight / 2 + 0.3, clampZ);
        mainPole.castShadow = true;
        deskGroup.add(mainPole);

        // Branching left and right arms
        [-2.8, 2.8].forEach((xTarget) => {
          const vesaX = monOffsetX + xTarget;
          const elbowPt = {
            x: clampX + (vesaX - clampX) * 0.5,
            y: clampY + 1.6 + monHeightOffset * 0.2,
            z: clampZ + (targetVesaZ - clampZ) * 0.4 - 0.4,
          };

          drawLink({ x: clampX, y: clampY + 1.8, z: clampZ }, elbowPt, 0.32, armMat);
          drawLink(elbowPt, { x: vesaX, y: targetVesaY, z: targetVesaZ }, 0.28, armMat);

          const elbowJ = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 16), armMat);
          elbowJ.position.set(elbowPt.x, elbowPt.y, elbowPt.z);
          deskGroup.add(elbowJ);

          const vesaPlate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.12), armMat);
          vesaPlate.position.set(vesaX, targetVesaY, targetVesaZ + 0.05);
          deskGroup.add(vesaPlate);
        });
      } else {
        // Single Articulated Arm (NB-F80 / BMA-2 / PMA-2D style)
        const elbowX = clampX + (targetVesaX - clampX) * 0.4 + 1.1;
        const elbowY = clampY + 0.9 + monHeightOffset * 0.3;
        const elbowZ = (clampZ + targetVesaZ) * 0.5 - 0.35;

        // Lower arm link (Base -> Elbow)
        drawLink(
          { x: clampX, y: clampY + 0.7, z: clampZ },
          { x: elbowX, y: elbowY, z: elbowZ },
          0.38,
          armMat
        );

        // Elbow Joint
        const elbowJ = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.55, 20), armMat);
        elbowJ.position.set(elbowX, elbowY, elbowZ);
        elbowJ.castShadow = true;
        deskGroup.add(elbowJ);

        // Upper Gas-Spring Arm (Elbow -> VESA)
        drawLink(
          { x: elbowX, y: elbowY, z: elbowZ },
          { x: targetVesaX, y: targetVesaY, z: targetVesaZ },
          0.34,
          armMat
        );

        // VESA Head Plate
        const vesaPlate = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.85, 0.15),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
        );
        vesaPlate.position.set(targetVesaX, targetVesaY, targetVesaZ + 0.05);
        vesaPlate.castShadow = true;
        deskGroup.add(vesaPlate);
      }
    }

    // -------------------------------------------------------------
    // C. SCREENBAR & LIGHTING (스크린바 및 하향 스팟 조명)
    // -------------------------------------------------------------
    if (light?.lightType === "screenbar") {
      const barW = Math.min(effectiveW * 0.75, 5.0);
      const barGeo = new THREE.BoxGeometry(barW, 0.18, 0.2);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.7,
        roughness: 0.3,
      });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.position.set(monOffsetX, monCenterY + effectiveH + 0.18, monCenterZ + 0.12);
      barMesh.rotation.y = monAngleRad;
      barMesh.castShadow = true;
      deskGroup.add(barMesh);

      // Downward Light Cone for Night Mode
      const screenLight = new THREE.SpotLight(0xfef08a, 1.2, 8, Math.PI * 0.35, 0.4, 1.2);
      screenLight.position.set(monOffsetX, monCenterY + effectiveH + 1.2, monCenterZ + 0.12);
      screenLight.target.position.set(monOffsetX, monCenterY, monCenterZ);
      scene.add(screenLight);
      scene.add(screenLight.target);
      state.screenLight = screenLight;
    }

    // -------------------------------------------------------------
    // D. DESK MAT, KEYBOARD & MOUSE (키보드 & 마우스 & 데스크패드)
    // -------------------------------------------------------------
    const kbOffsetX = (positions.keyboardX || 0) / 100;

    // Desk Mat (900×400mm = 9.0×4.0 units)
    let matColor = 0x18181b;
    if (light?.id === "lm_felt_wool_mat") matColor = 0x475569;
    else if (light?.id === "lm_rgb_gaming_mat") matColor = 0x0284c7;

    const matGeo = new THREE.BoxGeometry(8.5, 0.04, 3.8);
    const matMeshMat = new THREE.MeshStandardMaterial({
      color: matColor,
      roughness: 0.8,
      metalness: 0.1,
    });
    const matMesh = new THREE.Mesh(matGeo, matMeshMat);
    matMesh.position.set(kbOffsetX, deskH + deskT / 2 + 0.02, 0.6);
    matMesh.receiveShadow = true;
    deskGroup.add(matMesh);

    // Keyboard (TKL: 3.6 × 1.4 units)
    const kbW = km?.id?.includes("mk295") ? 4.4 : 3.6;
    const kbGeo = new THREE.BoxGeometry(kbW, 0.16, 1.4);
    const kbMat = new THREE.MeshStandardMaterial({
      color: km?.id?.includes("white") ? 0xf8fafc : 0x1e293b,
      roughness: 0.4,
      metalness: 0.2,
    });
    const kbMesh = new THREE.Mesh(kbGeo, kbMat);
    kbMesh.position.set(kbOffsetX - 0.8, deskH + deskT / 2 + 0.1, 0.7);
    kbMesh.castShadow = true;
    deskGroup.add(kbMesh);

    // Mouse (0.65 × 1.15 units)
    const mouseGeo = new THREE.BoxGeometry(0.65, 0.18, 1.15);
    const mouseMat = new THREE.MeshStandardMaterial({
      color: km?.id?.includes("white") ? 0xffffff : 0x0f172a,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mouseMesh = new THREE.Mesh(mouseGeo, mouseMat);
    mouseMesh.position.set(kbOffsetX + 2.4, deskH + deskT / 2 + 0.11, 0.7);
    mouseMesh.castShadow = true;
    deskGroup.add(mouseMesh);

    // -------------------------------------------------------------
    // E. PC CASE (컴퓨터 본체 - 위치 가변)
    // -------------------------------------------------------------
    const pcW = 2.1;
    const pcD = 4.4;
    const pcH = 4.5;

    let pcX = deskW / 2 - pcW / 2 - 0.4;
    let pcY = deskH + deskT / 2 + pcH / 2;
    let pcZ = 0;

    const pcPlacement = positions.pcPlacement || "desk-right";
    if (pcPlacement === "desk-left") {
      pcX = -deskW / 2 + pcW / 2 + 0.4;
      pcY = deskH + deskT / 2 + pcH / 2;
      pcZ = 0;
    } else if (pcPlacement === "floor-right") {
      pcX = deskW / 2 + pcW / 2 + 0.8;
      pcY = pcH / 2;
      pcZ = 0;
    } else if (pcPlacement === "floor-left") {
      pcX = -deskW / 2 - pcW / 2 - 0.8;
      pcY = pcH / 2;
      pcZ = 0;
    }

    const pcGroup = new THREE.Group();
    pcGroup.position.set(pcX, pcY, pcZ);
    deskGroup.add(pcGroup);

    // PC Chassis Box
    const pcChassis = new THREE.Mesh(
      new THREE.BoxGeometry(pcW, pcH, pcD),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.3 })
    );
    pcChassis.castShadow = true;
    pcChassis.receiveShadow = true;
    pcGroup.add(pcChassis);

    // Tempered Glass Side Window
    const glassMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(pcD - 0.4, pcH - 0.4),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0xa855f7,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.45,
      })
    );
    glassMesh.rotation.y = pcPlacement.includes("left") ? Math.PI / 2 : -Math.PI / 2;
    glassMesh.position.x = pcPlacement.includes("left") ? pcW / 2 + 0.01 : -pcW / 2 - 0.01;
    pcGroup.add(glassMesh);

    // Internal RGB Fan Glow
    const pcLight = new THREE.PointLight(0xa855f7, 2.0, 5);
    pcLight.position.set(pcX, pcY, pcZ);
    scene.add(pcLight);
    state.pcLight = pcLight;

    // -------------------------------------------------------------
    // F. BOOKSHELF SPEAKERS (스튜디오 북쉘프 스피커)
    // -------------------------------------------------------------
    if (positions.speakerPlacement !== "none") {
      const spkW = 1.3;
      const spkH = 2.1;
      const spkD = 1.5;

      const spkDist = positions.speakerPlacement === "wide" ? deskW * 0.44 : Math.max(3.8, sW / 2 + 1.2);

      const spkMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.4,
        metalness: 0.3,
      });

      [-spkDist, spkDist].forEach((sx, idx) => {
        const spk = new THREE.Mesh(new THREE.BoxGeometry(spkW, spkH, spkD), spkMat);
        spk.position.set(sx, deskH + deskT / 2 + spkH / 2, -deskD * 0.18);
        spk.rotation.y = idx === 0 ? 0.22 : -0.22;
        spk.castShadow = true;
        deskGroup.add(spk);
      });
    }

    // -------------------------------------------------------------
    // G. ACCESSORIES (3-in-1 맥세이프 거치대 or 식물)
    // -------------------------------------------------------------
    if (positions.accPlacement !== "none") {
      const accX = positions.accPlacement === "left" ? -deskW / 2 + 1.6 : deskW / 2 - 1.6;
      const standGroup = new THREE.Group();
      standGroup.position.set(accX, deskH + deskT / 2, -deskD * 0.15);

      const baseM = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 })
      );
      baseM.position.y = 0.05;
      baseM.castShadow = true;
      standGroup.add(baseM);

      const poleM = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.9 })
      );
      poleM.position.y = 0.65;
      standGroup.add(poleM);

      // Phone puck
      const puckM = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      puckM.position.set(0, 1.2, 0.15);
      puckM.rotation.x = 0.35;
      standGroup.add(puckM);

      deskGroup.add(standGroup);
    }

    // -------------------------------------------------------------
    // H. ERGONOMIC CHAIR (인체공학 의자)
    // -------------------------------------------------------------
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, deskD / 2 + 3.0);
    deskGroup.add(chairGroup);

    const chairColor = chair?.chairType === "leather" ? 0x18181b : 0x1e293b;
    const chairMat = new THREE.MeshStandardMaterial({
      color: chairColor,
      roughness: 0.6,
      metalness: 0.1,
    });

    // 5-Star Wheels Base on Floor
    const starBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    starBase.position.y = 0.3;
    chairGroup.add(starBase);

    // Gas Cylinder Lift
    const cylMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 })
    );
    cylMesh.position.y = 1.6;
    chairGroup.add(cylMesh);

    // Contoured Seat Cushion
    const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 3.4), chairMat);
    seatMesh.position.y = 3.0;
    seatMesh.castShadow = true;
    chairGroup.add(seatMesh);

    // Backrest with Ergonomic Curve
    const backMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.8, 0.4), chairMat);
    backMesh.position.set(0, 5.2, 1.6);
    backMesh.rotation.x = -0.15;
    backMesh.castShadow = true;
    chairGroup.add(backMesh);

    // Headrest
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.9, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 })
    );
    headMesh.position.set(0, 7.3, 1.9);
    headMesh.rotation.x = -0.12;
    headMesh.castShadow = true;
    chairGroup.add(headMesh);
  }, [
    desk,
    monitor,
    arm,
    chair,
    km,
    light,
    acc,
    positions,
    deskWidthUnits,
    deskDepthUnits,
    deskHeightUnits,
    deskThickUnits,
    isMotionDesk,
  ]);

  useEffect(() => {
    buildScene();
  }, [buildScene]);

  // Touch and Mouse Orbit Controller Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !sceneStateRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Update target angles (360° Horizontal Orbit, Vertical Pitch)
    sceneStateRef.current.targetTheta -= deltaX * 0.008;
    sceneStateRef.current.targetPhi += deltaY * 0.008;
    setCameraView("free");
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!sceneStateRef.current) return;
    e.preventDefault();
    sceneStateRef.current.targetDistance = Math.max(
      12,
      Math.min(42, sceneStateRef.current.targetDistance + e.deltaY * 0.02)
    );
  };

  // Camera preset views
  const handleSetView = (view: "free" | "front" | "top" | "side") => {
    const state = sceneStateRef.current;
    if (!state) return;
    setCameraView(view);

    if (view === "front") {
      // Eye level seated front view
      state.targetTheta = 0;
      state.targetPhi = 0.22;
      state.targetDistance = 21;
    } else if (view === "top") {
      // Top down layout view
      state.targetTheta = 0;
      state.targetPhi = Math.PI * 0.46;
      state.targetDistance = 28;
    } else if (view === "side") {
      // Side view to inspect monitor arm and desk thickness
      state.targetTheta = Math.PI / 2;
      state.targetPhi = 0.3;
      state.targetDistance = 22;
    } else {
      // Default isometric view
      state.targetTheta = 0.55;
      state.targetPhi = 0.58;
      state.targetDistance = 26;
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-toss-border bg-gradient-to-b from-slate-900/5 to-slate-900/10 shadow-md">
      {/* 1. Top HUD Status Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white/95 text-toss-blue shadow-xs backdrop-blur-md border border-blue-100 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            실측 1:1 스케일 3D
          </span>
          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-white backdrop-blur-md">
            {desk?.deskWidth}×{desk?.deskDepth}mm
          </span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-xl text-xs font-bold transition backdrop-blur-md shadow-xs ${
              autoRotate
                ? "bg-blue-600 text-white"
                : "bg-white/90 text-toss-subtext hover:bg-white"
            }`}
            title="360도 자동 회전"
          >
            <Rotate3d className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs backdrop-blur-md ${
              isNightMode
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            {isNightMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>낮</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>밤 조명</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1.5. 모니터암 3D 인터랙티브 모션 퀵 컨트롤 바 */}
      <div className="absolute top-12 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-gray-200/80 shadow-xs flex-wrap">
          <span className="text-[10px] font-black text-gray-500 flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-blue-600" />
            모니터암 무빙
          </span>

          {/* 90° Pivot Toggle */}
          <button
            onClick={() => onUpdatePosition?.((p) => ({ ...p, monitorPivot: !p.monitorPivot }))}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 border ${
              positions.monitorPivot
                ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
            title="가로/세로 90° 피벗 회전"
          >
            <Rotate3d className="w-3 h-3" />
            <span>{positions.monitorPivot ? "세로 90° (피벗중)" : "90° 피벗"}</span>
          </button>

          {/* Height Elevation Toggle */}
          <button
            onClick={() =>
              onUpdatePosition?.((p) => ({
                ...p,
                monitorHeight: (p.monitorHeight ?? 80) >= 140 ? 20 : (p.monitorHeight ?? 80) + 60,
              }))
            }
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
            title="모니터 높낮이 승하강"
          >
            <span>↕ 높이 {(positions.monitorHeight ?? 80) >= 120 ? "높게" : (positions.monitorHeight ?? 80) <= 40 ? "낮게" : "눈높이"}</span>
          </button>

          {/* Depth Toggle */}
          <button
            onClick={() =>
              onUpdatePosition?.((p) => ({
                ...p,
                monitorDepth: (p.monitorDepth || 0) >= 80 ? -100 : (p.monitorDepth || 0) + 90,
              }))
            }
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
            title="앞뒤 거리 조절"
          >
            <span>↔ {(positions.monitorDepth || 0) > 40 ? "앞으로" : (positions.monitorDepth || 0) < -40 ? "벽밀착" : "표준"}</span>
          </button>

          {/* Auto Demo Motion */}
          <button
            onClick={() => setIsDemoPlaying(!isDemoPlaying)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 border ${
              isDemoPlaying
                ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            }`}
            title="모니터암 자유 무빙 시연"
          >
            {isDemoPlaying ? (
              <>
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>정지</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>무빙 시연</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Three.js WebGL Interactive Stage (360° Touch / Mouse Rotate) */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full cursor-grab active:cursor-grabbing touch-none select-none relative"
        style={{ height }}
      />

      {/* 3. On-screen 3D Camera Angles Bar */}
      <div className="absolute bottom-11 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          <button
            onClick={() => handleSetView("free")}
            className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition ${
              cameraView === "free"
                ? "bg-toss-blue text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            360° 회전
          </button>
          <button
            onClick={() => handleSetView("front")}
            className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition ${
              cameraView === "front"
                ? "bg-toss-blue text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            눈높이
          </button>
          <button
            onClick={() => handleSetView("top")}
            className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition ${
              cameraView === "top"
                ? "bg-toss-blue text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            배치(탑뷰)
          </button>
          <button
            onClick={() => handleSetView("side")}
            className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition ${
              cameraView === "side"
                ? "bg-toss-blue text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            측면
          </button>
        </div>

        <div className="pointer-events-auto bg-black/60 text-white text-[10px] px-2 py-1 rounded-xl backdrop-blur-md flex items-center gap-1">
          <Move className="w-3 h-3" />
          <span>화면 드래그로 360° 회전</span>
        </div>
      </div>

      {/* 4. Bottom Specs Footer */}
      <div className="px-4 py-2 bg-white/95 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="font-extrabold text-toss-text">
            {desk?.brand} {desk?.deskWidth}mm
          </span>
          <span>·</span>
          <span>모니터 {monitor?.monitorSize}"</span>
          <span>·</span>
          <span>{chair?.brand}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400">호환성</span>
          <span className="font-black text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {score}점
          </span>
        </div>
      </div>
    </div>
  );
};
