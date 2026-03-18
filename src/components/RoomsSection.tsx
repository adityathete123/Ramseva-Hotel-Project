import { Check, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Room {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
}

export function RoomsSection() {
  const rooms: Room[] = [
    {
      id: 'general',
      name: 'General Room',
      description: 'Clean and comfortable budget-friendly rooms perfect for pilgrims and travelers',
      price: '₹800',
      image: 'https://images.unsplash.com/photo-1760573721914-29beb47a3544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBjbGVhbiUyMGNvbWZvcnRhYmxlfGVufDF8fHx8MTc3MDQ1Nzg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Clean Linen', 'Attached Bath', 'Hot Water', 'Fan/AC'],
      badge: 'Best Value',
      badgeColor: 'bg-[#8fb996]'
    },
    {
      id: 'standard',
      name: 'Standard Room',
      description: 'Spacious rooms with modern amenities for a comfortable family stay',
      price: '₹1,500',
      image: 'https://images.unsplash.com/photo-1760573721914-29beb47a3544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBjbGVhbiUyMGNvbWZvcnRhYmxlfGVufDF8fHx8MTc3MDQ1Nzg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['AC Room', 'TV', 'Mini Fridge', 'Wi-Fi', 'Geyser'],
      badge: 'Popular',
      badgeColor: 'bg-[#f26522]'
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      description: 'Premium rooms with luxury amenities and stunning views',
      price: '₹2,500',
      image: 'https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHJvb20lMjBsdXh1cnklMjBiZWR8ZW58MXx8fHwxNzcwNDU3ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      features: ['Premium AC', 'Smart TV', 'Balcony', 'Premium Bath', 'Room Service'],
      badge: 'Luxury',
      badgeColor: 'bg-[#0d7377]'
    }
  ];

  return (
    <section id="rooms" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#7ec8e3]/20 text-[#0d7377] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            <Sparkles className="inline w-4 h-4 mr-2" />
            Our Rooms
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Comfort
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            From budget-friendly to premium, we have the perfect room for your spiritual journey
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              {/* Room Image */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <ImageWithFallback
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                {room.badge && (
                  <div className={`absolute top-4 right-4 ${room.badgeColor} text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg`}>
                    {room.badge}
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-green-600 px-3 py-1 rounded-full text-xs md:text-sm font-semibold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Available</span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {room.name}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed">
                  {room.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {room.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-[#0d7377]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price & Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-[#0d7377]">
                      {room.price}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">per night</div>
                  </div>
                  <Button className="bg-[#f26522] hover:bg-[#d95518] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
