import React from 'react';

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="pagination-nav" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
      <ul className="pagination" style={{ display: 'flex', listStyle: 'none', padding: 0, gap: '5px' }}>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
        </li>
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(number)}>{number}</button>
          </li>
        ))}
        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage}>&raquo;</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;