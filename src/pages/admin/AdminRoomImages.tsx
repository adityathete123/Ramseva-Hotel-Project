import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, CheckCircle, X, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRoomImages() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roomType, setRoomType] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchData();
  }, [id, accessToken]);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [typeRes, imagesRes] = await Promise.all([
        fetch(`${apiUrl}/api/rooms/types/${id}`),
        fetch(`${apiUrl}/api/rooms/types/${id}/images`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` }
        })
      ]);

      if (typeRes.ok && imagesRes.ok) {
        const typeData = await typeRes.json();
        const imagesData = await imagesRes.json();
        setRoomType(typeData.data);
        setImages(imagesData.data || []);
      }
    } catch (error) {
      toast.error('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + images.length > 5) {
        toast.error('Maximum 5 images allowed per category');
        return;
      }
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Images uploaded successfully');
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData();
      } else {
        const res = await response.json();
        toast.error(res.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('Image deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#0d7377] animate-spin" />
    </div>
  );

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rooms')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK
                </Button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tighter italic">GALLERY MANAGEMENT</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{roomType?.name}</p>
                </div>
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* UPLOAD SECTION */}
            <div className="lg:col-span-4">
                <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-white sticky top-24">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-3xl font-black italic uppercase text-[#0d7377]">ADD IMAGES</CardTitle>
                        <CardDescription className="text-gray-500 font-bold text-xs uppercase tracking-widest">Select up to 5 high-quality photos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-4 border-dashed border-[#0d7377]/10 rounded-[24px] p-12 text-center hover:bg-[#0d7377]/5 transition-all cursor-pointer group"
                        >
                            <Upload className="w-16 h-16 mx-auto text-[#0d7377]/20 group-hover:text-[#0d7377] transition-all mb-4" />
                            <p className="font-black italic uppercase text-[#0d7377] text-sm">Select Files</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">JPG, PNG or WebP</p>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileSelect} 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                            />
                        </div>

                        {selectedFiles.length > 0 && (
                          <div className="mt-8 space-y-4">
                              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">READY TO UPLOAD</h4>
                              <div className="space-y-2">
                                {selectedFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
                                    <div className="flex items-center gap-3">
                                      <ImageIcon className="w-4 h-4 text-[#0d7377]" />
                                      <span className="text-xs font-bold truncate max-w-[150px]">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button 
                                onClick={handleUpload} 
                                disabled={uploading} 
                                className="w-full h-14 bg-[#0d7377] text-white hover:bg-[#0a5c5f] font-black italic uppercase rounded-2xl transition-all shadow-xl"
                              >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                                START UPLOAD
                              </Button>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* GALLERY GRID */}
            <div className="lg:col-span-8">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-black italic uppercase text-gray-900">ROOM GALLERY</h3>
                    <Badge variant="outline" className="font-bold border-2">{images.length}/5 IMAGES</Badge>
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.map((img) => (
                      <Card key={img.id} className="rounded-[28px] overflow-hidden border-none shadow-lg bg-white group">
                         <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                              src={`${apiUrl}${img.image_url}`} 
                              alt="Room" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            {img.is_primary === 1 && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-[#0d7377] font-black italic uppercase tracking-tighter text-[10px] py-1 px-3">
                                  <Star className="w-3 h-3 mr-1 fill-white" /> PRIMARY COVER
                                </Badge>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => handleDelete(img.id)}
                                className="rounded-full w-12 h-12 shadow-2xl hover:scale-110 transition-all"
                              >
                                <Trash2 className="w-6 h-6 text-white" />
                              </Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[40px] border-4 border-dashed border-gray-100">
                      <ImageIcon className="w-20 h-20 mx-auto text-gray-100 mb-6" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No images uploaded for this category yet</p>
                  </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
