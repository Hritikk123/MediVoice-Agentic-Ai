import React from 'react'
import HistoryList from './_components/HistoryList'
import DoctorAgentList from './_components/DoctorAgentList'
import AddNewSessionDialog from './_components/AddNewSessionDialog'

function Dashboard() {
  return (
    <div>
        <div className='flex justify-between items-center'>
        <h2 className='font-bold text-2xl'>My Dashboard</h2>
        <AddNewSessionDialog/>
        </div>
      <HistoryList/>
      <DoctorAgentList/>
    </div>
  )
}

export default Dashboard
