import { NextResponse } from 'next/server'

const RESPONSE_MESSAGE = 'You are in uncharted territory. Are you sure you want to do this?'

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ message: RESPONSE_MESSAGE })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 })
  }
}
