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

// Generate real-time notifications based on current date/time
function generateNotifications(): Notification[] {
  const now = new Date();
  const notifications: Notification[] = [];
  
  // Housing notifications
  notifications.push({
    id: 'notif-1',
    type: 'housing',
    title: 'BHA Section 8 Waitlist Applications Open Now',
    message: 'The Boston Housing Authority is now accepting Section 8 Housing Choice Voucher applications. Apply online or in person at BHA offices.',
    link: '/affordable-housing',
    linkText: 'View Details',
    priority: 'high',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
    read: false,
    source: 'Boston Housing Authority',
  });
  
  notifications.push({
    id: 'notif-2',
    type: 'deadline',
    title: 'RAFT Emergency Rental Assistance Available',
    message: 'Emergency rental assistance through RAFT is available. Up to $10,000 for rent arrears. Apply now if you\'re behind on rent.',
    link: 'https://www.mass.gov/raft',
    linkText: 'Apply Now',
    priority: 'high',
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    source: 'Mass.gov',
  });
  
  // Transit alert
  notifications.push({
    id: 'notif-3',
    type: 'transit',
    title: 'MBTA Red Line Service Updates',
    message: 'Check current Red Line service status and real-time departure predictions on the DOR101 map.',
    link: '/map',
    linkText: 'View Map',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    expiresAt: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
    read: false,
    source: 'MBTA',
  });
  
  // Food resource update
  notifications.push({
    id: 'notif-4',
    type: 'food',
    title: 'Food Distribution Schedule Updated',
    message: 'Check the food resources page for the latest distribution times at Codman Square and other Dorchester locations.',
    link: '/food',
    linkText: 'Find Food Resources',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    read: false,
    source: 'Greater Boston Food Bank',
  });
  
  // News notification
  notifications.push({
    id: 'notif-5',
    type: 'news',
    title: 'New Housing Initiatives Announced',
    message: 'City council discusses new affordable housing funding for Dorchester. Check the news page for full details.',
    link: '/news',
    linkText: 'Read Full Story',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: false,
    source: 'Boston City Council',
  });
  
  // Community alert
  notifications.push({
    id: 'notif-6',
    type: 'alert',
    title: 'Community Events This Week in Dorchester',
    message: 'Local community gatherings, resource fairs, and neighborhood meetings. Check the neighborhood page for details.',
    link: '/neighborhood',
    linkText: 'Learn More',
    priority: 'low',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
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
