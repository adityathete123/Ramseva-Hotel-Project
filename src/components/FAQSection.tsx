import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { motion } from 'motion/react';

interface FAQ {
  question: string;
  answer: string;
}

export function FAQSection() {
  const faqs: FAQ[] = [
    {
      question: 'How far is the hotel from Kumbh Mela grounds?',
      answer: 'Panchavati Hotel is approximately 2 km from the main Kumbh Mela grounds and just 1.2 km from Ram Kund and Godavari Ghats. All locations are easily accessible by foot or local transport.'
    },
    {
      question: 'Do you provide vegetarian food?',
      answer: 'Yes, we serve only pure vegetarian food. Our in-house kitchen prepares fresh, hygienic meals that cater to the dietary preferences of pilgrims and families.'
    },
    {
      question: 'Is parking available at the hotel?',
      answer: 'Yes, we have secure parking facilities for both two-wheelers and four-wheelers. Parking is complimentary for all our guests.'
    },
    {
      question: 'Are the rooms suitable for elderly guests?',
      answer: 'Absolutely! We offer ground floor rooms on request and our staff is trained to assist elderly guests. All facilities are easily accessible, and we provide extra care for senior citizens.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 48 hours before check-in receive a full refund. For cancellations within 48 hours, a nominal fee is charged. During peak seasons like Kumbh Mela, special policies may apply.'
    },
    {
      question: 'Do you accept UPI and digital payments?',
      answer: 'Yes, we accept all major payment modes including UPI, credit/debit cards, and cash. Our reception can assist with payment options.'
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#faf9f6] to-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#8fb996]/20 text-[#8fb996] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            ❓ FAQ
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Everything you need to know about your stay
          </p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 md:px-8 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-900 hover:text-[#0d7377] transition-colors py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-sm md:text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 md:mt-12 text-center bg-gradient-to-r from-[#0d7377] to-[#7ec8e3] rounded-2xl p-6 md:p-8 text-white"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-3">Still have questions?</h3>
          <p className="text-base md:text-lg text-white/95 mb-4">
            Our team is here to help 24/7
          </p>
          <a
            href="tel:+919876543210"
            className="inline-block bg-white text-[#0d7377] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg text-base md:text-lg"
          >
            Call Us: +91 98765 43210
          </a>
        </motion.div>
      </div>
    </section>
  );
}
