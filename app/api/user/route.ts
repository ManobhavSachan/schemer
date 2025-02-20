import { NextResponse } from "next/server";
import { getUser } from "./helper";
export async function GET() {
  try {
    const user = await getUser();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
