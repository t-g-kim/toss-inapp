import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  Rotate3d,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Eye,
  Sliders,
} from "lucide-react";
import { BuildState, getPartOption, checkCompatibility } from "./engine";

interface Pc3DViewerProps {
  build: BuildState;
  height?: number;
  className?: string;
}

// 사실적인 하드웨어 PBR 재질 색상 팔레트
const MAT_COLORS = {
  pcbBlack: 0x121417,      // 무광 블랙 메인보드 기판
  metalDark: 0x27272a,     // 다크 건메탈 샤시 & GPU 슈라우드
  metalMid: 0x3f3f46,      // 섀시 프레임 & 방열판
  metalSilver: 0xd4d4d8,   // 브러시드 알루미늄 핀 & IHS 은색
  copper: 0xb45309,        // 히트파이프 & 전원부 구리
  gold: 0xf59e0b,          // PCIe 골드 핑거 & 단자
  whiteChassis: 0xf8fafc,  // 화이트 케이스/슈라우드
  woodWalnut: 0x78350f,    // Fractal North 우드 루버
  glassTint: 0x0f172a,     // 스모키 틴팅 강화유리
  fanBlade: 0x1e293b,      // 무광 블랙 팬 블레이드
  fanBladeWhite: 0xf1f5f9, // 반투명 화이트 ARGB 블레이드
  rgbCyan: 0x38bdf8,       // 시안 블루 ARGB LED
  rgbPink: 0xf472b6,       // 마젠타 핑크 ARGB LED
  rgbPurple: 0xa855f7,     // 퍼플 네온 ARGB LED
  danger: 0xef4444,        // 간섭 경고 레드
};

const CASE_DIMS: Record<string, { w: number; h: number; d: number; isPanoramic?: boolean; isWhite?: boolean; isWood?: boolean }> = {
  case1: { w: 2.0, h: 3.8, d: 3.8 },                                       // 앱코 NCORE 미니타워
  case5: { w: 2.2, h: 4.3, d: 4.2 },                                       // 잘만 i3 NEO 미들타워
  case6: { w: 2.3, h: 4.4, d: 4.3 },                                       // 마이크로닉스 Master M60 메쉬
  case2: { w: 2.3, h: 4.4, d: 4.3 },                                       // darkFlash DK352 미들타워
  case7: { w: 2.3, h: 4.5, d: 4.4, isWhite: true },                        // 앱코 G40 시그니처 화이트
  case8: { w: 2.4, h: 4.2, d: 4.3, isPanoramic: true },                    // 3RSYS S401 Quiet 어항
  case4: { w: 2.2, h: 3.6, d: 4.4, isPanoramic: true },                    // 존스보 D31 파노라마
  case9: { w: 2.5, h: 4.6, d: 4.6 },                                       // darkFlash DLX21 MESH
  case10: { w: 2.6, h: 4.6, d: 4.6, isPanoramic: true },                   // 안텍 C8 MESH 커브드
  case11: { w: 2.6, h: 4.5, d: 4.6, isPanoramic: true },                   // 몬텍 KING 95 PRO 어항
  case3: { w: 2.7, h: 4.8, d: 4.7, isPanoramic: true },                    // 리안리 O11D EVO RGB 빅타워
  case12: { w: 2.3, h: 4.5, d: 4.4, isWood: true },                        // Fractal Design North 우드
  case13: { w: 2.6, h: 4.7, d: 4.6, isPanoramic: true },                   // 리안리 O11 Vision 3면 유리
};

export const Pc3DViewer: React.FC<Pc3DViewerProps> = ({
  build,
  height = 340,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    group: THREE.Group;
    fans: THREE.Group[];
    animId?: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const issues = checkCompatibility(build);
  const hasIssue = (kw: string) => issues.some((i) => i.includes(kw));

  // Geometry & Material 해제 헬퍼
  const disposeGroup = (root: THREE.Group) => {
    root.traverse((o: any) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) {
          o.material.forEach((m) => m.dispose());
        } else {
          o.material.dispose();
        }
      }
    });
    root.clear();
  };

  // 실물 부품 메쉬 생성 엔진
  const buildRig = useCallback(() => {
    if (!sceneRef.current) return;
    const { group } = sceneRef.current;
    disposeGroup(group);
    sceneRef.current.fans = [];

    const cpu = getPartOption("cpu", build.cpu);
    const mb = getPartOption("mb", build.mb);
    const gpu = getPartOption("gpu", build.gpu);
    const ram = getPartOption("ram", build.ram);
    const st = getPartOption("storage", build.storage);
    const cl = getPartOption("cooler", build.cooler);
    const psu = getPartOption("psu", build.psu);
    const cs = getPartOption("case", build.case);

    const bad = {
      cpu: hasIssue("소켓"),
      ram: hasIssue("RAM 규격"),
      mb: hasIssue("폼팩터"),
      gpu: hasIssue("GPU 길이") || hasIssue("그래픽카드 길이"),
      cooler: hasIssue("쿨러 높이") || hasIssue("수랭 라디에이터"),
    };

    const caseInfo = cs && CASE_DIMS[cs.id] ? CASE_DIMS[cs.id] : CASE_DIMS.case2;
    const { w, h, d, isPanoramic, isWhite, isWood } = caseInfo;

    // --- 유틸 메쉬 생성기 ---
    const at = (obj: THREE.Object3D, x: number, y: number, z: number) => {
      obj.position.set(x, y, z);
      return obj;
    };

    // 실물 금속/플라스틱 PBR 박스
    const realBox = (
      bw: number,
      bh: number,
      bd: number,
      color: number,
      {
        metalness = 0.3,
        roughness = 0.5,
        transparent = false,
        opacity = 1,
        emissive = 0x000000,
        emissiveIntensity = 0,
      } = {}
    ) => {
      return new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, bd),
        new THREE.MeshStandardMaterial({
          color,
          metalness,
          roughness,
          transparent,
          opacity,
          emissive,
          emissiveIntensity,
        })
      );
    };

    // 실물 입체 쿨링팬 (중심 허브 + 7개 블레이드 날개)
    const create3DFan = (radius: number, isRgb = true) => {
      const fanGroup = new THREE.Group();

      // 바깥 원형 프레임 림
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(radius, radius * 0.08, 12, 32),
        new THREE.MeshStandardMaterial({
          color: isRgb ? MAT_COLORS.rgbCyan : MAT_COLORS.metalDark,
          emissive: isRgb ? MAT_COLORS.rgbCyan : 0x000000,
          emissiveIntensity: isRgb ? 0.7 : 0,
          metalness: 0.2,
          roughness: 0.6,
        })
      );
      fanGroup.add(rim);

      // 모터 중심 허브
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, radius * 0.15, 20),
        new THREE.MeshStandardMaterial({
          color: MAT_COLORS.metalDark,
          metalness: 0.6,
          roughness: 0.3,
        })
      );
      hub.rotation.x = Math.PI / 2;
      fanGroup.add(hub);

      // 회전하는 블레이드 서브그룹
      const bladesGroup = new THREE.Group();
      const bladeCount = 7;
      for (let b = 0; b < bladeCount; b++) {
        const bladeAngle = (b * Math.PI * 2) / bladeCount;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(radius * 0.65, radius * 0.16, radius * 0.04),
          new THREE.MeshStandardMaterial({
            color: isRgb ? MAT_COLORS.fanBladeWhite : MAT_COLORS.fanBlade,
            metalness: 0.1,
            roughness: 0.4,
            transparent: isRgb,
            opacity: isRgb ? 0.85 : 1,
            emissive: isRgb ? MAT_COLORS.rgbCyan : 0x000000,
            emissiveIntensity: isRgb ? 0.4 : 0,
          })
        );
        blade.position.set(
          Math.cos(bladeAngle) * radius * 0.45,
          Math.sin(bladeAngle) * radius * 0.45,
          0
        );
        blade.rotation.z = bladeAngle + 0.3;
        blade.rotation.y = 0.25;
        bladesGroup.add(blade);
      }
      fanGroup.add(bladesGroup);

      // 애니메이션 회전 목록에 등록
      sceneRef.current?.fans.push(bladesGroup);
      return fanGroup;
    };

    // 실물 호스/슬리빙 튜브
    const createTube = (points: THREE.Vector3[], r: number, color: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, r, 12, false),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.1,
        })
      );
    };

    // ==========================================
    // 1. PC 케이스 샤시 (PC Chassis & Glass Panel)
    // ==========================================
    const chassisColor = isWhite ? MAT_COLORS.whiteChassis : MAT_COLORS.metalDark;

    // 섀시 메인 프레임 (외곽 기둥)
    const frameMat = new THREE.MeshStandardMaterial({
      color: chassisColor,
      roughness: 0.4,
      metalness: 0.5,
    });

    // 섀시 상단 & 하단 베이스 판
    group.add(at(realBox(w, 0.08, d, chassisColor, { metalness: 0.6, roughness: 0.4 }), 0, h / 2 - 0.04, 0));
    group.add(at(realBox(w, 0.12, d, chassisColor, { metalness: 0.6, roughness: 0.4 }), 0, -h / 2 + 0.06, 0));

    // 섀시 후면 메탈 벽체 (I/O 포트 타공 및 배기팬 홀)
    group.add(at(realBox(w, h * 0.96, 0.06, chassisColor, { metalness: 0.5, roughness: 0.4 }), 0, 0, -d / 2 + 0.03));

    // 후면 120mm 배기 ARGB 쿨링팬
    const rearFan = create3DFan(0.38, true);
    group.add(at(rearFan, -w / 2 + 0.55, h * 0.18, -d / 2 + 0.15));

    // 하단 PSU 슈라우드 챔버 (파워 가림막)
    const psuShroudHeight = 0.95;
    group.add(
      at(
        realBox(w * 0.96, psuShroudHeight, d * 0.96, chassisColor, { metalness: 0.5, roughness: 0.4 }),
        0,
        -h / 2 + psuShroudHeight / 2 + 0.12,
        0
      )
    );

    // Fractal North 우드 케이스인 경우: 전면에 7개 원목 루버 장착!
    if (isWood) {
      const woodCount = 7;
      const slatW = 0.14;
      const slatGap = (w * 0.8) / woodCount;
      for (let s = 0; s < woodCount; s++) {
        const sx = -w * 0.4 + s * slatGap + slatGap / 2;
        group.add(
          at(
            realBox(slatW, h * 0.9, 0.08, MAT_COLORS.woodWalnut, {
              metalness: 0.0,
              roughness: 0.85,
            }),
            sx,
            0,
            d / 2 + 0.04
          )
        );
      }
    } else if (!isPanoramic) {
      // 일반 미들타워/메쉬 케이스: 전면 3련 120mm ARGB 흡기팬
      for (let f = 0; f < 3; f++) {
        const frontFan = create3DFan(0.42, true);
        frontFan.rotation.y = Math.PI;
        group.add(at(frontFan, 0, h * 0.28 - f * 0.95, d / 2 - 0.12));
      }
      // 전면 미세 메쉬 그릴
      const meshFront = realBox(w * 0.92, h * 0.92, 0.02, chassisColor, {
        transparent: true,
        opacity: 0.55,
        roughness: 0.9,
      });
      group.add(at(meshFront, 0, 0, d / 2));
    }

    // 좌측 클리어 강화유리 패널 (Side Tempered Glass)
    const sideGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(d * 0.96, h * 0.96),
      new THREE.MeshStandardMaterial({
        color: MAT_COLORS.glassTint,
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
      })
    );
    sideGlass.rotation.y = Math.PI / 2;
    sideGlass.position.x = w / 2 - 0.02;
    group.add(sideGlass);

    // 어항 파노라마 케이스인 경우: 전면도 통유리 쇼케이스!
    if (isPanoramic) {
      const frontGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.96, h * 0.96),
        new THREE.MeshStandardMaterial({
          color: MAT_COLORS.glassTint,
          transparent: true,
          opacity: 0.22,
          roughness: 0.05,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
      );
      frontGlass.position.z = d / 2 - 0.02;
      group.add(frontGlass);
    }

    // 고무 받침대 피트 (Rubber Feet 4개)
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const foot = realBox(0.25, 0.14, 0.25, 0x09090b, { roughness: 0.9, metalness: 0.1 });
      group.add(at(foot, sx * (w / 2 - 0.25), -h / 2 - 0.07, sz * (d / 2 - 0.3)));
    });

    // ==========================================
    // 2. 메인보드 (Motherboard PCB & Heatsinks)
    // ==========================================
    const isAtx = mb ? mb.form === "ATX" : true;
    const mbH = isAtx ? 3.3 : 2.7;
    const mbD = 2.65;
    const mbX = -w / 2 + 0.22;
    const mbY = h / 2 - 0.55 - mbH / 2;
    const mbZ = -0.05;

    // 블랙 메인보드 기판
    const mbPcb = realBox(0.05, mbH, mbD, bad.mb ? MAT_COLORS.danger : MAT_COLORS.pcbBlack, {
      metalness: 0.2,
      roughness: 0.8,
    });
    group.add(at(mbPcb, mbX, mbY, mbZ));

    // 리어 I/O 아머 실드 (Rear I/O Shield Cover)
    const ioShield = realBox(0.26, 0.6, 0.75, MAT_COLORS.metalDark, { metalness: 0.7, roughness: 0.3 });
    group.add(at(ioShield, mbX + 0.15, mbY + mbH / 2 - 0.38, mbZ - mbD / 2 + 0.42));

    // VRM 상단 & 좌측 대형 알루미늄 방열판
    const vrmTop = realBox(0.2, 0.25, 0.95, MAT_COLORS.metalSilver, { metalness: 0.85, roughness: 0.25 });
    group.add(at(vrmTop, mbX + 0.12, mbY + mbH * 0.42, mbZ + 0.05));
    const vrmLeft = realBox(0.2, 0.65, 0.25, MAT_COLORS.metalSilver, { metalness: 0.85, roughness: 0.25 });
    group.add(at(vrmLeft, mbX + 0.12, mbY + mbH * 0.22, mbZ - mbD * 0.28));

    // 칩셋 방열판 (Chipset Heatsink)
    const chipsetHs = realBox(0.12, 0.55, 0.55, MAT_COLORS.metalDark, { metalness: 0.7, roughness: 0.3 });
    group.add(at(chipsetHs, mbX + 0.08, mbY - mbH * 0.28, mbZ + 0.35));

    // PCIe x16 스틸 아머 슬롯 (은색 메탈 보강 슬롯)
    const pcieSlot = realBox(0.12, 0.14, 1.8, MAT_COLORS.metalSilver, { metalness: 0.9, roughness: 0.2 });
    const pcieY = mbY - mbH * 0.12;
    group.add(at(pcieSlot, mbX + 0.08, pcieY, mbZ - 0.1));

    // ==========================================
    // 3. CPU 소켓 & IHS 히트스프레더
    // ==========================================
    const cpuY = mbY + mbH * 0.18;
    const cpuZ = mbZ - 0.15;

    // CPU IHS (실버 니켈 도금 커버)
    const cpuIhs = realBox(0.08, 0.5, 0.5, bad.cpu ? MAT_COLORS.danger : MAT_COLORS.metalSilver, {
      metalness: 0.92,
      roughness: 0.2,
    });
    group.add(at(cpuIhs, mbX + 0.06, cpuY, cpuZ));

    // 소켓 브래킷 래치 레버
    const socketBracket = realBox(0.06, 0.62, 0.62, MAT_COLORS.metalMid, { metalness: 0.8, roughness: 0.4 });
    group.add(at(socketBracket, mbX + 0.04, cpuY, cpuZ));

    // ==========================================
    // 4. CPU 쿨러 (Tower Air Cooler vs AIO Liquid Cooler)
    // ==========================================
    if (cl && cl.type === "air" && cl.id === "cl1") {
      // 인텔/AMD 번들 기본 쿨러
      const stockCooler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.25, 24),
        new THREE.MeshStandardMaterial({ color: MAT_COLORS.metalDark, metalness: 0.5, roughness: 0.5 })
      );
      stockCooler.rotation.z = Math.PI / 2;
      group.add(at(stockCooler, mbX + 0.2, cpuY, cpuZ));
      const stockFan = create3DFan(0.35, false);
      stockFan.rotation.y = Math.PI / 2;
      group.add(at(stockFan, mbX + 0.35, cpuY, cpuZ));
    } else if (cl && cl.type === "air") {
      // 타워형 공랭 쿨러 (AK400 / PA120 SE / Phantom Spirit 대장급)
      const isDualTower = cl.id === "cl6" || cl.id === "cl9" || cl.id === "cl10";
      const towerH = 1.25;
      const towerD = 0.95;
      const towerThickness = isDualTower ? 0.38 : 0.48;

      // 히트싱크 알루미늄 핀 스택
      const finMat = new THREE.MeshStandardMaterial({
        color: bad.cooler ? MAT_COLORS.danger : MAT_COLORS.metalSilver,
        metalness: 0.85,
        roughness: 0.25,
      });

      if (isDualTower) {
        // 듀얼 타워 핀 스택 2개
        [-0.24, 0.24].forEach((tx) => {
          const finStack = new THREE.Mesh(new THREE.BoxGeometry(towerThickness, towerH, towerD), finMat);
          group.add(at(finStack, mbX + 0.55 + tx, cpuY + 0.1, cpuZ));
        });
        // 중앙 및 전면 팬 2개
        [-0.45, 0.02].forEach((fx) => {
          const towerFan = create3DFan(0.46, cl.id === "cl10");
          towerFan.rotation.y = Math.PI / 2;
          group.add(at(towerFan, mbX + 0.55 + fx, cpuY + 0.1, cpuZ));
        });
      } else {
        // 싱글 타워 핀 스택 1개
        const finStack = new THREE.Mesh(new THREE.BoxGeometry(towerThickness, towerH, towerD), finMat);
        group.add(at(finStack, mbX + 0.55, cpuY + 0.1, cpuZ));
        // 전면 120mm 쿨링팬
        const towerFan = create3DFan(0.46, false);
        towerFan.rotation.y = Math.PI / 2;
        group.add(at(towerFan, mbX + 0.82, cpuY + 0.1, cpuZ));
      }

      // 상단 구리 히트파이프 캡 돌기들 (4~6개)
      for (let p = 0; p < 4; p++) {
        const pipeCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.08, 10),
          new THREE.MeshStandardMaterial({ color: MAT_COLORS.copper, metalness: 0.9, roughness: 0.2 })
        );
        group.add(at(pipeCap, mbX + 0.55, cpuY + 0.1 + towerH / 2 + 0.04, cpuZ - 0.3 + p * 0.2));
      }
    } else if (cl && cl.type === "aio") {
      // 일체형 수랭 쿨러 (AIO Liquid - Kraken, Liquid Freezer, Aqua Elite)
      const radLen = (cl.rad || 360) / 100;
      const radY = h / 2 - 0.28;
      const fanCount = cl.rad === 360 ? 3 : 2;

      // 1. CPU 수랭 펌프 블록 (인피니티 미러 / LCD 디스플레이)
      const pumpBlock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.28, 28),
        new THREE.MeshStandardMaterial({
          color: MAT_COLORS.metalDark,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      pumpBlock.rotation.z = Math.PI / 2;
      group.add(at(pumpBlock, mbX + 0.22, cpuY, cpuZ));

      // 펌프 상단 발광 LCD/인피니티 링
      const lcdScreen = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 28),
        new THREE.MeshStandardMaterial({
          color: MAT_COLORS.rgbCyan,
          emissive: MAT_COLORS.rgbCyan,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          side: THREE.DoubleSide,
        })
      );
      lcdScreen.rotation.y = Math.PI / 2;
      group.add(at(lcdScreen, mbX + 0.37, cpuY, cpuZ));

      // 2. 상단 블랙 라디에이터
      const radiator = realBox(0.95, 0.24, radLen, bad.cooler ? MAT_COLORS.danger : MAT_COLORS.metalDark, {
        metalness: 0.7,
        roughness: 0.4,
      });
      group.add(at(radiator, 0, radY, 0));

      // 3. 라디에이터 장착 ARGB 쿨링팬 2~3개
      const fanSpacing = radLen / fanCount;
      for (let rf = 0; rf < fanCount; rf++) {
        const radFan = create3DFan(0.42, true);
        radFan.rotation.x = Math.PI / 2;
        group.add(at(radFan, 0, radY - 0.14, -radLen / 2 + fanSpacing / 2 + rf * fanSpacing));
      }

      // 4. 슬리빙 직조 튜브 2가닥 (유려한 곡선)
      const tubeZ = -radLen / 2 + 0.25;
      group.add(
        createTube(
          [
            new THREE.Vector3(mbX + 0.32, cpuY + 0.08, cpuZ - 0.15),
            new THREE.Vector3(mbX + 0.85, (cpuY + radY) / 2 + 0.2, cpuZ - 0.7),
            new THREE.Vector3(-0.15, radY - 0.14, tubeZ),
          ],
          0.045,
          0x09090b
        )
      );
      group.add(
        createTube(
          [
            new THREE.Vector3(mbX + 0.32, cpuY - 0.1, cpuZ - 0.25),
            new THREE.Vector3(mbX + 1.05, (cpuY + radY) / 2 - 0.1, cpuZ - 0.85),
            new THREE.Vector3(0.12, radY - 0.14, tubeZ + 0.25),
          ],
          0.045,
          0x09090b
        )
      );
    }

    // ==========================================
    // 5. 메모리 (RAM - Trident Z / ARGB Gaming Sticks)
    // ==========================================
    const ramStickCount = ram ? (build.ram === "ram1" ? 1 : build.ram === "ram10" || build.ram === "ram4" ? 4 : 2) : 0;
    const isRgbRam = ram ? ram.name.includes("RGB") || ram.name.includes("CL30") : false;

    for (let r = 0; r < 4; r++) {
      const rz = cpuZ + 0.65 + r * 0.18;
      const isPlugged = r < ramStickCount;

      if (isPlugged) {
        // 알루미늄 건메탈 히트스프레더 바디
        const ramBody = realBox(0.08, 1.3, 0.09, bad.ram ? MAT_COLORS.danger : MAT_COLORS.metalDark, {
          metalness: 0.8,
          roughness: 0.3,
        });
        group.add(at(ramBody, mbX + 0.15, cpuY - 0.05, rz));

        // 상단 ARGB 라이트 바 디퓨저
        const ramRgb = realBox(0.09, 0.16, 0.09, isRgbRam ? MAT_COLORS.rgbPurple : MAT_COLORS.metalSilver, {
          emissive: isRgbRam ? MAT_COLORS.rgbPurple : 0x000000,
          emissiveIntensity: isRgbRam ? 0.85 : 0,
          roughness: 0.2,
        });
        group.add(at(ramRgb, mbX + 0.15, cpuY + 0.62, rz));
      } else {
        // 빈 RAM 슬롯 래치
        const emptySlot = realBox(0.06, 1.25, 0.06, MAT_COLORS.metalMid, { opacity: 0.4, transparent: true });
        group.add(at(emptySlot, mbX + 0.1, cpuY - 0.05, rz));
      }
    }

    // ==========================================
    // 6. 그래픽카드 (GPU - Heavy Shroud, Triple Fans, Metal Backplate)
    // ==========================================
    const gpuY = pcieY - 0.24;
    const isIntegrated = gpu && gpu.price === 0;

    if (gpu && !isIntegrated && (gpu.len || 0) > 0) {
      const glen = (gpu.len || 240) / 100; // mm -> Three unit
      const isTripleFan = glen > 2.7;
      const gpuGroup = new THREE.Group();

      // 메인 묵직한 GPU 슈라우드 (다크 건메탈 메탈릭 하우징)
      const gpuShroud = realBox(0.85, 0.48, glen, bad.gpu ? MAT_COLORS.danger : MAT_COLORS.metalDark, {
        metalness: 0.75,
        roughness: 0.3,
      });
      gpuGroup.add(gpuShroud);

      // 상단 메탈 백플레이트 (브러시드 실버/다크 알루미늄 판)
      const backplate = realBox(0.85, 0.05, glen, MAT_COLORS.metalSilver, {
        metalness: 0.9,
        roughness: 0.2,
      });
      backplate.position.y = 0.265;
      gpuGroup.add(backplate);

      // 측면 RGB LED 로고 라인 (GEFORCE RTX / RADEON)
      const logoLine = realBox(0.86, 0.08, glen * 0.6, MAT_COLORS.rgbCyan, {
        emissive: MAT_COLORS.rgbCyan,
        emissiveIntensity: 0.95,
        roughness: 0.2,
      });
      logoLine.position.y = 0.18;
      gpuGroup.add(logoLine);

      // 하단 2팬 또는 3팬 쿨링팬들
      const gFanCount = isTripleFan ? 3 : 2;
      const gFanSpacing = (glen * 0.85) / gFanCount;
      for (let gf = 0; gf < gFanCount; gf++) {
        const gpuFan = create3DFan(0.34, false);
        gpuFan.rotation.x = Math.PI / 2;
        gpuFan.position.set(0, -0.26, -glen * 0.42 + gf * gFanSpacing + gFanSpacing / 2);
        gpuGroup.add(gpuFan);
      }

      // 후면 은색 메탈 I/O 브래킷 (PCIe 슬롯 고정판)
      const pcieBracket = realBox(0.12, 0.75, 0.04, MAT_COLORS.metalSilver, { metalness: 0.9, roughness: 0.2 });
      pcieBracket.position.set(-0.4, 0.05, -glen / 2 - 0.02);
      gpuGroup.add(pcieBracket);

      // PCIe 12VHPWR / 8핀 보조전원 케이블 연결
      group.add(
        createTube(
          [
            new THREE.Vector3(mbX + 0.65, -h / 2 + 1.1, 0.5),
            new THREE.Vector3(mbX + 0.85, gpuY - 0.4, 0.3),
            new THREE.Vector3(mbX + 0.68, gpuY + 0.15, -mbD / 2 + glen - 0.2),
          ],
          0.04,
          0x0f172a
        )
      );

      group.add(at(gpuGroup, mbX + 0.68, gpuY, -mbD / 2 + glen / 2 + 0.1));
    }

    // ==========================================
    // 7. 저장장치 (M.2 NVMe SSD Heatsink)
    // ==========================================
    if (st) {
      // M.2 NVMe 슬롯에 안착된 알루미늄 M.2 방열판
      const m2Heatsink = realBox(0.06, 0.15, 0.8, MAT_COLORS.metalSilver, {
        metalness: 0.88,
        roughness: 0.2,
      });
      group.add(at(m2Heatsink, mbX + 0.06, pcieY + 0.35, mbZ + 0.2));
    }

    // ==========================================
    // 8. 파워서플라이 (PSU - 80PLUS Gold Chamber)
    // ==========================================
    const psuY = -h / 2 + 0.52;
    const psuZ = -d / 2 + 0.85;

    if (psu) {
      // 무광 블랙 파워 본체
      const psuBody = realBox(1.5, 0.86, 1.4, MAT_COLORS.metalDark, { metalness: 0.6, roughness: 0.4 });
      group.add(at(psuBody, 0, psuY, psuZ));

      // 파워 120mm 흡기팬 팬 그릴 (골드/블랙 링)
      const psuGrill = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.42, 24),
        new THREE.MeshStandardMaterial({
          color: MAT_COLORS.gold,
          metalness: 0.9,
          roughness: 0.2,
          side: THREE.DoubleSide,
        })
      );
      psuGrill.rotation.y = Math.PI / 2;
      group.add(at(psuGrill, 0.76, psuY, psuZ));

      // 24핀 메인 파워 케이블 번들 (직조 슬리빙 튜브)
      group.add(
        createTube(
          [
            new THREE.Vector3(0, psuY + 0.45, psuZ + 0.55),
            new THREE.Vector3(mbX + 0.95, -h / 2 + 1.25, 0.85),
            new THREE.Vector3(mbX + 0.16, mbY, mbZ + mbD / 2 - 0.25),
          ],
          0.05,
          0x18181b
        )
      );
    }
  }, [build, issues]);

  // Three.js Scene, Camera, Studio Lighting & Loop 초기화
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const heightPx = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(5.8, 3.8, 6.4);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.outline = "none";
    renderer.domElement.style.cursor = "grab";

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ==========================================
    // 시네마틱 스튜디오 3점 조명 (Studio Lighting)
    // ==========================================
    // 1. 메인 키 라이트 (Key Light) - 상단 전면 45도 자연광
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    // 2. 필 라이트 (Fill Light) - 좌측 부드러운 보조광
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.4);
    fillLight.position.set(-6, 3, 2);
    scene.add(fillLight);

    // 3. 림 라이트 (Rim Light) - 후면 메탈릭 실루엣 하이라이트
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-3, -2, -6);
    scene.add(rimLight);

    // 4. 시스템 내부 은은한 앰비언트 환경광
    const ambLight = new THREE.AmbientLight(0x1e293b, 1.1);
    scene.add(ambLight);

    // 5. 케이스 내부 ARGB 핑크/퍼플 포인트 라이트
    const rgbPoint = new THREE.PointLight(0xf472b6, 1.2, 8);
    rgbPoint.position.set(0.5, 0.8, 0.5);
    scene.add(rgbPoint);

    const group = new THREE.Group();
    scene.add(group);

    sceneRef.current = { scene, camera, renderer, group, fans: [] };

    // 애니메이션 렌더링 루프 (자동 회전 + 실물 팬 회전)
    const animate = () => {
      const animId = requestAnimationFrame(animate);
      if (sceneRef.current) {
        sceneRef.current.animId = animId;

        // 자동 회전
        if (!isDraggingRef.current && autoRotateRef.current) {
          group.rotation.y += 0.0035;
        }

        // 쿨링팬 고속 회전 애니메이션 (실제 구동 효과)
        sceneRef.current.fans.forEach((f) => {
          f.rotation.z += 0.12;
        });

        renderer.render(scene, camera);
      }
    };
    animate();

    const ro = new ResizeObserver(() => {
      if (!container || !sceneRef.current) return;
      const cw = container.clientWidth || 360;
      const ch = heightPx;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    ro.observe(container);

    // 터치 & 마우스 드래그 핸들러
    const onStart = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: clientX, y: clientY };
      renderer.domElement.style.cursor = "grabbing";
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !sceneRef.current) return;
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      group.rotation.y += dx * 0.007;
      group.rotation.x += dy * 0.005;
      group.rotation.x = Math.max(-0.65, Math.min(0.65, group.rotation.x));
      lastPosRef.current = { x: clientX, y: clientY };
    };

    const onEnd = () => {
      isDraggingRef.current = false;
      renderer.domElement.style.cursor = "grab";
    };

    const onMouseDown = (e: MouseEvent) => onStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onMouseUp = () => onEnd();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => onEnd();

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    buildRig();

    return () => {
      if (sceneRef.current?.animId) {
        cancelAnimationFrame(sceneRef.current.animId);
      }
      ro.disconnect();
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (sceneRef.current) {
        disposeGroup(sceneRef.current.group);
        sceneRef.current.renderer.dispose();
      }
      sceneRef.current = null;
    };
  }, [height, buildRig]);

  // 카메라 시점 프리셋
  const setCameraAngle = (type: "front" | "side" | "iso") => {
    if (!sceneRef.current) return;
    const { group, camera } = sceneRef.current;
    group.rotation.set(0, 0, 0);

    if (type === "front") {
      camera.position.set(0, 0.5, 8.2);
    } else if (type === "side") {
      camera.position.set(7.8, 0.6, 0);
    } else {
      camera.position.set(5.8, 3.8, 6.4);
    }
    camera.lookAt(0, -0.1, 0);
  };

  const gpuOpt = getPartOption("gpu", build.gpu);
  const coolerOpt = getPartOption("cooler", build.cooler);
  const caseOpt = getPartOption("case", build.case);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#0f141c] via-[#141b26] to-[#0a0d14] border border-slate-800 shadow-2xl select-none ${className}`}
      style={{ height }}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 좌측 상단: 장착 부품 스펙 뱃지 */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10 max-w-[65%]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-[10px] text-sky-400 font-extrabold shadow-sm w-fit">
          <Rotate3d className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="whitespace-nowrap">실물 3D 조립 시뮬레이션</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-0.5 text-[9px] text-slate-300">
          {gpuOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate font-semibold">
              {gpuOpt.name}
            </span>
          )}
          {coolerOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate font-semibold">
              {coolerOpt.type === "aio" ? `${coolerOpt.rad}mm 수랭` : "타워 공랭"}
            </span>
          )}
          {caseOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate font-semibold">
              {caseOpt.name}
            </span>
          )}
        </div>
      </div>

      {/* 우측 상단: 카메라 프리셋 & 회전 제어 버튼들 */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        {/* 카메라 각도 전환 버튼 */}
        <div className="flex items-center bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-0.5">
          <button
            onClick={() => setCameraAngle("iso")}
            className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="입체 뷰"
          >
            입체
          </button>
          <button
            onClick={() => setCameraAngle("side")}
            className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="측면 내부 뷰"
          >
            측면
          </button>
          <button
            onClick={() => setCameraAngle("front")}
            className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="정면 뷰"
          >
            정면
          </button>
        </div>

        {/* 자동 회전 토글 */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer border ${
            autoRotate
              ? "bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30"
              : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
          }`}
          title={autoRotate ? "자동 회전 끄기" : "자동 회전 켜기"}
          aria-label="자동 회전 토글"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* 시점 초기화 */}
        <button
          onClick={() => setCameraAngle("iso")}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title="카메라 시점 초기화"
          aria-label="카메라 시점 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 하단 제스처 가이드 */}
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none z-10 px-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] text-slate-300 shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="whitespace-nowrap">손가락으로 360° 자유 회전 및 팬 회전 감상</span>
        </div>
      </div>

      {/* 부품 간섭 경고 표시 */}
      {issues.length > 0 && (
        <div className="absolute bottom-11 right-3 z-10 pointer-events-none animate-pulse">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/90 border border-rose-500 text-rose-300 text-[10px] font-extrabold shadow-lg">
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            <span>간섭 부품 붉은색 표시</span>
          </div>
        </div>
      )}
    </div>
  );
};
