import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const COMPREHENSIVE_REPORT_PROMPT = `You are an expert medical documentation specialist. Your task is to create a COMPREHENSIVE and DETAILED medical consultation report based on the conversation between an AI medical specialist and a patient.

IMPORTANT: This report should be thorough, detailed, and professionally formatted. Include EVERY piece of medical information discussed.

Generate a complete JSON report with the following structure:

{
  "sessionId": "unique session ID",
  "agent": "Name of AI Medical Specialist (e.g., 'Dr. Smith - General Physician AI')",
  "user": "Patient name (use 'Patient' if not provided)",
  "timestamp": "Current date and time in ISO format",
  "consultationDuration": "Duration of call (if available)",
  
  "chiefComplaint": "Main reason for consultation in one sentence",
  
  "patientHistory": {
    "presentingSymptoms": "Detailed description of all symptoms mentioned",
    "onsetAndDuration": "When symptoms started and how long they've lasted",
    "severity": "mild, moderate, or severe with explanation",
    "progressionPattern": "How symptoms have changed over time",
    "previousTreatments": "Any treatments already tried",
    "relevantMedicalHistory": "Chronic conditions, allergies, past surgeries mentioned",
    "currentMedications": "Any medications currently being taken"
  },
  
  "clinicalAssessment": {
    "symptoms": ["Complete list of all symptoms discussed", "Include frequency, intensity, location"],
    "vitalSigns": "Any vital signs mentioned (temperature, blood pressure, etc.)",
    "physicalFindings": "Any physical examination findings discussed",
    "riskFactors": "Identified risk factors",
    "differentialDiagnosis": ["Possible conditions considered"]
  },
  
  "diagnosis": {
    "primary": "Main diagnosis with detailed explanation",
    "secondary": ["Other conditions identified"],
    "reasoning": "Clinical reasoning for the diagnosis"
  },
  
  "treatmentPlan": {
    "medications": [
      {
        "name": "Full medication name (generic and brand if mentioned)",
        "dosage": "Exact dosage (e.g., '500mg', '10ml')",
        "form": "Tablet, syrup, injection, etc.",
        "frequency": "How often to take (e.g., 'twice daily', 'every 8 hours')",
        "timing": "When to take (e.g., 'after breakfast and dinner', 'before bedtime', 'on empty stomach')",
        "duration": "How long to continue (e.g., '7 days', '2 weeks', 'as needed')",
        "instructions": "Detailed instructions (take with food, avoid alcohol, complete full course, etc.)",
        "purpose": "Why this medication is prescribed",
        "possibleSideEffects": "Common side effects to watch for",
        "precautions": "Important warnings or interactions"
      }
    ],
    "otherInterventions": ["Physical therapy, exercises, procedures recommended"]
  },
  
  "lifestyleRecommendations": {
    "dietaryAdvice": [
      "Detailed dietary recommendations",
      "Foods to eat and avoid",
      "Meal timing suggestions",
      "Hydration requirements"
    ],
    "activityRestrictions": [
      "Rest requirements",
      "Exercise limitations",
      "Work/school guidance",
      "Sleep recommendations"
    ],
    "lifestyleModifications": [
      "Stress management",
      "Sleep hygiene",
      "Environmental factors"
    ]
  },
  
  "homeCarePlan": {
    "selfCareInstructions": ["Detailed self-care steps"],
    "symptomsToMonitor": ["What to watch for"],
    "remedies": ["Home remedies suggested"],
    "preventiveMeasures": ["How to prevent recurrence"]
  },
  
  "followUpInstructions": {
    "nextVisit": "When to schedule follow-up",
    "reviewDate": "When to review progress",
    "testsRequired": ["Any lab tests or imaging needed"],
    "specialistReferral": "If referral to specialist needed"
  },
  
  "warningSignsToWatch": [
    "DETAILED list of symptoms requiring immediate medical attention",
    "When to go to emergency room",
    "When to call doctor urgently",
    "Red flags that indicate worsening condition"
  ],
  
  "patientEducation": {
    "aboutCondition": "Detailed explanation of the condition",
    "expectedCourse": "What to expect in recovery",
    "preventionTips": "How to prevent future occurrences",
    "importantInformation": "Key points patient should remember"
  },
  
  "additionalNotes": "Any other important information, special considerations, or doctor's observations",
  
  "disclaimer": "This is an AI-generated consultation report. For medical emergencies, contact emergency services immediately."
}

CRITICAL INSTRUCTIONS:
1. Extract EVERY medical detail from the conversation
2. For medications: Include EXACT dosage, timing (morning/evening/night), with/without food, duration
3. Be specific with recommendations - don't use vague terms
4. Include reasoning and explanations for better patient understanding
5. Format professionally as if this is an official medical document
6. If information is not mentioned, use "Not discussed" rather than omitting the field
7. Make the report comprehensive - minimum 20 detailed points across all sections

Based on the doctor's specialty and conversation provided, create this detailed report.

Return ONLY the JSON object, no other text.`;

export async function POST(req: NextRequest) {
  console.log('=== MEDICAL REPORT API CALLED ===')
  
  try {
    const body = await req.json()
    console.log('Request body received')
    console.log('SessionId:', body.sessionId)
    console.log('Messages count:', body.messages?.length)
    
    const { sessionId, sessionDetail, messages } = body

    if (!sessionId) {
      console.error('❌ Missing sessionId')
      return NextResponse.json(
        { error: 'sessionId is required', details: 'No session ID provided' },
        { status: 400 }
      )
    }

    if (!messages || messages.length === 0) {
      console.error('❌ No messages provided')
      return NextResponse.json(
        { error: 'No conversation messages to generate report from', details: 'Messages array is empty' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed')
    console.log('Preparing input for AI...')

    const UserInput = `AI Doctor Agent Info: ${JSON.stringify(sessionDetail)}

Conversation Messages:
${JSON.stringify(messages, null, 2)}

Please analyze this complete medical consultation and create a comprehensive, detailed report covering all aspects discussed.`

    console.log('📞 Calling OpenAI API...')

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-preview-05-20",
      messages: [
        { role: "system", content: COMPREHENSIVE_REPORT_PROMPT },
        { role: "user", content: UserInput }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    console.log('✅ OpenAI response received')

    const rawResp = completion.choices[0].message
    if (!rawResp || !rawResp.content) {
      console.error('❌ Empty response from OpenAI')
      throw new Error('Empty response from AI')
    }

    let cleanedResp = rawResp.content.trim()
    cleanedResp = cleanedResp.replace(/```json\n?/g, '')
    cleanedResp = cleanedResp.replace(/```\n?/g, '')
    cleanedResp = cleanedResp.trim()

    console.log('Response preview:', cleanedResp.substring(0, 200) + '...')

    let JSONResp
    try {
      JSONResp = JSON.parse(cleanedResp)
      console.log('✅ JSON parsed successfully')
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Raw response:', cleanedResp.substring(0, 500))
      throw new Error('Failed to parse AI response as JSON: ' + parseError)
    }

    if (!JSONResp.sessionId) {
      JSONResp.sessionId = sessionId
    }

    console.log('💾 Updating database...')

    try {
      await db.update(SessionChatTable)
        .set({
          report: JSONResp,
          conversation: messages
        })
        .where(eq(SessionChatTable.sessionId, sessionId))

      console.log('✅ Database updated successfully')
    } catch (dbError) {
      console.error('⚠️ Database update error:', dbError)
      console.log('Continuing with report generation...')
    }

    console.log('✅ REPORT GENERATION COMPLETE')
    return NextResponse.json(JSONResp)

  } catch (error: any) {
    console.error('❌ MEDICAL REPORT ERROR:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate medical report',
        details: error.message || 'Unknown error occurred',
        type: error.name || 'Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}