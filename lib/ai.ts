import OpenAI from 'openai';

export interface MemberData {
  name: string;
  email: string;
  joined_at: string;
  user_id: string;
}

// Lazy-load OpenAI client to avoid build-time initialization
function getOpenAIClient() {
  return new OpenAI();
}

export async function generateReEngagementMessage(
  member: MemberData,
  communityName?: string
): Promise<string> {
  const prompt = `You are a friendly community manager. Generate a short, warm, and personalized re-engagement message for a community member.

Member details:
- Name: ${member.name}
- Joined: ${new Date(member.joined_at).toLocaleDateString()}
- Community: ${communityName || 'our community'}

Requirements:
- Keep it under 280 characters
- Be genuine and friendly, not salesy
- Make them feel missed and valued
- Include a subtle call-to-action to come back
- Don't mention specific dates or time periods

Write only the message, nothing else.`;

  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Using Manus-provided model
      messages: [
        {
          role: 'system',
          content: 'You are a skilled community manager who writes warm, authentic messages.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const message = completion.choices[0]?.message?.content?.trim();
    
    if (!message) {
      throw new Error('No message generated');
    }

    return message;
  } catch (error) {
    console.error('Error generating AI message:', error);
    // Fallback message if AI fails
    return `Hey ${member.name}! We've noticed you haven't been around lately and wanted to check in. The community misses you! Hope to see you back soon. 💙`;
  }
}

