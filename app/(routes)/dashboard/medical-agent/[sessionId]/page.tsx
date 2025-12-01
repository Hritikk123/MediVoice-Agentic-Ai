"use client"
import { useParams } from 'next/navigation'
import React from 'react'
import axios from 'axios'

function MedicalVoiceAgent() {
  const {sessionId} = useParams()

  const GetSessionDetails=async()=>{
    const result = await axios.get('/api/session-chat?sessionId='+sessionId)
    console.log(result.data)
  }
  return (
    <div>
      {sessionId}
    </div>
  )
}

export default MedicalVoiceAgent
