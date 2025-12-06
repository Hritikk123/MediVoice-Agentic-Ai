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
  // Parse the report data
  const reportData = record.report as any

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'link'} size={'sm'}>View Report</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className='text-center text-2xl font-bold text-blue-600'>
            Medical AI Voice Agent Report
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          {/* Session Info */}
          <div className='border-b pb-4'>
            <h2 className='font-bold text-blue-500 text-lg mb-3'>Session Info</h2>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='font-semibold text-gray-700'>Doctor: </span>
                <span className='text-gray-600'>{reportData?.sessionInfo?.doctor || record.selectedDoctor?.specialist}</span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>User: </span>
                <span className='text-gray-600'>{reportData?.sessionInfo?.user || 'Anonymous'}</span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>Consulted On: </span>
                <span className='text-gray-600'>{moment(new Date(record?.createdOn)).format('MMM Do YYYY, h:mm a')}</span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>Agent: </span>
                <span className='text-gray-600'>{reportData?.sessionInfo?.agent || record.selectedDoctor?.specialist + ' AI'}</span>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          {(reportData?.chiefComplaint || record.notes) && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Chief Complaint</h2>
              <p className='text-gray-700 text-sm'>
                {reportData?.chiefComplaint || record.notes}
              </p>
            </div>
          )}

          {/* Summary */}
          {reportData?.summary && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Summary</h2>
              <p className='text-gray-700 text-sm leading-relaxed'>
                {reportData.summary}
              </p>
            </div>
          )}

          {/* Symptoms */}
          {reportData?.symptoms && reportData.symptoms.length > 0 && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Symptoms</h2>
              <ul className='list-disc list-inside space-y-1'>
                {reportData.symptoms.map((symptom: string, index: number) => (
                  <li key={index} className='text-gray-700 text-sm'>{symptom}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagnosis */}
          {reportData?.diagnosis && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Diagnosis</h2>
              <p className='text-gray-700 text-sm font-medium'>
                {reportData.diagnosis}
              </p>
            </div>
          )}

          {/* Medications - DETAILED */}
          {reportData?.medications && reportData.medications.length > 0 && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-3'>Prescribed Medications</h2>
              <div className='space-y-4'>
                {reportData.medications.map((med: any, index: number) => (
                  <div key={index} className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                    <h3 className='font-bold text-gray-800 mb-2'>{med.name}</h3>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      {med.dosage && (
                        <div>
                          <span className='font-semibold text-gray-700'>Dosage: </span>
                          <span className='text-gray-600'>{med.dosage}</span>
                        </div>
                      )}
                      {med.frequency && (
                        <div>
                          <span className='font-semibold text-gray-700'>Frequency: </span>
                          <span className='text-gray-600'>{med.frequency}</span>
                        </div>
                      )}
                      {med.timing && (
                        <div>
                          <span className='font-semibold text-gray-700'>Timing: </span>
                          <span className='text-gray-600'>{med.timing}</span>
                        </div>
                      )}
                      {med.duration && (
                        <div>
                          <span className='font-semibold text-gray-700'>Duration: </span>
                          <span className='text-gray-600'>{med.duration}</span>
                        </div>
                      )}
                    </div>
                    {med.instructions && (
                      <div className='mt-2'>
                        <span className='font-semibold text-gray-700'>Instructions: </span>
                        <span className='text-gray-600 text-sm'>{med.instructions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Recommendations */}
          {reportData?.dietaryRecommendations && reportData.dietaryRecommendations.length > 0 && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Dietary Recommendations</h2>
              <ul className='list-disc list-inside space-y-1'>
                {reportData.dietaryRecommendations.map((diet: string, index: number) => (
                  <li key={index} className='text-gray-700 text-sm'>{diet}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Activity Restrictions */}
          {reportData?.activityRestrictions && reportData.activityRestrictions.length > 0 && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Activity Restrictions</h2>
              <ul className='list-disc list-inside space-y-1'>
                {reportData.activityRestrictions.map((restriction: string, index: number) => (
                  <li key={index} className='text-gray-700 text-sm'>{restriction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Instructions */}
          {reportData?.followUp && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Follow-up Instructions</h2>
              <p className='text-gray-700 text-sm'>
                {reportData.followUp}
              </p>
            </div>
          )}

          {/* Warning Signs */}
          {reportData?.warningSignsToWatch && reportData.warningSignsToWatch.length > 0 && (
            <div className='border-b pb-4 bg-red-50 p-4 rounded-lg'>
              <h2 className='font-bold text-red-600 text-lg mb-2'>⚠️ Warning Signs to Watch</h2>
              <ul className='list-disc list-inside space-y-1'>
                {reportData.warningSignsToWatch.map((sign: string, index: number) => (
                  <li key={index} className='text-red-700 text-sm font-medium'>{sign}</li>
                ))}
              </ul>
              <p className='text-red-600 text-xs mt-2 font-semibold'>
                Seek immediate medical attention if you experience any of these symptoms.
              </p>
            </div>
          )}

          {/* Recommendations */}
          {reportData?.recommendations && reportData.recommendations.length > 0 && (
            <div className='border-b pb-4'>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Recommendations</h2>
              <ul className='list-disc list-inside space-y-1'>
                {reportData.recommendations.map((rec: string, index: number) => (
                  <li key={index} className='text-gray-700 text-sm'>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Notes */}
          {reportData?.additionalNotes && (
            <div>
              <h2 className='font-bold text-blue-500 text-lg mb-2'>Additional Notes</h2>
              <p className='text-gray-700 text-sm leading-relaxed'>
                {reportData.additionalNotes}
              </p>
            </div>
          )}

          {/* Fallback: Show raw JSON if structure doesn't match */}
          {!reportData?.sessionInfo && !reportData?.summary && record.report && (
            <div>
              <h2 className='font-bold text-blue-500 text-lg mb-3'>Report Details:</h2>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <pre className='whitespace-pre-wrap text-sm text-gray-700'>
                  {JSON.stringify(record.report, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReportDialog