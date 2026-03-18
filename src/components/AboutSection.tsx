import { Heart, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-[#f26522]/10 text-[#f26522] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
              🏨 About Us
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your Trusted Home Away from Home
            </h2>
            <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
              <p>
                Panchavati Hotel has been serving pilgrims, families, and travelers in Nashik for years. 
                Located in the heart of the spiritual district, we pride ourselves on offering clean, 
                comfortable, and affordable accommodation.
              </p>
              <p>
                During the auspicious Nashik Kumbh Mela, thousands of devotees trust us for our 
                proximity to holy sites, genuine hospitality, and commitment to cleanliness. Our team 
                understands the special needs of elderly guests and pilgrims.
              </p>
              <p>
                Whether you're here for spiritual reasons, family vacation, or business, we ensure 
                your stay is peaceful, comfortable, and memorable.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 md:mt-10">
              <div className="text-center p-4 bg-gradient-to-br from-[#0d7377]/10 to-[#7ec8e3]/10 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-[#0d7377] mb-1">15+</div>
                <div className="text-xs md:text-sm text-gray-600">Years Service</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#f26522]/10 to-[#f26522]/20 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-[#f26522] mb-1">50K+</div>
                <div className="text-xs md:text-sm text-gray-600">Happy Guests</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#8fb996]/10 to-[#8fb996]/20 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-[#8fb996] mb-1">4.5★</div>
                <div className="text-xs md:text-sm text-gray-600">Guest Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Cleanliness First</h3>
                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                    Daily housekeeping, sanitized rooms, and strict hygiene protocols ensure 
                    a safe and clean environment for all guests.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-[#f26522] to-[#d95518] rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Elder Care</h3>
                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                    Special attention to elderly guests with ground floor rooms, assistance, 
                    and staff trained to help with any needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-[#8fb996] to-[#7ec8e3] rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Kumbh Expertise</h3>
                  <p className="text-sm md:text-base text-white/95 leading-relaxed">
                    Experienced in hosting pilgrims during Kumbh Mela, we guide guests to 
                    holy sites and provide all necessary information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
