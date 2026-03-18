import { MapPin, Phone, Mail, MessageCircle, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { motion } from 'motion/react';

export function ContactSection() {
  return (
    <section id="contact" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#f26522]/10 text-[#f26522] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            📞 Get in Touch
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact & Booking
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            We're here to help you plan your perfect stay in Nashik
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Contact Info */}
          <div className="space-y-6">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#0d7377]/10 to-[#7ec8e3]/10 rounded-2xl p-6 md:p-8 border border-[#0d7377]/20"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                    Panchavati Hotel<br />
                    Near Ram Kund, Panchavati<br />
                    Nashik - 422003, Maharashtra
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-gradient-to-br from-[#f26522]/10 to-[#f26522]/20 rounded-2xl p-6 md:p-8 border border-[#f26522]/20"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f26522] to-[#d95518] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Phone</h3>
                  <a href="tel:+919876543210" className="text-gray-700 hover:text-[#f26522] text-sm md:text-base block mb-1 transition-colors">
                    +91 98765 43210
                  </a>
                  <a href="tel:+912532123456" className="text-gray-700 hover:text-[#f26522] text-sm md:text-base block transition-colors">
                    0253 212 3456
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-br from-[#8fb996]/10 to-[#7ec8e3]/10 rounded-2xl p-6 md:p-8 border border-[#8fb996]/20"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8fb996] to-[#7ec8e3] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Email</h3>
                  <a href="mailto:info@panchavatihotel.com" className="text-gray-700 hover:text-[#8fb996] text-sm md:text-base transition-colors">
                    info@panchavatihotel.com
                  </a>
                </div>
              </div>
            </motion.div>

            {/* WhatsApp Support */}
            <motion.a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="block bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1">WhatsApp Support</h3>
                    <p className="text-white/90 text-sm md:text-base">Chat with us instantly</p>
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </motion.a>

            {/* UPI Payment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 md:p-8 border border-purple-200"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">UPI Payment</h3>
                  <p className="text-gray-700 text-sm md:text-base mb-2">
                    UPI ID: <span className="font-mono font-semibold">panchavatihotel@paytm</span>
                  </p>
                  <div className="bg-white rounded-xl p-3 inline-block">
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent text-base"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Check-in Date</label>
                <Input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Message</label>
                <Textarea
                  placeholder="Tell us about your requirements..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7377] focus:border-transparent resize-none text-base"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-[#f26522] to-[#d95518] hover:from-[#d95518] hover:to-[#c04813] text-white py-4 md:py-6 rounded-lg text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Send Inquiry
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
