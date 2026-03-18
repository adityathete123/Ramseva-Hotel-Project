import { Droplets, Clock, Car, Utensils, Church, Wifi, Users, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface Amenity {
  icon: any;
  title: string;
  color: string;
}

export function FacilitiesSection() {
  const amenities: Amenity[] = [
    { icon: Droplets, title: 'Hot Water 24×7', color: 'from-blue-500 to-blue-600' },
    { icon: Clock, title: '24×7 Help Desk', color: 'from-[#0d7377] to-[#7ec8e3]' },
    { icon: Car, title: 'Secure Parking', color: 'from-gray-600 to-gray-700' },
    { icon: Utensils, title: 'Pure Veg Food', color: 'from-green-500 to-green-600' },
    { icon: Church, title: 'Prayer Room', color: 'from-[#f26522] to-[#d95518]' },
    { icon: Wifi, title: 'Free Wi-Fi', color: 'from-purple-500 to-purple-600' },
    { icon: Users, title: 'Family Friendly', color: 'from-pink-500 to-pink-600' },
    { icon: Shield, title: 'Safe & Clean', color: 'from-teal-500 to-teal-600' }
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#faf9f6] to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#8fb996]/20 text-[#8fb996] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            ✨ Facilities & Amenities
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Modern amenities with traditional hospitality for a comfortable stay
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {amenities.map((amenity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-100"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${amenity.color} flex items-center justify-center mb-4 shadow-lg`}>
                <amenity.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-gray-800 text-sm md:text-base font-semibold leading-tight">
                {amenity.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 md:mt-16 bg-gradient-to-r from-[#0d7377] to-[#7ec8e3] rounded-3xl p-6 md:p-10 text-white text-center shadow-2xl"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Special Care for Elderly Guests
          </h3>
          <p className="text-base md:text-lg text-white/95 max-w-3xl mx-auto leading-relaxed">
            We understand the needs of elderly pilgrims. Our staff is trained to provide extra assistance, 
            ground floor rooms are available on request, and we ensure easy access to all facilities.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
