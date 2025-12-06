"use client"
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { doctorAgent } from '../../_components/DoctorAgentCard'
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner'

export type SessionDetail = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: doctorAgent,
  createdOn: string
}

type messages = {
  role: string,
  text: string
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams()
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>()
  const [callStarted, setCallStarted] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState<string>()
  const [vapiInstance, setVapiInstance] = useState<any>()
  const [currentRole, setCurrentRole] = useState<string | null>()
  const [messages, setMessages] = useState<messages[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails()
    }
  }, [sessionId])

  const GetSessionDetails = async () => {
    const result = await axios.get('/api/session-chat?sessionId=' + sessionId)
    setSessionDetail(result.data)
  }

  const StartCall = () => {
    setLoading(true)
    
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi)

    // Try using the assistant ID first (more reliable)
    const assistantId = process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID;
    
    //@ts-ignore
    vapi.start(assistantId);

    vapi.on('call-start', () => {
      console.log('Call started')
      setCallStarted(true)
      setLoading(false)
      toast.success('Connected! Start speaking...')
    });

    vapi.on('call-end', () => {
      setCallStarted(false)
      setLoading(false)
      console.log('Call ended')
    });

    vapi.on('message', (message: any) => {
      if (message.type === 'transcript') {
        const { role, transcriptType, transcript } = message

        if (transcriptType === 'partial') {
          setLiveTranscript(transcript)
          setCurrentRole(role)
        }
        else if (transcriptType === 'final') {
          setMessages((prev: any) => [...prev, { role: role, text: transcript }])
          setLiveTranscript("")
          setCurrentRole(null)
        }
      }
    });

    vapi.on('speech-start', () => {
      console.log('Assistant started speaking')
      setCurrentRole('assistant')
    })

    vapi.on('speech-end', () => {
      console.log('Assistant stopped speaking')
      setCurrentRole('user')
    })
  }

  const endCall = async () => {
    setLoading(true)
    
    if (vapiInstance) {
      // Just stop the call - don't try to remove listeners
      vapiInstance.stop()
      setVapiInstance(null)
    }

    setCallStarted(false)

    // Generate report if we have messages
    if (messages.length > 0) {
      try {
        await GenerateReport()
        toast.success('Report generated successfully!')
      } catch (error) {
        console.error('Error generating report:', error)
        toast.error('Failed to generate report')
      }
    } else {
      toast.info('No conversation recorded')
    }

    setLoading(false)
    
    // Navigate back to dashboard
    router.push('/dashboard')
  }

  const GenerateReport = async () => {
    const result = await axios.post('/api/medical-report', {
      messages: messages,
      sessionDetail: sessionDetail,
      sessionId: sessionId
    })
    console.log('Report generated:', result.data)
    return result.data
  }

  return (
    <div className='p-5 border rounded-3xl bg-secondary'>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
          <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`} />
          {callStarted ? 'Connected...' : 'Not connected'}
        </h2>
        <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
      </div>

      {sessionDetail && (
        <div className='flex items-center flex-col mt-10'>
          <Image
            src={sessionDetail.selectedDoctor?.image}
            alt={sessionDetail.selectedDoctor?.specialist ?? 'Doctor'}
            height={120}
            width={120}
            className='h-[100px] w-[100px] object-cover rounded-full'
          />
          <h2 className='mt-2 text-lg'>{sessionDetail.selectedDoctor?.specialist}</h2>
          <p className='text-sm text-gray-400'>AI Medical Voice Agent</p>

          <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72 max-h-[300px]'>
            {messages.slice(-4).map((msg: messages, index) => (
              <h2 className='text-gray-400 p-2' key={index}>
                <span className='font-semibold'>{msg.role}:</span> {msg.text}
              </h2>
            ))}

            {liveTranscript && (
              <h2 className='text-lg font-medium'>
                <span className='font-semibold'>{currentRole}:</span> {liveTranscript}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className='mt-20' onClick={StartCall} disabled={loading}>
              {loading ? <Loader className='animate-spin' /> : <PhoneCall />}
              Start Call
            </Button>
          ) : (
            <Button variant={'destructive'} onClick={endCall} disabled={loading}>
              {loading ? <Loader className='animate-spin' /> : <PhoneOff />}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default MedicalVoiceAgent