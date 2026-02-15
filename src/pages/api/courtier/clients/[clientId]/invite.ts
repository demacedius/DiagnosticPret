import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { generateInviteToken } from '../../../../../lib/courtier';

export const POST: APIRoute = async ({ locals, params, request }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });


  const origin = new URL(request.url).origin;

  try {
    const supabase = createServerSupabaseClient();
    const inviteToken = await generateInviteToken(params.clientId!, supabase);
    const inviteUrl = `${origin}/courtier/invitation/${inviteToken}`;

    return new Response(JSON.stringify({ inviteUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/clients/[id]/invite POST]', err);
    return new Response('Server error', { status: 500 });
  }
};
