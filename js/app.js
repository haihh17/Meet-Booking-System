let allSlots = [];
let selectedMonth = null;
let selectedWeekday = null;
let selectedDate = null;
let selectedTime = null;

const PRIVACY_NOTICE_VERSION = '1.2';
const CONSENT_SCHEMA_VERSION = '1.0';
const SLOT_LOAD_MAX_ATTEMPTS = 3;
const SLOT_LOAD_RETRY_DELAY = 1000;
const BOOKING_STATUS_MAX_ATTEMPTS = 20;
const BOOKING_STATUS_POLL_DELAY = 800;

const WEEKDAYS = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const MONTHS = {
  0: 'Tháng 1',
  1: 'Tháng 2',
  2: 'Tháng 3',
  3: 'Tháng 4',
  4: 'Tháng 5',
  5: 'Tháng 6',
  6: 'Tháng 7',
  7: 'Tháng 8',
  8: 'Tháng 9',
  9: 'Tháng 10',
  10: 'Tháng 11',
  11: 'Tháng 12'
};

let monthOptions;
let weekdayOptions;
let dateOptions;
let timeOptions;
let classGate;
let classCodeForm;
let classCodeInput;
let classCodeError;
let classCodeButton;
let bookingFlow;
let statusText;
let errorText;
let weekdaySection;
let dateSection;
let timeSection;
let summarySection;
let summaryValue;
let studentSection;
let bookingForm;
let studentName;
let studentMssv;
let studentEmail;
let studentTopic;
let processingConsent;
let processingConsentError;
let calendarInviteConsent;
let confirmButton;
let formMessage;
let nameError;
let mssvError;
let emailError;
let topicError;

function initDOM() {
  monthOptions = document.getElementById('monthOptions');
  weekdayOptions = document.getElementById('weekdayOptions');
  dateOptions = document.getElementById('dateOptions');
  timeOptions = document.getElementById('timeOptions');

  classGate = document.getElementById('classGate');
  classCodeForm = document.getElementById('classCodeForm');
  classCodeInput = document.getElementById('classCodeInput');
  classCodeError = document.getElementById('classCodeError');
  classCodeButton = document.getElementById('classCodeButton');
  bookingFlow = document.querySelector('.booking-flow');

  statusText = document.getElementById('status');
  errorText = document.getElementById('error');

  weekdaySection = document.getElementById('weekdaySection');
  dateSection = document.getElementById('dateSection');
  timeSection = document.getElementById('timeSection');
  summarySection = document.getElementById('summarySection');
  summaryValue = document.getElementById('summaryValue');

  studentSection = document.getElementById('studentSection');
  bookingForm = document.getElementById('bookingForm');
  studentName = document.getElementById('studentName');
  studentMssv = document.getElementById('studentMssv');
  studentEmail = document.getElementById('studentEmail');
  studentTopic = document.getElementById('studentTopic');

  processingConsent = document.getElementById('processingConsent');
  processingConsentError = document.getElementById('processingConsentError');
  calendarInviteConsent = document.getElementById('calendarInviteConsent');

  confirmButton = document.getElementById('confirmButton');
  formMessage = document.getElementById('formMessage');

  nameError = document.getElementById('nameError');
  mssvError = document.getElementById('mssvError');
  emailError = document.getElementById('emailError');
  topicError = document.getElementById('topicError');
}

function checkRequiredElements() {
  const required = {
    monthOptions,
    weekdayOptions,
    dateOptions,
    timeOptions,
    classGate,
    classCodeForm,
    classCodeInput,
    classCodeError,
    classCodeButton,
    bookingFlow,
    statusText,
    errorText,
    weekdaySection,
    dateSection,
    timeSection,
    summarySection,
    summaryValue,
    studentSection,
    bookingForm,
    studentName,
    studentMssv,
    studentEmail,
    studentTopic,
    processingConsent,
    processingConsentError,
    calendarInviteConsent,
    confirmButton,
    formMessage,
    nameError,
    mssvError,
    emailError,
    topicError
  };

  const missing = Object.entries(required)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Thiếu thành phần HTML: ${missing.join(', ')}`);
  }
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateForDisplay(dateString) {
  const date = parseDate(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

function formatSelectedDate_() {
  return formatDateForDisplay(selectedDate);
}

function getStartMinutes_(slot) {
  const startTime = String(slot.time || '').split(/[–—-]/)[0].trim();
  const match = startTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function sortDates(a, b) {
  const dateDifference = parseDate(a.date).getTime() - parseDate(b.date).getTime();

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return getStartMinutes_(a) - getStartMinutes_(b);
}

function showError(message) {
  statusText.textContent = '';
  statusText.classList.add('hidden');
  errorText.textContent = message;
  errorText.classList.remove('hidden');
}

function hideError() {
  errorText.textContent = '';
  errorText.classList.add('hidden');
}

function updateActiveButtons(container, activeButton) {
  Array.from(container.children).forEach(child => {
    child.classList.remove('active');
  });

  activeButton.classList.add('active');
}

function setupClassGate() {
  classCodeForm.addEventListener('submit', event => {
    event.preventDefault();

    const classCode = classCodeInput.value.trim().toUpperCase();
    classCodeError.textContent = '';

    if (!classCode) {
      classCodeError.textContent = 'Vui lòng nhập mã lớp.';
      return;
    }

    classCodeButton.disabled = true;
    classCodeButton.textContent = 'Đang kiểm tra...';
    statusText.textContent = 'Đang xác thực mã lớp...';

    validateClassCode(classCode)
      .then(result => {
        if (!result.valid) {
          classCodeError.textContent = result.error || 'Mã lớp không hợp lệ.';
          statusText.textContent = 'Mã lớp không hợp lệ.';
          classCodeButton.disabled = false;
          classCodeButton.innerHTML = 'Tiếp tục <span aria-hidden="true">→</span>';
          return;
        }

        classGate.classList.add('hidden');
        bookingFlow.classList.remove('hidden');
        classCodeButton.disabled = false;
        statusText.textContent = 'Đang tải lịch...';
        initializeSchedule();
      })
      .catch(error => {
        classCodeError.textContent = error.message || 'Không thể xác thực mã lớp.';
        statusText.textContent = 'Không thể xác thực mã lớp.';
        classCodeButton.disabled = false;
        classCodeButton.innerHTML = 'Tiếp tục <span aria-hidden="true">→</span>';
      });
  });
}

function loadSlotsWithRetry_(attempt = 1) {
  return loadSlots().catch(error => {
    if (attempt >= SLOT_LOAD_MAX_ATTEMPTS) {
      throw error;
    }

    statusText.textContent = `Đang kết nối lại... (${attempt}/${SLOT_LOAD_MAX_ATTEMPTS - 1})`;

    return new Promise(resolve => {
      setTimeout(resolve, SLOT_LOAD_RETRY_DELAY);
    }).then(() => loadSlotsWithRetry_(attempt + 1));
  });
}

function initializeSchedule() {
  hideError();
  statusText.textContent = 'Đang tải lịch...';

  if (typeof loadSlots !== 'function') {
    showError('Không tìm thấy loadSlots(). Hãy kiểm tra js/api.js.');
    return;
  }

  loadSlotsWithRetry_()
    .then(slots => {
      allSlots = Array.isArray(slots) ? slots.sort(sortDates) : [];
      statusText.textContent = `Đã tải ${allSlots.length} slot.`;

      if (allSlots.length === 0) {
        showError('Hiện chưa có slot meeting.');
        return;
      }

      renderMonths();
    })
    .catch(error => {
      console.error('LOAD ERROR:', error);
      showError(error.message || 'Không thể tải lịch booking.');
    });
}

function renderMonths() {
  monthOptions.innerHTML = '';

  const months = [...new Set(allSlots.map(slot => slot.date.slice(0, 7)))].sort();

  months.forEach(monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'option';
    button.textContent = `${MONTHS[month - 1]} ${year}`;

    button.addEventListener('click', () => {
      selectedMonth = monthKey;
      selectedWeekday = null;
      selectedDate = null;
      selectedTime = null;

      updateActiveButtons(monthOptions, button);
      weekdaySection.classList.remove('hidden');
      dateSection.classList.add('hidden');
      timeSection.classList.add('hidden');
      summarySection.classList.add('hidden');
      studentSection.classList.add('hidden');

      renderWeekdays();
    });

    monthOptions.appendChild(button);
  });
}

function renderWeekdays() {
  weekdayOptions.innerHTML = '';

  const slots = allSlots.filter(slot => slot.date.startsWith(selectedMonth));
  const weekdays = [...new Set(
    slots.map(slot => parseDate(slot.date).getDay())
  )].sort((a, b) => {
    const dayA = a === 0 ? 7 : a;
    const dayB = b === 0 ? 7 : b;
    return dayA - dayB;
  });

  weekdays.forEach(weekday => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'option';
    button.textContent = WEEKDAYS[weekday];

    button.addEventListener('click', () => {
      selectedWeekday = weekday;
      selectedDate = null;
      selectedTime = null;

      updateActiveButtons(weekdayOptions, button);
      dateSection.classList.remove('hidden');
      timeSection.classList.add('hidden');
      summarySection.classList.add('hidden');
      studentSection.classList.add('hidden');

      renderDates();
    });

    weekdayOptions.appendChild(button);
  });
}

function renderDates() {
  dateOptions.innerHTML = '';

  const slots = allSlots
    .filter(slot => slot.date.startsWith(selectedMonth))
    .filter(slot => parseDate(slot.date).getDay() === selectedWeekday);

  const dates = [...new Set(slots.map(slot => slot.date))].sort();

  dates.forEach(dateString => {
    const date = parseDate(dateString);
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'date-card';
    card.innerHTML = `
      <div class="date-number">${date.getDate()}</div>
      <div class="date-month">${MONTHS[date.getMonth()]}</div>
    `;

    card.addEventListener('click', () => {
      selectedDate = dateString;
      selectedTime = null;

      updateActiveButtons(dateOptions, card);
      timeSection.classList.remove('hidden');
      summarySection.classList.add('hidden');
      studentSection.classList.add('hidden');

      renderTimes();
    });

    dateOptions.appendChild(card);
  });
}

function renderTimes() {
  timeOptions.innerHTML = '';

  const slots = allSlots.filter(slot => slot.date === selectedDate);

  slots.forEach(slot => {
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'time-card';
    card.innerHTML = `
      <div class="time-label">${slot.time}</div>
      <div class="time-status">Còn trống</div>
    `;

    card.addEventListener('click', () => {
      selectedTime = slot.time;
      updateActiveButtons(timeOptions, card);
      showSummary();
    });

    timeOptions.appendChild(card);
  });
}

function showSummary() {
  if (!selectedDate || !selectedTime) {
    return;
  }

  summaryValue.textContent = `${formatSelectedDate_()} — ${selectedTime}`;
  summarySection.classList.remove('hidden');
  studentSection.classList.remove('hidden');

  validateBookingForm();
}

function validateBookingForm() {
  const name = studentName.value.trim();
  const mssv = studentMssv.value.trim();
  const email = studentEmail.value.trim();
  const topic = studentTopic.value.trim();
  const hasProcessingConsent = processingConsent.checked;

  let valid = true;

  nameError.textContent = '';
  mssvError.textContent = '';
  emailError.textContent = '';
  topicError.textContent = '';
  processingConsentError.textContent = '';

  if (!name) {
    nameError.textContent = 'Vui lòng nhập họ và tên.';
    valid = false;
  } else if (name.length < 2) {
    nameError.textContent = 'Họ và tên chưa hợp lệ.';
    valid = false;
  }

  if (!mssv) {
    mssvError.textContent = 'Vui lòng nhập MSSV.';
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    emailError.textContent = 'Vui lòng nhập email.';
    valid = false;
  } else if (!emailPattern.test(email)) {
    emailError.textContent = 'Email chưa đúng định dạng.';
    valid = false;
  }

  if (!topic) {
    topicError.textContent = 'Vui lòng nhập nội dung cần trao đổi.';
    valid = false;
  } else if (topic.length < 5) {
    topicError.textContent = 'Vui lòng mô tả nội dung chi tiết hơn.';
    valid = false;
  }

  if (!hasProcessingConsent) {
    processingConsentError.textContent = 'Vui lòng đồng ý xử lý dữ liệu cá nhân để tiếp tục đặt lịch.';
    valid = false;
  }

  confirmButton.disabled = !valid;
  return valid;
}

function addHiddenField_(form, name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = String(value);
  form.appendChild(input);
}

function setupBookingResponseFrame() {
  let frame = document.getElementById('bookingResponseFrame');

  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'bookingResponseFrame';
    frame.name = 'bookingResponseFrame';
    frame.style.display = 'none';
    document.body.appendChild(frame);
  }
}

function pollBookingStatus_(bookingId, attempt = 0) {
  if (attempt >= BOOKING_STATUS_MAX_ATTEMPTS) {
    confirmButton.disabled = false;
    confirmButton.innerHTML = 'Xác nhận booking <span aria-hidden="true">→</span>';
    formMessage.textContent = 'Hệ thống chưa trả về kết quả booking. Vui lòng kiểm tra lại trước khi đặt lần nữa.';
    return;
  }

  const callbackName = `bookingStatus_${Date.now()}_${attempt}`;
  const script = document.createElement('script');
  let finished = false;

  function cleanup() {
    if (finished) {
      return;
    }

    finished = true;
    script.remove();

    try {
      delete window[callbackName];
    } catch (error) {
      window[callbackName] = undefined;
    }
  }

  window[callbackName] = data => {
    cleanup();

    if (data && data.success && data.eventId) {
      const successUrl = './booking-success.html' +
        '?status=success' +
        '&eventId=' + encodeURIComponent(data.eventId);

      window.location.replace(successUrl);
      return;
    }

    if (data && data.success === false && !data.pending && data.error) {
      const errorUrl = './booking-success.html' +
        '?status=error' +
        '&message=' + encodeURIComponent(data.error);

      window.location.replace(errorUrl);
      return;
    }

    setTimeout(() => {
      pollBookingStatus_(bookingId, attempt + 1);
    }, BOOKING_STATUS_POLL_DELAY);
  };

  script.onerror = () => {
    cleanup();
    setTimeout(() => {
      pollBookingStatus_(bookingId, attempt + 1);
    }, BOOKING_STATUS_POLL_DELAY);
  };

  const params = new URLSearchParams({
    action: 'bookingStatus',
    bookingId,
    callback: callbackName,
    t: String(Date.now())
  });

  script.src = `${API_URL}?${params.toString()}`;
  document.body.appendChild(script);
}

function setupFormEvents() {
  [studentName, studentMssv, studentEmail, studentTopic].forEach(field => {
    field.addEventListener('input', validateBookingForm);
  });

  [processingConsent, calendarInviteConsent].forEach(field => {
    field.addEventListener('change', validateBookingForm);
  });

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!validateBookingForm()) {
      if (!processingConsent.checked) {
        processingConsent.focus();
      }
      return;
    }

    if (!selectedDate || !selectedTime) {
      formMessage.textContent = 'Vui lòng chọn khung giờ meeting.';
      return;
    }

    confirmButton.disabled = true;
    confirmButton.textContent = 'Đang xác nhận...';
    formMessage.textContent = 'Đang kiểm tra và xác nhận lịch meeting...';

    const slot = `${formatSelectedDate_()} | ${selectedTime}`;
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const postForm = document.createElement('form');

    postForm.method = 'POST';
    postForm.action = API_URL;
    postForm.target = 'bookingResponseFrame';
    postForm.style.display = 'none';

    addHiddenField_(postForm, 'action', 'book');
    addHiddenField_(postForm, 'bookingId', bookingId);
    addHiddenField_(postForm, 'slot', slot);
    addHiddenField_(postForm, 'student', studentName.value.trim());
    addHiddenField_(postForm, 'mssv', studentMssv.value.trim());
    addHiddenField_(postForm, 'email', studentEmail.value.trim());
    addHiddenField_(postForm, 'topic', studentTopic.value.trim());
    addHiddenField_(postForm, 'processingConsent', processingConsent.checked ? 'true' : 'false');
    addHiddenField_(postForm, 'calendarInviteConsent', calendarInviteConsent.checked ? 'true' : 'false');
    addHiddenField_(postForm, 'privacyNoticeVersion', PRIVACY_NOTICE_VERSION);
    addHiddenField_(postForm, 'consentSchemaVersion', CONSENT_SCHEMA_VERSION);

    document.body.appendChild(postForm);
    postForm.submit();
    pollBookingStatus_(bookingId);
  });
}

function startApp() {
  try {
    initDOM();
    checkRequiredElements();
    setupBookingResponseFrame();
    setupFormEvents();
    setupClassGate();
  } catch (error) {
    console.error('APP START ERROR:', error);

    const errorElement = document.getElementById('error');
    const statusElement = document.getElementById('status');

    if (statusElement) {
      statusElement.classList.add('hidden');
    }

    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.classList.remove('hidden');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
