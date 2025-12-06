"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DialogClose } from "@radix-ui/react-dialog"
import { ArrowRight, Loader2 } from "lucide-react"
import axios from "axios"
import SuggestedDoctorCard from "./SuggestedDoctorCard"
import { doctorAgent } from "./DoctorAgentCard"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { SessionDetail } from "../medical-agent/[sessionId]/page"
import { toast } from "sonner"

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>()
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([])
  const [historyList, setHistoryList] = useState<SessionDetail[]>([])

  const router = useRouter()
  const { has } = useAuth()
  // free users: only 1 session allowed
  // @ts-ignore
  const paidUser = has && has({ plan: "pro" })

  // load history list once
  useEffect(() => {
    GetHistoryList()
  }, [])

  const GetHistoryList = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all")
      console.log('History list:', result.data)
      // Ensure we always set an array
      const data = Array.isArray(result.data) ? result.data : []
      setHistoryList(data)
    } catch (error: any) {
      console.error('Error fetching history list:', error)
      // Set empty array on error to prevent UI issues
      setHistoryList([])
    }
  }

  const onClickNext = async () => {
    if (!note || note.trim() === '') {
      toast.error('Please enter your symptoms or details')
      return
    }

    setLoading(true)
    try {
      console.log('Requesting doctor suggestions for:', note)
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      })
      console.log('Doctor suggestions response:', result.data)

      // make sure suggestedDoctors is ALWAYS an array
      const data = result.data
      const doctors = Array.isArray(data) ? data : (data.doctors || [])
      
      if (doctors.length === 0) {
        toast.error('No doctors found. Please try again.')
        setLoading(false)
        return
      }

      setSuggestedDoctors(doctors)

      // auto-select first doctor so Start Consultation is enabled immediately
      if (doctors.length > 0) {
        setSelectedDoctor(doctors[0])
      }

      toast.success(`Found ${doctors.length} specialist${doctors.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      console.error('Error suggesting doctors:', error)
      toast.error('Failed to suggest doctors: ' + (error.response?.data?.error || error.message || 'Unknown error'))
      // Show empty array on error
      setSuggestedDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const onStartConsultation = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor')
      return
    }

    setLoading(true)

    try {
      console.log('Starting consultation with:', selectedDoctor)
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      })
      console.log('Session created:', result.data)

      if (result.data?.sessionId) {
        toast.success('Consultation started!')
        // go to the medical-agent page where chat + voice happens
        router.push("/dashboard/medical-agent/" + result.data.sessionId)
      } else {
        toast.error('Failed to create session')
      }
    } catch (error: any) {
      console.error('Error starting consultation:', error)
      toast.error('Failed to start consultation: ' + (error.response?.data?.error || error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      {/* avoid nested <button> */}
      <DialogTrigger asChild>
        <Button
          className="mt-3"
          disabled={!paidUser && historyList?.length >= 1}
        >
          + Start a Consultation
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
        </DialogHeader>

        {/* avoid <h2> inside <p> by using asChild */}
        <DialogDescription asChild>
          {suggestedDoctors.length === 0 ? (
            <div>
              <h2 className="font-semibold mb-2">
                Add Symptoms or Any Other Details
              </h2>
              <Textarea
                placeholder="Add Details here..."
                className="h-[200px] mt-1"
                onChange={(e) => setNote(e.target.value)}
                value={note}
              />
            </div>
          ) : (
            <div>
              <h2 className="font-semibold mb-3">Select the Doctor</h2>
              <div className="grid grid-cols-3 gap-5">
                {suggestedDoctors.map((doctor, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedDoctor(doctor)}
                    className="cursor-pointer"
                  >
                    <SuggestedDoctorCard
                      doctorAgent={doctor}
                      // @ts-ignore
                      selectedDoctor={selectedDoctor}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogDescription>

        <DialogFooter>
          {/* avoid nested <button> */}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {suggestedDoctors.length === 0 ? (
            <Button disabled={!note || loading} onClick={onClickNext}>
              Next{" "}
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight />
              )}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={onStartConsultation}
            >
              Start Consultation{" "}
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight />
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewSessionDialog