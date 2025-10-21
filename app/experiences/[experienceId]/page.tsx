import { whopSdk } from "@/lib/whop";
import { headers } from "next/headers";
import ActivityTracker from "./activity-tracker";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const headersList = await headers();
	const { experienceId } = await params;
	const { userId } = await whopSdk.verifyUserToken(headersList);

	const result = await whopSdk.access.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	const user = await whopSdk.users.getUser({ userId });
	const experience = await whopSdk.experiences.getExperience({ experienceId });

	// Get company ID from experience
	const companyId = experience.company_id;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
			<ActivityTracker userId={userId} companyId={companyId} />
			
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							Welcome to ReEngage AI
						</h1>
						<p className="text-gray-600">
							Automated member retention powered by AI
						</p>
					</div>

					<div className="space-y-6">
						<div className="bg-blue-50 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-3">
								👋 Hi {user.name}!
							</h2>
							<p className="text-gray-700">
								You're viewing <strong>{experience.name}</strong> as a <strong>{result.accessLevel}</strong>.
							</p>
						</div>

						<div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-3">
								✨ What is ReEngage AI?
							</h2>
							<p className="text-gray-700 mb-4">
								ReEngage AI automatically identifies at-risk community members and sends them personalized, 
								AI-generated messages to bring them back. It's like having a dedicated community manager 
								working 24/7 to prevent churn.
							</p>
							<ul className="space-y-2 text-gray-700">
								<li className="flex items-start">
									<span className="text-purple-600 mr-2">•</span>
									<span>Tracks member activity automatically</span>
								</li>
								<li className="flex items-start">
									<span className="text-purple-600 mr-2">•</span>
									<span>Identifies inactive members before they churn</span>
								</li>
								<li className="flex items-start">
									<span className="text-purple-600 mr-2">•</span>
									<span>Generates personalized re-engagement messages with AI</span>
								</li>
								<li className="flex items-start">
									<span className="text-purple-600 mr-2">•</span>
									<span>Sends messages automatically via Whop notifications</span>
								</li>
							</ul>
						</div>

						<div className="bg-green-50 rounded-lg p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-3">
								📊 Your Status
							</h2>
							<p className="text-gray-700">
								Your activity is being tracked to help keep this community engaged. 
								By visiting this page, you're marked as active!
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

