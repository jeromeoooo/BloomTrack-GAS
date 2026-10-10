import { PregnancyWeekInfo } from '../data/pregnancyMilestones';

export interface CalendarEventPayload {
  week: number;
  date: string; // YYYY-MM-DD
  summary: string;
  description: string;
  sizeFruit: string;
  sizeEmoji: string;
  selected: boolean;
}

export interface ExistingCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { date?: string; dateTime?: string };
  htmlLink?: string;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date without mutation
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Compute the date for a given pregnancy week (1..40) from LMP
 */
export function getWeekStartDate(lmpDate: Date, weekNumber: number): Date {
  return addDays(lmpDate, (weekNumber - 1) * 7);
}

/**
 * Formats rich event description for Google Calendar
 */
export function buildEventDescription(week: PregnancyWeekInfo, dateStr: string): string {
  return [
    `🌸 PREGNANCY WEEK ${week.week} MILESTONE`,
    `📅 Milestone Date: ${dateStr}`,
    `----------------------------------------`,
    `🌱 Baby Size: As big as a ${week.sizeFruit}! ${week.sizeEmoji}`,
    `📏 Approx Length: ${week.approxLength}`,
    `⚖️ Approx Weight: ${week.approxWeight}`,
    ``,
    `✨ Baby's Development:`,
    `${week.babyDevelopment}`,
    ``,
    `🩺 What To Expect & Mom's Health:`,
    `${week.momBodyTips}`,
    week.medicalMilestone ? `\n📋 Medical Checklist: ${week.medicalMilestone}` : '',
    ``,
    `----------------------------------------`,
    `Tracked with Pregnancy Week Tracker 💛`,
  ].join('\n');
}

/**
 * Create a single event in user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description: string;
    date: string;
    week: number;
  }
): Promise<any> {
  const nextDay = formatDateISO(addDays(new Date(event.date + 'T00:00:00'), 1));

  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      date: event.date,
    },
    end: {
      date: nextDay,
    },
    transparency: 'transparent', // Doesn't block out user's busy time
    extendedProperties: {
      private: {
        appId: 'pregnancy-week-tracker',
        pregnancyWeek: String(event.week),
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 540 }, // Morning 9 AM notification
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Calendar API error (HTTP ${res.status})`
    );
  }

  return res.json();
}

/**
 * Fetch existing events created by this tracker
 */
export async function fetchExistingPregnancyEvents(
  accessToken: string
): Promise<ExistingCalendarEvent[]> {
  // Query events that contain "Pregnancy Week" or private extended property
  const params = new URLSearchParams({
    q: 'Pregnancy Week',
    maxResults: '250',
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list Google Calendar events');
  }

  const data = await res.json();
  const items: any[] = data.items || [];

  // Filter items matching our pregnancy pattern
  return items.map((item) => ({
    id: item.id,
    summary: item.summary || 'Pregnancy Event',
    description: item.description,
    start: item.start || {},
    htmlLink: item.htmlLink,
  }));
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete event ${eventId}`);
  }
}

/**
 * Generate .ics calendar content for downloading
 */
export function generateICSContent(events: CalendarEventPayload[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pregnancy Week Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Pregnancy Milestones',
  ];

  events.filter((e) => e.selected).forEach((ev) => {
    const cleanDate = ev.date.replace(/-/g, '');
    const nextDate = formatDateISO(addDays(new Date(ev.date + 'T00:00:00'), 1)).replace(/-/g, '');
    const uid = `pregnancy-week-${ev.week}-${cleanDate}@pregnancytracker.local`;
    const summaryEscaped = ev.summary.replace(/,/g, '\\,').replace(/;/g, '\\;');
    const descEscaped = ev.description.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${cleanDate}T090000Z`);
    lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    lines.push(`DTEND;VALUE=DATE:${nextDate}`);
    lines.push(`SUMMARY:${summaryEscaped}`);
    lines.push(`DESCRIPTION:${descEscaped}`);
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
