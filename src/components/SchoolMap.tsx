import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

type RoomType = 'room' | 'corridor' | 'stair' | 'entrance';

type Room = {
  id: string;
  label: string;
  name: string;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: RoomType;
};

const CELL = 38;
const COLS = 20;
const ROWS = 9;

// Лестничная клетка — одна позиция на каждом этаже (x=17, y=3)
const STAIR_X = 17;
const STAIR_Y = 3;
const CORR_Y = 4;
const CORR_H = 2;

const floorData: Record<number, Room[]> = {
  1: [
    { id: 'f1-corr', label: '', name: 'Коридор', floor: 1, x: 1, y: CORR_Y, w: 16, h: CORR_H, type: 'corridor' },
    { id: 'f1-stair', label: '▲', name: 'Лестница', floor: 1, x: STAIR_X, y: STAIR_Y, w: 2, h: 3, type: 'stair' },
    { id: 'f1-in', label: '🚪', name: 'Главный вход', floor: 1, x: 9, y: 7, w: 2, h: 2, type: 'entrance' },
    // Нижний ряд
    { id: '101', label: '101', name: 'Гардероб', floor: 1, x: 1, y: 6, w: 3, h: 2, type: 'room' },
    { id: '102', label: '102', name: 'Столовая', floor: 1, x: 5, y: 6, w: 4, h: 2, type: 'room' },
    { id: '107', label: '107', name: 'Медпункт', floor: 1, x: 12, y: 6, w: 3, h: 2, type: 'room' },
    // Верхний ряд
    { id: '103', label: '103', name: 'Библиотека', floor: 1, x: 1, y: 1, w: 3, h: 2, type: 'room' },
    { id: '104', label: '104', name: 'Актовый зал', floor: 1, x: 5, y: 1, w: 5, h: 2, type: 'room' },
    { id: '108', label: '108', name: 'Рус. язык · Козлова', floor: 1, x: 11, y: 1, w: 4, h: 2, type: 'room' },
  ],
  2: [
    { id: 'f2-corr', label: '', name: 'Коридор', floor: 2, x: 1, y: CORR_Y, w: 16, h: CORR_H, type: 'corridor' },
    { id: 'f2-stair', label: '▲▼', name: 'Лестница', floor: 2, x: STAIR_X, y: STAIR_Y, w: 2, h: 3, type: 'stair' },
    // Нижний ряд
    { id: '201', label: '201', name: 'Математика · Смирнова', floor: 2, x: 1, y: 6, w: 4, h: 2, type: 'room' },
    { id: '204', label: '204', name: 'Геометрия', floor: 2, x: 6, y: 6, w: 3, h: 2, type: 'room' },
    { id: '206', label: '206', name: 'Англ. язык · Орлова', floor: 2, x: 10, y: 6, w: 4, h: 2, type: 'room' },
    // Верхний ряд
    { id: '210', label: '210', name: 'История · Новиков', floor: 2, x: 1, y: 1, w: 4, h: 2, type: 'room' },
    { id: '212', label: '212', name: 'Обществознание', floor: 2, x: 6, y: 1, w: 4, h: 2, type: 'room' },
    { id: '214', label: '214', name: 'Физика · Фёдоров', floor: 2, x: 11, y: 1, w: 4, h: 2, type: 'room' },
  ],
  3: [
    { id: 'f3-corr', label: '', name: 'Коридор', floor: 3, x: 1, y: CORR_Y, w: 16, h: CORR_H, type: 'corridor' },
    { id: 'f3-stair', label: '▲▼', name: 'Лестница', floor: 3, x: STAIR_X, y: STAIR_Y, w: 2, h: 3, type: 'stair' },
    // Нижний ряд
    { id: '301', label: '301', name: 'Химия', floor: 3, x: 1, y: 6, w: 3, h: 2, type: 'room' },
    { id: '302', label: '302', name: 'Информатика · Волков', floor: 3, x: 5, y: 6, w: 4, h: 2, type: 'room' },
    { id: '305', label: '305', name: 'Черчение', floor: 3, x: 10, y: 6, w: 4, h: 2, type: 'room' },
    // Верхний ряд
    { id: '310', label: '310', name: 'Биология · Морозова', floor: 3, x: 1, y: 1, w: 4, h: 2, type: 'room' },
    { id: '314', label: '314', name: 'География', floor: 3, x: 6, y: 1, w: 4, h: 2, type: 'room' },
    { id: '316', label: '316', name: 'Экология', floor: 3, x: 11, y: 1, w: 4, h: 2, type: 'room' },
  ],
  4: [
    { id: 'f4-corr', label: '', name: 'Коридор', floor: 4, x: 1, y: CORR_Y, w: 16, h: CORR_H, type: 'corridor' },
    { id: 'f4-stair', label: '▼', name: 'Лестница', floor: 4, x: STAIR_X, y: STAIR_Y, w: 2, h: 3, type: 'stair' },
    // Нижний ряд
    { id: '401', label: '401', name: 'ИЗО', floor: 4, x: 1, y: 6, w: 3, h: 2, type: 'room' },
    { id: '402', label: '402', name: 'Музыка', floor: 4, x: 5, y: 6, w: 3, h: 2, type: 'room' },
    { id: '405', label: '405', name: 'Технология', floor: 4, x: 9, y: 6, w: 4, h: 2, type: 'room' },
    // Верхний ряд
    { id: '410', label: '410', name: 'Астрономия', floor: 4, x: 1, y: 1, w: 3, h: 2, type: 'room' },
    { id: '412', label: '412', name: 'Психолог', floor: 4, x: 5, y: 1, w: 3, h: 2, type: 'room' },
    { id: '415', label: '415', name: 'Администрация', floor: 4, x: 9, y: 1, w: 5, h: 2, type: 'room' },
  ],
};

const allRooms = Object.values(floorData).flat();

const roomById = (id: string) => allRooms.find((r) => r.id === id)!;

const cx = (r: Room) => (r.x + r.w / 2) * CELL;
const cy = (r: Room) => (r.y + r.h / 2) * CELL;

// Находим коридор нужного этажа
const corridorOf = (floor: number) => floorData[floor].find((r) => r.type === 'corridor')!;
// Лестница на нужном этаже
const stairOf = (floor: number) => floorData[floor].find((r) => r.type === 'stair')!;

const selectable = allRooms.filter((r) => r.type === 'room' || r.id === 'f1-in');

const FLOOR_LABELS: Record<number, string> = { 1: '1 этаж', 2: '2 этаж', 3: '3 этаж', 4: '4 этаж' };

const SchoolMap = () => {
  const [from, setFrom] = useState('f1-in');
  const [to, setTo] = useState('214');
  const [viewFloor, setViewFloor] = useState(1);

  const fromRoom = roomById(from);
  const toRoom = roomById(to);

  const sameFloor = fromRoom.floor === toRoom.floor;

  // Строим маршрут для текущего просматриваемого этажа
  const routePath = useMemo(() => {
    const corr = corridorOf(viewFloor);
    const corrCy = cy(corr);

    if (sameFloor && fromRoom.floor === viewFloor) {
      // простой маршрут: А → коридор → Б
      const ax = cx(fromRoom); const ay = cy(fromRoom);
      const bx = cx(toRoom); const by = cy(toRoom);
      return `M ${ax} ${ay} L ${ax} ${corrCy} L ${bx} ${corrCy} L ${bx} ${by}`;
    }

    if (!sameFloor) {
      const stair = stairOf(viewFloor);
      const stairCx = cx(stair);
      const stairCy = cy(stair);

      if (viewFloor === fromRoom.floor) {
        // Отрезок: от А до лестницы
        const ax = cx(fromRoom); const ay = cy(fromRoom);
        return `M ${ax} ${ay} L ${ax} ${corrCy} L ${stairCx} ${corrCy} L ${stairCx} ${stairCy}`;
      }
      if (viewFloor === toRoom.floor) {
        // Отрезок: от лестницы до Б
        const bx = cx(toRoom); const by = cy(toRoom);
        return `M ${stairCx} ${stairCy} L ${stairCx} ${corrCy} L ${bx} ${corrCy} L ${bx} ${by}`;
      }
      // Транзитный этаж: показываем лестницу → лестница
      return `M ${stairCx} ${stairCy - CELL * 0.5} L ${stairCx} ${stairCy + CELL * 0.5}`;
    }

    return '';
  }, [viewFloor, fromRoom, toRoom, sameFloor]);

  const showFromMarker = fromRoom.floor === viewFloor;
  const showToMarker = toRoom.floor === viewFloor;

  const dist = useMemo(() => {
    const floorDiff = Math.abs(toRoom.floor - fromRoom.floor);
    const corrF = corridorOf(fromRoom.floor);
    const corrT = corridorOf(toRoom.floor);
    const stairF = stairOf(fromRoom.floor);
    const horizFrom = Math.abs(cx(fromRoom) - cx(stairF)) + Math.abs(cy(fromRoom) - cy(corrF));
    const horizTo = Math.abs(cx(toRoom) - cx(stairOf(toRoom.floor))) + Math.abs(cy(toRoom) - cy(corrT));
    const floorDist = floorDiff * 3 * CELL;
    return Math.round((horizFrom + horizTo + floorDist) / CELL * 1.3);
  }, [fromRoom, toRoom]);

  const currentRooms = floorData[viewFloor];

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Route panel */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">А</span>
          <select
            value={from}
            onChange={(e) => { setFrom(e.target.value); setViewFloor(roomById(e.target.value).floor); }}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {selectable.map((r) => (
              <option key={r.id} value={r.id}>{r.label} {r.name} ({FLOOR_LABELS[r.floor]})</option>
            ))}
          </select>
        </div>
        <Icon name="ArrowRight" size={18} className="hidden shrink-0 text-muted-foreground sm:block" />
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">Б</span>
          <select
            value={to}
            onChange={(e) => { setTo(e.target.value); setViewFloor(roomById(e.target.value).floor); }}
            className="w-full bg-transparent text-sm font-medium outline-none"
          >
            {selectable.map((r) => (
              <option key={r.id} value={r.id}>{r.label} {r.name} ({FLOOR_LABELS[r.floor]})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Floor switcher */}
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-5 py-3">
        <Icon name="Layers" size={15} className="mr-1 text-muted-foreground" />
        {[1, 2, 3, 4].map((f) => {
          const hasFrom = fromRoom.floor === f;
          const hasTo = toRoom.floor === f;
          const isActive = viewFloor === f;
          return (
            <button
              key={f}
              onClick={() => setViewFloor(f)}
              className={`relative flex h-9 min-w-[56px] items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-border hover:text-foreground'
              }`}
            >
              {f} эт.
              {(hasFrom || hasTo) && (
                <span className={`h-1.5 w-1.5 rounded-full ${hasFrom && hasTo ? 'bg-accent' : hasFrom ? 'bg-foreground/60' : 'bg-accent'} ${isActive ? 'bg-background/70' : ''}`} />
              )}
            </button>
          );
        })}
        {!sameFloor && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="ArrowUpDown" size={13} />
            маршрут через лестницу
          </span>
        )}
      </div>

      {/* Map */}
      <div className="overflow-x-auto bg-[hsl(40,30%,96%)] p-4">
        <svg
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          className="w-full min-w-[500px]"
          style={{ maxHeight: 400 }}
        >
          <defs>
            <pattern id="mapgrid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
              <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke="hsl(30,15%,87%)" strokeWidth="0.7" />
            </pattern>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="hsl(16,90%,56%)" />
            </marker>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#mapgrid)" />

          {/* Floor label */}
          <text x={10} y={22} fontSize="10" fill="hsl(25,8%,50%)" fontWeight="700" letterSpacing="1.5">
            {FLOOR_LABELS[viewFloor].toUpperCase()}
          </text>

          {/* Rooms */}
          {currentRooms.map((r) => {
            if (r.type === 'corridor') {
              return (
                <rect key={r.id}
                  x={r.x * CELL} y={r.y * CELL}
                  width={r.w * CELL} height={r.h * CELL}
                  rx="10" fill="hsl(40,20%,90%)"
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
              ? 'hsl(40,18%,86%)'
              : r.type === 'entrance'
              ? 'hsl(40,18%,86%)'
              : 'white';

            const textFill = highlighted
              ? 'white'
              : 'hsl(20,14%,25%)';

            return (
              <g
                key={r.id}
                onClick={() => r.type === 'room' && setTo(r.id)}
                className={r.type === 'room' ? 'cursor-pointer' : ''}
                filter={highlighted ? 'url(#shadow)' : undefined}
              >
                <rect
                  x={r.x * CELL + 3} y={r.y * CELL + 3}
                  width={r.w * CELL - 6} height={r.h * CELL - 6}
                  rx="9"
                  fill={fill}
                  stroke={highlighted ? 'transparent' : 'hsl(30,15%,83%)'}
                  strokeWidth="1.5"
                />
                <text
                  x={cx(r)} y={cy(r) + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={textFill}
                >
                  {r.label}
                </text>
              </g>
            );
          })}

          {/* Route shadow */}
          {routePath && (
            <path d={routePath} fill="none"
              stroke="hsl(16,90%,56%)" strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
              opacity="0.15"
            />
          )}
          {/* Route line */}
          {routePath && (
            <path d={routePath} fill="none"
              stroke="hsl(16,90%,56%)" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
          )}

          {/* Start marker */}
          {showFromMarker && (
            <>
              <circle cx={cx(fromRoom)} cy={cy(fromRoom)} r="10" fill="white" stroke="hsl(20,14%,8%)" strokeWidth="3.5" />
              <circle cx={cx(fromRoom)} cy={cy(fromRoom)} r="4" fill="hsl(20,14%,8%)" />
            </>
          )}
          {/* End marker */}
          {showToMarker && (
            <>
              <circle cx={cx(toRoom)} cy={cy(toRoom)} r="10" fill="white" stroke="hsl(16,90%,56%)" strokeWidth="3.5" />
              <circle cx={cx(toRoom)} cy={cy(toRoom)} r="4" fill="hsl(16,90%,56%)" />
            </>
          )}

          {/* Stair hint for multi-floor */}
          {!sameFloor && (() => {
            const stair = stairOf(viewFloor);
            return (
              <text
                x={cx(stair)} y={cy(stair) + 4}
                textAnchor="middle" fontSize="10" fontWeight="700"
                fill="hsl(20,14%,35%)"
              >
                {viewFloor < toRoom.floor ? '▲' : '▼'}
              </text>
            );
          })()}
        </svg>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="flex items-center gap-3 text-sm">
          <Icon name="Footprints" size={18} className="text-accent" />
          <span className="font-semibold">~{dist} шагов</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{Math.max(1, Math.round(dist / 80))} мин</span>
          {!sameFloor && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Icon name="ArrowUpDown" size={14} />
                {Math.abs(toRoom.floor - fromRoom.floor)} {Math.abs(toRoom.floor - fromRoom.floor) === 1 ? 'пролёт' : 'пролёта'}
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {fromRoom.name} → {toRoom.name}
        </p>
      </div>
    </div>
  );
};

export default SchoolMap;
