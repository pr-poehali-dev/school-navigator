import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import SchoolMap from '@/components/SchoolMap';

type Teacher = { id: number; name: string; subject: string; room: string; cabinet: string };
type SchoolClass = { id: number; name: string; teacher: string; room: string; students: number };
type Lesson = { num: number; start: string; end: string };

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

const bells: Lesson[] = [
  { num: 1, start: '08:30', end: '09:15' },
  { num: 2, start: '09:25', end: '10:10' },
  { num: 3, start: '10:30', end: '11:15' },
  { num: 4, start: '11:35', end: '12:20' },
  { num: 5, start: '13:00', end: '13:45' },
  { num: 6, start: '13:55', end: '14:40' },
  { num: 7, start: '14:50', end: '15:35' },
];

const schedule = [
  { time: '08:30', subject: 'Математика', teacher: 'Смирнова И.В.', cabinet: '112' },
  { time: '09:25', subject: 'Русский язык', teacher: 'Козлова Н.П.', cabinet: '108' },
  { time: '10:30', subject: 'История', teacher: 'Новиков А.С.', cabinet: '210' },
  { time: '11:35', subject: 'Английский язык', teacher: 'Орлова Т.Н.', cabinet: '206' },
  { time: '13:00', subject: 'Физика', teacher: 'Фёдоров Д.А.', cabinet: '214' },
  { time: '13:55', subject: 'Информатика', teacher: 'Волков А.И.', cabinet: '302' },
];

const tabs = [
  { id: 'map', label: 'Маршрут', icon: 'Map' },
  { id: 'schedule', label: 'Расписание', icon: 'CalendarDays' },
  { id: 'teachers', label: 'Учителя', icon: 'GraduationCap' },
  { id: 'classes', label: 'Классы', icon: 'Users' },
  { id: 'bells', label: 'Звонки', icon: 'Bell' },
];

const Index = () => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('map');

  const q = query.trim().toLowerCase();

  const foundTeachers = useMemo(
    () => teachers.filter((t) => !q || `${t.name} ${t.subject} ${t.cabinet} ${t.room}`.toLowerCase().includes(q)),
    [q]
  );
  const foundClasses = useMemo(
    () => classes.filter((c) => !q || `${c.name} ${c.teacher} ${c.room}`.toLowerCase().includes(q)),
    [q]
  );

  const showSearch = q.length > 0;

  return (
    <div className="min-h-screen grain">
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-16">
        <header className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
              <Icon name="Compass" size={22} />
            </div>
            <span className="font-display text-lg font-semibold">Навигатор</span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground md:flex">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Школа №1234
          </div>
        </header>

        <section className="mt-14 md:mt-20 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Школа №1234 · Москва</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Найди всё <br className="hidden md:block" />за пару секунд
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
            Большая Молчановка, 26–28 · Учителя, классы, аудитории и расписание звонков.
          </p>

          <div className="relative mt-8 max-w-xl">
            <Icon
              name="Search"
              size={20}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Учитель, класс или аудитория…"
              className="w-full rounded-2xl border border-border bg-card py-4 pl-14 pr-5 text-base shadow-sm outline-none ring-accent/30 transition focus:border-accent focus:ring-4"
            />
          </div>
        </section>

        {showSearch && (
          <section className="mt-10 animate-fade-up">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="ListFilter" size={16} />
              Результаты поиска: {foundTeachers.length + foundClasses.length}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {foundTeachers.map((t) => (
                <InfoCard key={`t-${t.id}`} icon="GraduationCap" title={t.name} subtitle={t.subject}
                  meta={`${t.room} · каб. ${t.cabinet}`} />
              ))}
              {foundClasses.map((c) => (
                <InfoCard key={`c-${c.id}`} icon="Users" title={`Класс ${c.name}`} subtitle={`Куратор ${c.teacher}`}
                  meta={`${c.room} · ${c.students} учеников`} />
              ))}
              {foundTeachers.length + foundClasses.length === 0 && (
                <p className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
                  Ничего не нашлось. Попробуйте другой запрос.
                </p>
              )}
            </div>
          </section>
        )}

        {!showSearch && (
          <>
            <nav className="mt-12 flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    active === tab.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <section className="mt-8 animate-fade-up" style={{ animationDelay: '240ms' }}>
              {active === 'map' && <SchoolMap />}

              {active === 'schedule' && (
                <div className="overflow-hidden rounded-3xl border border-border bg-card">
                  {schedule.map((l, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0">
                      <span className="w-14 font-display text-sm font-semibold text-accent">{l.time}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{l.subject}</p>
                        <p className="text-sm text-muted-foreground">{l.teacher}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">каб. {l.cabinet}</span>
                    </div>
                  ))}
                </div>
              )}

              {active === 'teachers' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teachers.map((t) => (
                    <InfoCard key={t.id} icon="GraduationCap" title={t.name} subtitle={t.subject}
                      meta={`${t.room} · каб. ${t.cabinet}`} />
                  ))}
                </div>
              )}

              {active === 'classes' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {classes.map((c) => (
                    <InfoCard key={c.id} icon="Users" title={`Класс ${c.name}`} subtitle={`Куратор ${c.teacher}`}
                      meta={`${c.room} · ${c.students} учеников`} />
                  ))}
                </div>
              )}

              {active === 'bells' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bells.map((b) => (
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
