import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// Real-time notifications for DOR101
interface Notification {
  id: string;
  type: 'housing' | 'food' | 'transit' | 'alert' | 'news' | 'deadline';
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  read: boolean;
  source: string;
}

// Dynamic notification generation based on current date/time
function generateDynamicNotifications(): Notification[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const monthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const notifications: Notification[] = [];

  // BHA Section 8 - always relevant
  notifications.push({
    id: 'notif-housing-1',
    type: 'housing',
    title: 'BHA Section 8 Waitlist Applications Open',
    message: 'The Boston Housing Authority is now accepting Section 8 Housing Choice Voucher applications. Apply online at bostonhousing.org or in person at 52 Chauncy Street.',
    link: '/affordable-housing',
    linkText: 'Apply Now',
    priority: 'high',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    source: 'Boston Housing Authority',
  });

  // End of month RAFT deadline
  if (dayOfMonth >= 25) {
    notifications.push({
      id: 'notif-deadline-1',
      type: 'deadline',
      title: 'RAFT Emergency Rental Assistance Deadline',
      message: 'Applications for RAFT emergency rental assistance close at end of month. Massachusetts residents can apply for up to $10,000.',
      link: '/affordable-housing',
      linkText: 'Apply Now',
      priority: 'urgent',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'Mass.gov',
    });
  }

  // Cold weather shelter (winter months)
  if (['december', 'january', 'february'].includes(monthName)) {
    notifications.push({
      id: 'notif-weather-1',
      type: 'alert',
      title: 'Cold Weather Emergency Shelters Available',
      message: 'Due to cold weather, additional emergency shelter beds are available. Call 311 for immediate placement or visit any Boston shelter.',
      link: '/resources',
      linkText: 'Find Shelter',
      priority: 'urgent',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'City of Boston',
    });
  }

  // Summer youth employment
  if (['june', 'july', 'august'].includes(monthName)) {
    notifications.push({
      id: 'notif-summer-1',
      type: 'news',
      title: 'Summer Youth Employment Program Active',
      message: 'Boston SYEP is accepting applications for youth ages 14-18. Paid positions include community service and leadership roles.',
      link: '/resources',
      linkText: 'Apply',
      priority: 'medium',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'City of Boston',
    });
  }

  // Weekend MBTA changes
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    notifications.push({
      id: 'notif-transit-1',
      type: 'transit',
      title: 'MBTA Weekend Service Changes',
      message: 'Reduced service on weekends due to track maintenance. Check real-time departure times on the DOR101 map before traveling.',
      link: '/map',
      linkText: 'View Map',
      priority: 'medium',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'MBTA',
    });
  }

  // Food distribution - Tue, Thu, Sat
  const distributionDays = [2, 4, 6];
  if (distributionDays.includes(dayOfWeek)) {
    const locations: Record<number, string> = { 2: 'Codman Square', 4: 'Uphams Corner', 6: 'Fields Corner' };
    notifications.push({
      id: 'notif-food-1',
      type: 'food',
      title: `Food Distribution at ${locations[dayOfWeek]} Today`,
      message: `Free food distribution from 10 AM - 2 PM at ${locations[dayOfWeek]}. No ID or proof of income required. Multilingual staff available.`,
      link: '/food',
      linkText: 'View Schedule',
      priority: 'high',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'Greater Boston Food Bank',
    });
  }

  // New housing lotteries (beginning of month)
  if (dayOfMonth <= 7) {
    notifications.push({
      id: 'notif-housing-2',
      type: 'housing',
      title: 'New Affordable Housing Lotteries Open',
      message: 'New affordable housing lottery openings are available in Dorchester. Income restrictions vary by unit.',
      link: '/affordable-housing',
      linkText: 'View Listings',
      priority: 'high',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      source: 'BPDA',
    });
  }

  // MassHealth enrollment
  notifications.push({
    id: 'notif-health-1',
    type: 'news',
    title: 'MassHealth Enrollment Assistance Available',
    message: 'Free enrollment assistance at Codman Square Health Center with multilingual staff. No appointment needed.',
    link: '/resources',
    linkText: 'Get Help',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    source: 'MassHealth',
  });

  // Community events
  notifications.push({
    id: 'notif-community-1',
    type: 'news',
    title: 'Dorchester Community Resource Fair',
    message: 'Monthly resource fair featuring housing, food, health, and legal services. Free and open to all Dorchester residents.',
    link: '/news',
    linkText: 'Learn More',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    source: 'DOR101',
  });

  // MBTA Red Line updates - always
  notifications.push({
    id: 'notif-transit-2',
    type: 'transit',
    title: 'MBTA Red Line Service Updates',
    message: 'Check current Red Line service status and real-time departure predictions on the DOR101 map.',
    link: '/map',
    linkText: 'View Map',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
    read: false,
    source: 'MBTA',
  });

  // Filter out expired notifications
  return notifications.filter(notif => {
    if (!notif.expiresAt) return true;
    return new Date(notif.expiresAt) > now;
  });
}

// In-memory storage for read notifications
let readNotificationIds = new Set<string>();
let lastResetDate = new Date().toDateString();

function checkDailyReset() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    readNotificationIds = new Set();
    lastResetDate = today;
  }
}

export async function GET() {
  try {
    checkDailyReset();

    let notifications = generateDynamicNotifications();

    // Update read status
    notifications = notifications.map(n => ({
      ...n,
      read: readNotificationIds.has(n.id),
    }));

    // Sort by priority and date
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      notifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      lastUpdated: new Date().toISOString(),
      source: 'Dynamic generation based on date/time',
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST to mark notifications as read
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, action } = body;

    if (action === 'markRead' && notificationId) {
      readNotificationIds.add(notificationId);
    } else if (action === 'markAllRead') {
      const notifications = generateDynamicNotifications();
      notifications.forEach(n => readNotificationIds.add(n.id));
    } else if (action === 'clearAll') {
      readNotificationIds = new Set();
    }

    return NextResponse.json({
      success: true,
      readCount: readNotificationIds.size,
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}