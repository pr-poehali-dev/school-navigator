import { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import SchoolMap3D from '@/components/SchoolMap3D';

const AUTH_URL = 'https://functions.poehali.dev/346845e7-0469-4886-96ca-992b772abdb5';
const SCHEDULE_URL = 'https://functions.poehali.dev/26b93fab-0c7a-4166-b79b-adaf120d3844';

const CLASSES = [
  '5 «А»', '5 «Б»', '6 «А»', '6 «Б»',
  '7 «А»', '7 «Б»', '8 «А»', '8 «В»',
  '9 «А»', '9 «Б»', '10 «А»', '10 «Б»',
  '11 «А»', '11 «Б»',
];

type User = { id: number; name: string; class_name: string; session_id?: string };
type Lesson = { num: number; time_start: string; time_end: string; subject: string; teacher: string; cabinet: string };
type DaySchedule = { day: number; day_name: string; lessons: Lesson[] };

type Teacher = { id: number; name: string; subject: string; room: string; cabinet: string };
type SchoolClass = { id: number; name: string; teacher: string; room: string; students: number };
type Bell = { num: number; start: string; end: string };

const teachers: Teacher[] = [
  { id: 1, name: 'Ирина Владимировна Смирнова', subject: 'Математика', room: '1 этаж', cabinet: '112' },
  { id: 2, name: 'Дмитрий Алексеевич Фёдоров', subject: 'Физика', room: '2 этаж', cabinet: '214' },
  { id: 3, name: 'Наталья Петровна Козлова', subject: 'Русский язык и литература', room: '1 этаж', cabinet: '108' },
  { id: 4, name: 'Андрей Сергеевич Новиков', subject: 'История и обществознание', room: '2 этаж', cabinet: '210' },
  { id: 5, name: 'Светлана Юрьевна Морозова', subject: 'Биология и химия', room: '3 этаж', cabinet: '316' },
  { id: 6, name: 'Алексей Игоревич Волков', subject: 'Информатика', room: '3 этаж', cabinet: '302' },
  { id: 7, name: 'Татьяна Николаевна Орлова', subject: 'Английский язык', room: '2 этаж', cabinet: '206' },
  { id: 8, name: 'Павел Михайлович Захаров', subject: 'Физическая культура', room: 'Цоколь', cabinet: 'Спортзал' },
];

const classes: SchoolClass[] = [
  { id: 1, name: '5 «А»', teacher: 'Козлова Н.П.', room: '1 этаж', students: 27 },
  { id: 2, name: '6 «Б»', teacher: 'Новиков А.С.', room: '1 этаж', students: 25 },
  { id: 3, name: '7 «А»', teacher: 'Смирнова И.В.', room: '2 этаж', students: 29 },
  { id: 4, name: '8 «В»', teacher: 'Орлова Т.Н.', room: '2 этаж', students: 26 },
  { id: 5, name: '9 «А»', teacher: 'Фёдоров Д.А.', room: '2 этаж', students: 28 },
  { id: 6, name: '10 «Б»', teacher: 'Морозова С.Ю.', room: '3 этаж', students: 24 },
  { id: 7, name: '11 «А»', teacher: 'Волков А.И.', room: '3 этаж', students: 22 },
];

const bells: Bell[] = [
  { num: 1, start: '08:30', end: '09:15' },
  { num: 2, start: '09:25', end: '10:10' },
  { num: 3, start: '10:30', end: '11:15' },
  { num: 4, start: '11:35', end: '12:20' },
  { num: 5, start: '13:00', end: '13:45' },
  { num: 6, start: '13:55', end: '14:40' },
  { num: 7, start: '14:50', end: '15:35' },
];

const DAY_SHORT: Record<number, string> = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт' };

const tabs = [
  { id: 'my-schedule', label: 'Моё расписание', icon: 'CalendarCheck' },
  { id: 'map', label: 'Маршрут', icon: 'Map' },
  { id: 'teachers', label: 'Учителя', icon: 'GraduationCap' },
  { id: 'classes', label: 'Классы', icon: 'Users' },
  { id: 'bells', label: 'Звонки', icon: 'Bell' },
];

// ── Экран регистрации ─────────────────────────────────────────────────────────
const RegisterScreen = ({ onDone }: { onDone: (u: User) => void }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim() || !className) { setError('Заполни имя и выбери класс'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), class_name: className }),
    });
    const data = await res.json();
    if (!res.ok) { setError('Ошибка, попробуй ещё раз'); setLoading(false); return; }
    localStorage.setItem('school_session', data.session_id);
    onDone(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center grain px-5">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
            <Icon name="Compass" size={22} />
          </div>
          <div>
            <p className="font-display font-semibold">Навигатор</p>
            <p className="text-xs text-muted-foreground">Школа №1234 · Москва</p>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight">Привет! 👋</h1>
        <p className="mt-2 text-muted-foreground">Скажи нам, как тебя зовут и в каком ты классе — мы покажем твоё расписание.</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Например: Иван Петров"
              className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-base outline-none ring-accent/30 transition focus:border-accent focus:ring-4"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Класс</label>
            <select
              value={className}
              onChange={e => setClassName(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-base outline-none ring-accent/30 transition focus:border-accent focus:ring-4"
            >
              <option value="">Выбери класс…</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <Icon name="AlertCircle" size={15} /> {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="ArrowRight" size={18} />}
            {loading ? 'Входим…' : 'Войти в навигатор'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Главный экран ─────────────────────────────────────────────────────────────
const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('my-schedule');
  const [mySchedule, setMySchedule] = useState<DaySchedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);

  // Восстанавливаем сессию при загрузке
  useEffect(() => {
    const sid = localStorage.getItem('school_session');
    if (!sid) { setAuthLoading(false); return; }
    fetch(AUTH_URL, { headers: { 'X-Session-Id': sid } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) setUser(data);
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  // Загружаем расписание как только есть пользователь
  useEffect(() => {
    const sid = localStorage.getItem('school_session');
    if (!user || !sid) return;
    setScheduleLoading(true);
    fetch(SCHEDULE_URL, { headers: { 'X-Session-Id': sid } })
      .then(r => r.json())
      .then(data => {
        if (data?.days) {
          setMySchedule(data.days);
          // выбираем текущий день недели (1=Пн..5=Пт), иначе Пн
          const today = new Date().getDay(); // 0=вс,1=пн..
          const schoolDay = today >= 1 && today <= 5 ? today : 1;
          const hasToday = data.days.some((d: DaySchedule) => d.day === schoolDay);
          setActiveDay(hasToday ? schoolDay : data.days[0]?.day ?? 1);
        }
        setScheduleLoading(false);
      })
      .catch(() => setScheduleLoading(false));
  }, [user]);

  const q = query.trim().toLowerCase();
  const foundTeachers = useMemo(
    () => teachers.filter(t => !q || `${t.name} ${t.subject} ${t.cabinet} ${t.room}`.toLowerCase().includes(q)),
    [q]
  );
  const foundClasses = useMemo(
    () => classes.filter(c => !q || `${c.name} ${c.teacher} ${c.room}`.toLowerCase().includes(q)),
    [q]
  );
  const showSearch = q.length > 0;

  const logout = () => {
    localStorage.removeItem('school_session');
    setUser(null);
    setMySchedule([]);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center grain">
        <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <RegisterScreen onDone={u => setUser(u)} />;

  const todayLessons = mySchedule.find(d => d.day === activeDay)?.lessons ?? [];

  return (
    <div className="min-h-screen grain">
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-16">

        {/* Header */}
        <header className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
              <Icon name="Compass" size={22} />
            </div>
            <span className="font-display text-lg font-semibold">Навигатор</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm md:flex">
              <Icon name="User" size={14} className="text-accent" />
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{user.class_name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Icon name="LogOut" size={14} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-12 md:mt-16 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Школа №1234 · Москва</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Привет, {user.name.split(' ')[0]}!<br />
            <span className="text-muted-foreground">Класс {user.class_name}</span>
          </h1>

          <div className="relative mt-6 max-w-xl">
            <Icon name="Search" size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Учитель, класс или аудитория…"
              className="w-full rounded-2xl border border-border bg-card py-4 pl-14 pr-5 text-base shadow-sm outline-none ring-accent/30 transition focus:border-accent focus:ring-4"
            />
          </div>
        </section>

        {/* Search results */}
        {showSearch && (
          <section className="mt-8 animate-fade-up">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="ListFilter" size={16} />
              Результаты: {foundTeachers.length + foundClasses.length}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {foundTeachers.map(t => (
                <InfoCard key={`t-${t.id}`} icon="GraduationCap" title={t.name} subtitle={t.subject} meta={`${t.room} · каб. ${t.cabinet}`} />
              ))}
              {foundClasses.map(c => (
                <InfoCard key={`c-${c.id}`} icon="Users" title={`Класс ${c.name}`} subtitle={`Куратор ${c.teacher}`} meta={`${c.room} · ${c.students} учеников`} />
              ))}
              {foundTeachers.length + foundClasses.length === 0 && (
                <p className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
                  Ничего не нашлось. Попробуйте другой запрос.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Tabs + Content */}
        {!showSearch && (
          <>
            <nav className="mt-10 flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    active === tab.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={15} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <section className="mt-8 animate-fade-up" style={{ animationDelay: '220ms' }}>

              {/* ── Моё расписание ── */}
              {active === 'my-schedule' && (
                <div>
                  {scheduleLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : mySchedule.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
                      <Icon name="CalendarX" size={32} className="mx-auto mb-3 opacity-40" />
                      <p>Расписание для класса {user.class_name} пока не добавлено.</p>
                    </div>
                  ) : (
                    <>
                      {/* Day tabs */}
                      <div className="mb-5 flex gap-1.5 flex-wrap">
                        {mySchedule.map(d => (
                          <button
                            key={d.day}
                            onClick={() => setActiveDay(d.day)}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                              activeDay === d.day
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {DAY_SHORT[d.day]} <span className="hidden sm:inline">· {d.day_name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Lessons */}
                      <div className="overflow-hidden rounded-3xl border border-border bg-card">
                        {todayLessons.map((l, i) => (
                          <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-secondary/30 transition">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-foreground">
                              {l.num}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{l.subject}</p>
                              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Icon name="GraduationCap" size={13} />
                                {l.teacher}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-display text-sm font-semibold text-accent">{l.time_start}</p>
                              <p className="text-xs text-muted-foreground">каб. {l.cabinet}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {active === 'map' && <SchoolMap3D />}

              {active === 'teachers' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teachers.map(t => (
                    <InfoCard key={t.id} icon="GraduationCap" title={t.name} subtitle={t.subject} meta={`${t.room} · каб. ${t.cabinet}`} />
                  ))}
                </div>
              )}

              {active === 'classes' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {classes.map(c => (
                    <InfoCard key={c.id} icon="Users" title={`Класс ${c.name}`} subtitle={`Куратор ${c.teacher}`} meta={`${c.room} · ${c.students} учеников`} />
                  ))}
                </div>
              )}

              {active === 'bells' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bells.map(b => (
                    <div key={b.num} className="rounded-3xl border border-border bg-card p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-3xl font-bold">{b.num}</span>
                        <Icon name="Bell" size={18} className="text-accent" />
                      </div>
                      <p className="mt-4 font-display text-lg font-semibold">{b.start} — {b.end}</p>
                      <p className="text-sm text-muted-foreground">урок · 45 минут</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground">
          Школа №1234 · Большая Молчановка, 26–28 · Москва
        </footer>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, subtitle, meta }: { icon: string; title: string; subtitle: string; meta: string }) => (
  <div className="group rounded-3xl border border-border bg-card p-5 transition hover:border-foreground/20 hover:shadow-md">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon name={icon} size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          <Icon name="MapPin" size={13} />
          {meta}
        </p>
      </div>
    </div>
  </div>
);

export default Index;