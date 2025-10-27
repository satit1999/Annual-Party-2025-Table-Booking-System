import React, { useEffect, useState } from 'react';

const CancellationOverlay: React.FC = () => {
    const [language, setLanguage] = useState<'th' | 'en'>('th');

    // Effect to disable most user interactions, but allow language toggle
    useEffect(() => {
        const body = document.body;
        body.style.overflow = 'hidden'; // Prevent scrolling

        const preventInteraction = (e: Event) => {
            const target = e.target as HTMLElement;
            // Allow interaction with the language toggle button
            if (target.closest('#language-toggle-button')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevent context menu (right-click)
        document.addEventListener('contextmenu', preventInteraction, true);
        // Prevent text selection
        document.addEventListener('selectstart', preventInteraction, true);
        // Prevent all key presses
        document.addEventListener('keydown', preventInteraction, true);
        // Prevent mouse clicks, except on the toggle button
        document.addEventListener('mousedown', preventInteraction, true);
        document.addEventListener('mouseup', preventInteraction, true);
        document.addEventListener('click', preventInteraction, true);


        return () => {
            body.style.overflow = 'auto'; // Restore scrolling on cleanup
            document.removeEventListener('contextmenu', preventInteraction, true);
            document.removeEventListener('selectstart', preventInteraction, true);
            document.removeEventListener('keydown', preventInteraction, true);
            document.removeEventListener('mousedown', preventInteraction, true);
            document.removeEventListener('mouseup', preventInteraction, true);
            document.removeEventListener('click', preventInteraction, true);
        };
    }, []);

    const ThaiAnnouncement = () => (
        <div className="animate-fadeIn">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">ประกาศ โรงเรียนสาธิตอุดมศึกษา</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl">เรื่อง ยกเลิกการจัดงานประจำปี พ.ศ. ๒๕๖๘</h2>
            <hr className="my-6 border-gray-600" />
            <div className="space-y-3 text-base sm:text-lg leading-relaxed">
                <p>เนื่องด้วยเหตุการณ์การสวรรคตของ สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง</p>
                <p>ตามแนวทางของกระทรวงศึกษาธิการให้สถานศึกษางดจัดกิจกรรมรื่นเริงทุกประเภท</p>
                <p className="font-semibold mt-4">โรงเรียนสาธิตอุดมศึกษา<br />จึงขอยกเลิกการจัด งานประจำปี พ.ศ. ๒๕๖๘</p>
                <p>ซึ่งเดิมกำหนดจัดในวันที่ ๑๙ ธันวาคม พ.ศ. ๒๕๖๘ เวลา ๑๘.๐๐–๒๒.๓๐ น.</p>
                <p className="mt-4">สำหรับผู้ที่ได้ซื้อตั๋วเข้าร่วมงานไว้แล้ว<br />ทางคณะผู้จัดงานจะดำเนินการ คืนเงินให้โดยเร็วที่สุด</p>
                <p className="mt-4">จึงประกาศมาเพื่อทราบโดยทั่วกัน</p>
            </div>
            <div className="mt-8 text-sm sm:text-base">
                <p>ประกาศ ณ วันที่ ๒๗ ตุลาคม พ.ศ. ๒๕๖๘</p>
                <p>คณะผู้จัดงาน</p>
                <p>โรงเรียนสาธิตอุดมศึกษา</p>
            </div>
        </div>
    );

    const EnglishAnnouncement = () => (
         <div className="animate-fadeIn">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">Announcement — Satit Udomseuksa School</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl">Subject: Cancellation of the Annual Party 2025</h2>
            <hr className="my-6 border-gray-600" />
            <div className="space-y-3 text-base sm:text-lg leading-relaxed">
                <p>Due to the passing of Her Majesty Queen Sirikit, The Queen Mother,</p>
                <p>and in compliance with the Ministry of Education’s directive<br />prohibiting all forms of festive activities within educational institutions,</p>
                <p className="font-semibold mt-4">Satit Udomseuksa School hereby announces the cancellation of the Annual Party 2025,</p>
                <p>originally scheduled on 19 December 2025, from 6:00 p.m. to 10:30 p.m.</p>
                <p className="mt-4">Refunds will be arranged for all ticket holders as soon as possible.</p>
            </div>
            <div className="mt-8 text-sm sm:text-base">
                <p>Issued on 27 October 2025</p>
                <p>Organizing Committee</p>
                <p>Satit Udomseuksa School</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-800 text-white z-[9999] flex items-center justify-center p-4 sm:p-8 overflow-auto">
            <div className="w-full max-w-4xl text-center flex flex-col items-center gap-8">
                <div className="bg-gray-700/50 p-6 sm:p-10 rounded-lg border border-gray-600 w-full">
                   {language === 'th' ? <ThaiAnnouncement /> : <EnglishAnnouncement />}
                </div>
                <div>
                    <button
                        id="language-toggle-button"
                        onClick={() => setLanguage(lang => lang === 'th' ? 'en' : 'th')}
                        className="bg-white/20 border border-white/30 px-6 py-3 rounded-full text-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:-translate-y-1"
                        aria-label="Toggle language"
                    >
                         <span className="material-icons">language</span>
                        <span>{language === 'th' ? 'English' : 'ภาษาไทย'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancellationOverlay;