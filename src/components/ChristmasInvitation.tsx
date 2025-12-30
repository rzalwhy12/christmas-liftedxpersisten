'use client';

    import { useState, useEffect } from 'react';
    import { Calendar, Clock, MapPin, Sparkles, Mail, MessageCircle, Users } from 'lucide-react';

    const BACKENDLESS_URL = 'https://logicalgirls-us.backendless.app';
    const BACKENDLESS_APP_ID = '40580AF3-9C6A-4E31-BAE2-875EECE97F5D';
    const BACKENDLESS_API_KEY = 'DD28A030-CC9B-46A9-AC3E-C8C8F8DDE139';

    export default function ChristmasInvitation() {
    const [copied, setCopied] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [school, setSchool] = useState('');
    const [christmasMessage, setChristmasMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [guests, setGuests] = useState<any[]>([]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText('Jl. Panglima Sudirman No.102, Kepatihan, Kampungdalem, Kec. Tulungagung, Kabupaten Tulungagung, Jawa Timur 66212');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        try {
            let allGuests: any[] = [];
            let pageNumber = 0;
            const pageSize = 100;
            let hasMore = true;

            while (hasMore) {
                const offset = pageNumber * pageSize;
                const response = await fetch(
                    `${BACKENDLESS_URL}/api/data/GuestList?pageSize=${pageSize}&offset=${offset}&sortBy=confirmedAt DESC`,
                    {
                        headers: {
                            'X-Backendless-Application-Id': BACKENDLESS_APP_ID,
                            'X-Backendless-REST-API-Key': BACKENDLESS_API_KEY,
                        },
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data) && data.length > 0) {
                        allGuests = [...allGuests, ...data];
                        pageNumber++;
                        
                        if (data.length < pageSize) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            setGuests(allGuests);
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };

    const handleConfirmAttendance = async () => {
        if (!guestName.trim() || !school.trim()) {
            setMessage('Silakan masukkan nama dan asal sekolah terlebih dahulu');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${BACKENDLESS_URL}/api/data/GuestList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Backendless-Application-Id': BACKENDLESS_APP_ID,
                    'X-Backendless-REST-API-Key': BACKENDLESS_API_KEY,
                },
                body: JSON.stringify({
                    name: guestName,
                    school: school,
                    christmasMessage: christmasMessage || 'Tidak ada pesan',
                    confirmedAt: new Date().toISOString(),
                    status: 'confirmed'
                }),
            });

            if (response.ok) {
                setMessage(`Terima kasih ${guestName}! Kehadiran Anda telah terdaftar. 🎄`);
                setGuestName('');
                setSchool('');
                setChristmasMessage('');
                fetchGuests();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Terjadi kesalahan koneksi. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-red-600 via-green-700 to-green-800 p-3 sm:p-8">
        {/* Header dengan Logo */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
            <img 
                src="/logo.PNG" 
                alt="Logo Natal" 
                className="w-20 h-20 sm:w-32 sm:h-32 drop-shadow-lg"
            />
            </div>
            <h1 className="text-center text-3xl sm:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">
            YOU'RE INVITED!
            </h1>
                <div className="text-center mt-2 mb-3 sm:mb-4">
                <p className="text-yellow-300 text-xs sm:text-sm font-semibold drop-shadow-md mb-3">
                    🎁 FREE ENTRY! 🎁
                </p>
                
                {/* Form Inputs */}
                <div className="space-y-2 sm:space-y-3 mb-3">
                <input 
                    type="text" 
                    placeholder="Nama Anda..." 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-white/90 text-gray-800 font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full max-w-xs text-sm"
                />
                <input 
                    type="text" 
                    placeholder="Asal Sekolah..." 
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="bg-white/90 text-gray-800 font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full max-w-xs text-sm"
                />
                <textarea 
                    placeholder="Pesan Natal (opsional)..." 
                    value={christmasMessage}
                    onChange={(e) => setChristmasMessage(e.target.value)}
                    className="bg-white/90 text-gray-800 font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full max-w-xs text-sm resize-none h-16 sm:h-20"
                />
                </div>

                <button
                    onClick={handleConfirmAttendance}
                    disabled={isLoading}
                    className="bg-yellow-400 text-red-600 font-bold py-2 px-6 sm:py-2.5 sm:px-8 rounded-lg hover:bg-yellow-300 transition duration-300 flex items-center justify-center gap-2 shadow text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                    <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" /> {isLoading ? 'Processing...' : "I'm Coming!"}
                </button>
                {message && (
                    <p className={`text-xs sm:text-sm mt-2 p-2 rounded ${message.includes('kesalahan') ? 'text-red-200 bg-red-500/20' : 'text-green-200 bg-green-500/20'}`}>
                        {message}
                    </p>
                )}
                </div>
            </div>

            {/* Container Utama */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                {/* Poster Section */}
                <div className="p-3 sm:p-12 bg-white flex justify-center">
                <div className="w-full max-w-xs sm:max-w-sm aspect-3/4">
                <img 
                    src="/poster.JPG" 
                    alt="Poster Natal" 
                    className="w-full h-full object-cover rounded-lg drop-shadow-lg"
                />
            </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-12 py-6 sm:pb-12 bg-white">
            {/* Event Details */}
            <div className="space-y-6 sm:space-y-8">

                {/* Event Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Date Card */}
                <div className="bg-linear-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl border-2 border-red-200 flex flex-col items-center">
                    <Calendar className="text-red-600 w-6 sm:w-8 h-6 sm:h-8 mb-1 sm:mb-2" />
                    <h3 className="font-bold text-red-700 mb-0.5 sm:mb-1 text-sm sm:text-base">Tanggal</h3>
                    <p className="text-red-600 font-semibold text-xs sm:text-sm">09 Januari 2026</p>
                    <p className="text-xs text-red-500">Hari Raya Natal</p>
                </div>

                {/* Time Card */}
                <div className="bg-linear-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl border-2 border-yellow-200 flex flex-col items-center">
                    <Clock className="text-yellow-600 w-6 sm:w-8 h-6 sm:h-8 mb-1 sm:mb-2" />
                    <h3 className="font-bold text-yellow-700 mb-0.5 sm:mb-1 text-sm sm:text-base">Waktu</h3>
                    <p className="text-yellow-600 font-semibold text-xs sm:text-sm">16.00 WIB</p>
                    <p className="text-xs text-yellow-500">Sore</p>
                </div>

                {/* Location Card */}
                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border-2 border-green-200 flex flex-col items-center">
                    <MapPin className="text-green-600 w-6 sm:w-8 h-6 sm:h-8 mb-1 sm:mb-2" />
                    <h3 className="font-bold text-green-700 mb-0.5 sm:mb-1 text-sm sm:text-base">Lokasi</h3>
                    <p className="text-green-600 font-semibold text-xs sm:text-sm">GUPDI Tulungagung</p>
                    <p className="text-xs text-green-500">Tulungagung, Jawa Timur</p>
                </div>
                </div>

                {/* Location Details */}
                <div className="bg-linear-to-r from-red-50 to-green-50 p-4 sm:p-6 rounded-2xl border-2 border-red-200 space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                    <MapPin className="text-green-700 w-5 sm:w-6 h-5 sm:h-6" />
                    <span>Lokasi Acara</span>
                </h3>
                    <div>
                    <p className="text-gray-700 font-semibold mb-1 text-sm sm:text-base">
                        Gereja GUPDI Tulungagung
                    </p>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">
                        Jl. Panglima Sudirman No.102, Kepatihan, Kampungdalem, Kec. Tulungagung, Kabupaten Tulungagung, Jawa Timur 66212
                    </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={copyToClipboard}
                        className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                        {copied ? '✓ Disalin!' : '📋 Salin Alamat'}
                    </button>
                    <a
                        href="https://www.google.com/maps/place/Gupdi+Tulungagung"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-3 sm:px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow text-sm"
                    >
                        <MapPin className="w-4 h-4" /> Google Map
                    </a>
                    </div>

                {/* Map */}
                <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 h-64 sm:h-80 mt-3">
                    <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4876.24618023161!2d111.90462537586758!3d-8.063008691964676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78e3005a58758f%3A0x148448163e404aba!2sGupdi%20Tulungagung!5e1!3m2!1sen!2sid!4v1767090200313!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                    ></iframe>
                </div>
                </div>

                {/* Meet Up Section */}
                <div className="bg-linear-to-r from-red-500 to-green-600 p-5 sm:p-8 rounded-2xl text-white text-center shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Let's Meet Up and See You!</h3>
                <p className="mb-4 text-sm sm:text-lg">Kami menantikan kehadiran Anda untuk merayakan hari Natal bersama dengan penuh sukacita dan kebersamaan 🎄</p>
                </div>

                {/* Guest List Section */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center">
                    <Users className="text-red-600 w-6 h-6" />
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Tamu yang Sudah Terdaftar ({guests.length})</h3>
                </div>
                
                {guests.length > 0 ? (
                    <div className="bg-linear-to-b from-red-50 to-green-50 rounded-2xl p-4 sm:p-6 border-2 border-red-200 shadow-lg">
                    <div className="max-h-96 sm:max-h-125 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
                        {guests.map((guest, index) => (
                        <div key={index} className="bg-white p-3 sm:p-4 rounded-xl shadow border-l-4 border-red-500 hover:shadow-lg transition duration-300">
                            <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm sm:text-base">{index + 1}. {guest.name}</p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">📚 {guest.school}</p>
                                {guest.christmasMessage && guest.christmasMessage !== 'Tidak ada pesan' && (
                                <p className="text-xs sm:text-sm text-green-700 italic mt-2 bg-green-50 p-2 rounded">💬 "{guest.christmasMessage}"</p>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">✓ Hadir</span>
                                <p className="text-xs text-gray-500 mt-1">
                                {new Date(guest.confirmedAt).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                                </p>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                ) : (
                    <div className="bg-linear-to-b from-yellow-50 to-orange-50 rounded-2xl p-6 sm:p-8 text-center border-2 border-yellow-200 shadow-lg">
                    <p className="text-gray-600 text-sm sm:text-base mb-2">Belum ada tamu yang terdaftar</p>
                    <p className="text-yellow-600 font-semibold text-sm sm:text-base">Jadilah yang pertama untuk mengkonfirmasi kehadiran! 🎉</p>
                    </div>
                )}
                </div>

                {/* Footer */}
                <div className="text-center text-gray-600 pt-4 sm:pt-6 border-t-2 border-gray-200">
                <p className="text-xs sm:text-sm">
                    🎄 Diundang dengan penuh doa dan kasih sayang 🎄
                </p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                    Terima kasih telah menjadi bagian dari perayaan spesial kami
                </p>
                </div>
            </div>
            </div>
        </div>

        {/* Decorative Bottom */}
        <div className="max-w-4xl mx-auto mt-6 sm:mt-8 text-center">
            <p className="text-yellow-200 text-base sm:text-lg drop-shadow-md">
            <Sparkles className="inline w-4 sm:w-5 h-4 sm:h-5 mr-1 align-middle" /> Selamat Hari Natal <Sparkles className="inline w-4 sm:w-5 h-4 sm:h-5 ml-1 align-middle" />
            </p>
        </div>
        </div>
    );
    }
