'use client';

import { useEffect } from 'react';

interface ActivityTrackerProps {
  userId: string;
  companyId: string;
}

export default function ActivityTracker({ userId, companyId }: ActivityTrackerProps) {
  useEffect(() => {
    // Track activity when component mounts
    const trackActivity = async () => {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId }),
        });
      } catch (error) {
        console.error('Failed to track activity:', error);
      }
    };

    trackActivity();
  }, [userId, companyId]);

  return null; // This component doesn't render anything
}

