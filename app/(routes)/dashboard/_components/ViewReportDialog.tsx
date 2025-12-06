// FILE: app/(routes)/dashboard/_components/ViewReportDialog.tsx

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { SessionDetail } from '../medical-agent/[sessionId]/page'
import moment from 'moment'

type props = {
  record: SessionDetail
}

function ViewReportDialog({ record }: props) {
  const report = record.report

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'link'} size={'sm'}>View Report</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className='text-center text-2xl mb-4 flex items-center justify-center gap-2'>
            <span className='text-3xl'>🏥</span>
            Medical AI Voice Agent Report
          </DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-4'>
              
              {/* Session Info */}
              <div className='border-b-2 border-blue-400 pb-4'>
                <h2 className='font-bold text-blue-700 text-lg mb-3'>Session Info</h2>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-semibold text-gray-600'>Doctor:</span>
                    <p className='text-gray-900'>{record.selectedDoctor?.specialist || 'N/A'}</p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-600'>User:</span>
                    <p className='text-gray-900'>Anonymous</p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-600'>Consulted On:</span>
                    <p className='text-gray-900'>
                      {moment(new Date(record?.createdOn)).format('MMMM Do YYYY, h:mm a')}
                    </p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-600'>Agent:</span>
                    <p className='text-gray-900'>{record.selectedDoctor?.specialist || 'General Physician'} AI</p>
                  </div>
                </div>
              </div>

              {/* If report exists, show detailed sections */}
              {report ? (
                <>
                  {/* Chief Complaint */}
                  <div className='border-b-2 border-blue-400 pb-4'>
                    <h2 className='font-bold text-blue-700 text-lg mb-2'>Chief Complaint</h2>
                    <p className='text-gray-800'>
                      {report.chiefComplaint || record.notes || 'User reports symptoms requiring medical consultation.'}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className='border-b-2 border-blue-400 pb-4'>
                    <h2 className='font-bold text-blue-700 text-lg mb-2'>Summary</h2>
                    <p className='text-gray-800 leading-relaxed'>
                      {report.summary || report.diagnosis?.reasoning || 'Based on the consultation, the AI assistant has provided recommendations and guidance.'}
                    </p>
                  </div>

                  {/* Symptoms */}
                  {report.clinicalAssessment?.symptoms && report.clinicalAssessment.symptoms.length > 0 && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Symptoms</h2>
                      <ul className='list-disc list-inside space-y-1'>
                        {report.clinicalAssessment.symptoms.map((symptom: string, idx: number) => (
                          <li key={idx} className='text-gray-800'>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duration & Severity */}
                  <div className='border-b-2 border-blue-400 pb-4'>
                    <h2 className='font-bold text-blue-700 text-lg mb-3'>Duration & Severity</h2>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <span className='font-semibold text-gray-600'>Duration:</span>
                        <p className='text-gray-900'>
                          {report.patientHistory?.onsetAndDuration || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className='font-semibold text-gray-600'>Severity:</span>
                        <p className='text-gray-900 capitalize'>
                          {report.patientHistory?.severity || 'Moderate'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {report.diagnosis && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Diagnosis</h2>
                      <p className='text-gray-800 font-medium mb-2'>
                        {report.diagnosis.primary || 'Condition assessed based on symptoms'}
                      </p>
                      {report.diagnosis.reasoning && (
                        <p className='text-gray-700 text-sm'>
                          <span className='font-semibold'>Reasoning:</span> {report.diagnosis.reasoning}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Treatment Plan / Recommendations */}
                  <div className='border-b-2 border-blue-400 pb-4'>
                    <h2 className='font-bold text-blue-700 text-lg mb-3'>Treatment Plan</h2>
                    
                    {/* Medications */}
                    {report.treatmentPlan?.medications && report.treatmentPlan.medications.length > 0 && (
                      <div className='mb-4'>
                        <h3 className='font-semibold text-gray-700 mb-2'>Medications:</h3>
                        <div className='space-y-3'>
                          {report.treatmentPlan.medications.map((med: any, idx: number) => (
                            <div key={idx} className='bg-gray-50 p-3 rounded border border-gray-200'>
                              <p className='font-bold text-gray-900 mb-1'>{med.name}</p>
                              <div className='text-sm space-y-1'>
                                {med.dosage && (
                                  <p><span className='font-semibold'>Dosage:</span> {med.dosage}</p>
                                )}
                                {med.frequency && (
                                  <p><span className='font-semibold'>Frequency:</span> {med.frequency}</p>
                                )}
                                {med.timing && (
                                  <p><span className='font-semibold'>When to Take:</span> {med.timing}</p>
                                )}
                                {med.duration && (
                                  <p><span className='font-semibold'>Duration:</span> {med.duration}</p>
                                )}
                                {med.instructions && (
                                  <p className='text-gray-700 mt-2'>{med.instructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Recommendations */}
                    {report.treatmentPlan?.generalRecommendations && (
                      <div>
                        <h3 className='font-semibold text-gray-700 mb-2'>General Recommendations:</h3>
                        <p className='text-gray-800'>{report.treatmentPlan.generalRecommendations}</p>
                      </div>
                    )}
                  </div>

                  {/* Lifestyle Recommendations */}
                  {(report.lifestyleRecommendations?.dietaryAdvice || report.lifestyleRecommendations?.activityRestrictions) && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-3'>Lifestyle Recommendations</h2>
                      
                      {report.lifestyleRecommendations.dietaryAdvice && report.lifestyleRecommendations.dietaryAdvice.length > 0 && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-gray-700 mb-1'>Dietary Advice:</h3>
                          <ul className='list-disc list-inside space-y-1'>
                            {report.lifestyleRecommendations.dietaryAdvice.map((advice: string, idx: number) => (
                              <li key={idx} className='text-gray-800 text-sm'>{advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.lifestyleRecommendations.activityRestrictions && report.lifestyleRecommendations.activityRestrictions.length > 0 && (
                        <div>
                          <h3 className='font-semibold text-gray-700 mb-1'>Activity Guidelines:</h3>
                          <ul className='list-disc list-inside space-y-1'>
                            {report.lifestyleRecommendations.activityRestrictions.map((restriction: string, idx: number) => (
                              <li key={idx} className='text-gray-800 text-sm'>{restriction}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up */}
                  {report.followUpInstructions && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Follow-up</h2>
                      {report.followUpInstructions.nextVisit && (
                        <p className='text-gray-800 mb-2'>
                          <span className='font-semibold'>Next Visit:</span> {report.followUpInstructions.nextVisit}
                        </p>
                      )}
                      {report.followUpInstructions.testsRequired && report.followUpInstructions.testsRequired.length > 0 && (
                        <div>
                          <span className='font-semibold text-gray-700'>Tests Required:</span>
                          <ul className='list-disc list-inside ml-4 mt-1'>
                            {report.followUpInstructions.testsRequired.map((test: string, idx: number) => (
                              <li key={idx} className='text-gray-800 text-sm'>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning Signs */}
                  {report.warningSignsToWatch && report.warningSignsToWatch.length > 0 && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Warning Signs</h2>
                      <p className='text-sm text-gray-600 mb-2'>Seek immediate medical attention if you experience:</p>
                      <ul className='list-disc list-inside space-y-1'>
                        {report.warningSignsToWatch.map((sign: string, idx: number) => (
                          <li key={idx} className='text-red-700 font-medium text-sm'>{sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patient Education */}
                  {report.patientEducation && (
                    <div className='border-b-2 border-blue-400 pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Patient Education</h2>
                      {report.patientEducation.aboutCondition && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-gray-700 text-sm mb-1'>About Your Condition:</h3>
                          <p className='text-gray-800 text-sm'>{report.patientEducation.aboutCondition}</p>
                        </div>
                      )}
                      {report.patientEducation.expectedCourse && (
                        <div>
                          <h3 className='font-semibold text-gray-700 text-sm mb-1'>What to Expect:</h3>
                          <p className='text-gray-800 text-sm'>{report.patientEducation.expectedCourse}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Notes */}
                  {report.additionalNotes && (
                    <div className='pb-4'>
                      <h2 className='font-bold text-blue-700 text-lg mb-2'>Additional Notes</h2>
                      <p className='text-gray-800 text-sm'>{report.additionalNotes}</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className='bg-gray-100 p-3 rounded text-xs text-gray-600 text-center border border-gray-300'>
                    {report.disclaimer || 'This is an AI-generated consultation report and should not replace professional medical advice. For medical emergencies, contact emergency services immediately.'}
                  </div>
                </>
              ) : (
                <div className='text-center text-gray-500 py-8 space-y-3'>
                  <p className='text-lg'>📋 No detailed report available</p>
                  <p className='text-sm'>The report may still be generating or the consultation may not have been completed.</p>
                  {record.notes && (
                    <div className='bg-gray-50 p-4 rounded mt-4 text-left'>
                      <p className='font-semibold text-gray-700 mb-1'>Initial Notes:</p>
                      <p className='text-gray-800'>{record.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReportDialog