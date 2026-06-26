import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

type Room = {
  id: string;
  label: string;
  name: string;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'room' | 'hub';
};

const GRID = { cols: 20, rows: 12, cell: 34 };

const rooms: Room[] = [
  { id: 'in', label: '🚪', name: 'Главный вход', floor: 1, x: 9, y: 11, w: 2, h: 1, type: 'hub' },
  { id: 'hall1', label: 'Холл', name: 'Холл 1 этаж', floor: 1, x: 4, y: 7, w: 12, h: 2, type: 'hub' },
  { id: '101', label: '101', name: 'Гардероб', floor: 1, x: 2, y: 9, w: 3, h: 2, type: 'room' },
  { id: '102', label: '102', name: 'Столовая', floor: 1, x: 6, y: 9, w: 4, h: 2, type: 'room' },
  { id: '108', label: '108', name: 'Русский язык · Орлова М.Д.', floor: 1, x: 11, y: 9, w: 3, h: 2, type: 'room' },
  { id: '112', label: '112', name: 'История · Соколов В.О.', floor: 1, x: 15, y: 9, w: 3, h: 2, type: 'room' },
  { id: '201', label: '201', name: 'Библиотека', floor: 1, x: 2, y: 4, w: 3, h: 2, type: 'room' },
  { id: '204', label: '204', name: 'Математика · Котова А.С.', floor: 1, x: 6, y: 4, w: 3, h: 2, type: 'room' },
  { id: '215', label: '215', name: 'Физика · Лебедев И.П.', floor: 1, x: 11, y: 4, w: 3, h: 2, type: 'room' },
  { id: '301', label: '301', name: 'Биология · Зайцева Е.Ю.', floor: 1, x: 15, y: 4, w: 3, h: 2, type: 'room' },
  { id: '305', label: '305', name: 'Информатика · Громов П.А.', floor: 1, x: 2, y: 1, w: 4, h: 2, type: 'room' },
  { id: 'gym', label: 'Зал', name: 'Спортивный зал', floor: 1, x: 13, y: 1, w: 5, h: 2, type: 'room' },
];

const center = (r: Room) => ({ cx: (r.x + r.w / 2) * GRID.cell, cy: (r.y + r.h / 2) * GRID.cell });

const SchoolMap = () => {
  const [from, setFrom] = useState('in');
  const [to, setTo] = useState('215');

  const fromRoom = rooms.find((r) => r.id === from)!;
  const toRoom = rooms.find((r) => r.id === to)!;
  const hub = rooms.find((r) => r.id === 'hall1')!;

  const path = useMemo(() => {
    const a = center(fromRoom);
    const h = center(hub);
    const b = center(toRoom);
    return `M ${a.cx} ${a.cy} L ${a.cx} ${h.cy} L ${b.cx} ${h.cy} L ${b.cx} ${b.cy}`;
  }, [fromRoom, toRoom, hub]);

  const dist = useMemo(() => {
    const a = center(fromRoom);
    const h = center(hub);
    const b = center(toRoom);
    const len = Math.abs(a.cy - h.cy) + Math.abs(a.cx - b.cx) + Math.abs(h.cy - b.cy);
    return Math.round(len / GRID.cell * 1.2);
  }, [fromRoom, toRoom, hub]);

  const selectable = rooms.filter((r) => r.type === 'room' || r.id === 'in');

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Route panel */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">А</span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {selectable.map((r) => (
              <option key={r.id} value={r.id}>{r.label} · {r.name}</option>
            ))}
          </select>
        </div>
        <Icon name="ArrowRight" size={18} className="hidden shrink-0 text-muted-foreground sm:block" />
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">Б</span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {selectable.map((r) => (
              <option key={r.id} value={r.id}>{r.label} · {r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-[hsl(40,30%,96%)] p-4">
        <svg
          viewBox={`0 0 ${GRID.cols * GRID.cell} ${GRID.rows * GRID.cell}`}
          className="w-full"
          style={{ maxHeight: 420 }}
        >
          <defs>
            <pattern id="grid" width={GRID.cell} height={GRID.cell} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID.cell} 0 L 0 0 0 ${GRID.cell}`} fill="none" stroke="hsl(30,15%,88%)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* corridor highlight */}
          <rect
            x={hub.x * GRID.cell} y={hub.y * GRID.cell}
            width={hub.w * GRID.cell} height={hub.h * GRID.cell}
            rx="10" fill="hsl(40,20%,90%)"
          />

          {/* rooms */}
          {rooms.map((r) => {
            const isFrom = r.id === from;
            const isTo = r.id === to;
            const active = isFrom || isTo;
            return (
              <g key={r.id} onClick={() => setTo(r.id)} className="cursor-pointer">
                <rect
                  x={r.x * GRID.cell + 3} y={r.y * GRID.cell + 3}
                  width={r.w * GRID.cell - 6} height={r.h * GRID.cell - 6}
                  rx="9"
                  fill={isTo ? 'hsl(16,90%,56%)' : isFrom ? 'hsl(20,14%,8%)' : 'white'}
                  stroke={active ? 'transparent' : 'hsl(30,15%,85%)'}
                  strokeWidth="1.5"
                />
                <text
                  x={center(r).cx} y={center(r).cy + 4}
                  textAnchor="middle"
                  fontSize="13" fontWeight="600"
                  fill={active ? 'white' : 'hsl(20,14%,20%)'}
                >
                  {r.label}
                </text>
              </g>
            );
          })}

          {/* route */}
          <path d={path} fill="none" stroke="hsl(16,90%,56%)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 11" opacity="0.45" />
          <path d={path} fill="none" stroke="hsl(16,90%,56%)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* markers */}
          <circle cx={center(fromRoom).cx} cy={center(fromRoom).cy} r="8" fill="white" stroke="hsl(20,14%,8%)" strokeWidth="4" />
          <circle cx={center(toRoom).cx} cy={center(toRoom).cy} r="8" fill="white" stroke="hsl(16,90%,56%)" strokeWidth="4" />
        </svg>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between gap-4 border-t border-border p-5">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="Footprints" size={18} className="text-accent" />
          <span className="font-medium">~{dist} шагов</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{Math.max(1, Math.round(dist / 80))} мин</span>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">Нажмите на кабинет, чтобы построить маршрут</p>
      </div>
    </div>
  );
};

export default SchoolMap;
