'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { OnboardingData } from '@/lib/ai';

export async function completeOnboardingAction(data: OnboardingData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const client = await clerkClient();

  // Update user's public metadata to mark onboarding as complete
  // We can also store the data if we want, but for now we just mark as complete
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
        onboardingComplete: true,
        onboardingData: data
    }
  });

  return { success: true };
}
