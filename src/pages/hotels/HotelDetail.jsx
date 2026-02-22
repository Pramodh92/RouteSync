import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import Loader from '../../components/ui/Loader';

export default function HotelDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { startBooking } = useBooking();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIdx, setGalleryIdx] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        fetch('/data/hotels.json').then(r => r.json()).then(data => {
            const h = data.find(x => x.id === id) || data[0];
            setHotel(h);
            setSelectedRoom(h.rooms[0]);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader size="lg" /></div>;
    if (!hotel) return null;

    const handleBook = () => {
        startBooking({ ...hotel, price: selectedRoom.price, roomType: selectedRoom.type }, 'hotels');
        navigate(`/hotels/book/${hotel.id}`);
    };

    return (
        <div className="min-h-screen bg-ivory pt-20">
            {/* Gallery Grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-72 sm:h-96 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-4">
                <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => { setGalleryIdx(0); setGalleryOpen(true); }}>
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                {hotel.gallery?.slice(0, 3).map((img, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => { setGalleryIdx(i + 1); setGalleryOpen(true); }}>
                        <img src={img} alt="gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        {i === 2 && hotel.gallery.length > 3 && (
                            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                                <span className="text-white font-semibold">+{hotel.gallery.length - 3} more</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Info */}
                    <div className="flex-1">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-display font-bold text-charcoal">{hotel.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-orange" />
                                    <span className="text-warmgray">{hotel.address}</span>
                                </div>
                            </div>
                            <div className="bg-gold text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                                <Star className="w-4 h-4" fill="white" /> {hotel.rating}
                            </div>
                        </div>
                        <p className="text-charcoal/80 leading-relaxed mb-6">{hotel.description}</p>

                        {/* Amenities */}
                        <h2 className="text-xl font-display font-semibold text-charcoal mb-3">Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                            {hotel.amenities.map(a => (
                                <div key={a} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-orange flex-shrink-0" />
                                    <span className="text-charcoal">{a}</span>
                                </div>
                            ))}
                        </div>

                        {/* Rooms */}
                        <h2 className="text-xl font-display font-semibold text-charcoal mb-4">Select Room</h2>
                        <div className="space-y-3">
                            {hotel.rooms.map(room => (
                                <div key={room.type} onClick={() => room.available && setSelectedRoom(room)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!room.available ? 'opacity-50 cursor-not-allowed border-sand' : selectedRoom?.type === room.type ? 'border-orange bg-orange/5' : 'border-sand hover:border-orange/40'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-charcoal">{room.type}</p>
                                            <p className="text-warmgray text-sm">{room.size} · {room.beds}</p>
                                        </div>
                                        {room.available ? (
                                            <div className="text-right">
                                                <p className="text-orange font-bold text-lg">₹{room.price.toLocaleString()}</p>
                                                <p className="text-warmgray text-xs">/night</p>
                                            </div>
                                        ) : (
                                            <span className="text-warmgray text-sm font-medium">Sold Out</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="card p-5 sticky top-24">
                            <p className="text-3xl font-bold text-orange mb-1">₹{selectedRoom?.price?.toLocaleString()}<span className="text-warmgray text-sm font-normal">/night</span></p>
                            <p className="text-warmgray text-xs line-through mb-1">₹{hotel.originalPrice.toLocaleString()}</p>
                            <p className="tag-orange text-xs mb-4 self-start">
                                {Math.round((1 - hotel.pricePerNight / hotel.originalPrice) * 100)}% OFF
                            </p>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between"><span className="text-warmgray">Check-in</span><span className="font-medium">{hotel.checkIn}</span></div>
                                <div className="flex justify-between"><span className="text-warmgray">Check-out</span><span className="font-medium">{hotel.checkOut}</span></div>
                                <div className="flex justify-between"><span className="text-warmgray">Room</span><span className="font-medium">{selectedRoom?.type}</span></div>
                            </div>
                            <button onClick={handleBook} className="btn-primary w-full mt-2">Book Now</button>
                            <p className="text-xs text-warmgray text-center mt-3">Free cancellation · No hidden charges</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Lightbox */}
            {galleryOpen && (
                <div className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
                    <button className="absolute top-4 right-4 text-sand hover:text-orange" onClick={() => setGalleryOpen(false)}>
                        <X className="w-8 h-8" />
                    </button>
                    <button className="absolute left-4 text-sand hover:text-orange p-2" onClick={e => { e.stopPropagation(); setGalleryIdx(i => Math.max(0, i - 1)); }}>
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <img
                        src={[hotel.image, ...(hotel.gallery || [])][galleryIdx]}
                        alt="gallery"
                        className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                    <button className="absolute right-4 text-sand hover:text-orange p-2" onClick={e => { e.stopPropagation(); setGalleryIdx(i => Math.min([hotel.image, ...(hotel.gallery || [])].length - 1, i + 1)); }}>
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}
        </div>
    );
}
