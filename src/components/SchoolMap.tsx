import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

type Room = {
  id: string;
  label: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'room' | 'corridor' | 'stair' | 'service';
};

const CELL = 36;
const W = 22;
const H = 13;

const rooms: Room[] = [
  // ── Коридор / холл
  { id: 'corr', label: '', name: 'Коридор', x: 3, y: 5, w: 16, h: 2, type: 'corridor' },

  // ── Вход
  { id: 'in', label: '🚪', name: 'Главный вход', x: 10, y: 11, w: 2, h: 2, type: 'stair' },

  // ── Лестница
  { id: 'stair', label: '⬆', name: 'Лестница', x: 19, y: 5, w: 2, h: 2, type: 'stair' },

  // ── 1-й этаж (нижние)
  { id: '101', label: '101', name: 'Гардероб', x: 1, y: 8, w: 3, h: 2, type: 'room' },
  { id: '102', label: '102', name: 'Столовая', x: 5, y: 8, w: 4, h: 2, type: 'room' },
  { id: '108', label: '108', name: 'Русский язык · Козлова Н.П.', x: 10, y: 8, w: 3, h: 2, type: 'room' },
  { id: '112', label: '112', name: 'Математика · Смирнова И.В.', x: 14, y: 8, w: 4, h: 2, type: 'room' },

  // ── 1-й этаж (верхние)
  { id: '103', label: '103', name: 'Библиотека', x: 1, y: 2, w: 3, h: 2, type: 'room' },
  { id: '105', label: '105', name: 'Медпункт', x: 5, y: 2, w: 3, h: 2, type: 'room' },
  { id: '106', label: '106', name: 'Актовый зал', x: 9, y: 2, w: 4, h: 2, type: 'room' },
  { id: '109', label: '109', name: 'Начальные классы', x: 14, y: 2, w: 4, h: 2, type: 'room' },

  // ── 2-й этаж (условно — верхняя строка)
  { id: '206', label: '206', name: 'Английский язык · Орлова Т.Н.', x: 1, y: 0, w: 3, h: 1, type: 'room' },
  { id: '210', label: '210', name: 'История · Новиков А.С.', x: 5, y: 0, w: 3, h: 1, type: 'room' },
  { id: '214', label: '214', name: 'Физика · Фёдоров Д.А.', x: 9, y: 0, w: 4, h: 1, type: 'room' },
  { id: '302', label: '302', name: 'Информатика · Волков А.И.', x: 14, y: 0, w: 3, h: 1, type: 'room' },
  { id: '316', label: '316', name: 'Биология · Морозова С.Ю.', x: 18, y: 0, w: 3, h: 1, type: 'room' },
];

const center = (r: Room) => ({
  cx: (r.x + r.w / 2) * CELL,
  cy: (r.y + r.h / 2) * CELL,
});

const corridorRoom = rooms.find((r) => r.id === 'corr')!;

const SchoolMap = () => {
  const [from, setFrom] = useState('in');
  const [to, setTo] = useState('112');

  const fromRoom = rooms.find((r) => r.id === from)!;
  const toRoom = rooms.find((r) => r.id === to)!;

  const path = useMemo(() => {
    const a = center(fromRoom);
    const h = center(corridorRoom);
    const b = center(toRoom);
    return `M ${a.cx} ${a.cy} L ${a.cx} ${h.cy} L ${b.cx} ${h.cy} L ${b.cx} ${b.cy}`;
  }, [fromRoom, toRoom]);

  const dist = useMemo(() => {
    const a = center(fromRoom);
    const h = center(corridorRoom);
    const b = center(toRoom);
    const len = Math.abs(a.cy - h.cy) + Math.abs(a.cx - b.cx) + Math.abs(h.cy - b.cy);
    return Math.round((len / CELL) * 1.4);
  }, [fromRoom, toRoom]);

  const selectable = rooms.filter((r) => r.type === 'room' || r.id === 'in');

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Route panel */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">А</span>
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
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">Б</span>
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
      <div className="overflow-x-auto bg-[hsl(40,30%,96%)] p-4">
        <svg
          viewBox={`0 0 ${W * CELL} ${H * CELL}`}
          className="w-full min-w-[520px]"
          style={{ maxHeight: 440 }}
        >
          <defs>
            <pattern id="grid1234" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
              <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke="hsl(30,15%,87%)" strokeWidth="0.8" />
            </pattern>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="hsl(16,90%,56%)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid1234)" />

          {/* Floor label */}
          <text x="8" y="20" fontSize="9" fill="hsl(25,8%,55%)" fontWeight="600" letterSpacing="1">1 ЭТАЖ</text>
          <text x="8" y={1 * CELL - 6} fontSize="9" fill="hsl(25,8%,55%)" fontWeight="600" letterSpacing="1">2–3 ЭТАЖ</text>

          {/* Rooms */}
          {rooms.map((r) => {
            if (r.type === 'corridor') {
              return (
                <rect key={r.id}
                  x={r.x * CELL} y={r.y * CELL}
                  width={r.w * CELL} height={r.h * CELL}
                  rx="8" fill="hsl(40,20%,90%)"
                />
              );
            }

            const isFrom = r.id === from;
            const isTo = r.id === to;
            const highlighted = isFrom || isTo;

            const fill = isTo
              ? 'hsl(16,90%,56%)'
              : isFrom
              ? 'hsl(20,14%,8%)'
              : r.type === 'stair'
              ? 'hsl(40,20%,88%)'
              : 'white';

            const textFill = highlighted ? 'white' : r.type === 'stair' ? 'hsl(20,14%,40%)' : 'hsl(20,14%,20%)';

            return (
              <g
                key={r.id}
                onClick={() => r.type === 'room' && setTo(r.id)}
                className={r.type === 'room' ? 'cursor-pointer' : ''}
              >
                <rect
                  x={r.x * CELL + 3} y={r.y * CELL + 3}
                  width={r.w * CELL - 6} height={r.h * CELL - 6}
                  rx="8"
                  fill={fill}
                  stroke={highlighted ? 'transparent' : 'hsl(30,15%,84%)'}
                  strokeWidth="1.5"
                />
                <text
                  x={center(r).cx} y={center(r).cy + 4}
                  textAnchor="middle"
                  fontSize={r.h < 1.5 ? '10' : '12'}
                  fontWeight="600"
                  fill={textFill}
                >
                  {r.label}
                </text>
              </g>
            );
          })}

          {/* Route shadow */}
          <path
            d={path} fill="none"
            stroke="hsl(16,90%,56%)" strokeWidth="6"
            strokeLinecap="round" strokeLinejoin="round"
            opacity="0.18"
          />
          {/* Route */}
          <path
            d={path} fill="none"
            stroke="hsl(16,90%,56%)" strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round"
            markerEnd="url(#arrow)"
          />

          {/* Start marker */}
          <circle cx={center(fromRoom).cx} cy={center(fromRoom).cy} r="9" fill="white" stroke="hsl(20,14%,8%)" strokeWidth="3.5" />
          <circle cx={center(fromRoom).cx} cy={center(fromRoom).cy} r="3.5" fill="hsl(20,14%,8%)" />
          {/* End marker */}
          <circle cx={center(toRoom).cx} cy={center(toRoom).cy} r="9" fill="white" stroke="hsl(16,90%,56%)" strokeWidth="3.5" />
          <circle cx={center(toRoom).cx} cy={center(toRoom).cy} r="3.5" fill="hsl(16,90%,56%)" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
        <div className="flex items-center gap-3 text-sm">
          <Icon name="Footprints" size={18} className="text-accent" />
          <span className="font-semibold">~{dist} шагов</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{Math.max(1, Math.round(dist / 80))} мин пешком</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="MousePointer" size={13} />
          <span className="hidden sm:inline">Нажмите на кабинет</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolMap;
