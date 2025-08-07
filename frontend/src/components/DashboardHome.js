import React from 'react';
import JobForm from './JobForm'; // Pastikan path benar
import JobList from './JobList'; // Pastikan path benar

const DashboardHome = ({ tickets, users, addTicket, updateTicketStatus, deleteTicket }) => {
  return (
    <div className="p-6">
      {/* Bagian Dashboard v3 (kartu informasi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">0</h3>
          <p>Tiket Belum Selesai</p>
          <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">2</h3>
          <p>Tiket Selesai</p>
          <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">4</h3>
          <p>Total Assign</p>
          <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
        </div>
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">5</h3>
          <p>Users</p>
          <button className="mt-2 text-sm underline">More info <i className="fas fa-arrow-circle-right"></i></button>
        </div>
      </div>

      {/* Bagian Ticketing Tracker (JobForm dan JobList) */}
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Ticketing Tracker</h1>
      <JobForm users={users} addTicket={addTicket} />
      <JobList tickets={tickets} updateTicketStatus={updateTicketStatus} deleteTicket={deleteTicket} />
    </div>
  );
};

export default DashboardHome;
