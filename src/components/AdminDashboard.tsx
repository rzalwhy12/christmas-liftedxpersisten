'use client';

import { useState, useEffect, useRef } from 'react';
import { BarChart3, Download, RefreshCw, Lock, LogOut, FileText, Eye, EyeOff } from 'lucide-react';

const BACKENDLESS_URL = 'https://logicalgirls-us.backendless.app';
const BACKENDLESS_APP_ID = '40580AF3-9C6A-4E31-BAE2-875EECE97F5D';
const BACKENDLESS_API_KEY = 'DD28A030-CC9B-46A9-AC3E-C8C8F8DDE139';
const ADMIN_PASSWORD = 'persis10'; // Simple password for demo

export default function AdminDashboard() {
    const [guests, setGuests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if already authenticated
        const auth = typeof window !== 'undefined' ? localStorage.getItem('adminAuth') : null;
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchGuests();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuth', 'true');
            setLoginError('');
            setPassword('');
            fetchGuests();
        } else {
            setLoginError('Password salah');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuth');
        setPassword('');
        setGuests([]);
    };

    const fetchGuests = async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ['No.', 'Nama', 'Sekolah', 'Gereja', 'No. WhatsApp', 'Tanda Tangan', 'Tanggal Daftar'];
        const data = guests.map((guest, index) => [
            index + 1,
            guest.name || '',
            guest.school || '',
            guest.church || '',
            guest.phone || '',
            '', // Tanda Tangan kosong untuk diisi saat acara
            new Date(guest.confirmedAt).toLocaleDateString('id-ID'),
        ]);

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `laporan_peserta_natal_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = async () => {
        try {
            const jsPDF = (await import('jspdf')).jsPDF;
            const autoTable = (await import('jspdf-autotable')).default;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text('Laporan Peserta Acara Natal Persisten 2025/2026', 14, 14);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
            pdf.text(`Total Peserta: ${guests.length}`, 14, 28);
            // Data tabel
            const tableData = guests.map((guest, idx) => [
                idx + 1,
                guest.name || '',
                guest.school || '',
                guest.church || '',
                guest.phone || '',
                '', // Tanda tangan kosong
                new Date(guest.confirmedAt).toLocaleDateString('id-ID'),
            ]);
            autoTable(pdf, {
                head: [['No.', 'Nama', 'Sekolah', 'Gereja', 'No. WhatsApp', 'Tanda Tangan', 'Tanggal Daftar']],
                body: tableData,
                startY: 34,
                styles: { font: 'helvetica', fontSize: 9 },
                headStyles: { fillColor: [220, 38, 38], textColor: 255 },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    pdf.setFontSize(8);
                    pdf.text(`Halaman ${pdf.getCurrentPageInfo().pageNumber} dari {total}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 5, { align: 'center' });
                },
            });
            pdf.save(`laporan_peserta_natal_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error saat membuat PDF:', error);
            alert('Gagal membuat PDF. Detail error di console.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-700 to-green-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <Lock className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-center text-gray-600 mb-6">Masukkan password untuk akses</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-2 p-1 rounded text-gray-700 hover:bg-gray-200 focus:outline-none"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {loginError && (
                            <p className="text-red-600 text-sm text-center">{loginError}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-green-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
                        <p className="text-gray-600 text-sm mb-2">Total Peserta</p>
                        <p className="text-3xl font-bold text-red-600">{guests.length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
                        <p className="text-gray-600 text-sm mb-2">Status Konfirmasi</p>
                        <p className="text-3xl font-bold text-green-600">{guests.filter(g => g.status === 'confirmed').length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
                        <p className="text-gray-600 text-sm mb-2">Pesan Diterima</p>
                        <p className="text-3xl font-bold text-yellow-600">{guests.filter(g => g.christmasMessage && g.christmasMessage !== 'Tidak ada pesan').length}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                        onClick={fetchGuests}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <Download className="w-4 h-4" /> Download CSV
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <FileText className="w-4 h-4" /> Download PDF
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto" ref={tableRef}>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-linear-to-r from-red-600 to-green-600 text-white">
                                    <th className="px-4 py-3 text-left text-sm font-bold">No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Nama</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Sekolah</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Gereja</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">No. WhatsApp</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Tanda Tangan</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Tanggal Daftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guests.length > 0 ? (
                                    guests.map((guest, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{guest.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{guest.school}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{guest.church || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <a
                                                    href={`https://wa.me/${guest.phone?.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-800 underline font-medium"
                                                >
                                                    {guest.phone}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <span className="text-gray-400">_______________</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {new Date(guest.confirmedAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Belum ada data peserta
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-gray-600 text-sm">
                    <p>© 2025 Christmas Invitation Dashboard - Data Peserta Natal</p>
                </div>
            </div>
        </div>
    );
}
