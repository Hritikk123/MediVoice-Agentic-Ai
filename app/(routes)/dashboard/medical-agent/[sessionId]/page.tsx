"use client"
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { doctorAgent } from '../../_components/DoctorAgentCard'
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Vapi from '@vapi-ai/web'
import { toast } from 'sonner'

export type SessionDetail = {
  id: number
  sessionId: string
  createdBy: string
  notes: string
  selectedDoctor: doctorAgent
  createdOn: string
  report?: any
  conversation?: any
}

function MedicalVoiceAgent() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params['sessionId']
  
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>()
  const [vapiInstance, setVapiInstance] = useState<any>()
  const [callStarted, setCallStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [currentRole, setCurrentRole] = useState<string>('')
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails()
    }
  }, [sessionId])

  // Timer effect - counts seconds when call is active
  useEffect(() => {
    let interval: any
    if (callStarted) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [callStarted])

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const GetSessionDetails = async () => {
    try {
      setLoading(true)
      const result = await axios.get('/api/session-chat?sessionId=' + sessionId)
      console.log('Session details:', result.data)
      setSessionDetail(result.data)
    } catch (error: any) {
      console.error('Error fetching session details:', error)
      toast.error('Failed to load session details')
    } finally {
      setLoading(false)
    }
  }

  const StartCall = async () => {
    console.log('Starting call with VAPI...')
    
    if (!sessionDetail) {
      toast.error('Session details not loaded')
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY
    if (!apiKey) {
      toast.error('VAPI API key not configured')
      return
    }

    console.log('VAPI API Key exists:', !!apiKey)
    
    setLoading(true)

    try {
      const vapi = new Vapi(apiKey)
      console.log('VAPI instance created successfully')
      
      setVapiInstance(vapi)

      vapi.on('call-start', () => {
        console.log('✅ Call started successfully')
        setCallStarted(true)
        setLoading(false)
        toast.success('Call connected!')
      })

      vapi.on('call-end', () => {
        console.log('Call ended')
        setCallStarted(false)
        setCurrentRole('')
      })

      vapi.on('speech-start', () => {
        console.log('Assistant started speaking')
        setCurrentRole('assistant')
      })

      vapi.on('speech-end', () => {
        console.log('Assistant stopped speaking')
        setCurrentRole('')
      })

      vapi.on('message', (message: any) => {
        console.log('Message received:', message)
        
        if (message.type === 'transcript') {
          const transcriptType = message.transcriptType
          const transcript = message.transcript
          
          if (transcriptType === 'partial') {
            console.log('Partial transcript:', transcript)
          } else if (transcriptType === 'final') {
            console.log('Final transcript:', transcript)
            setMessages((prev) => [...prev, message])
          }
        }
      })

      const assistantId = process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID
      console.log('Starting call with assistant ID:', assistantId)
      
      await vapi.start(assistantId)
      
    } catch (error: any) {
      console.error('Error starting call:', error)
      setLoading(false)
      setCallStarted(false)
      toast.error('Failed to start call: ' + (error.message || 'Unknown error'))
    }
  }

  const endCall = async () => {
    console.log('Ending call...')
    
    if (vapiInstance) {
      try {
        vapiInstance.stop()
        setCallStarted(false)
        
        console.log('Generating report with', messages.length, 'messages')
        
        if (messages.length > 0) {
          await GenerateReport()
          toast.success('Call ended. Report generated!')
        } else {
          toast.info('Call ended. No conversation to report.')
        }
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        
      } catch (error: any) {
        console.error('Error ending call:', error)
        toast.error('Error ending call: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const GenerateReport = async () => {
    console.log('=== STARTING REPORT GENERATION ===')
    console.log('Messages count:', messages.length)
    console.log('SessionId:', sessionId)

    try {
      if (!messages || messages.length === 0) {
        console.log('No messages to generate report from')
        toast.info('No conversation recorded')
        return
      }

      toast.info('Generating detailed medical report...')

      const result = await axios.post('/api/medical-report', {
        messages: messages,
        sessionDetail: sessionDetail,
        sessionId: sessionId
      })

      console.log('✅ Report generated successfully:', result.data)
      toast.success('Detailed medical report generated!')
      
    } catch (error: any) {
      console.error('❌ Report generation error:', error)
      console.error('Error response:', error.response?.data)
      
      const errorMsg = error.response?.data?.details || 
                       error.response?.data?.error || 
                       error.message || 
                       'Failed to generate report'
      
      toast.error('Report Error: ' + errorMsg)
    }
  }

  if (loading && !sessionDetail) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader className='animate-spin w-10 h-10' />
      </div>
    )
  }

  return (
    <div className='p-10 flex flex-col items-center justify-center h-screen gap-5'>
      <Image
        src={sessionDetail?.selectedDoctor?.image || '/placeholder.png'}
        alt='doctor'
        width={200}
        height={200}
        className='rounded-full border-4 border-primary'
      />
      
      <h2 className='text-2xl font-bold'>
        {sessionDetail?.selectedDoctor?.specialist}
      </h2>
      
      <p className='text-gray-500 text-center max-w-md'>
        {sessionDetail?.selectedDoctor?.agentPrompt}
      </p>

      {/* CONNECTION STATUS AND TIMER - THIS IS THE KEY PART */}
      <div className='flex items-center gap-6 bg-gray-100 px-6 py-3 rounded-lg'>
        {/* Connection Status with Green/Red Circle */}
        <div className='flex items-center gap-2'>
          <Circle 
            className={`w-4 h-4 ${
              callStarted 
                ? 'fill-green-500 text-green-500 animate-pulse' 
                : 'fill-red-500 text-red-500'
            }`} 
          />
          <span className={`font-semibold ${callStarted ? 'text-green-600' : 'text-red-600'}`}>
            {callStarted ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        
        {/* Timer in MM:SS format */}
        <div className='text-2xl font-mono font-bold text-gray-800'>
          {formatDuration(callDuration)}
        </div>
      </div>

      {!callStarted ? (
        <Button 
          disabled={loading} 
          onClick={StartCall}
          className='gap-2 px-8 py-6 text-lg'
        >
          {loading ? (
            <>
              <Loader className='animate-spin w-5 h-5' />
              Connecting...
            </>
          ) : (
            <>
              <PhoneCall className='w-5 h-5' />
              Start Call
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={endCall}
          variant='destructive'
          className='gap-2 px-8 py-6 text-lg'
        >
          <PhoneOff className='w-5 h-5' />
          Disconnect
        </Button>
      )}

      {callStarted && (
        <div className='mt-5 w-full max-w-2xl'>
          <h3 className='font-bold text-lg mb-3 flex items-center gap-2'>
            <Circle className={`w-3 h-3 ${currentRole === 'assistant' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'} animate-pulse`} />
            Conversation Transcript
          </h3>
          
          <div className='bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto'>
            {messages.length === 0 ? (
              <p className='text-gray-400 text-center'>
                Waiting for conversation to start...
              </p>
            ) : (
              <div className='space-y-3'>
                {messages.map((msg, index) => (
                  <div key={index} className='text-sm'>
                    <span className='font-bold'>
                      {msg.role === 'assistant' ? 'AI Doctor' : 'You'}:
                    </span>{' '}
                    <span className='text-gray-700'>
                      {msg.transcript || msg.content}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalVoiceAgent