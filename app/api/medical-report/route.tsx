import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the doctor AI agent info and conversation between AI medical agent and user, generate a COMPREHENSIVE and DETAILED structured report.

CRITICAL: Extract EVERY piece of medical information mentioned, including:
- ALL medications with complete details (name, dosage, frequency, timing, duration, special instructions)
- Dietary recommendations (what to eat, what to avoid)
- Activity restrictions or recommendations
- Follow-up instructions
- Warning signs to watch for
- Any lifestyle modifications

Return the result in this EXACT JSON format:
{
  "sessionInfo": {
    "doctor": "Doctor specialty from agent info",
    "user": "Patient name or Anonymous",
    "agent": "AI Assistant name from agent info"
  },
  "chiefComplaint": "Main complaint in patient's own words",
  "summary": "Detailed 3-5 sentence summary including diagnosis, treatment approach, and key recommendations",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "duration": "How long symptoms present (e.g., '2 days', '1 week')",
  "severity": "mild/moderate/severe",
  "diagnosis": "Suspected or confirmed diagnosis based on symptoms",
  "medications": [
    {
      "name": "Exact medicine name",
      "dosage": "Amount per dose (e.g., 500mg, 2 tablets)",
      "frequency": "How often (e.g., twice daily, three times a day)",
      "timing": "When to take (e.g., after meals, before breakfast, morning and evening)",
      "duration": "How long to continue (e.g., 5 days, 1 week, until symptoms improve)",
      "instructions": "Special instructions (e.g., take with water, avoid alcohol, take on empty stomach)"
    }
  ],
  "dietaryRecommendations": [
    "Specific food to eat or avoid",
    "Hydration instructions",
    "Meal timing recommendations"
  ],
  "activityRestrictions": [
    "Rest requirements",
    "Exercise limitations",
    "Work/school restrictions"
  ],
  "followUp": "When and why to follow up (e.g., 'Return in 3 days if symptoms don't improve', 'Schedule follow-up in 1 week')",
  "warningSignsToWatch": [
    "Symptoms that require immediate attention",
    "When to go to emergency room"
  ],
  "recommendations": [
    "General health advice",
    "Preventive measures",
    "Home care instructions"
  ],
  "additionalNotes": "Any other important information discussed"
}

INSTRUCTIONS:
1. Extract EVERY medication mentioned with ALL details (dosage, timing, duration)
2. If timing is mentioned (like "take after breakfast and dinner"), include it in the "timing" field
3. If duration is mentioned (like "continue for 5 days"), include it in the "duration" field
4. Include ALL dietary advice, no matter how small
5. Include ALL warning signs mentioned
6. Be thorough - don't skip any details from the conversation
7. If a field doesn't apply, use an empty array [] or empty string ""
8. Respond with ONLY the JSON object, no markdown formatting, no explanation

Based on the doctor AI agent info and conversation between AI medical agent and user, generate the report:`

export async function POST(req: NextRequest) {
  const { sessionId, sessionDetail, messages } = await req.json()
  
  try {
    const UserInput = "AI Doctor Agent Info: " + JSON.stringify(sessionDetail) + 
                     "\n\nConversation: " + JSON.stringify(messages)
    
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-preview-05-20",
      messages: [
        { role: "system", content: REPORT_GEN_PROMPT },
        { role: "user", content: UserInput }
      ],
    })

    const rawResp = completion.choices[0].message
    //@ts-ignore
    let Resp = rawResp.content.trim()
    
    // Clean up response - remove markdown code blocks if present
    Resp = Resp.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const JSONResp = JSON.parse(Resp)

    // Save to database
    const result = await db.update(SessionChatTable).set({
      report: JSONResp,
      conversation: messages
    }).where(eq(SessionChatTable.sessionId, sessionId))

    console.log('Medical report generated successfully:', JSONResp)
    return NextResponse.json(JSONResp)
    
  } catch (e: any) {
    console.error('Error generating medical report:', e)
    return NextResponse.json(
      { error: e.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}