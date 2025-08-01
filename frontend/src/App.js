import React, { useState } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';

function App() {
  const [jobs, setJobs] = useState([]);

  const addJob = (namaPekerja, namaPekerjaan) => {
    const sedangDikerjakan = jobs.some(
      (job) => job.namaPekerja === namaPekerja && job.status === 'Sedang Dikerjakan'
    );

    const newJob = {
      id: jobs.length + 1,
      namaPekerja,
      namaPekerjaan,
      status: sedangDikerjakan ? 'Belum Dikerjakan' : 'Sedang Dikerjakan',
    };

    setJobs([...jobs, newJob]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ticketing Tracker</h1>
      <JobForm addJob={addJob} />
      <JobList jobs={jobs} />
    </div>
  );
}

export default App;
