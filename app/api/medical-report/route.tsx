import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const DETAILED_REPORT_PROMPT = `You are a medical documentation expert. Create a DETAILED, COMPREHENSIVE medical consultation report.

Generate a JSON report with these sections. Be thorough and specific:

{
  "sessionId": "session ID",
  "agent": "Doctor name with specialty",
  "user": "Patient name or 'Patient'",
  "timestamp": "ISO date/time",
  
  "chiefComplaint": "2-3 sentence description of main issue",
  
  "presentingHistory": {
    "symptoms": "Detailed paragraph (5-8 sentences) describing all symptoms, onset, duration, severity, progression, aggravating/relieving factors",
    "timeline": "When symptoms started and how they've changed",
    "impact": "How symptoms affect daily life, work, sleep, mood"
  },
  
  "patientHistory": {
    "medicalHistory": "Chronic conditions, past surgeries, hospitalizations",
    "medications": "Current medications with dosages",
    "allergies": "Any allergies",
    "lifestyle": "Smoking, alcohol, exercise, diet, stress, occupation"
  },
  
  "clinicalAssessment": {
    "findings": "Physical examination findings discussed",
    "vitalSigns": "Temperature, BP, pulse if mentioned",
    "systemsReview": "Other body systems mentioned"
  },
  
  "diagnosis": {
    "primary": "Main diagnosis with 3-4 sentence medical explanation",
    "differential": ["Other possible conditions considered"],
    "reasoning": "4-5 sentence paragraph explaining why this diagnosis, key findings that support it"
  },
  
  "treatmentPlan": {
    "medications": [
      {
        "name": "Full medication name (generic and brand)",
        "indication": "Why prescribed",
        "dosage": "Exact amount (500mg, 10ml, etc.)",
        "form": "Tablet, syrup, cream, etc.",
        "frequency": "How often (twice daily, every 8 hours, etc.)",
        "timing": "SPECIFIC times - e.g. '8:00 AM after breakfast, 2:00 PM after lunch, 8:00 PM after dinner' OR 'Morning 7 AM on empty stomach, Evening 7 PM with food'",
        "duration": "Complete course (7 days, 2 weeks, 1 month, as needed)",
        "instructions": "Take with food/water, avoid alcohol, complete full course, etc.",
        "sideEffects": "Common side effects",
        "precautions": "Important warnings",
        "missedDose": "What to do if dose missed",
        "storage": "How to store"
      }
    ],
    "nonMedication": ["Physical therapy, exercises, home remedies with detailed instructions"]
  },
  
  "lifestyleGuidance": {
    "diet": {
      "recommendations": ["Specific foods to eat with quantities/timing"],
      "restrictions": ["Foods to avoid and why"],
      "hydration": "Water intake recommendations",
      "mealTiming": "When and how often to eat"
    },
    "activity": {
      "exercise": "Specific exercise recommendations with duration/frequency",
      "restrictions": "Activities to avoid",
      "rest": "Sleep and rest requirements"
    },
    "stressManagement": ["Techniques discussed"]
  },
  
  "monitoringPlan": {
    "symptomsToTrack": ["What to monitor and how"],
    "selfCare": ["Self-care instructions"],
    "homeRemedies": ["Home treatments suggested"]
  },
  
  "followUp": {
    "nextVisit": "When to schedule follow-up and why",
    "tests": ["Lab tests or imaging needed with timing"],
    "referrals": ["Specialist referrals if needed"],
    "reviewDate": "When to review progress"
  },
  
  "warningSignsEmergency": {
    "immediate": ["Symptoms requiring immediate ER visit - be specific"],
    "urgent": ["Symptoms to contact doctor within 24-48 hours"],
    "concerning": ["Symptoms to monitor and report"]
  },
  
  "patientEducation": {
    "aboutCondition": "5-6 sentence explanation of the condition in simple terms",
    "howTreatmentWorks": "Explanation of why this treatment approach",
    "expectedRecovery": "Timeline for improvement, what to expect",
    "prevention": ["How to prevent recurrence or complications"],
    "resources": ["Educational materials, support groups, helpful websites"]
  },
  
  "clinicalNotes": {
    "summary": "4-5 sentence comprehensive summary of consultation",
    "patientConcerns": "Specific worries patient expressed",
    "riskFactors": "Any identified risks",
    "complianceFactors": "Factors affecting adherence"
  },
  
  "additionalNotes": "Any other important information, observations, or special considerations",
  
  "disclaimer": "Standard medical disclaimer"
}

CRITICAL REQUIREMENTS:
1. For MEDICATIONS: Always specify EXACT timing like "8:00 AM, 2:00 PM, 8:00 PM" or "Morning 7 AM, Night 9 PM"
2. Make medication instructions very detailed (5-7 points per medication)
3. Write in complete paragraphs for history, reasoning, education sections
4. Be specific with dosages, quantities, timeframes
5. Total report should be detailed and comprehensive (aim for 1500+ words when written out)
6. Extract EVERY detail from the conversation
7. Use medical terminology appropriately

Analyze the conversation and create this detailed report. Return ONLY the JSON.`;

export async function POST(req: NextRequest) {
  console.log('=== MEDICAL REPORT API STARTED ===')
  
  try {
    const body = await req.json()
    console.log('✅ Request received')
    console.log('Session ID:', body.sessionId)
    console.log('Messages count:', body.messages?.length)
    
    const { sessionId, sessionDetail, messages } = body

    // Validation
    if (!sessionId) {
      console.error('❌ Missing sessionId')
      return NextResponse.json(
        { error: 'sessionId required', details: 'No session ID' },
        { status: 400 }
      )
    }

    if (!messages || messages.length === 0) {
      console.error('❌ No messages')
      return NextResponse.json(
        { error: 'No conversation', details: 'Messages array empty' },
        { status: 400 }
      )
    }

    // Check API key
    const apiKey = process.env.OPEN_ROUTER_API_KEY
    if (!apiKey) {
      console.error('❌ API key missing')
      return NextResponse.json(
        { error: 'API key not configured', details: 'Check OPEN_ROUTER_API_KEY in .env.local' },
        { status: 500 }
      )
    }

    console.log('✅ Validation passed')

    // Format conversation
    const conversationText = messages.map((msg: any, idx: number) => {
      const role = msg.role === 'assistant' ? 'Doctor' : 'Patient';
      const text = msg.transcript || msg.content || '';
      return `${role}: ${text}`;
    }).join('\n');

    const UserInput = `Doctor Specialist: ${sessionDetail?.selectedDoctor?.specialist || 'General Physician'}
Date: ${new Date().toISOString()}
Session: ${sessionId}

CONVERSATION:
${conversationText}

Create a detailed medical report based on this consultation. Include every detail discussed, exact medication timings, and comprehensive explanations.`;

    console.log('📞 Calling AI API...')
    console.log('Conversation length:', conversationText.length, 'characters')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Medical Voice Agent'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: DETAILED_REPORT_PROMPT },
          { role: 'user', content: UserInput }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`API returned ${response.status}: ${errorText.substring(0, 200)}`)
    }

    const completion = await response.json()
    console.log('✅ AI response received')

    const rawResp = completion.choices?.[0]?.message?.content

    if (!rawResp) {
      console.error('❌ Empty AI response')
      console.error('Full response:', JSON.stringify(completion, null, 2).substring(0, 500))
      throw new Error('Empty response from AI')
    }

    console.log('Response length:', rawResp.length, 'characters')

    // Clean response
    let cleanedResp = rawResp.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    console.log('Parsing JSON...')

    let JSONResp
    try {
      JSONResp = JSON.parse(cleanedResp)
      console.log('✅ JSON parsed successfully')
    } catch (parseError: any) {
      console.error('❌ JSON Parse Error:', parseError.message)
      console.error('First 500 chars of response:', cleanedResp.substring(0, 500))
      console.error('Last 200 chars of response:', cleanedResp.substring(cleanedResp.length - 200))
      throw new Error('Failed to parse AI response: ' + parseError.message)
    }

    // Add sessionId if missing
    if (!JSONResp.sessionId) {
      JSONResp.sessionId = sessionId
    }

    // Save to database
    console.log('💾 Saving to database...')
    try {
      await db.update(SessionChatTable)
        .set({
          report: JSONResp,
          conversation: messages
        })
        .where(eq(SessionChatTable.sessionId, sessionId))

      console.log('✅ Database updated')
    } catch (dbError: any) {
      console.error('⚠️ Database error:', dbError.message)
      // Continue anyway - report is still generated
    }

    console.log('✅✅✅ REPORT GENERATION COMPLETE ✅✅✅')
    return NextResponse.json(JSONResp)

  } catch (error: any) {
    console.error('❌❌❌ CRITICAL ERROR ❌❌❌')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}