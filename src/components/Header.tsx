import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X, Globe, LogIn, User } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const { user } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const languages = ['EN', 'HI', 'MR'];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={() => scrollToSection('hero')} className="flex items-center space-x-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">P</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-[#0d7377] font-semibold text-base md:text-lg leading-tight">Panchavati Hotel</div>
                <div className="text-gray-500 text-xs">Nashik</div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('hero')} className="text-gray-700 hover:text-[#0d7377] transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('rooms')} className="text-gray-700 hover:text-[#0d7377] transition-colors">
              Rooms
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#0d7377] transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#0d7377] transition-colors">
              Contact
            </button>
          </nav>

          {/* Right Side - Language & Book Now */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
              <Globe className="w-4 h-4 text-gray-500 ml-2" />
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm transition-all ${
                    language === lang
                      ? 'bg-[#0d7377] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* User Actions */}
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'receptionist' ? '/reception' : '/customer'}>
                <Button className="hidden md:flex bg-[#0d7377] hover:bg-[#0a5c5f] text-white px-6 py-2 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  {user.role === 'admin' ? 'Admin' : user.role === 'receptionist' ? 'Reception' : 'My Account'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="hidden md:flex border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white px-6 py-2 rounded-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Button 
                  onClick={() => scrollToSection('hero')}
                  className="hidden md:flex bg-[#f26522] hover:bg-[#d95518] text-white px-6 py-2 rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  Book Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('hero')}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('rooms')}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Rooms
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Contact
              </button>
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'receptionist' ? '/reception' : '/customer'}>
                  <Button className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] text-white py-3 rounded-lg">
                    <User className="w-4 h-4 mr-2" />
                    {user.role === 'admin' ? 'Admin Portal' : user.role === 'receptionist' ? 'Reception' : 'My Account'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="w-full border-[#0d7377] text-[#0d7377] py-3 rounded-lg mb-2">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => scrollToSection('hero')}
                    className="w-full bg-[#f26522] hover:bg-[#d95518] text-white py-3 rounded-lg"
                  >
                    Book Now
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}