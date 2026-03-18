import { Calendar, Users, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[85vh] md:min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1721975178671-726ee3e22456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOYXNoaWslMjBHb2RhdmFyaSUyMGdoYXQlMjByaXZlciUyMEluZGlhfGVufDF8fHx8MTc3MDQ1Nzg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Godavari Ghats"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d7377]/70 via-[#0d7377]/50 to-[#f26522]/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="max-w-3xl">
          {/* Heading */}
          <div className="mb-8 md:mb-12">
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 text-sm md:text-base">
              ✨ Welcome to Nashik's Premier Stay
            </div>
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Stay Close to the Sacred
            </h1>
            <h2 className="text-white/95 text-xl sm:text-2xl md:text-3xl mb-4 leading-relaxed">
              Panchavati Hotel, Nashik
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-xl">
              Comfortable Stay Near Kumbh Mela & Holy Ghats
            </p>
          </div>

          {/* Booking Widget */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-2xl">
            <h3 className="text-gray-800 text-lg md:text-xl font-semibold mb-4 md:mb-6">
              Check Availability
            </h3>
            
            <div className="space-y-4">
              {/* Check-in / Check-out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Check-in</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent text-base"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Check-out</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent text-base"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Room Category & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Room Category</label>
                  <Select>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Guests</label>
                  <div className="relative">
                    <Select>
                      <SelectTrigger className="w-full py-3 text-base">
                        <SelectValue placeholder="Number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Check Availability Button */}
              <Button className="w-full bg-[#f26522] hover:bg-[#d95518] text-white py-4 md:py-6 rounded-lg text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Check Availability
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
