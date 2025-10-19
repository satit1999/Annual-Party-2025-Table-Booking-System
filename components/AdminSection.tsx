import React, { useState, useMemo } from 'react';
import { Booking, Language } from '../types';
import { translations, TOTAL_MAIN_TABLES, TOTAL_RESERVE_TABLES, SEATS_PER_TABLE } from '../constants';
import BookingDetailsModal from './BookingDetailsModal';

declare var XLSX: any;
declare var Swal: any;

interface AdminSectionProps {
    bookings: Booking[];
    currentLanguage: Language;
    onEditStart: (bookingId: string) => void;
    onCancelStart: (booking: Booking) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-gradient-to-r from-[#aa3a3b] to-[#8b2f30] text-white p-6 rounded-xl shadow-lg flex items-center gap-4">
        <span className="material-icons text-4xl opacity-80">{icon}</span>
        <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm opacity-90">{label}</div>
        </div>
    </div>
);

const AdminSection: React.FC<AdminSectionProps> = ({ 
    bookings, 
    currentLanguage, 
    onEditStart, 
    onCancelStart,
}) => {
    const t = translations[currentLanguage];
    const [customerFilter, setCustomerFilter] = useState('');
    const [studentFilter, setStudentFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const filteredBookings = useMemo(() => {
        const customerFilterTerms = customerFilter.toLowerCase().split(' ').filter(term => term.trim() !== '');
        const studentFilterTerms = studentFilter.toLowerCase().split(' ').filter(term => term.trim() !== '');

        return bookings.filter(booking => {
            const parentName = `${booking.parent.prefix} ${booking.parent.firstName} ${booking.parent.lastName}`.toLowerCase();
            const studentName = `${booking.student.prefix} ${booking.student.firstName} ${booking.student.lastName}`.toLowerCase();

            const customerMatch = customerFilterTerms.length > 0
                ? customerFilterTerms.every(term => parentName.includes(term))
                : true;

            const studentMatch = studentFilterTerms.length > 0
                ? studentFilterTerms.every(term => studentName.includes(term))
                : true;

            return customerMatch && studentMatch;
        });
    }, [bookings, customerFilter, studentFilter]);

    const activeBookings = bookings.filter(b => b.status !== 'cancelled');
    const totalBookings = activeBookings.length;
    const totalSeatsBooked = activeBookings.reduce((sum, booking) => sum + booking.seats.length, 0);
    const totalRevenue = activeBookings.reduce((sum, booking) => sum + booking.total, 0);
    const totalSeats = (TOTAL_MAIN_TABLES + TOTAL_RESERVE_TABLES) * SEATS_PER_TABLE;
    const availableSeats = totalSeats - totalSeatsBooked;

    const handleExport = () => {
        const dataToExport = filteredBookings;
        if (dataToExport.length === 0) {
            Swal.fire({
                icon: 'info',
                title: t.swalInfoTitle,
                text: t.swalNoDataToExport,
                confirmButtonColor: '#aa3a3b',
            });
            return;
        }

        const excelData = dataToExport.map(b => ({
            'Booking ID': b.id,
            'Parent Name': `${b.parent.prefix} ${b.parent.firstName} ${b.parent.lastName}`,
            'Student Name': `${b.student.prefix} ${b.student.firstName} ${b.student.lastName}`,
            'Program': b.student.program,
            'Class': b.student.class,
            'Phone': b.parent.phone,
            'Seats': b.seats.join('; '),
            'Total Amount': b.total,
            'Booked By': b.bookedBy || '',
            'Status': b.status,
            'Booking Date': new Date(b.timestamp).toLocaleString(currentLanguage === 'th' ? 'th-TH' : 'en-US'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        const columnWidths = [
            { wch: 15 }, // Booking ID
            { wch: 30 }, // Parent Name
            { wch: 30 }, // Student Name
            { wch: 25 }, // Program
            { wch: 15 }, // Class
            { wch: 15 }, // Phone
            { wch: 40 }, // Seats
            { wch: 15 }, // Total Amount
            { wch: 25 }, // Booked By
            { wch: 15 }, // Status
            { wch: 25 }, // Booking Date
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.writeFile(workbook, "bookings.xlsx");
    };

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg space-y-12">
            <div>
                <h2 className="text-3xl font-bold text-center text-[#aa3a3b] mb-8">{t.adminTitle}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label={t.totalBookingsLabel} value={totalBookings} icon="confirmation_number" />
                    <StatCard label={t.totalSeatsBookedLabel} value={totalSeatsBooked} icon="event_seat" />
                    <StatCard label={t.totalRevenueLabel} value={totalRevenue.toLocaleString()} icon="account_balance_wallet" />
                    <StatCard label={t.availableSeatsLabel} value={availableSeats} icon="chair_alt" />
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-[#aa3a3b] pb-2 border-b-2 border-yellow-200">{t.bookingListTitle}</h3>
                    <div className="flex items-center gap-3">
                        <button onClick={handleExport} className="bg-orange-400 text-white font-bold py-2 px-4 rounded-lg transition-all hover:bg-orange-500 hover:shadow-md flex items-center justify-center gap-2">
                            <span className="material-icons text-lg">download</span>
                            {t.exportBtn}
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="font-medium text-sm text-gray-700 block mb-1">{t.filterByCustomerLabel}</label>
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={customerFilter}
                            onChange={(e) => setCustomerFilter(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b]"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="font-medium text-sm text-gray-700 block mb-1">{t.filterByStudentLabel}</label>
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={studentFilter}
                            onChange={(e) => setStudentFilter(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b]"
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <button
                            onClick={() => {
                                setCustomerFilter('');
                                setStudentFilter('');
                            }}
                            className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-all hover:bg-gray-300 flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-lg">clear</span>
                            {t.clearFilterBtn}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.bookingIdHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.customerNameHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.studentNameHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.amountHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.bookedByHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b]">{t.statusHeader}</th>
                                <th className="p-3 font-semibold text-[#aa3a3b] whitespace-nowrap">{t.actionsHeader}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(booking => (
                                <tr key={booking.id} className={`border-b hover:bg-gray-50 ${booking.status === 'cancelled' ? 'bg-red-50/50' : ''}`}>
                                    <td className="p-3">{booking.id}</td>
                                    <td className="p-3">{`${booking.parent.prefix} ${booking.parent.firstName} ${booking.parent.lastName}`}</td>
                                    <td className="p-3">{`${booking.student.prefix} ${booking.student.firstName} ${booking.student.lastName}`}</td>
                                    <td className="p-3">{booking.total.toLocaleString()}</td>
                                    <td className="p-3">{booking.bookedBy || '-'}</td>
                                    <td className={`p-3 font-medium capitalize ${booking.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                                        {booking.status === 'cancelled' ? t.cancelledStatus : booking.status}
                                    </td>
                                    <td className="p-3 text-sm whitespace-nowrap">
                                       <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1.5"
                                            >
                                                <span className="material-icons text-sm">visibility</span>
                                                {t.viewDetailsBtn}
                                            </button>
                                            <button
                                                onClick={() => onEditStart(booking.id)}
                                                className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-yellow-200 transition-colors flex items-center gap-1.5"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                                {t.editBtn}
                                            </button>
                                            <button
                                                onClick={() => onCancelStart(booking)}
                                                disabled={booking.status === 'cancelled'}
                                                className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-icons text-sm">cancel</span>
                                                {t.cancelAction}
                                            </button>
                                       </div>
                                    </td>
                                </tr>
                            ))}
                             {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center p-6 text-gray-500">
                                        {bookings.length > 0 ? t.noResultsText : t.noBookingsYetText}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {selectedBooking && (
                <BookingDetailsModal
                    isOpen={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    booking={selectedBooking}
                    currentLanguage={currentLanguage}
                />
            )}
        </div>
    );
};

export default AdminSection;