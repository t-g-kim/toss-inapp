import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Rotate3d, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { BuildState, getPartOption, checkCompatibility } from "./engine";

interface Pc3DViewerProps {
  build: BuildState;
  height?: number;
  className?: string;
}

const COL = {
  line: 0x4f7fa8,
  bright: 0x38bdf8,
  copper: 0xf59e0b,
  silver: 0xe2e8f0,
  green: 0x10b981,
  danger: 0xef4444,
  panel: 0x0f172a,
  frame: 0x1e293b,
  rgbPink: 0xf472b6,
};

const CASE_DIMS: Record<string, { w: number; h: number; d: number }> = {
  case1: { w: 2.0, h: 3.9, d: 3.9 }, // 앱코 미니타워
  case2: { w: 2.3, h: 4.4, d: 4.3 }, // darkFlash 미들타워
  case3: { w: 2.6, h: 4.8, d: 4.7 }, // 리안리 O11D EVO 빅타워
  case4: { w: 2.1, h: 3.5, d: 4.4 }, // 존스보 D31 파노라마
};

export const Pc3DViewer: React.FC<Pc3DViewerProps> = ({
  build,
  height = 320,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    group: THREE.Group;
    animId?: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const issues = checkCompatibility(build);
  const hasIssue = (kw: string) => issues.some((i) => i.includes(kw));

  // Geometry disposal helper to prevent memory leaks
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

  // Build the 3D rig according to currently selected parts
  const buildRig = useCallback(() => {
    if (!sceneRef.current) return;
    const { group } = sceneRef.current;
    disposeGroup(group);

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

    const dims = cs && CASE_DIMS[cs.id] ? CASE_DIMS[cs.id] : CASE_DIMS.case2;
    const { w, h, d } = dims;

    // Helpers
    const at = (obj: THREE.Object3D, x: number, y: number, z: number) => {
      obj.position.set(x, y, z);
      return obj;
    };

    const wireBox = (bw: number, bh: number, bd: number, color: number, opacity = 1) => {
      return new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(bw, bh, bd)),
        new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
      );
    };

    const solidBox = (bw: number, bh: number, bd: number, color: number, opacity = 0.85) => {
      return new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, bd),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity,
        })
      );
    };

    const part = (bw: number, bh: number, bd: number, color: number, { on = true, opacity = 0.8 } = {}) => {
      const g = new THREE.Group();
      if (on) g.add(solidBox(bw, bh, bd, color, opacity));
      g.add(wireBox(bw, bh, bd, on ? color : COL.line, on ? 1 : 0.45));
      return g;
    };

    const fanRing = (r: number, color: number, opacity = 1) => {
      return new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.RingGeometry(r * 0.3, r, 24)),
        new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
      );
    };

    const cyl = (r: number, len: number, color: number, opacity = 0.85) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, len, 20),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity,
        })
      );
      m.rotation.z = Math.PI / 2;
      return m;
    };

    const tube = (points: THREE.Vector3[], r: number, color: number) => {
      return new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, r, 6, false),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 })
      );
    };

    // 1. Chassis Case (Wireframe Frame + Tempered Glass Side + Intake Fans)
    group.add(wireBox(w, h, d, cs ? COL.copper : COL.line, cs ? 0.95 : 0.4));
    if (cs) {
      // Tempered glass left side
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(d * 0.94, h * 0.94),
        new THREE.MeshBasicMaterial({
          color: COL.panel,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
        })
      );
      glass.rotation.y = Math.PI / 2;
      glass.position.x = w / 2 - 0.01;
      group.add(glass);

      // Front panel
      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.94, h * 0.94),
        new THREE.MeshBasicMaterial({
          color: COL.panel,
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
        })
      );
      front.position.z = d / 2 - 0.01;
      group.add(front);

      // Front intake fan rings (2 or 3 fans)
      const fanCount = cs.id === "case1" || cs.id === "case4" ? 2 : 3;
      for (let i = 0; i < fanCount; i++) {
        group.add(at(fanRing(0.38, COL.bright, 0.85), 0, h * 0.28 - i * 0.92, d / 2 + 0.01));
      }

      // Case rubber feet
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].forEach(([sx, sz]) =>
        group.add(
          at(
            part(0.3, 0.14, 0.3, COL.frame, { opacity: 0.9 }),
            sx * (w / 2 - 0.3),
            -h / 2 - 0.07,
            sz * (d / 2 - 0.35)
          )
        )
      );
    }

    // 2. Motherboard (ATX: 3.2 vs mATX: 2.6)
    const bh = mb ? (mb.form === "ATX" ? 3.2 : 2.6) : 2.8;
    const bd = 2.55;
    const bx = -w / 2 + 0.18;
    const by = h / 2 - 0.5 - bh / 2;
    const bz = 0;
    group.add(
      at(
        part(0.06, bh, bd, bad.mb ? COL.danger : COL.bright, { on: !!mb, opacity: 0.45 }),
        bx,
        by,
        bz
      )
    );

    if (mb) {
      const mcol = bad.mb ? COL.danger : COL.silver;
      group.add(at(part(0.3, 0.5, 0.6, mcol, { opacity: 0.65 }), bx + 0.17, by + bh / 2 - 0.4, bz - bd / 2 + 0.45)); // Rear IO shield
      group.add(at(part(0.24, 0.2, 0.95, mcol, { opacity: 0.65 }), bx + 0.15, by + bh * 0.44, bz + 0.1)); // VRM Heatsink
      group.add(at(part(0.1, 0.45, 0.45, mcol, { opacity: 0.55 }), bx + 0.08, by - bh * 0.3, bz + 0.35)); // Chipset Heatsink
    }

    // 3. CPU Socket & Heat Spreader
    const cpuY = by + bh * 0.2;
    const cpuZ = bz - 0.2;
    group.add(
      at(
        part(0.1, 0.44, 0.44, bad.cpu ? COL.danger : COL.copper, { on: !!cpu }),
        bx + 0.08,
        cpuY,
        cpuZ
      )
    );

    // 4. CPU Cooler (Air Tower vs AIO Liquid)
    const coolCol = bad.cooler ? COL.danger : cl && cl.type === "aio" ? COL.bright : COL.silver;
    if (!cl) {
      group.add(at(part(1.0, 1.2, 0.9, COL.line, { on: false }), bx + 0.68, cpuY, cpuZ));
    } else if (cl.type === "air" && cl.id === "cl1") {
      // Basic stock cooler
      group.add(at(cyl(0.36, 0.3, coolCol), bx + 0.3, cpuY, cpuZ));
      const fr = fanRing(0.32, coolCol);
      fr.rotation.y = Math.PI / 2;
      group.add(at(fr, bx + 0.47, cpuY, cpuZ));
    } else if (cl.type === "air") {
      // Tower air cooler fins + fan
      const outer = (cl.height || 155) / 130;
      const fins = new THREE.Group();
      const n = 7;
      for (let i = 0; i < n; i++) {
        fins.add(at(wireBox(0.02, 1.0, 0.85, coolCol, 0.8), 0.32 + (i * (outer - 0.4)) / (n - 1), 0, 0));
      }
      fins.add(at(part(0.1, 1.05, 0.14, coolCol, { opacity: 0.6 }), 0.32 + (outer - 0.4) / 2, 0, 0.52));
      fins.add(at(fanRing(0.4, coolCol), 0.32 + (outer - 0.4) / 2, 0, 0.6));
      group.add(at(fins, bx, cpuY, cpuZ));
    } else {
      // AIO Liquid Cooler (Pump + Radiator + Braided Tubes)
      group.add(at(cyl(0.28, 0.24, coolCol, 0.95), bx + 0.22, cpuY, cpuZ)); // Pump block
      const radLen = (cl.rad || 240) / 100;
      const radY = h / 2 - 0.28;
      group.add(at(part(0.9, 0.2, radLen, coolCol, { opacity: 0.7 }), 0, radY, 0)); // Top Radiator
      const fanCount2 = (cl.rad || 240) / 120;
      for (let i = 0; i < fanCount2; i++) {
        const fr = fanRing(0.38, coolCol, 0.9);
        fr.rotation.x = Math.PI / 2;
        group.add(at(fr, 0, radY - 0.12, -radLen / 2 + 0.6 + i * 1.2));
      }
      const tz = -radLen / 2 + 0.15;
      group.add(
        tube(
          [
            new THREE.Vector3(bx + 0.3, cpuY + 0.05, cpuZ - 0.15),
            new THREE.Vector3(bx + 0.7, (cpuY + radY) / 2, cpuZ - 0.7),
            new THREE.Vector3(-0.1, radY - 0.12, tz),
          ],
          0.035,
          coolCol
        )
      );
      group.add(
        tube(
          [
            new THREE.Vector3(bx + 0.3, cpuY - 0.1, cpuZ - 0.25),
            new THREE.Vector3(bx + 0.85, (cpuY + radY) / 2 - 0.2, cpuZ - 0.85),
            new THREE.Vector3(0.1, radY - 0.12, tz + 0.15),
          ],
          0.035,
          coolCol
        )
      );
    }

    // 5. RAM Slots (2 sticks)
    const ramCount = ram ? (build.ram === "ram1" ? 1 : 2) : 0;
    [0.72, 0.9].forEach((dz, i) => {
      group.add(
        at(
          part(0.32, 1.25, 0.07, bad.ram ? COL.danger : COL.bright, { on: i < ramCount }),
          bx + 0.2,
          cpuY - 0.1,
          cpuZ + dz
        )
      );
    });

    // 6. GPU (Real millimeter length ratio + dual/triple fans + backplate)
    const gpuY = by - bh * 0.16;
    if (gpu && (gpu.len || 0) > 0) {
      const glen = (gpu.len || 240) / 100;
      const gcol = bad.gpu ? COL.danger : (gpu.score || 0) > 85 ? COL.copper : COL.bright;
      const g = new THREE.Group();
      g.add(part(1.0, 0.5, glen, gcol, { opacity: 0.75 }));
      g.add(at(part(1.0, 0.05, glen, COL.silver, { opacity: 0.5 }), 0, 0.29, 0)); // Backplate
      const fanCount3 = glen > 3 ? 3 : 2;
      for (let i = 0; i < fanCount3; i++) {
        const fr = fanRing(0.34, gcol);
        fr.rotation.x = Math.PI / 2;
        g.add(at(fr, 0, -0.27, -glen / 2 + 0.55 + (i * (glen - 1.1)) / Math.max(1, fanCount3 - 1)));
      }
      group.add(at(g, bx + 0.72, gpuY, bz - bd / 2 + glen / 2 + 0.05));
    } else if (gpu) {
      // Integrated GPU badge
      group.add(at(part(0.08, 0.3, 0.3, COL.bright, { opacity: 0.5 }), bx + 0.07, gpuY, bz + 0.5));
    } else {
      group.add(at(part(1.0, 0.5, 2.6, COL.line, { on: false }), bx + 0.72, gpuY, bz - bd / 2 + 1.35));
    }

    // 7. Storage (NVMe M.2 or SATA drive)
    if (st && st.id === "st5") {
      // M.2 NVMe on motherboard PCB
      group.add(at(part(0.06, 0.2, 0.7, COL.green, { opacity: 0.9 }), bx + 0.06, gpuY - 0.55, bz + 0.55));
    } else if (st) {
      const drv =
        st.id === "st2"
          ? part(0.7, 0.1, 1.0, COL.green, { opacity: 0.75 })
          : part(0.95, 0.26, 1.4, COL.green, { opacity: 0.75 });
      group.add(at(drv, w / 2 - 0.6, -h / 2 + 0.45, d / 2 - 0.9));
    } else {
      group.add(at(part(0.95, 0.26, 1.4, COL.line, { on: false }), w / 2 - 0.6, -h / 2 + 0.45, d / 2 - 0.9));
    }

    // 8. PSU (Power Supply Chamber + 24-Pin and PCIe Braided Cables)
    const psuY2 = -h / 2 + 0.5;
    const psuZ = -d / 2 + 0.8;
    if (psu) {
      const p = new THREE.Group();
      p.add(part(1.5, 0.85, 1.4, COL.copper, { opacity: 0.7 }));
      const fr = fanRing(0.3, COL.copper);
      fr.rotation.y = Math.PI / 2;
      p.add(at(fr, 0.76, 0, 0));
      group.add(at(p, 0, psuY2, psuZ));

      if (mb) {
        // 24-Pin main power cable tube
        group.add(
          tube(
            [
              new THREE.Vector3(0, psuY2 + 0.45, psuZ + 0.6),
              new THREE.Vector3(bx + 0.9, -h / 2 + 1.3, 0.9),
              new THREE.Vector3(bx + 0.12, by, bz + bd / 2 - 0.2),
            ],
            0.045,
            COL.copper
          )
        );
      }
      if (gpu && (gpu.len || 0) > 0) {
        // PCIe 8-pin power cable tube
        const glen2 = (gpu.len || 240) / 100;
        group.add(
          tube(
            [
              new THREE.Vector3(0.3, psuY2 + 0.45, psuZ + 0.3),
              new THREE.Vector3(bx + 1.2, gpuY - 0.6, 0.4),
              new THREE.Vector3(bx + 0.8, gpuY + 0.2, bz - bd / 2 + glen2 - 0.25),
            ],
            0.04,
            COL.copper
          )
        );
      }
    } else {
      group.add(at(part(1.5, 0.85, 1.4, COL.line, { on: false }), 0, psuY2, psuZ));
    }
  }, [build, issues]);

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const heightPx = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 100);
    camera.position.set(5.6, 4.0, 6.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.outline = "none";
    renderer.domElement.style.cursor = "grab";

    // Clean previous children if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const pLight1 = new THREE.PointLight(0x7dc4f0, 1.5, 0, 0);
    pLight1.position.set(4, 5, 5);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(COL.rgbPink, 0.9, 0, 0);
    pLight2.position.set(-4, -2, -3);
    scene.add(pLight2);

    const ambLight = new THREE.AmbientLight(0x223344, 1.3);
    scene.add(ambLight);

    const group = new THREE.Group();
    scene.add(group);

    sceneRef.current = { scene, camera, renderer, group };

    // Animation loop
    const animate = () => {
      const animId = requestAnimationFrame(animate);
      if (sceneRef.current) {
        sceneRef.current.animId = animId;
        if (!isDraggingRef.current && autoRotateRef.current) {
          group.rotation.y += 0.0035;
        }
        renderer.render(scene, camera);
      }
    };
    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!container || !sceneRef.current) return;
      const cw = container.clientWidth || 360;
      const ch = heightPx;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    ro.observe(container);

    // Touch & Mouse Drag Rotation Handlers
    const onStart = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: clientX, y: clientY };
      setIsInteracting(true);
      renderer.domElement.style.cursor = "grabbing";
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !sceneRef.current) return;
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      group.rotation.y += dx * 0.007;
      group.rotation.x += dy * 0.005;
      group.rotation.x = Math.max(-0.6, Math.min(0.6, group.rotation.x));
      lastPosRef.current = { x: clientX, y: clientY };
    };

    const onEnd = () => {
      isDraggingRef.current = false;
      setIsInteracting(false);
      renderer.domElement.style.cursor = "grab";
    };

    const onMouseDown = (e: MouseEvent) => {
      onStart(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      onEnd();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      onEnd();
    };

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
  }, [height]);

  // Update rig whenever build or parts change
  useEffect(() => {
    buildRig();
  }, [buildRig]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (!sceneRef.current) return;
    const { group, camera } = sceneRef.current;
    group.rotation.set(0, 0, 0);
    camera.position.set(5.6, 4.0, 6.6);
    camera.lookAt(0, 0, 0);
  };

  const gpuOpt = getPartOption("gpu", build.gpu);
  const coolerOpt = getPartOption("cooler", build.cooler);
  const caseOpt = getPartOption("case", build.case);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl select-none ${className}`}
      style={{ height }}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Installed Rig Specs Tag */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10 max-w-[65%]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] text-sky-300 font-extrabold shadow-sm w-fit">
          <Rotate3d className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="whitespace-nowrap">3D 실시간 조립 뷰</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-0.5 text-[9px] text-slate-300">
          {gpuOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate">
              {gpuOpt.name}
            </span>
          )}
          {coolerOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate">
              {coolerOpt.type === "aio" ? `${coolerOpt.rad}mm 수랭` : "타워 공랭"}
            </span>
          )}
          {caseOpt && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 truncate">
              {caseOpt.name}
            </span>
          )}
        </div>
      </div>

      {/* Top Right: Controls (Auto-Rotate, Reset Camera) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
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

        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title="카메라 시점 초기화"
          aria-label="카메라 시점 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Center: Gesture Guide Badge */}
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none z-10 px-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/70 text-[10px] text-slate-300 shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="whitespace-nowrap">손가락으로 360° 회전하여 부품 장착을 확인하세요</span>
        </div>
      </div>

      {/* Bottom Right / Warning Indicator if any */}
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
