import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import Icon from '@/components/ui/icon';

// ── Данные ───────────────────────────────────────────────────────────────────

const FLOOR_HEIGHT = 1.6;
const FLOOR_GAP = 0.15;

type RoomDef = {
  id: string;
  label: string;
  name: string;
  floor: number; // 1..4
  x: number; z: number; w: number; d: number;
  type: 'room' | 'corridor' | 'stair' | 'entrance';
};

// Координаты: X — горизонталь, Z — глубина, Y — высота (этажи)
const ROOMS: RoomDef[] = [
  // ── Коридор (на каждом этаже)
  ...([1, 2, 3, 4] as const).map(f => ({
    id: `corr-${f}`, label: '', name: 'Коридор', floor: f,
    x: 0, z: 0, w: 9, d: 1.2, type: 'corridor' as const,
  })),
  // ── Лестница
  ...([1, 2, 3, 4] as const).map(f => ({
    id: `stair-${f}`, label: '▲', name: 'Лестница', floor: f,
    x: 4.8, z: 0, w: 1.2, d: 2.4, type: 'stair' as const,
  })),
  // ── Вход (1 этаж)
  { id: 'entrance', label: '🚪', name: 'Вход', floor: 1, x: 1, z: 2, w: 1.6, d: 1.2, type: 'entrance' },

  // ── 1 этаж
  { id: '101', label: '101', name: 'Гардероб',        floor: 1, x: -4,  z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '102', label: '102', name: 'Столовая',         floor: 1, x: -1.5,z: -2, w: 2.5, d: 1.8, type: 'room' },
  { id: '107', label: '107', name: 'Медпункт',         floor: 1, x: 1.5, z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '108', label: '108', name: 'Рус. язык',        floor: 1, x: 3.5, z: -2, w: 2.2, d: 1.8, type: 'room' },

  // ── 2 этаж
  { id: '201', label: '201', name: 'Математика',       floor: 2, x: -4,  z: -2, w: 2.5, d: 1.8, type: 'room' },
  { id: '204', label: '204', name: 'Геометрия',        floor: 2, x: -1,  z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '206', label: '206', name: 'Англ. язык',       floor: 2, x: 1.5, z: -2, w: 2.2, d: 1.8, type: 'room' },
  { id: '210', label: '210', name: 'История',          floor: 2, x: 3.8, z: -2, w: 2.2, d: 1.8, type: 'room' },

  // ── 3 этаж
  { id: '301', label: '301', name: 'Химия',            floor: 3, x: -4,  z: -2, w: 2.2, d: 1.8, type: 'room' },
  { id: '302', label: '302', name: 'Информатика',      floor: 3, x: -1.5,z: -2, w: 2.5, d: 1.8, type: 'room' },
  { id: '310', label: '310', name: 'Биология',         floor: 3, x: 1.5, z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '314', label: '314', name: 'География',        floor: 3, x: 3.8, z: -2, w: 2.2, d: 1.8, type: 'room' },

  // ── 4 этаж
  { id: '401', label: '401', name: 'ИЗО',              floor: 4, x: -4,  z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '402', label: '402', name: 'Музыка',           floor: 4, x: -1.5,z: -2, w: 2,   d: 1.8, type: 'room' },
  { id: '410', label: '410', name: 'Астрономия',       floor: 4, x: 1.2, z: -2, w: 2.2, d: 1.8, type: 'room' },
  { id: '415', label: '415', name: 'Администрация',    floor: 4, x: 3.8, z: -2, w: 2.5, d: 1.8, type: 'room' },
];

const SELECTABLE = ROOMS.filter(r => r.type === 'room' || r.id === 'entrance');

const roomCenter = (r: RoomDef) => ({
  x: r.x + r.w / 2,
  y: (r.floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP) + FLOOR_HEIGHT / 2,
  z: r.z - r.d / 2,
});

const stairCenter = (floor: number) => {
  const s = ROOMS.find(r => r.id === `stair-${floor}`)!;
  return {
    x: s.x + s.w / 2,
    y: (floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP) + FLOOR_HEIGHT / 2,
    z: s.z - s.d / 2,
  };
};

const corrY = (floor: number) =>
  (floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP) + FLOOR_HEIGHT / 2;

// Строим цепочку точек маршрута
function buildPath(from: RoomDef, to: RoomDef): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const a = roomCenter(from);
  const b = roomCenter(to);

  if (from.floor === to.floor) {
    const cy = corrY(from.floor);
    pts.push(
      new THREE.Vector3(a.x, a.y, a.z),
      new THREE.Vector3(a.x, cy, 0.6),
      new THREE.Vector3(b.x, cy, 0.6),
      new THREE.Vector3(b.x, b.y, b.z),
    );
  } else {
    const sc = stairCenter(from.floor);
    const step = from.floor < to.floor ? 1 : -1;
    pts.push(new THREE.Vector3(a.x, a.y, a.z));
    pts.push(new THREE.Vector3(a.x, corrY(from.floor), 0.6));
    pts.push(new THREE.Vector3(sc.x, corrY(from.floor), 0.6));

    for (let f = from.floor; f !== to.floor; f += step) {
      const yBottom = corrY(f);
      const yTop = corrY(f + step);
      pts.push(new THREE.Vector3(sc.x, yBottom, 0.6));
      pts.push(new THREE.Vector3(sc.x, yTop, 0.6));
    }

    const sc2 = stairCenter(to.floor);
    pts.push(new THREE.Vector3(sc2.x, corrY(to.floor), 0.6));
    pts.push(new THREE.Vector3(b.x, corrY(to.floor), 0.6));
    pts.push(new THREE.Vector3(b.x, b.y, b.z));
  }
  return pts;
}

// ── Animated route dot ───────────────────────────────────────────────────────
function RouteDot({ points }: { points: THREE.Vector3[] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tRef = useRef(0);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3), [points]);

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * 0.18) % 1;
    const p = curve.getPoint(tRef.current);
    meshRef.current.position.copy(p);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color="#f4581a" emissive="#f4581a" emissiveIntensity={0.6} />
    </mesh>
  );
}

// ── Floor slab ───────────────────────────────────────────────────────────────
function FloorSlab({ floor, fromFloor, toFloor }: { floor: number; fromFloor: number; toFloor: number }) {
  const y = (floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP);
  const active = floor === fromFloor || floor === toFloor;
  return (
    <mesh position={[1, y - 0.08, -0.5]} receiveShadow>
      <boxGeometry args={[11, 0.12, 5]} />
      <meshStandardMaterial
        color={active ? '#f5f0ea' : '#ede8e1'}
        transparent opacity={0.9}
      />
    </mesh>
  );
}

// ── Room box ─────────────────────────────────────────────────────────────────
function RoomBox({
  room, isFrom, isTo, onClick,
}: {
  room: RoomDef; isFrom: boolean; isTo: boolean; onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const y = (room.floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP) + FLOOR_HEIGHT / 2;

  useFrame(() => {
    if (!meshRef.current) return;
    const target = hovered || isFrom || isTo ? 1.05 : 1;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, target, 0.12));
  });

  const color = isTo ? '#f4581a' : isFrom ? '#1a1410' : room.type === 'corridor' ? '#e8e2d8' : room.type === 'stair' ? '#d8d2c8' : '#ffffff';
  const emissive = isTo ? '#f4581a' : isFrom ? '#3a2a1a' : '#000000';

  if (room.type === 'corridor') {
    return (
      <mesh position={[room.x + room.w / 2, y, room.z - room.d / 2]} receiveShadow>
        <boxGeometry args={[room.w, FLOOR_HEIGHT * 0.3, room.d]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[room.x + room.w / 2, y, room.z - room.d / 2]}
        castShadow receiveShadow
        onClick={room.type === 'room' ? onClick : undefined}
        onPointerOver={() => { if (room.type === 'room') { setHovered(true); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[room.w - 0.1, FLOOR_HEIGHT - 0.2, room.d - 0.1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={isFrom || isTo ? 0.15 : 0} />
      </mesh>
      {room.label && (
        <Text
          position={[room.x + room.w / 2, y + 0.05, room.z - room.d / 2 + 0.05]}
          fontSize={0.22}
          color={isFrom || isTo ? '#ffffff' : '#333'}
          anchorX="center" anchorY="middle"
          renderOrder={10}
        >
          {room.label}
        </Text>
      )}
    </group>
  );
}

// ── Floor label ──────────────────────────────────────────────────────────────
function FloorLabel({ floor }: { floor: number }) {
  const y = (floor - 1) * (FLOOR_HEIGHT + FLOOR_GAP) + FLOOR_HEIGHT / 2;
  return (
    <Text position={[-5.5, y, 1.5]} fontSize={0.3} color="#aaa" anchorX="left" anchorY="middle" rotation={[0, 0.3, 0]}>
      {floor} ЭТ.
    </Text>
  );
}

// ── Markers ──────────────────────────────────────────────────────────────────
function Marker({ room, color }: { room: RoomDef; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const c = roomCenter(room);
  useFrame(({ clock }) => {
    ref.current.position.y = c.y + 0.7 + Math.sin(clock.elapsedTime * 2) * 0.08;
  });
  return (
    <mesh ref={ref} position={[c.x, c.y + 0.7, c.z]} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

// ── Scene ────────────────────────────────────────────────────────────────────
function Scene({ fromId, toId, onRoomClick }: { fromId: string; toId: string; onRoomClick: (id: string) => void }) {
  const fromRoom = ROOMS.find(r => r.id === fromId)!;
  const toRoom = ROOMS.find(r => r.id === toId)!;
  const pathPoints = useMemo(() => buildPath(fromRoom, toRoom), [fromId, toId]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-8, 12, -6]} intensity={0.4} />

      {/* Floor slabs */}
      {[1, 2, 3, 4].map(f => (
        <FloorSlab key={f} floor={f} fromFloor={fromRoom.floor} toFloor={toRoom.floor} />
      ))}
      {/* Floor labels */}
      {[1, 2, 3, 4].map(f => <FloorLabel key={f} floor={f} />)}

      {/* Rooms */}
      {ROOMS.map(r => (
        <RoomBox
          key={r.id}
          room={r}
          isFrom={r.id === fromId}
          isTo={r.id === toId}
          onClick={() => onRoomClick(r.id)}
        />
      ))}

      {/* Route line */}
      <Line points={pathPoints} color="#f4581a" lineWidth={4} dashed={false} />

      {/* Animated dot */}
      <RouteDot points={pathPoints} />

      {/* Start / End markers */}
      <Marker room={fromRoom} color="#1a1410" />
      <Marker room={toRoom} color="#f4581a" />

      <OrbitControls
        enablePan={true} enableZoom={true} enableRotate={true}
        minDistance={4} maxDistance={30}
        target={[1, (FLOOR_HEIGHT + FLOOR_GAP) * 1.5, -0.5]}
      />
    </>
  );
}

// ── Camera reset ─────────────────────────────────────────────────────────────
function CameraReset({ trigger }: { trigger: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(12, 10, 12);
    camera.lookAt(1, 3, -0.5);
  }, [trigger]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
const FLOOR_LABELS: Record<number, string> = { 1: '1 этаж', 2: '2 этаж', 3: '3 этаж', 4: '4 этаж' };

export default function SchoolMap3D() {
  const [fromId, setFromId] = useState('entrance');
  const [toId, setToId] = useState('302');
  const [resetKey, setResetKey] = useState(0);

  const fromRoom = ROOMS.find(r => r.id === fromId)!;
  const toRoom = ROOMS.find(r => r.id === toId)!;
  const floorDiff = Math.abs(toRoom.floor - fromRoom.floor);

  const handleRoomClick = (id: string) => {
    if (id !== fromId) setToId(id);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">А</span>
          <select
            value={fromId}
            onChange={e => setFromId(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {SELECTABLE.map(r => (
              <option key={r.id} value={r.id}>{r.label} {r.name} ({FLOOR_LABELS[r.floor]})</option>
            ))}
          </select>
        </div>
        <Icon name="ArrowRight" size={18} className="hidden shrink-0 text-muted-foreground sm:block" />
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">Б</span>
          <select
            value={toId}
            onChange={e => setToId(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {SELECTABLE.map(r => (
              <option key={r.id} value={r.id}>{r.label} {r.name} ({FLOOR_LABELS[r.floor]})</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setResetKey(k => k + 1)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Icon name="RotateCcw" size={15} />
          <span className="hidden sm:inline">Сброс</span>
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="relative h-[480px] bg-[hsl(40,25%,95%)]">
        <Canvas
          shadows
          camera={{ position: [12, 10, 12], fov: 45 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene fromId={fromId} toId={toId} onRoomClick={handleRoomClick} />
            <CameraReset trigger={resetKey} />
          </Suspense>
        </Canvas>

        {/* Hint overlay */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
            <Icon name="MousePointer2" size={13} />
            Вращай · Зум · Клик по кабинету
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="flex items-center gap-3 text-sm">
          <Icon name="Footprints" size={18} className="text-accent" />
          <span className="font-semibold">{fromRoom.name}</span>
          <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
          <span className="font-semibold">{toRoom.name}</span>
        </div>
        {floorDiff > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icon name="ArrowUpDown" size={15} />
            {floorDiff} {floorDiff === 1 ? 'пролёт' : 'пролёта'} лестницы
          </div>
        )}
      </div>
    </div>
  );
}
