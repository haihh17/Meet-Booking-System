const API_URL = 'https://script.google.com/macros/s/AKfycbwDbTkT5KzUkp9tglbKZV9uu0iyZzepXNM6LFQR53ieEiGIY-IdP8yYOUMmxkbWn6EF/exec';

function jsonpRequest(params, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    if (!API_URL || API_URL.includes('PASTE_YOUR')) {
      reject(new Error('API_URL chưa được cấu hình trong api.js.'));
      return;
    }

    const callbackName = `jsonp_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');

    let timeoutId = null;
    let settled = false;

    function cleanup() {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      script.onerror = null;
      script.remove();

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    function fail(error) {
      if (settled) return;

      settled = true;
      cleanup();
      reject(error);
    }

    window[callbackName] = data => {
      if (settled) return;

      settled = true;
      cleanup();

      if (!data || data.success !== true) {
        reject(
          new Error(
            data && data.error
              ? data.error
              : 'Dữ liệu trả về không hợp lệ.'
          )
        );
        return;
      }

      resolve(data);
    };

    script.onerror = () => {
      fail(
        new Error('Không thể kết nối tới Apps Script API.')
      );
    };

    timeoutId = setTimeout(() => {
      fail(
        new Error('API phản hồi quá lâu. Vui lòng thử lại.')
      );
    }, timeoutMs);

    try {
      const url = new URL(API_URL);

      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });

      url.searchParams.set('callback', callbackName);
      url.searchParams.set('_', String(Date.now()));

      script.src = url.toString();
      document.head.appendChild(script);

    } catch (error) {
      fail(new Error('API_URL không hợp lệ.'));
    }
  });
}

async function loadSlots() {
  const data = await jsonpRequest({
    action: 'slots'
  });

  return Array.isArray(data.slots)
    ? data.slots
    : [];
}

function validateClassCode(classCode) {
  return jsonpRequest({
    action: 'validateClass',
    classCode: String(classCode || '').trim().toUpperCase()
  });
}

window.API_URL = API_URL;
window.jsonpRequest = jsonpRequest;
window.loadSlots = loadSlots;
window.validateClassCode = validateClassCode;
