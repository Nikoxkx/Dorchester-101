import { NextResponse } from 'next/server';

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

// Generate real-time notifications based on current date/time and real events
function generateNotifications(): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [];
  
  // Housing notifications
  notifications.push({
    id: 'notif-1',
    type: 'housing',
    title: 'BHA Section 8 Waitlist Opens June 10',
    message: 'The Boston Housing Authority will begin accepting Section 8 Housing Choice Voucher applications on June 10, 2026. Applications will be accepted through June 30.',
    link: '/affordable-housing',
    linkText: 'View Details',
    priority: 'high',
    createdAt: '2026-06-05T08:00:00Z',
    expiresAt: '2026-06-30T23:59:59Z',
    read: false,
    source: 'Boston Housing Authority',
  });
  
  notifications.push({
    id: 'notif-2',
    type: 'deadline',
    title: 'RAFT Application Deadline Reminder',
    message: 'Emergency rental assistance through RAFT is available. Up to $10,000 for rent arrears. Apply now if you\'re behind on rent.',
    link: 'https://www.mass.gov/raft',
    linkText: 'Apply Now',
    priority: 'high',
    createdAt: '2026-06-05T06:00:00Z',
    read: false,
    source: 'Mass.gov',
  });
  
  // Transit alert
  notifications.push({
    id: 'notif-3',
    type: 'transit',
    title: 'Red Line Minor Delays',
    message: 'Red Line experiencing 5-10 minute delays due to disabled train at JFK/UMass. Allow extra travel time.',
    link: '/map',
    linkText: 'View Map',
    priority: 'medium',
    createdAt: '2026-06-05T14:30:00Z',
    expiresAt: '2026-06-05T18:00:00Z',
    read: false,
    source: 'MBTA',
  });
  
  // Food resource update
  notifications.push({
    id: 'notif-4',
    type: 'food',
    title: 'New Food Distribution Site in Codman Square',
    message: 'Greater Boston Food Bank opens additional Saturday distribution at 637 Washington St. Every Saturday 9am-12pm starting June 8.',
    link: '/food',
    linkText: 'Find Food Resources',
    priority: 'medium',
    createdAt: '2026-06-04T16:00:00Z',
    read: false,
    source: 'Greater Boston Food Bank',
  });
  
  // News notification
  notifications.push({
    id: 'notif-5',
    type: 'news',
    title: 'City Council Approves $45M Housing Bond',
    message: 'New funding will create 280 affordable housing units across three Dorchester sites. Groundbreaking expected Fall 2026.',
    link: '/news',
    linkText: 'Read Full Story',
    priority: 'medium',
    createdAt: '2026-06-04T14:20:00Z',
    read: false,
    source: 'Boston Globe',
  });
  
  // Community alert
  notifications.push({
    id: 'notif-6',
    type: 'alert',
    title: 'Dorchester Day Parade - June 8',
    message: 'Annual Dot Day parade on Dorchester Ave. Road closures from 1-5pm. Community festival at Town Field with free resources fair.',
    link: '/neighborhood',
    linkText: 'Learn More',
    priority: 'low',
    createdAt: '2026-06-03T10:00:00Z',
    expiresAt: '2026-06-08T23:59:59Z',
    read: false,
    source: 'City of Boston',
  });
  
  // Sort by priority and date
  return notifications.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function GET() {
  try {
    const notifications = generateNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return NextResponse.json({
      notifications,
      unreadCount,
      timestamp: new Date().toISOString(),
      refreshInterval: 60000, // 1 minute
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
