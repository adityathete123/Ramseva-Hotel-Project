import { Globe, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* About Column */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">P</span>
              </div>
              <div>
                <div className="text-white font-semibold text-base md:text-lg">Panchavati Hotel</div>
                <div className="text-gray-400 text-xs">Nashik</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
              Your trusted accommodation near Kumbh Mela grounds and holy Godavari Ghats. 
              Offering clean, comfortable rooms with traditional hospitality.
            </p>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#7ec8e3]" />
              <div className="flex space-x-3 text-sm">
                <button className="text-gray-300 hover:text-white transition-colors">English</button>
                <span className="text-gray-600">|</span>
                <button className="text-gray-300 hover:text-white transition-colors">हिंदी</button>
                <span className="text-gray-600">|</span>
                <button className="text-gray-300 hover:text-white transition-colors">मराठी</button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base md:text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <button onClick={() => scrollToSection('hero')} className="text-gray-300 hover:text-[#7ec8e3] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('rooms')} className="text-gray-300 hover:text-[#7ec8e3] transition-colors">
                  Rooms
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-[#7ec8e3] transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-[#7ec8e3] transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-white font-semibold text-base md:text-lg mb-4">
              🚨 Emergency Contact
            </h3>
            <div className="space-y-3 text-sm md:text-base">
              <a href="tel:+919876543210" className="flex items-center space-x-2 text-gray-300 hover:text-[#f26522] transition-colors">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </a>
              <a href="mailto:info@panchavatihotel.com" className="flex items-center space-x-2 text-gray-300 hover:text-[#f26522] transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@panchavatihotel.com</span>
              </a>
              <div className="flex items-start space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Panchavati, Nashik - 422003</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Panchavati Hotel, Nashik. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
