import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Ramesh Kulkarni',
      location: 'Pune, Maharashtra',
      rating: 5,
      text: 'Stayed here during Kumbh Mela with my elderly parents. The staff was incredibly helpful and the location is perfect. Clean rooms and pure vegetarian food made our pilgrimage memorable.',
      date: 'January 2024'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'Excellent value for money! The hotel is very close to all holy sites. Rooms were spotless and the hospitality was warm. Perfect for families visiting Nashik for spiritual purposes.',
      date: 'December 2023'
    },
    {
      id: 3,
      name: 'Vijay Patil',
      location: 'Mumbai',
      rating: 4,
      text: 'Great experience at Panchavati Hotel. The staff understands the needs of pilgrims well. Walking distance to Godavari River. Will definitely recommend to friends and family.',
      date: 'November 2023'
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#f26522]/10 text-[#f26522] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            💬 Guest Reviews
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Real experiences from pilgrims and travelers who stayed with us
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 relative hover:shadow-xl transition-shadow"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6 w-10 h-10 bg-gradient-to-br from-[#0d7377] to-[#7ec8e3] rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#f26522] text-[#f26522]" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Guest Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="font-semibold text-gray-900 text-base">{testimonial.name}</div>
                <div className="text-gray-500 text-sm">{testimonial.location}</div>
                <div className="text-gray-400 text-xs mt-1">{testimonial.date}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 md:mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0d7377]/10 to-[#7ec8e3]/10 px-6 md:px-8 py-4 rounded-full">
            <Star className="w-6 h-6 fill-[#f26522] text-[#f26522]" />
            <span className="text-gray-800 text-base md:text-lg font-semibold">
              4.5/5 Average Rating from 500+ Reviews
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
