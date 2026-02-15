import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { getClientByInviteToken, linkClientToClerkUser } from '../../../../lib/courtier';

export const POST: APIRoute = async ({ locals, params }) => {
  const { userId } = locals.auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // Pour lire l'invitation on a besoin d'un accès sans RLS stricte
  // On utilise le token du courtier propriétaire via la policy "invite token read"
  const supabaseUrl  = import.meta.env.SUPABASE_URL as string;
  const supabaseAnon = import.meta.env.SUPABASE_ANON_KEY as string;

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false },
  });

  const client = await getClientByInviteToken(params.token!, supabase);

  if (!client) {
    return new Response('Token invalide', { status: 404 });
  }
  if (client.invite_used) {
    return new Response('Invitation déjà utilisée', { status: 409 });
  }

  try {
    // Pour l'écriture, on a besoin du token du broker
    // On utilise le service role ou on fait la mise à jour via anon key
    // puisque la RLS n'empêche pas la mise à jour depuis le token anon
    // si le client_clerk_id n'est pas encore défini
    const { error } = await supabase
      .from('courtier_clients')
      .update({ client_clerk_id: userId, invite_used: true })
      .eq('id', client.id);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, clientId: client.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/courtier/invitation POST]', err);
    return new Response('Server error', { status: 500 });
  }
};
