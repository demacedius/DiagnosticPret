import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import type { Plan } from '../../../lib/subscription';

export const POST: APIRoute = async ({ request }) => {
  const stripeSecretKey  = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret    = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const clerkSecretKey   = import.meta.env.CLERK_SECRET_KEY;
  const pricePro         = import.meta.env.STRIPE_PRICE_PRO ?? '';

  if (!stripeSecretKey || !webhookSecret) {
    return new Response('Stripe keys missing', { status: 500 });
  }

  const stripe    = new Stripe(stripeSecretKey);
  const rawBody   = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // ── Vérification de la signature Stripe ──────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook/stripe] Signature invalide :', err);
    return new Response(`Webhook signature error: ${err}`, { status: 400 });
  }

  // ── Traitement de l'événement ─────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. Identifier le plan acheté
    //    Priorité : metadata.plan > STRIPE_PRICE_PRO comparaison > défaut premium
    let plan: Plan = 'premium';
    if (session.metadata?.plan === 'pro') {
      plan = 'pro';
    } else if (session.metadata?.plan === 'premium') {
      plan = 'premium';
    } else if (pricePro) {
      // Si pas de metadata, on compare le premier line item au price ID Pro
      const expanded = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      const firstPriceId = expanded.line_items?.data?.[0]?.price?.id ?? '';
      if (firstPriceId === pricePro) plan = 'pro';
    }

    // 2. Identifier l'utilisateur Clerk
    //    Priorité : metadata.clerkUserId (checkout dynamique) > email (payment link)
    let clerkUserId: string | null = session.metadata?.clerkUserId ?? null;

    if (!clerkUserId) {
      const email = session.customer_details?.email;
      if (!email) {
        console.error("[webhook/stripe] Impossible d'identifier l'utilisateur : ni clerkUserId ni email");
        return new Response('User unidentifiable', { status: 400 });
      }

      // Recherche par email dans Clerk
      const res = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}&limit=1`,
        { headers: { Authorization: `Bearer ${clerkSecretKey}` } }
      );
      const users = await res.json() as Array<{ id: string }>;
      clerkUserId = users?.[0]?.id ?? null;
    }

    if (!clerkUserId) {
      console.error('[webhook/stripe] Utilisateur Clerk introuvable');
      return new Response('Clerk user not found', { status: 404 });
    }

    // 3. Mettre à jour les métadonnées Clerk
    const updateRes = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}/metadata`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_metadata: { plan } }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error('[webhook/stripe] Erreur mise à jour Clerk :', err);
      return new Response('Clerk update failed', { status: 500 });
    }

    console.log(`[webhook/stripe] Plan "${plan}" activé pour ${clerkUserId}`);
  }

  // Stripe attend un 200 pour confirmer la réception
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
