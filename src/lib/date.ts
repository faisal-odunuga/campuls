const TIME_ZONE = 'Africa/Lagos';
const LOCALE = 'en-US';

function formatParts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options }).format(date);
}

function partsToObject(parts: Intl.DateTimeFormatPart[]) {
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function formatLagosDateLabel(date: Date) {
  return formatParts(date, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLagosTodayLabel(date = new Date()) {
  return formatParts(date, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatLagosWeekday(date = new Date()) {
  return formatParts(date, {
    weekday: 'long',
  });
}

export function getLagosDateIso(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = partsToObject(parts);
  return `${map.year}-${map.month}-${map.day}`;
}

export function getLagosNow() {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date());

  const values = partsToObject(parts);
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

export function getLagosDayStart(date: Date) {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = partsToObject(parts);
  return Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day));
}

export function getLagosTimeParts(date = new Date()) {
  return partsToObject(
    new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIME_ZONE,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date),
  );
}

export function getLagosWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() === 0 ? 7 : copy.getDay();
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getLagosWeekDates(weekOffset = 0) {
  const start = getLagosWeekStart(getLagosNow());
  start.setDate(start.getDate() + weekOffset * 7);

  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      day,
      short: day.slice(0, 3),
      date,
      label: formatLagosDateLabel(date),
    };
  });
}
