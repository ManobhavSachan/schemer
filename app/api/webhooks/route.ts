import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, UserJSON } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prismaClient'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const userData = evt.data as UserJSON
    const { id, email_addresses, first_name, last_name, primary_email_address_id } = userData
    const email = email_addresses.find((email) => email.id === primary_email_address_id)?.email_address;
    if(!email) {
      return new Response('Error: No email found', {
        status: 400,
      })

    }
    if(!first_name) {
      return new Response('Error: No first name found', {
        status: 400,
      })
    }
    
    await prisma.user.create({
      data: {
        email: email,
        firstName: first_name,
        lastName: last_name,
        externalId: id,
      },
    })



    return new Response('User created', { status: 200 })
  }

  return new Response('Webhook received', { status: 200 })
}