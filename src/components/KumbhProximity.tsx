import { MapPin, Footprints, Bus, TreePine } from 'lucide-react';
import { motion } from 'motion/react';

export function KumbhProximity() {
  const highlights = [
    { icon: Footprints, text: 'Walkable Distance', color: 'from-[#0d7377] to-[#7ec8e3]' },
    { icon: Bus, text: 'Easy Transport', color: 'from-[#f26522] to-[#f26522]' },
    { icon: TreePine, text: 'Peaceful Panchavati', color: 'from-[#8fb996] to-[#7ec8e3]' },
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#faf9f6] to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Map/Illustration */}
            <div className="relative bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] p-8 md:p-12 flex items-center justify-center">
              <div className="relative z-10 text-center">
                <MapPin className="w-20 h-20 md:w-24 md:h-24 text-white mx-auto mb-6 drop-shadow-lg" />
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">1.2 km</h3>
                  <p className="text-base md:text-lg">from Ram Kund &</p>
                  <p className="text-base md:text-lg">Godavari Ghats</p>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right: Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block bg-[#f26522]/10 text-[#f26522] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4 w-fit">
                🕉️ Prime Location
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                Perfect Stay for Nashik Kumbh Mela
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                Experience the spiritual journey with ease. Panchavati Hotel is strategically located near all major pilgrimage sites and Kumbh Mela grounds.
              </p>

              {/* Highlights */}
              <div className="space-y-4">
                {highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-800 text-base md:text-lg font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-[#7ec8e3]/20 to-[#8fb996]/20 rounded-xl border border-[#7ec8e3]/30">
                <p className="text-gray-700 text-sm md:text-base">
                  <span className="font-semibold">🌊 River Godavari:</span> 1.2 km • 
                  <span className="font-semibold ml-2">🛕 Ram Kund:</span> 1.5 km • 
                  <span className="font-semibold ml-2">📍 Kumbh Grounds:</span> 2 km
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
