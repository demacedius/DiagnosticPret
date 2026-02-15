export type Plan = 'free' | 'premium' | 'pro';

type ClerkUser = { publicMetadata?: Record<string, unknown> } | null;

export function getUserPlan(user: ClerkUser): Plan {
  if (!user) return 'free';
  const plan = user.publicMetadata?.plan;
  if (plan === 'pro') return 'pro';
  if (plan === 'premium') return 'premium';
  return 'free';
}

export function hasPremium(user: ClerkUser): boolean {
  const plan = getUserPlan(user);
  return plan === 'premium' || plan === 'pro';
}

export function isPro(user: ClerkUser): boolean {
  return getUserPlan(user) === 'pro';
}
