import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
       
        <h1 className="text-xl font-bold text-blue-600">EduDash</h1>


        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-blue-500 transition">Home</a>
          <a href="/dashboard" className="hover:text-blue-500 transition">Dashboard</a>
          <a href="/about" className="hover:text-blue-500 transition">About</a>
          <a href="/contact" className="hover:text-blue-500 transition">Contact</a>
        </nav>

        
        <button className="md:hidden text-gray-700" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

     
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          <nav className="flex flex-col gap-3 mt-2 text-gray-700 font-medium">
            <a href="/" className="hover:text-blue-500 transition">Home</a>
            <a href="/dashboard" className="hover:text-blue-500 transition">Dashboard</a>
            <a href="/about" className="hover:text-blue-500 transition">About</a>
            <a href="/contact" className="hover:text-blue-500 transition">Contact</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
