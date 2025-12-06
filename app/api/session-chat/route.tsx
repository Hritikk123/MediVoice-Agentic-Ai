import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm"; // FIXED: Added 'eq' import
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { notes, selectedDoctor } = await req.json()
        const user = await currentUser()

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            )
        }

        const sessionId = uuidv4();
        const result = await db.insert(SessionChatTable).values({
            sessionId: sessionId,
            createdBy: user.primaryEmailAddress.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdOn: (new Date()).toString()
        }).returning({ sessionId: SessionChatTable.sessionId })

        return NextResponse.json({ sessionId: result[0]?.sessionId })
    } catch (e: any) {
        console.error("Error creating session:", e)
        return NextResponse.json(
            { error: e.message || "Failed to create session" },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('sessionId')
        const user = await currentUser()

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            )
        }

        if (sessionId == 'all') {
            const result = await db.select().from(SessionChatTable)
                .where(eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(SessionChatTable.id))
            return NextResponse.json(result)
        } else if (sessionId) {
            const result = await db.select().from(SessionChatTable)
                .where(eq(SessionChatTable.sessionId, sessionId))
            return NextResponse.json(result[0] || null)
        } else {
            return NextResponse.json(
                { error: "sessionId parameter is required" },
                { status: 400 }
            )
        }
    } catch (e: any) {
        console.error("Error fetching session:", e)
        return NextResponse.json(
            { error: e.message || "Failed to fetch session" },
            { status: 500 }
        )
    }
}