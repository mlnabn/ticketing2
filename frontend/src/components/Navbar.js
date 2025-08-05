import React from 'react';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      {/* <h2>Ticketing App</h2> */}
      <button onClick={onLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
