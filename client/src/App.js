import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import LoginSignUp from './components/LoginSignUp';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Invoice from './components/Invoice'; // Import the Invoice component
import { ProductProvider } from './ProductContext';
import './App.css';
import Landing from './components/Landing';
import Loading from './components/Loading'; // Import the Loading component
import Branches from './components/Branches';
import Categories from './components/Categories';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Set the duration of the loading screen here

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, []);

  return (
    <ProductProvider>
      <Router>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login-signup" element={<LoginSignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </>
        )}
      </Router>
    </ProductProvider>
  );
};

export default App;
