import React, { useState, useEffect } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import './App.css'

const DAFTAR_PEKERJA = ['Andi', 'Budi', 'Citra', 'Dewi'];
const DAFTAR_STATUS = ['Belum Dikerjakan', 'Sedang Dikerjakan'];

function App() {
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('jobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (namaPekerja, namaPekerjaan, status) => {
    if (status === 'Sedang Dikerjakan') {
      const isWorkerBusy = jobs.some(
        (job) => job.namaPekerja === namaPekerja && job.status === 'Sedang Dikerjakan'
      );
      if (isWorkerBusy) {
        alert(`${namaPekerja} sudah memiliki pekerjaan yang sedang dikerjakan! Status diubah menjadi 'Belum Dikerjakan'.`);
        status = 'Belum Dikerjakan';
      }
    }
    
    const newJob = {
      id: new Date().getTime(),
      namaPekerja,
      namaPekerjaan,
      status,
    };
    setJobs([...jobs, newJob]);
  };

  // PASTIKAN FUNGSI INI ADA DI SINI
  const mulaiPekerjaan = (id) => {
    const jobToStart = jobs.find((job) => job.id === id);
    if (!jobToStart) return;

    const isWorkerBusy = jobs.some(
      (job) => job.namaPekerja === jobToStart.namaPekerja && job.status === 'Sedang Dikerjakan'
    );

    if (isWorkerBusy) {
      alert(`${jobToStart.namaPekerja} tidak bisa memulai pekerjaan baru karena masih ada pekerjaan yang aktif.`);
      return;
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === id ? { ...job, status: 'Sedang Dikerjakan' } : job
      )
    );
  };

  const selesaikanPekerjaan = (id) => {
    setJobs((prevJobs) => {
      let updatedJobs = prevJobs.map((job) =>
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
      <JobForm
        addJob={addJob}
        pekerjaList={DAFTAR_PEKERJA}
        statusList={DAFTAR_STATUS}
      />
      <JobList
        jobs={jobs}
        selesaikanPekerjaan={selesaikanPekerjaan}
        mulaiPekerjaan={mulaiPekerjaan}
      />
    </div>
  );
}

export default App;