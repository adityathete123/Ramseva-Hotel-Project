import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Photo {
  id: number;
  src: string;
  alt: string;
  category: string;
}

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);

  const photos: Photo[] = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHJvb20lMjBsdXh1cnklMjBiZWR8ZW58MXx8fHwxNzcwNDU3ODYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Deluxe Room',
      category: 'Rooms'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1760573721914-29beb47a3544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBjbGVhbiUyMGNvbWZvcnRhYmxlfGVufDF8fHx8MTc3MDQ1Nzg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Standard Room',
      category: 'Rooms'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvYmJ5JTIwbW9kZXJuJTIwY2xlYW58ZW58MXx8fHwxNzcwNDU3ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Hotel Lobby',
      category: 'Lobby'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1572517499173-4e2cb8bef19b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB2ZWdldGFyaWFuJTIwdGhhbGklMjBmb29kfGVufDF8fHx8MTc3MDM5MjAxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Vegetarian Food',
      category: 'Food'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1721975178671-726ee3e22456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOYXNoaWslMjBHb2RhdmFyaSUyMGdoYXQlMjByaXZlciUyMEluZGlhfGVufDF8fHx8MTc3MDQ1Nzg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Godavari Ghats',
      category: 'Surroundings'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvYmJ5JTIwbW9kZXJuJTIwY2xlYW58ZW58MXx8fHwxNzcwNDU3ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Reception Area',
      category: 'Lobby'
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#faf9f6] to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block bg-[#7ec8e3]/20 text-[#0d7377] px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-4">
            📸 Gallery
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Hotel
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Take a visual tour of our rooms, facilities, and the beautiful surroundings
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => setSelectedImage(photo)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow"
            >
              <ImageWithFallback
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white text-sm font-semibold">{photo.alt}</div>
                  <div className="text-white/80 text-xs">{photo.category}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full"
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="text-center mt-4">
                <div className="text-white text-xl font-semibold">{selectedImage.alt}</div>
                <div className="text-white/80 text-sm">{selectedImage.category}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
