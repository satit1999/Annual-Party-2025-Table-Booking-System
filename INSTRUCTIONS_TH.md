# วิธีการเชื่อมต่อระบบจองโต๊ะกับ Google Sheets

คู่มือนี้จะแนะนำขั้นตอนการตั้งค่า Google Sheets เพื่อใช้เป็นฐานข้อมูลสำหรับระบบจองโต๊ะของคุณ

## สิ่งที่ต้องเตรียม
- บัญชี Google Account

---

### ขั้นตอนที่ 1: สร้าง Google Sheet สำหรับเก็บข้อมูล

1.  ไปที่ [Google Sheets](https://sheets.google.com) และสร้างชีตใหม่ (Blank spreadsheet)
2.  ตั้งชื่อไฟล์ Spreadsheet ของคุณ (เช่น "Annual Party Bookings 2025")
3.  **สำคัญมาก:** เปลี่ยนชื่อชีตแรก (Sheet1) ให้เป็น **`Bookings`** (ต้องตรงตามนี้ทุกตัวอักษร)
4.  ในแถวแรกของชีต `Bookings` ให้คัดลอกและวางหัวข้อคอลัมน์ต่อไปนี้ตามลำดับ:

    `id, parentPrefix, parentFirstName, parentLastName, parentPhone, studentPrefix, studentFirstName, studentLastName, studentProgram, studentClass, seats, total, status, timestamp, bookedBy`

---

### ขั้นตอนที่ 2: สร้างและตั้งค่า Google Apps Script

1.  ในหน้า Google Sheet ที่คุณสร้างไว้, ไปที่เมนู **ส่วนขยาย (Extensions)** > **Apps Script**
2.  จะเปิดหน้าต่างใหม่สำหรับเขียนโค้ด Apps Script
3.  ลบโค้ดเริ่มต้นที่มีอยู่ทั้งหมด และ**คัดลอกโค้ดทั้งหมดด้านล่างนี้**ไปวางแทนที่:

    ```javascript
    // The headers in the Google Sheet must be exactly:
    // id, parentPrefix, parentFirstName, parentLastName, parentPhone, studentPrefix, studentFirstName, studentLastName, studentProgram, studentClass, seats, total, status, timestamp, bookedBy

    const SHEET_NAME = 'Bookings';

    // This function runs when a GET request is made to the script URL
    function doGet(e) {
      try {
        const action = e.parameter.action;

        if (action === 'READ') {
          const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
          // Return empty array if sheet doesn't exist or is empty
          if (!sheet || sheet.getLastRow() < 2) {
             return ContentService
              .createTextOutput(JSON.stringify({ status: 'success', data: [] }))
              .setMimeType(ContentService.MimeType.JSON);
          }

          const data = sheet.getDataRange().getValues();
          const headers = data.shift(); // Remove header row
          
          const bookingsData = data.map(row => {
            const flatBooking = {};
            headers.forEach((header, index) => {
              flatBooking[header] = row[index];
            });
            
            // Reconstruct the nested object structure the frontend expects
            return {
              id: flatBooking.id,
              parent: {
                  prefix: flatBooking.parentPrefix,
                  firstName: flatBooking.parentFirstName,
                  lastName: flatBooking.parentLastName,
                  phone: flatBooking.parentPhone,
              },
              student: {
                  prefix: flatBooking.studentPrefix,
                  firstName: flatBooking.studentFirstName,
                  lastName: flatBooking.studentLastName,
                  program: flatBooking.studentProgram,
                  class: flatBooking.studentClass,
              },
              seats: flatBooking.seats ? flatBooking.seats.toString().split('; ') : [],
              total: Number(flatBooking.total) || 0,
              status: flatBooking.status,
              timestamp: flatBooking.timestamp,
              bookedBy: flatBooking.bookedBy,
            };
          });

          return ContentService
            .createTextOutput(JSON.stringify({ status: 'success', data: bookingsData }))
            .setMimeType(ContentService.MimeType.JSON);
        }
        
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action specified.' }))
            .setMimeType(ContentService.MimeType.JSON);

      } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: error.message, stack: error.stack }))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // This function runs when a POST request is made to the script URL
    function doPost(e) {
      const lock = LockService.getScriptLock();
      lock.waitLock(30000); // Wait up to 30 seconds for other processes to finish

      try {
        const requestData = JSON.parse(e.postData.contents);
        const action = requestData.action;
        const payload = requestData.payload;

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

        const flattenPayload = (p) => {
            const seatsString = Array.isArray(p.seats) ? p.seats.join('; ') : p.seats;
            return headers.map(header => {
                if (header === 'seats') return seatsString;
                if (header.startsWith('parent')) {
                    const key = header.charAt(6).toLowerCase() + header.slice(7);
                    return p.parent[key] || '';
                }
                if (header.startsWith('student')) {
                    const key = header.charAt(7).toLowerCase() + header.slice(8);
                    return p.student[key] || '';
                }
                return p[header] !== undefined ? p[header] : '';
            });
        };

        if (action === 'CREATE') {
          const newRow = flattenPayload(payload);
          sheet.appendRow(newRow);
          return ContentService
            .createTextOutput(JSON.stringify({ status: 'success', message: 'Booking created successfully.' }))
            .setMimeType(ContentService.MimeType.JSON);
        }

        if (action === 'UPDATE') {
          const idToUpdate = payload.id;
          const data = sheet.getDataRange().getValues();
          const idColumnIndex = headers.indexOf('id');
          
          if (idColumnIndex === -1) throw new Error("Column 'id' not found.");
          
          let rowIndexToUpdate = -1;
          for (let i = 1; i < data.length; i++) {
            if (data[i][idColumnIndex] == idToUpdate) {
              rowIndexToUpdate = i + 1; // Sheet rows are 1-indexed
              break;
            }
          }

          if (rowIndexToUpdate !== -1) {
            const updatedRow = flattenPayload(payload);
            sheet.getRange(rowIndexToUpdate, 1, 1, headers.length).setValues([updatedRow]);
            return ContentService
                .createTextOutput(JSON.stringify({ status: 'success', message: `Booking ${idToUpdate} updated successfully.` }))
                .setMimeType(ContentService.MimeType.JSON);
          } else {
            return ContentService
                .createTextOutput(JSON.stringify({ status: 'error', message: `Booking with ID ${idToUpdate} not found.` }))
                .setMimeType(ContentService.MimeType.JSON);
          }
        }

        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action specified.' }))
            .setMimeType(ContentService.MimeType.JSON);

      } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: error.message, stack: error.stack }))
            .setMimeType(ContentService.MimeType.JSON);
      } finally {
        lock.releaseLock();
      }
    }
    ```
4.  กดไอคอนรูปแผ่นดิสก์ (💾) เพื่อบันทึกโปรเจกต์ ตั้งชื่อโปรเจกต์ของคุณ (เช่น "Booking API") แล้วกด **Rename**

---

### ขั้นตอนที่ 3: Deploy สคริปต์เป็น Web App

1.  ที่มุมบนขวาของหน้า Apps Script, คลิกที่ปุ่มสีฟ้า **Deploy** > **New deployment**

2.  จะปรากฏหน้าต่าง "New deployment" ขึ้นมา ให้ตั้งค่าดังนี้:
    *   คลิกที่ไอคอนรูปเฟือง (⚙️) ข้างๆ "Select type" และเลือก **Web app**
    *   **Description:** (ไม่บังคับ) ใส่คำอธิบายสั้นๆ เช่น "Booking System API v1"
    *   **Execute as:** เลือก **Me** (บัญชี Google ของคุณ)
    *   **Who has access:** **สำคัญมาก!** ต้องเลือกเป็น **Anyone**

3.  คลิกปุ่ม **Deploy**

---

### ขั้นตอนที่ 4: การให้สิทธิ์ (Authorization)

1.  หลังจากคลิก Deploy, Google จะขอสิทธิ์ให้สคริปต์เข้าถึงข้อมูลใน Google Sheet ของคุณ ให้คลิก **Authorize access**
2.  เลือกบัญชี Google ของคุณ
3.  คุณอาจจะเห็นหน้าจอเตือนว่า "Google hasn't verified this app" ไม่ต้องกังวล นี่เป็นเรื่องปกติสำหรับสคริปต์ที่เราสร้างขึ้นเอง ให้คลิกที่ **Advanced** แล้วคลิกที่ **Go to [ชื่อโปรเจกต์ของคุณ] (unsafe)**
4.  หน้าจอถัดไปจะแสดงสิทธิ์ที่สคริปต์ต้องการ ให้เลื่อนลงมาด้านล่างสุดแล้วคลิก **Allow**

---

### ขั้นตอนที่ 5: นำ Web App URL ไปใช้งาน

1.  หลังจากให้สิทธิ์เรียบร้อยแล้ว คุณจะได้รับ **Web app URL**
2.  คลิกปุ่ม **Copy** เพื่อคัดลอก URL นี้
3.  เปิดไฟล์ **`App.tsx`** ในโปรเจกต์ของคุณ
4.  มองหาตัวแปร `GOOGLE_SHEET_API_URL` แล้วนำ URL ที่คัดลอกมาไปวางแทนที่ `"YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"`

    **ตัวอย่าง:**
    ```javascript
    const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycby.../exec";
    ```
5.  บันทึกไฟล์ **`App.tsx`**

**เรียบร้อย!** ตอนนี้ระบบจองโต๊ะของคุณได้เชื่อมต่อกับฐานข้อมูล Google Sheet แล้ว ทุกการจองจะถูกบันทึกและดึงข้อมูลมาจากชีตของคุณโดยอัตโนมัติ

### การอัปเดตโค้ดในอนาคต
หากคุณมีการแก้ไขโค้ดใน Apps Script คุณจะต้อง Deploy ใหม่เพื่อให้การเปลี่ยนแปลงมีผล:
1.  ไปที่ **Deploy** > **Manage deployments**
2.  เลือก Deployment ที่คุณใช้งานอยู่ (Active)
3.  คลิกที่ไอคอนรูปดินสอ (✏️) เพื่อแก้ไข
4.  ในช่อง "Version" ให้เลือก **New version**
5.  คลิก **Deploy**
