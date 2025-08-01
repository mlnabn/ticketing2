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

  const selesaikanPekerjaan = (id) => {
    setJobs((prevJobs) => {
      const updatedJobs = prevJobs.map((job) =>
        job.id === id ? { ...job, status: 'Selesai' } : job
      );

      const justFinished = prevJobs.find((job) => job.id === id);
      if (justFinished) {
        const nextJobIndex = updatedJobs.findIndex(
          (job) =>
            job.namaPekerja === justFinished.namaPekerja &&
            job.status === 'Belum Dikerjakan'
        );

        if (nextJobIndex !== -1) {
          updatedJobs[nextJobIndex] = {
            ...updatedJobs[nextJobIndex],
            status: 'Sedang Dikerjakan',
          };
        }
      }

      return updatedJobs;
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ticketing Tracker</h1>
      <JobForm addJob={addJob} />
      <JobList jobs={jobs} selesaikanPekerjaan={selesaikanPekerjaan} />
    </div>
  );
}

export default App;
