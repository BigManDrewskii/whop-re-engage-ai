import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify the user token from Whop
    const { userId } = await whopSdk.verifyUserToken(request.headers);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get company ID from request body
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Update or insert member activity
    const { error } = await supabase
      .from('member_activity')
      .upsert(
        {
          user_id: userId,
          company_id: companyId,
          last_active_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,company_id',
        }
      );

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

