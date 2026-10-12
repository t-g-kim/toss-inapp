/**
 * 원룸 가구 배치 3D - Three.js 기반 3D 아이소메트릭 룸 뷰어
 * - 자연 채광 조명 & 부드러운 그림자 (PCF Soft Shadows)
 * - 원목 바닥 및 반투명 개방형 벽체
 * - 각 가구별 3D 디테일 모델링 (침대 헤드, 베개, 모니터 데스크, 옷장 손잡이)
 * - 4가지 카메라 프리셋 시점 & 터치 회전 지원
 */

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import {
  RoomTemplate,
  PlacedFurniture,
  getFurnitureById,
} from "./catalog";
import { Eye, RotateCw, Sparkles, Box, Camera } from "lucide-react";

interface Room3DViewerProps {
  template: RoomTemplate;
  placed: PlacedFurniture[];
  selectedId: string | null;
  onSelect: (instanceId: string | null) => void;
}

export const Room3DViewer: React.FC<Room3DViewerProps> = ({
  template,
  placed,
  selectedId,
  onSelect,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewPreset, setViewPreset] = useState<"iso" | "top" | "front" | "window">("iso");

  // Three.js 내부 참조
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);

  // 마우스/터치 드래그 카메라 회전 상태
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.5, radius: 800 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Renderer 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a"); // 세련된 다크 블루그레이 배경
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Camera 설정
    const camera = new THREE.PerspectiveCamera(40, width / height, 10, 3000);
    cameraRef.current = camera;

    // 3. 조명 (자연 채광 햇빛 & 필 라이트)
    const ambientLight = new THREE.AmbientLight("#f8fafc", 0.7);
    scene.add(ambientLight);

    // 창문 방향에서 비추는 메인 태양광
    const sunLight = new THREE.DirectionalLight("#fffbeb", 1.8);
    sunLight.position.set(0, 500, -350);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 50;
    sunLight.shadow.camera.far = 1200;
    const d = 500;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 천장 따뜻한 포인트 라이트
    const pointLight = new THREE.PointLight("#60a5fa", 0.5, 900);
    pointLight.position.set(0, 300, 0);
    scene.add(pointLight);

    // 4. 룸 & 가구 그룹
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomGroupRef.current = roomGroup;

    // 카메라 위치 갱신 함수
    const updateCamera = () => {
      const { theta, phi, radius } = cameraAnglesRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 40, 0);
    };
    updateCamera();

    // 렌더 루프
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 리사이즈 핸들러
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 룸 및 가구 3D 메시 재구성
  useEffect(() => {
    if (!roomGroupRef.current) return;
    const group = roomGroupRef.current;

    // 기존 자식 객체 정리
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const rw = template.width;
    const rd = template.depth;
    const wallH = 180; // 벽 높이 cm
    const wallThick = 8; // 벽 두께 cm

    // 원룸 중심점을 (0, 0, 0)으로 맞추기 위한 오프셋
    const halfW = rw / 2;
    const halfD = rd / 2;

    // 1. 따뜻한 원목 마룻바닥
    const floorGeo = new THREE.BoxGeometry(rw, 4, rd);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#ecdcc8",
      roughness: 0.6,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -2, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. 바닥 걸레받이 몰딩 테두리
    const trimMat = new THREE.MeshStandardMaterial({ color: "#cbd5e1" });
    const trimGeo = new THREE.BoxGeometry(rw + wallThick * 2, 8, rd + wallThick * 2);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, -6, 0);
    group.add(trimMesh);

    // 3. 개방형 벽체 (시야를 가리지 않도록 후면/좌측 벽만 높게 올리고 전면은 투명 처리)
    const wallMat = new THREE.MeshStandardMaterial({
      color: "#f1f5f9",
      roughness: 0.8,
    });

    // 후면 벽 (Top wall - 창문 위치)
    const backWallGeo = new THREE.BoxGeometry(rw + wallThick * 2, wallH, wallThick);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, wallH / 2, -halfD - wallThick / 2);
    backWall.receiveShadow = true;
    group.add(backWall);

    // 창문 프레임 및 투명 유리 (후면 벽 중앙)
    const winGeo = new THREE.BoxGeometry(180, 100, wallThick + 2);
    const winMat = new THREE.MeshStandardMaterial({
      color: "#38bdf8",
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(0, 90, -halfD - wallThick / 2);
    group.add(winMesh);

    // 좌측 벽 (Left wall)
    const leftWallGeo = new THREE.BoxGeometry(wallThick, wallH, rd);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-halfW - wallThick / 2, wallH / 2, 0);
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // 우측 벽 & 전면 벽은 시야 확보를 위해 30cm 낮은 반투명 가이드 벽으로 연출
    const lowWallMat = new THREE.MeshStandardMaterial({
      color: "#94a3b8",
      transparent: true,
      opacity: 0.2,
    });
    const rightLowWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, 30, rd),
      lowWallMat
    );
    rightLowWall.position.set(halfW + wallThick / 2, 15, 0);
    group.add(rightLowWall);

    const frontLowWall = new THREE.Mesh(
      new THREE.BoxGeometry(rw + wallThick * 2, 30, wallThick),
      lowWallMat
    );
    frontLowWall.position.set(0, 15, halfD + wallThick / 2);
    group.add(frontLowWall);

    // 4. 가구 3D 메시 인스턴스 생성
    placed.forEach((item) => {
      const meta = getFurnitureById(item.furnitureId);
      if (!meta) return;

      const fGroup = new THREE.Group();
      fGroup.name = item.instanceId;

      const isSelected = item.instanceId === selectedId;

      // 가구 카테고리별 특화 3D 모델링
      switch (meta.category) {
        case "bed": {
          // 침대 프레임
          const frameMat = new THREE.MeshStandardMaterial({
            color: isSelected ? "#3b82f6" : "#cbd5e1",
            roughness: 0.5,
          });
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width, 25, meta.depth),
            frameMat
          );
          frame.position.y = 12.5;
          frame.castShadow = true;
          frame.receiveShadow = true;
          fGroup.add(frame);

          // 매트리스 & 시트
          const mattMat = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 0.8,
          });
          const mattress = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width - 6, 20, meta.depth - 6),
            mattMat
          );
          mattress.position.y = 30;
          mattress.castShadow = true;
          fGroup.add(mattress);

          // 푹신한 베개 1개 또는 2개
          const pillowMat = new THREE.MeshStandardMaterial({ color: "#f8fafc" });
          const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width - 24, 8, 35),
            pillowMat
          );
          pillow.position.set(0, 42, -meta.depth / 2 + 30);
          pillow.castShadow = true;
          fGroup.add(pillow);

          // 헤드보드
          const headMat = new THREE.MeshStandardMaterial({
            color: isSelected ? "#2563eb" : "#94a3b8",
          });
          const headboard = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width, 45, 10),
            headMat
          );
          headboard.position.set(0, 35, -meta.depth / 2 + 5);
          headboard.castShadow = true;
          fGroup.add(headboard);
          break;
        }

        case "desk": {
          // 데스크 상판
          const topMat = new THREE.MeshStandardMaterial({
            color: isSelected ? "#3b82f6" : meta.color,
            roughness: 0.4,
          });
          const top = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width, 4, meta.depth),
            topMat
          );
          top.position.y = meta.height - 2;
          top.castShadow = true;
          fGroup.add(top);

          // 메탈 다리 4개
          const legMat = new THREE.MeshStandardMaterial({
            color: "#1e293b",
            metalness: 0.8,
            roughness: 0.2,
          });
          const legPositions = [
            [-meta.width / 2 + 4, (meta.height - 4) / 2, -meta.depth / 2 + 4],
            [meta.width / 2 - 4, (meta.height - 4) / 2, -meta.depth / 2 + 4],
            [-meta.width / 2 + 4, (meta.height - 4) / 2, meta.depth / 2 - 4],
            [meta.width / 2 - 4, (meta.height - 4) / 2, meta.depth / 2 - 4],
          ];
          legPositions.forEach(([lx, ly, lz]) => {
            const leg = new THREE.Mesh(
              new THREE.BoxGeometry(4, meta.height - 4, 4),
              legMat
            );
            leg.position.set(lx, ly, lz);
            leg.castShadow = true;
            fGroup.add(leg);
          });

          // 모니터 거치대 및 디스플레이 (컴퓨터 책상인 경우)
          if (meta.width >= 100) {
            const monStand = new THREE.Mesh(
              new THREE.BoxGeometry(16, 12, 10),
              legMat
            );
            monStand.position.set(0, meta.height + 6, -meta.depth / 2 + 15);
            fGroup.add(monStand);

            const screen = new THREE.Mesh(
              new THREE.BoxGeometry(50, 30, 3),
              new THREE.MeshStandardMaterial({
                color: "#0284c7",
                emissive: "#0284c7",
                emissiveIntensity: 0.4,
              })
            );
            screen.position.set(0, meta.height + 25, -meta.depth / 2 + 15);
            screen.castShadow = true;
            fGroup.add(screen);
          }
          break;
        }

        case "storage": {
          // 옷장/서랍장 본체
          const bodyMat = new THREE.MeshStandardMaterial({
            color: isSelected ? "#3b82f6" : meta.color,
            roughness: 0.6,
          });
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(meta.width, meta.height, meta.depth),
            bodyMat
          );
          body.position.y = meta.height / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          fGroup.add(body);

          // 실버 손잡이
          const handleMat = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            metalness: 0.9,
          });
          const handle = new THREE.Mesh(
            new THREE.BoxGeometry(3, 14, 3),
            handleMat
          );
          handle.position.set(0, meta.height / 2, meta.depth / 2 + 2);
          fGroup.add(handle);
          break;
        }

        case "living": {
          if (item.furnitureId === "rug_circle") {
            // 원형 러그
            const rugMat = new THREE.MeshStandardMaterial({
              color: meta.color,
              roughness: 0.9,
            });
            const rug = new THREE.Mesh(
              new THREE.CylinderGeometry(meta.width / 2, meta.width / 2, 1, 32),
              rugMat
            );
            rug.position.y = 1;
            rug.receiveShadow = true;
            fGroup.add(rug);
          } else {
            // 소파
            const sofaMat = new THREE.MeshStandardMaterial({
              color: isSelected ? "#3b82f6" : meta.color,
              roughness: 0.8,
            });
            // 하단 좌방석
            const seat = new THREE.Mesh(
              new THREE.BoxGeometry(meta.width, 35, meta.depth),
              sofaMat
            );
            seat.position.y = 17.5;
            seat.castShadow = true;
            fGroup.add(seat);

            // 등받이
            const back = new THREE.Mesh(
              new THREE.BoxGeometry(meta.width, meta.height - 35, 20),
              sofaMat
            );
            back.position.set(0, 35 + (meta.height - 35) / 2, -meta.depth / 2 + 10);
            back.castShadow = true;
            fGroup.add(back);
          }
          break;
        }
      }

      // 회전 및 좌표 배치
      fGroup.rotation.y = -(item.rotation * Math.PI) / 180;

      // 2D 좌상단 기준 좌표 -> 3D 중앙 기준 좌표로 매핑
      // 2D 박스 중심 구하기
      const isRot = item.rotation === 90 || item.rotation === 270;
      const bW = isRot ? meta.depth : meta.width;
      const bD = isRot ? meta.width : meta.depth;

      const posX = item.x + bW / 2 - halfW;
      const posZ = item.y + bD / 2 - halfD;

      fGroup.position.set(posX, 0, posZ);

      group.add(fGroup);
    });
  }, [template, placed, selectedId]);

  // 카메라 프리셋 전환
  const handleApplyPreset = (preset: "iso" | "top" | "front" | "window") => {
    setViewPreset(preset);
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    switch (preset) {
      case "iso":
        cameraAnglesRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.5, radius: 820 };
        break;
      case "top":
        cameraAnglesRef.current = { theta: 0, phi: 0.05, radius: 950 };
        break;
      case "front":
        cameraAnglesRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 850 };
        break;
      case "window":
        cameraAnglesRef.current = { theta: Math.PI, phi: Math.PI / 3, radius: 820 };
        break;
    }

    const { theta, phi, radius } = cameraAnglesRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 40, 0);
  };

  // 터치/마우스 드래그 카메라 궤도 회전
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.006;
    cameraAnglesRef.current.theta += dx * sensitivity;
    cameraAnglesRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2 - 0.05, cameraAnglesRef.current.phi - dy * sensitivity)
    );

    const { theta, phi, radius } = cameraAnglesRef.current;
    const camera = cameraRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 40, 0);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full max-w-[420px] aspect-[4/5] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {/* 상단 힌트 배지 */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-[11px] font-bold border border-white/10 flex items-center gap-1.5 pointer-events-none shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3D 룸 자유 회전 (드래그)</span>
        </div>

        {/* 우상단 카메라 시점 프리셋 버튼들 */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => handleApplyPreset("iso")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border transition cursor-pointer ${
              viewPreset === "iso"
                ? "bg-blue-600 text-white border-blue-400 shadow-md"
                : "bg-black/50 text-white/80 border-white/10 hover:bg-black/70"
            }`}
          >
            아이소 45°
          </button>
          <button
            onClick={() => handleApplyPreset("top")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border transition cursor-pointer ${
              viewPreset === "top"
                ? "bg-blue-600 text-white border-blue-400 shadow-md"
                : "bg-black/50 text-white/80 border-white/10 hover:bg-black/70"
            }`}
          >
            탑뷰 90°
          </button>
          <button
            onClick={() => handleApplyPreset("front")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border transition cursor-pointer ${
              viewPreset === "front"
                ? "bg-blue-600 text-white border-blue-400 shadow-md"
                : "bg-black/50 text-white/80 border-white/10 hover:bg-black/70"
            }`}
          >
            정면 시점
          </button>
          <button
            onClick={() => handleApplyPreset("window")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border transition cursor-pointer ${
              viewPreset === "window"
                ? "bg-blue-600 text-white border-blue-400 shadow-md"
                : "bg-black/50 text-white/80 border-white/10 hover:bg-black/70"
            }`}
          >
            창가 시점
          </button>
        </div>
      </div>
    </div>
  );
};
