// "use client"
// import React, { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Textarea } from '@/components/ui/textarea'
// import { DialogClose } from '@radix-ui/react-dialog'
// import { ArrowRight, Loader2 } from 'lucide-react'
// import axios from 'axios'
// import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
// import SuggestedDoctorCard from './SuggestedDoctorCard'

// function AddNewSessionDialog() {
//   const [note, setNote] = useState<string>()
//   const [loading, setLoading] = useState(false)
//   const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([])

//   const onClickNext = async () => {
//     setLoading(true)
//     const result = await axios.post('/api/suggest-doctors', {
//       notes: note,
//     })
//     console.log(result.data)

//     const data = result.data
//     const doctors = Array.isArray(data) ? data : data.doctors ?? []

//     setSuggestedDoctors(doctors)
//     setLoading(false)
//   }

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="mt-3">+ Start a Consultation</Button>
//       </DialogTrigger>

//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add Basic Details</DialogTitle>
//           <DialogDescription asChild>
//             {suggestedDoctors.length === 0 ? (
//               <div>
//                 <h2>Add Symptoms or Any Other Details</h2>
//                 <Textarea
//                   placeholder="Add Details here..."
//                   className="h-[200px] mt-1"
//                   onChange={(e) => setNote(e.target.value)}
//                 />
//               </div>
//             ) : (
//               <div className="grid grid-cols-3 gap-5">
//                 {suggestedDoctors.map((doctor, index) => (
//                   <SuggestedDoctorCard doctorAgent={doctor} key={index} />
//                 ))}
//               </div>
//             )}
//           </DialogDescription>
//         </DialogHeader>

//         <DialogFooter>
//           <DialogClose asChild>
//             <Button variant="outline">Cancel</Button>
//           </DialogClose>

//           {suggestedDoctors.length === 0 ? (
//             <Button disabled={!note || loading} onClick={onClickNext}>
//               Next{" "}
//               {loading ? (
//                 <Loader2 className="animate-spin" />
//               ) : (
//                 <ArrowRight />
//               )}
//             </Button>
//           ) : (
//             <Button>Start Consultation</Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default AddNewSessionDialog


"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'

function AddNewSessionDialog() {
    const [note,setNote] = useState<string>()
    const [loading,setLoading]= useState(false)
    const router = useRouter()
    const [selectedDoctor,setSelectedDoctor] =useState<doctorAgent>()
    const [suggestedDoctors,setSuggestedDoctors]=useState<doctorAgent[]>()
    const onClickNext=async()=>{
        setLoading(true)
        const result = await axios.post('/api/suggest-doctors',{
            notes:note
        })
        console.log(result.data)
        setSuggestedDoctors(result.data)
        setLoading(false)
    }

    const onStartConsultation=async()=>{
        setLoading(true)
        // Save all info to database
        const result = await axios.post('/api/session-chat',{
            notes:note,
            selectedDoctor:selectedDoctor
        })
        console.log(result.data)
        if(result.data?.sessionId)
        {
            console.log(result.data.sessionId)
            //Route new conversation

            router.push('/dashboard/medical-agent/'+result.data.sessionId);
        }
        setLoading(false)

    }
  return (
    <Dialog>
  <DialogTrigger>
    <Button className='mt-3'>+ Start a Consultation</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Basic Details</DialogTitle>
      <DialogDescription>
        {!suggestedDoctors ? <div>
            <h2>Add Symptoms or Any Other Details</h2>
            <Textarea placeholder='Add Details here...' 
            className='h-[200px] mt-1'
            onChange={(e)=>setNote(e.target.value)}
            />
        </div>:
            <div>
                <h2>Select the Doctor</h2>
            <div className='grid grid-cols-3 gap-5'>
                {suggestedDoctors.map((doctor,index)=>(
                        <SuggestedDoctorCard doctorAgent={doctor} key={index}
                        setSelectedDoctor={()=>setSelectedDoctor(doctor)}
                        //@ts-ignore
                        selectedDoctor={selectedDoctor}/>
                ))}
        </div>
        </div>}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <DialogClose>
            <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
        
        {!suggestedDoctors ? <Button disabled={!note|| loading} onClick={()=>onClickNext()}>
            
            Next {loading ? <Loader2 className='animate-spin'/>:<ArrowRight/>}</Button>
            : <Button disabled={loading || !selectedDoctor} onClick={()=>onStartConsultation()}>Start Consultation {loading ? <Loader2 className='animate-spin'/>:<ArrowRight/>}</Button>}
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default AddNewSessionDialog


//hi
