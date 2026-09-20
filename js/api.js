/* =========================================================
   STUDENT MEETING BOOKING - API CONNECTION
   ========================================================= */

const API_URL = 'https://script.google.com/macros/s/AKfycbwDbTkT5KzUkp9tglbKZV9uu0iyZzepXNM6LFQR53ieEiGIY-IdP8yYOUMmxkbWn6EF/exec';

/**
 * Helper thực hiện request JSONP tới Google Apps Script
 * Giải quyết vấn đề Cross-Origin (CORS) khi gọi Apps Script từ browser
 */
function jsonpRequest(params, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    if (!API_URL || API_URL.includes('PASTE_YOUR')) {
      return reject(new Error('API_URL chưa được cấu hình trong api.js.'));
    }

    // Tạo tên callback duy nhất tránh trùng lặp request
    const callbackName = `jsonp_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let timeoutId = null;

    const script = document.createElement('script');

    // Dọn dẹp DOM và global callback sau khi hoàn thành request
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (script.parentNode) script.remove();
      delete window[callbackName];
    };

    // Callback xử lý dữ liệu trả về từ Apps Script
    window[callbackName] = (data) => {
      cleanup();
      if (!data || data.success !== true) {
        return reject(new Error(data?.error || 'Dữ liệu trả về không hợp lệ.'));
      }
      resolve(data);
    };

    // Xử lý lỗi kết nối mạng / DNS / 404
    script.onerror = () => {
      cleanup();
      reject(new Error('Không thể kết nối tới Apps Script API.'));
    };

    // Xử lý timeout khi Google Apps Script phản hồi chậm
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('API phản hồi quá lâu. Vui lòng thử lại.'));
    }, timeoutMs);

    // Ghép query parameters và inject script vào document
    try {
      const url = new URL(API_URL);
      Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
      url.searchParams.set('callback', callbackName);
      url.searchParams.set('_', Date.now()); // Tránh cache trình duyệt

      script.src = url.toString();
      document.head.appendChild(script);
    } catch (err) {
      cleanup();
      reject(new Error('API_URL không hợp lệ.'));
    }
  });
}

/**
 * Lấy danh sách lịch họp còn trống
 */
async function loadSlots() {
  const data = await jsonpRequest({ action: 'slots' });
  return Array.isArray(data.slots) ? data.slots : [];
}

/**
 * Xác thực mã lớp học của sinh viên
 */
function validateClassCode(classCode) {
  return jsonpRequest({
    action: 'validateClass',
    classCode: classCode
  });
}
