import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';
import { supabase } from '@/lib/supabase';
import { generateReEngagementMessage } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inactivityThreshold = parseInt(
      process.env.INACTIVITY_THRESHOLD_DAYS || '14',
      10
    );
    const thresholdDate = new Date(
      Date.now() - inactivityThreshold * 24 * 60 * 60 * 1000
    );

    console.log(`Running daily cron job. Threshold: ${inactivityThreshold} days`);

    // Fetch all member activity records
    const { data: activities, error: fetchError } = await supabase
      .from('member_activity')
      .select('*');

    if (fetchError) {
      console.error('Error fetching activities:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let processedCount = 0;
    let sentCount = 0;

    for (const activity of activities || []) {
      const lastActive = new Date(activity.last_active_at);

      // Check if member is at risk (inactive beyond threshold)
      if (lastActive < thresholdDate && activity.status !== 're_engaged') {
        processedCount++;

        try {
          // Fetch user details from Whop
          const user = await whopSdk.users.getUser({ userId: activity.user_id });

          if (!user) {
            console.log(`User not found: ${activity.user_id}`);
            continue;
          }

          // Generate personalized AI message
          const message = await generateReEngagementMessage({
            name: user.name || 'there',
            email: '', // Not available in user object
            joined_at: new Date(user.createdAt * 1000).toISOString(),
            user_id: user.id,
          });

          // Send notification via Whop
          await whopSdk.notifications.sendPushNotification({
            title: `Hey ${user.name || 'there'}, we miss you! 💙`,
            content: message,
            companyTeamId: activity.company_id,
            userIds: [activity.user_id],
          });

          // Update status in database
          await supabase
            .from('member_activity')
            .update({
              status: 'at_risk',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', activity.user_id)
            .eq('company_id', activity.company_id);

          sentCount++;
          console.log(`Sent re-engagement to ${user.name || activity.user_id}`);
        } catch (error) {
          console.error(
            `Error processing user ${activity.user_id}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      sent: sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

