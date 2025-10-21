import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop';
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
          // Fetch member details from Whop
          const member = await whopSdk.companies.getMember({
            userId: activity.user_id,
            companyId: activity.company_id,
          });

          if (!member) {
            console.log(`Member not found: ${activity.user_id}`);
            continue;
          }

          // Generate personalized AI message
          const message = await generateReEngagementMessage({
            name: member.user.name || 'there',
            email: member.user.email,
            joined_at: member.joined_at,
            user_id: member.user_id,
          });

          // Send notification via Whop
          await whopSdk.notifications.createNotificationRequest({
            body: {
              title: `Hey ${member.user.name}, we miss you! 💙`,
              content: message,
            },
            topics: [
              {
                topic_identifier: 'reengage',
                users: [member.user_id],
              },
            ],
            target: {
              company: activity.company_id,
            },
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
          console.log(`Sent re-engagement to ${member.user.name}`);
        } catch (error) {
          console.error(
            `Error processing member ${activity.user_id}:`,
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

