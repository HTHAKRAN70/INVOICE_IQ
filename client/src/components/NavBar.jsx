import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    setIsLoggedIn(!!token); 
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
    setIsOpen(false);
  };

  const isLoginPage = location.pathname === '/login-signup';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand">
          <Link to="/" onClick={toggleMenu}>InvoiceIQ.</Link>
        </div>
        <div className={`menu ${isOpen ? 'open' : ''}`}>
          {!isLoginPage && (
            <>
              <a href="#section1" onClick={toggleMenu}>About</a>
              <a href="#section4" onClick={toggleMenu}>Products</a>
              <a href="#section3" onClick={toggleMenu}>For You</a>
              <a href="#section5" onClick={toggleMenu}>FAQ</a>
            </>
          )}
          <div className="nav-btns">
            {isLoggedIn ? (
              <button className="logout" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login-signup">
                  <button className="login">Login</button>
                </Link>
                <Link to="/login-signup">
                  <button className="signup">Signup</button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          {isOpen ? <X className="icon" /> : <Menu className="icon" />} {/* Lucide icons */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
