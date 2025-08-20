import React from 'react';

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="my-pagination-nav">
      <ul className="my-pagination-list">
        <li className={`my-page-item ${currentPage === 1 ? 'my-disabled' : ''}`}>
          <button 
            className="my-page-link" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>

        {pageNumbers.map(number => (
          <li 
            key={number} 
            className={`my-page-item ${currentPage === number ? 'my-active' : ''}`}
          >
            <button 
              className="my-page-link" 
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}

        <li className={`my-page-item ${currentPage === lastPage ? 'my-disabled' : ''}`}>
          <button 
            className="my-page-link" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === lastPage}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
