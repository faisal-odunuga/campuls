export type SessionStatus = 'scheduled' | 'pending' | 'ongoing' | 'completed' | 'postponed' | 'cancelled';

export type SessionStatusTone = 'success' | 'warning' | 'error' | 'neutral';

export function normalizeSessionStatus(value?: string | null): SessionStatus {
  const status = value?.trim().toLowerCase();

  if (!status) {
    return 'scheduled';
  }

  if (status === 'up next') {
    return 'scheduled';
  }

  if (
    status === 'scheduled' ||
    status === 'pending' ||
    status === 'ongoing' ||
    status === 'completed' ||
    status === 'postponed' ||
    status === 'cancelled'
  ) {
    return status;
  }

  return 'scheduled';
}

export function getSessionStatusLabel(status?: string | null) {
  switch (normalizeSessionStatus(status)) {
    case 'ongoing':
      return 'Live Now';
    case 'pending':
      return 'Awaiting HOC';
    case 'postponed':
      return 'Postponed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    case 'scheduled':
    default:
      return 'Upcoming';
  }
}

export function getSessionStatusTone(status?: string | null): SessionStatusTone {
  switch (normalizeSessionStatus(status)) {
    case 'ongoing':
      return 'success';
    case 'pending':
    case 'postponed':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'completed':
    case 'scheduled':
    default:
      return 'neutral';
  }
}
