import { whopSdk } from "@/lib/whop";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const headersList = await headers();
	const { companyId } = await params;
	const { userId } = await whopSdk.verifyUserToken(headersList);

	// Check access
	const result = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
	});

	if (result.accessLevel !== 'admin') {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<h1 className="text-xl text-red-500">
					Access Denied. Only company admins can access this dashboard.
				</h1>
			</div>
		);
	}

	const user = await whopSdk.users.getUser({ userId });
	const company = await whopSdk.companies.getCompany({ companyId });

	// Fetch member activity stats
	const { data: activities, error } = await supabase
		.from('member_activity')
		.select('*')
		.eq('company_id', companyId);

	const inactivityThreshold = parseInt(
		process.env.INACTIVITY_THRESHOLD_DAYS || '14',
		10
	);
	const thresholdDate = new Date(
		Date.now() - inactivityThreshold * 24 * 60 * 60 * 1000
	);

	const activeMembers = activities?.filter(
		(a) => new Date(a.last_active_at) >= thresholdDate
	).length || 0;

	const atRiskMembers = activities?.filter(
		(a) => new Date(a.last_active_at) < thresholdDate
	).length || 0;

	const reEngagedMembers = activities?.filter(
		(a) => a.status === 're_engaged'
	).length || 0;

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						ReEngage AI Dashboard
					</h1>
					<p className="text-gray-600">
						Managing {company.title} • Logged in as @{user.username}
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-sm font-medium text-gray-500 mb-1">
							Active Members
						</div>
						<div className="text-3xl font-bold text-green-600">
							{activeMembers}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Active in last {inactivityThreshold} days
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-sm font-medium text-gray-500 mb-1">
							At-Risk Members
						</div>
						<div className="text-3xl font-bold text-orange-600">
							{atRiskMembers}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Inactive for {inactivityThreshold}+ days
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-sm font-medium text-gray-500 mb-1">
							Re-Engaged
						</div>
						<div className="text-3xl font-bold text-blue-600">
							{reEngagedMembers}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Successfully brought back
						</div>
					</div>
				</div>

				{/* Configuration */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						Configuration
					</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Inactivity Threshold
							</label>
							<p className="text-gray-600">
								Members inactive for <strong>{inactivityThreshold} days</strong> will receive re-engagement messages.
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Cron Schedule
							</label>
							<p className="text-gray-600">
								Daily at midnight (00:00 UTC)
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								AI Model
							</label>
							<p className="text-gray-600">
								GPT-4.1-mini via Manus (1 trillion free tokens)
							</p>
						</div>
					</div>
				</div>

				{/* How It Works */}
				<div className="bg-blue-50 rounded-lg p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-4">
						How ReEngage AI Works
					</h2>
					<ol className="space-y-3 text-gray-700">
						<li className="flex items-start">
							<span className="font-bold text-blue-600 mr-2">1.</span>
							<span>Members are tracked when they interact with your community.</span>
						</li>
						<li className="flex items-start">
							<span className="font-bold text-blue-600 mr-2">2.</span>
							<span>Every day at midnight, the system checks for inactive members.</span>
						</li>
						<li className="flex items-start">
							<span className="font-bold text-blue-600 mr-2">3.</span>
							<span>AI generates personalized re-engagement messages for at-risk members.</span>
						</li>
						<li className="flex items-start">
							<span className="font-bold text-blue-600 mr-2">4.</span>
							<span>Messages are sent via Whop notifications automatically.</span>
						</li>
					</ol>
				</div>
			</div>
		</div>
	);
}

