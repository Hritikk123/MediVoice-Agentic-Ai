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
          <DialogTitle className='text-center text-3xl mb-4'>
            Medical Consultation Report
          </DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-6'>
              
              {/* Session Info */}
              <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <h2 className='font-bold text-blue-700 text-xl mb-3'>Session Information</h2>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <span className='font-semibold text-gray-700'>Doctor:</span>
                    <p className='text-gray-900'>{record.selectedDoctor?.specialist || 'N/A'}</p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-700'>Date:</span>
                    <p className='text-gray-900'>{moment(new Date(record?.createdOn)).format('MMMM DD, YYYY')}</p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-700'>Time:</span>
                    <p className='text-gray-900'>{moment(new Date(record?.createdOn)).format('hh:mm A')}</p>
                  </div>
                  <div>
                    <span className='font-semibold text-gray-700'>Session ID:</span>
                    <p className='text-gray-900 text-xs'>{record.sessionId}</p>
                  </div>
                </div>
              </div>

              {record.notes && (
                <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                  <h2 className='font-bold text-gray-700 text-lg mb-2'>Initial Notes</h2>
                  <p className='text-gray-800'>{record.notes}</p>
                </div>
              )}

              {/* If report exists, show detailed sections */}
              {report ? (
                <>
                  {/* Chief Complaint */}
                  {report.chiefComplaint && (
                    <div className='bg-orange-50 p-4 rounded-lg border border-orange-200'>
                      <h2 className='font-bold text-orange-700 text-lg mb-2'>Chief Complaint</h2>
                      <p className='text-gray-800'>{report.chiefComplaint}</p>
                    </div>
                  )}

                  {/* Patient History */}
                  {report.patientHistory && (
                    <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
                      <h2 className='font-bold text-purple-700 text-xl mb-3'>Patient History</h2>
                      <div className='space-y-3'>
                        {report.patientHistory.presentingSymptoms && (
                          <div>
                            <h3 className='font-semibold text-purple-600'>Presenting Symptoms:</h3>
                            <p className='text-gray-800'>{report.patientHistory.presentingSymptoms}</p>
                          </div>
                        )}
                        {report.patientHistory.onsetAndDuration && (
                          <div>
                            <h3 className='font-semibold text-purple-600'>Onset & Duration:</h3>
                            <p className='text-gray-800'>{report.patientHistory.onsetAndDuration}</p>
                          </div>
                        )}
                        {report.patientHistory.severity && (
                          <div>
                            <h3 className='font-semibold text-purple-600'>Severity:</h3>
                            <p className='text-gray-800 capitalize'>{report.patientHistory.severity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clinical Assessment */}
                  {report.clinicalAssessment && (
                    <div className='bg-indigo-50 p-4 rounded-lg border border-indigo-200'>
                      <h2 className='font-bold text-indigo-700 text-xl mb-3'>Clinical Assessment</h2>
                      {report.clinicalAssessment.symptoms && report.clinicalAssessment.symptoms.length > 0 && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-indigo-600 mb-1'>Symptoms:</h3>
                          <ul className='list-disc list-inside space-y-1'>
                            {report.clinicalAssessment.symptoms.map((symptom: string, idx: number) => (
                              <li key={idx} className='text-gray-800'>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Diagnosis */}
                  {report.diagnosis && (
                    <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
                      <h2 className='font-bold text-red-700 text-xl mb-3'>Diagnosis</h2>
                      {report.diagnosis.primary && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-red-600'>Primary Diagnosis:</h3>
                          <p className='text-gray-800'>{report.diagnosis.primary}</p>
                        </div>
                      )}
                      {report.diagnosis.reasoning && (
                        <div>
                          <h3 className='font-semibold text-red-600'>Reasoning:</h3>
                          <p className='text-gray-800'>{report.diagnosis.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MEDICATIONS - MOST IMPORTANT */}
                  {report.treatmentPlan?.medications && report.treatmentPlan.medications.length > 0 && (
                    <div className='bg-green-50 p-4 rounded-lg border-2 border-green-300'>
                      <h2 className='font-bold text-green-700 text-2xl mb-4'>💊 Medications Prescribed</h2>
                      <div className='space-y-4'>
                        {report.treatmentPlan.medications.map((med: any, idx: number) => (
                          <div key={idx} className='bg-white p-4 rounded-lg shadow-sm border border-green-200'>
                            <h3 className='font-bold text-lg text-green-800 mb-2'>{med.name}</h3>
                            <div className='grid grid-cols-2 gap-3 text-sm'>
                              {med.dosage && (
                                <div>
                                  <span className='font-semibold text-gray-600'>Dosage:</span>
                                  <p className='text-gray-900 font-medium'>{med.dosage}</p>
                                </div>
                              )}
                              {med.frequency && (
                                <div>
                                  <span className='font-semibold text-gray-600'>Frequency:</span>
                                  <p className='text-gray-900 font-medium'>{med.frequency}</p>
                                </div>
                              )}
                              {med.timing && (
                                <div>
                                  <span className='font-semibold text-gray-600'>When to Take:</span>
                                  <p className='text-gray-900 font-medium'>{med.timing}</p>
                                </div>
                              )}
                              {med.duration && (
                                <div>
                                  <span className='font-semibold text-gray-600'>Duration:</span>
                                  <p className='text-gray-900 font-medium'>{med.duration}</p>
                                </div>
                              )}
                            </div>
                            {med.instructions && (
                              <div className='mt-3 bg-green-50 p-3 rounded'>
                                <span className='font-semibold text-gray-600'>Instructions:</span>
                                <p className='text-gray-900 mt-1'>{med.instructions}</p>
                              </div>
                            )}
                            {med.purpose && (
                              <div className='mt-2'>
                                <span className='font-semibold text-gray-600'>Purpose:</span>
                                <p className='text-gray-800'>{med.purpose}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dietary Recommendations */}
                  {report.lifestyleRecommendations?.dietaryAdvice && report.lifestyleRecommendations.dietaryAdvice.length > 0 && (
                    <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                      <h2 className='font-bold text-yellow-700 text-xl mb-3'>🍎 Dietary Recommendations</h2>
                      <ul className='list-disc list-inside space-y-2'>
                        {report.lifestyleRecommendations.dietaryAdvice.map((advice: string, idx: number) => (
                          <li key={idx} className='text-gray-800'>{advice}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Activity Restrictions */}
                  {report.lifestyleRecommendations?.activityRestrictions && report.lifestyleRecommendations.activityRestrictions.length > 0 && (
                    <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                      <h2 className='font-bold text-blue-700 text-xl mb-3'>🏃 Activity Guidelines</h2>
                      <ul className='list-disc list-inside space-y-2'>
                        {report.lifestyleRecommendations.activityRestrictions.map((restriction: string, idx: number) => (
                          <li key={idx} className='text-gray-800'>{restriction}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Instructions */}
                  {report.followUpInstructions && (
                    <div className='bg-teal-50 p-4 rounded-lg border border-teal-200'>
                      <h2 className='font-bold text-teal-700 text-xl mb-3'>📅 Follow-up Instructions</h2>
                      <div className='space-y-2'>
                        {report.followUpInstructions.nextVisit && (
                          <div>
                            <span className='font-semibold text-teal-600'>Next Visit:</span>
                            <p className='text-gray-800'>{report.followUpInstructions.nextVisit}</p>
                          </div>
                        )}
                        {report.followUpInstructions.testsRequired && report.followUpInstructions.testsRequired.length > 0 && (
                          <div>
                            <span className='font-semibold text-teal-600'>Tests Required:</span>
                            <ul className='list-disc list-inside ml-4'>
                              {report.followUpInstructions.testsRequired.map((test: string, idx: number) => (
                                <li key={idx} className='text-gray-800'>{test}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* WARNING SIGNS - IMPORTANT */}
                  {report.warningSignsToWatch && report.warningSignsToWatch.length > 0 && (
                    <div className='bg-red-100 p-4 rounded-lg border-2 border-red-400'>
                      <h2 className='font-bold text-red-700 text-xl mb-3'>⚠️ Warning Signs - Seek Immediate Help If:</h2>
                      <ul className='list-disc list-inside space-y-2'>
                        {report.warningSignsToWatch.map((sign: string, idx: number) => (
                          <li key={idx} className='text-red-900 font-medium'>{sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patient Education */}
                  {report.patientEducation && (
                    <div className='bg-gray-50 p-4 rounded-lg border border-gray-300'>
                      <h2 className='font-bold text-gray-700 text-xl mb-3'>📚 Patient Education</h2>
                      {report.patientEducation.aboutCondition && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-gray-600'>About Your Condition:</h3>
                          <p className='text-gray-800'>{report.patientEducation.aboutCondition}</p>
                        </div>
                      )}
                      {report.patientEducation.expectedCourse && (
                        <div className='mb-3'>
                          <h3 className='font-semibold text-gray-600'>What to Expect:</h3>
                          <p className='text-gray-800'>{report.patientEducation.expectedCourse}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Notes */}
                  {report.additionalNotes && (
                    <div className='bg-gray-100 p-4 rounded-lg border border-gray-300'>
                      <h2 className='font-bold text-gray-700 text-lg mb-2'>Additional Notes</h2>
                      <p className='text-gray-800'>{report.additionalNotes}</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className='bg-gray-200 p-3 rounded text-xs text-gray-600 text-center'>
                    {report.disclaimer || 'This is an AI-generated consultation report. For medical emergencies, contact emergency services immediately.'}
                  </div>
                </>
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  <p>No detailed report available for this consultation.</p>
                  <p className='text-sm mt-2'>The report may still be generating or the consultation may not have been completed.</p>
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