import React, { useState, useEffect } from 'react';
import { ParentInfo, StudentInfo, Language, Booking } from '../types';
import { translations, classData, calculateTotalPrice } from '../constants';
import ConfirmationModal from './ConfirmationModal';

declare var Swal: any;

interface FormSectionProps {
    selectedSeats: string[];
    onConfirmBooking: (bookingData: Omit<Booking, 'id' | 'timestamp' | 'status' | 'bookedBy'>) => Promise<boolean>;
    onBack: () => void;
    currentLanguage: Language;
    isBookingClosed: boolean;
    isAdminLoggedIn: boolean;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="font-medium mb-2 text-gray-700">{label}</label>
        <input {...props} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b] focus:ring-1 focus:ring-[#aa3a3b] transition" />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div className="flex flex-col">
        <label className="font-medium mb-2 text-gray-700">{label}</label>
        <select {...props} className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#aa3a3b] focus:ring-1 focus:ring-[#aa3a3b] transition bg-white">
            {children}
        </select>
    </div>
);


const FormSection: React.FC<FormSectionProps> = ({ selectedSeats, onConfirmBooking, onBack, currentLanguage, isBookingClosed, isAdminLoggedIn }) => {
    const t = translations[currentLanguage];
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const [parentInfo, setParentInfo] = useState<ParentInfo>({ prefix: '', firstName: '', lastName: '', phone: '' });
    const [studentInfo, setStudentInfo] = useState<StudentInfo>({ prefix: '', firstName: '', lastName: '', program: '', class: '' });

    const handleParentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setParentInfo({ ...parentInfo, [e.target.name]: e.target.value });
    };

    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
    };
    
    useEffect(() => {
        if(studentInfo.program) {
           setStudentInfo(prev => ({...prev, class: ''}));
        }
    }, [studentInfo.program]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isBookingClosed && !isAdminLoggedIn) {
             Swal.fire({
                icon: 'error',
                title: t.bookingClosedTitle,
                text: t.bookingClosedMessage,
                confirmButtonColor: '#aa3a3b',
            });
             return;
        }
        setIsConfirmationModalOpen(true);
    };

    const handleFinalConfirm = async () => {
        setIsLoading(true);
        const bookingData = {
            parent: parentInfo,
            student: studentInfo,
            seats: selectedSeats,
            total: calculateTotalPrice(selectedSeats),
        };
        
        const success = await onConfirmBooking(bookingData);
        setIsLoading(false);
        if (success) {
            setIsConfirmationModalOpen(false);
        } else {
            Swal.fire({
                icon: 'error',
                title: t.swalErrorTitle,
                text: t.swalBookingError,
                confirmButtonColor: '#aa3a3b',
            });
        }
    };
    
    const thParentPrefixes = ["นาย", "นาง", "นางสาว"];
    const enParentPrefixes = ["Mr.", "Mrs.", "Ms."];
    const thStudentPrefixes = ["เด็กชาย", "เด็กหญิง", "นาย", "นางสาว"];
    const enStudentPrefixes = ["Master", "Miss", "Mr.", "Ms."];
    const thPrograms = ["เนอสเซอรี่", "อนุบาล", "โปรแกรมภาษาไทย", "โปรแกรมภาษาอังกฤษ"];
    const enPrograms = ["Nursery", "Kindergarten", "Thai Program", "English Program"];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-center text-[#aa3a3b] mb-8">{t.formTitle}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-[#aa3a3b] pb-2 border-b-2 border-yellow-200 mb-6">{t.parentTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <FormSelect label={t.parentPrefixLabel} name="prefix" value={parentInfo.prefix} onChange={handleParentChange} required>
                                <option value="">{currentLanguage === 'th' ? 'เลือกคำนำหน้า' : 'Select Title'}</option>
                                {(currentLanguage === 'th' ? thParentPrefixes : enParentPrefixes).map(p => <option key={p} value={p}>{p}</option>)}
                            </FormSelect>
                            <FormInput label={t.parentFirstNameLabel} name="firstName" value={parentInfo.firstName} onChange={handleParentChange} required />
                            <FormInput label={t.parentLastNameLabel} name="lastName" value={parentInfo.lastName} onChange={handleParentChange} required />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                             <FormInput label={t.parentPhoneLabel} name="phone" type="tel" value={parentInfo.phone} onChange={handleParentChange} required />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-[#aa3a3b] pb-2 border-b-2 border-yellow-200 mb-6">{t.studentTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <FormSelect label={t.studentPrefixLabel} name="prefix" value={studentInfo.prefix} onChange={handleStudentChange} required>
                                <option value="">{currentLanguage === 'th' ? 'เลือกคำนำหน้า' : 'Select Title'}</option>
                                {(currentLanguage === 'th' ? thStudentPrefixes : enStudentPrefixes).map(p => <option key={p} value={p}>{p}</option>)}
                            </FormSelect>
                            <FormInput label={t.studentFirstNameLabel} name="firstName" value={studentInfo.firstName} onChange={handleStudentChange} required />
                            <FormInput label={t.studentLastNameLabel} name="lastName" value={studentInfo.lastName} onChange={handleStudentChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect label={t.studentProgramLabel} name="program" value={studentInfo.program} onChange={handleStudentChange} required>
                                <option value="">{currentLanguage === 'th' ? 'เลือกโปรแกรม' : 'Select Program'}</option>
                                {(currentLanguage === 'th' ? thPrograms : enPrograms).map(p => <option key={p} value={p}>{p}</option>)}
                            </FormSelect>
                            <FormSelect label={t.studentClassLabel} name="class" value={studentInfo.class} onChange={handleStudentChange} required disabled={!studentInfo.program}>
                                 <option value="">{currentLanguage === 'th' ? 'เลือกชั้นเรียน' : 'Select Class'}</option>
                                 {studentInfo.program && classData[studentInfo.program]?.map(c => <option key={c} value={c}>{c}</option>)}
                            </FormSelect>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button type="button" onClick={onBack} className="w-full sm:w-auto bg-transparent border-2 border-[#aa3a3b] text-[#aa3a3b] font-bold py-3 px-8 rounded-lg transition-all hover:bg-[#aa3a3b] hover:text-white">
                            {t.backToBookingBtn}
                        </button>
                        <button type="submit" className="w-full sm:w-auto bg-[#aa3a3b] text-white font-bold py-3 px-8 rounded-lg transition-all hover:bg-[#8b2f30] hover:shadow-md">
                           {t.confirmBookingBtn}
                        </button>
                    </div>
                </form>
            </div>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handleFinalConfirm}
                bookingData={{
                    parent: parentInfo,
                    student: studentInfo,
                    seats: selectedSeats,
                    total: calculateTotalPrice(selectedSeats),
                }}
                currentLanguage={currentLanguage}
                isLoading={isLoading}
            />
        </div>
    );
};

export default FormSection;
