import React from 'react';

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) {
    return null; // Tidak perlu paginasi jika hanya ada 1 halaman
  }

  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="pagination-nav">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            &laquo;
          </button>
        </li>
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage}>
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;