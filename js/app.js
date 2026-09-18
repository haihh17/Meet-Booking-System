/* =========================================================
   STUDENT MEETING BOOKING
   APP.JS — CLEAN VERSION
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let allSlots = [];

let selectedMonth = null;
let selectedWeekday = null;
let selectedDate = null;
let selectedTime = null;


/* =========================================================
   LABELS
   ========================================================= */

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


/* =========================================================
   DOM
   ========================================================= */

let monthOptions;
let weekdayOptions;
let dateOptions;
let timeOptions;

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

let confirmButton;
let formMessage;

let nameError;
let mssvError;
let emailError;
let topicError;


/* =========================================================
   INIT DOM
   ========================================================= */

function initDOM() {

  monthOptions =
    document.getElementById('monthOptions');

  weekdayOptions =
    document.getElementById('weekdayOptions');

  dateOptions =
    document.getElementById('dateOptions');

  timeOptions =
    document.getElementById('timeOptions');

  statusText =
    document.getElementById('status');

  errorText =
    document.getElementById('error');

  weekdaySection =
    document.getElementById('weekdaySection');

  dateSection =
    document.getElementById('dateSection');

  timeSection =
    document.getElementById('timeSection');

  summarySection =
    document.getElementById('summarySection');

  summaryValue =
    document.getElementById('summaryValue');

  studentSection =
    document.getElementById('studentSection');

  bookingForm =
    document.getElementById('bookingForm');

  studentName =
    document.getElementById('studentName');

  studentMssv =
    document.getElementById('studentMssv');

  studentEmail =
    document.getElementById('studentEmail');

  studentTopic =
    document.getElementById('studentTopic');

  confirmButton =
    document.getElementById('confirmButton');

  formMessage =
    document.getElementById('formMessage');

  nameError =
    document.getElementById('nameError');

  mssvError =
    document.getElementById('mssvError');

  emailError =
    document.getElementById('emailError');

  topicError =
    document.getElementById('topicError');

}


/* =========================================================
   DOM CHECK
   ========================================================= */

function checkRequiredElements() {

  const required = {

    monthOptions,
    weekdayOptions,
    dateOptions,
    timeOptions,

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

    confirmButton,
    formMessage,

    nameError,
    mssvError,
    emailError,
    topicError

  };


  const missing = [];


  Object.entries(required)
    .forEach(
      ([name, element]) => {

        if (!element) {
          missing.push(name);
        }

      }
    );


  if (missing.length > 0) {

    throw new Error(
      'Thiếu thành phần HTML: ' +
      missing.join(', ')
    );

  }

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseDate(dateString) {

  const [
    year,
    month,
    day
  ] =
    dateString
      .split('-')
      .map(Number);


  return new Date(
    year,
    month - 1,
    day
  );

}


function formatDateForDisplay(
  dateString
) {

  const date =
    parseDate(
      dateString
    );


  return (
    String(
      date.getDate()
    ).padStart(2, '0') +
    '/' +
    String(
      date.getMonth() + 1
    ).padStart(2, '0') +
    '/' +
    date.getFullYear()
  );

}


function formatSelectedDate_() {

  return formatDateForDisplay(
    selectedDate
  );

}


function sortDates(a, b) {

  return (
    parseDate(a.date).getTime() -
    parseDate(b.date).getTime()
  );

}


/* =========================================================
   UI
   ========================================================= */

function showError(message) {

  statusText.textContent = '';

  statusText.classList.add(
    'hidden'
  );


  errorText.textContent =
    message;

  errorText.classList.remove(
    'hidden'
  );

}


function hideError() {

  errorText.textContent = '';

  errorText.classList.add(
    'hidden'
  );

}


function updateActiveButtons(
  container,
  activeButton
) {

  [...container.children]
    .forEach(
      child => {

        child.classList.remove(
          'active'
        );

      }
    );


  activeButton.classList.add(
    'active'
  );

}


/* =========================================================
   LOAD SLOTS
   ========================================================= */

function initialize() {

  hideError();


  statusText.textContent =
    'Đang tải lịch...';


  /**
   * Check API function.
   */
  if (
    typeof loadSlots !==
    'function'
  ) {

    showError(
      'Không tìm thấy loadSlots(). ' +
      'Hãy kiểm tra js/api.js.'
    );

    return;

  }


  loadSlots()

    .then(
      slots => {

        allSlots =
          Array.isArray(slots)
            ? slots.sort(sortDates)
            : [];


        statusText.textContent =
          `Đã tải ${allSlots.length} slot.`;


        if (
          allSlots.length === 0
        ) {

          showError(
            'Hiện chưa có slot meeting.'
          );

          return;

        }


        renderMonths();

      }
    )

    .catch(
      error => {

        console.error(
          'LOAD ERROR:',
          error
        );


        showError(
          error.message ||
          'Không thể tải lịch booking.'
        );

      }
    );

}


/* =========================================================
   MONTH
   ========================================================= */

function renderMonths() {

  monthOptions.innerHTML = '';


  const months = [
    ...new Set(
      allSlots.map(
        slot =>
          slot.date.slice(0, 7)
      )
    )
  ];


  months.sort();


  months.forEach(
    monthKey => {

      const [
        year,
        month
      ] =
        monthKey
          .split('-')
          .map(Number);


      const button =
        document.createElement(
          'button'
        );


      button.type =
        'button';


      button.className =
        'option';


      button.textContent =
        `${MONTHS[month - 1]} ${year}`;


      button.addEventListener(
        'click',
        () => {

          selectedMonth =
            monthKey;

          selectedWeekday =
            null;

          selectedDate =
            null;

          selectedTime =
            null;


          updateActiveButtons(
            monthOptions,
            button
          );


          weekdaySection.classList.remove(
            'hidden'
          );


          dateSection.classList.add(
            'hidden'
          );


          timeSection.classList.add(
            'hidden'
          );


          summarySection.classList.add(
            'hidden'
          );


          studentSection.classList.add(
            'hidden'
          );


          renderWeekdays();

        }
      );


      monthOptions.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   WEEKDAY
   ========================================================= */

function renderWeekdays() {

  weekdayOptions.innerHTML = '';


  const slots =
    allSlots.filter(
      slot =>
        slot.date.startsWith(
          selectedMonth
        )
    );


  const weekdays = [
    ...new Set(
      slots.map(
        slot =>
          parseDate(
            slot.date
          ).getDay()
      )
    )
  ];


  weekdays.sort(
    (a, b) => {

      const dayA =
        a === 0 ? 7 : a;

      const dayB =
        b === 0 ? 7 : b;

      return dayA - dayB;

    }
  );


  weekdays.forEach(
    weekday => {

      const button =
        document.createElement(
          'button'
        );


      button.type =
        'button';


      button.className =
        'option';


      button.textContent =
        WEEKDAYS[weekday];


      button.addEventListener(
        'click',
        () => {

          selectedWeekday =
            weekday;

          selectedDate =
            null;

          selectedTime =
            null;


          updateActiveButtons(
            weekdayOptions,
            button
          );


          dateSection.classList.remove(
            'hidden'
          );


          timeSection.classList.add(
            'hidden'
          );


          summarySection.classList.add(
            'hidden'
          );


          studentSection.classList.add(
            'hidden'
          );


          renderDates();

        }
      );


      weekdayOptions.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   DATE
   ========================================================= */

function renderDates() {

  dateOptions.innerHTML = '';


  const slots =
    allSlots
      .filter(
        slot =>
          slot.date.startsWith(
            selectedMonth
          )
      )
      .filter(
        slot =>
          parseDate(
            slot.date
          ).getDay() ===
          selectedWeekday
      );


  const dates = [
    ...new Set(
      slots.map(
        slot =>
          slot.date
      )
    )
  ];


  dates.sort();


  dates.forEach(
    dateString => {

      const date =
        parseDate(
          dateString
        );


      const card =
        document.createElement(
          'button'
        );


      card.type =
        'button';


      card.className =
        'date-card';


      card.innerHTML = `
        <div class="date-number">
          ${date.getDate()}
        </div>

        <div class="date-month">
          ${MONTHS[date.getMonth()]}
        </div>
      `;


      card.addEventListener(
        'click',
        () => {

          selectedDate =
            dateString;

          selectedTime =
            null;


          updateActiveButtons(
            dateOptions,
            card
          );


          timeSection.classList.remove(
            'hidden'
          );


          summarySection.classList.add(
            'hidden'
          );


          studentSection.classList.add(
            'hidden'
          );


          renderTimes();

        }
      );


      dateOptions.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   TIME
   ========================================================= */

function renderTimes() {

  timeOptions.innerHTML = '';


  const slots =
    allSlots.filter(
      slot =>
        slot.date ===
        selectedDate
    );


  slots.forEach(
    slot => {

      const card =
        document.createElement(
          'button'
        );


      card.type =
        'button';


      card.className =
        'time-card';


      card.innerHTML = `
        <div class="time-label">
          ${slot.time}
        </div>

        <div class="time-status">
          Còn trống
        </div>
      `;


      card.addEventListener(
        'click',
        () => {

          selectedTime =
            slot.time;


          updateActiveButtons(
            timeOptions,
            card
          );


          showSummary();

        }
      );


      timeOptions.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function showSummary() {

  if (
    !selectedDate ||
    !selectedTime
  ) {

    return;

  }


  summaryValue.textContent =
    `${formatSelectedDate_()} — ${selectedTime}`;


  summarySection.classList.remove(
    'hidden'
  );


  studentSection.classList.remove(
    'hidden'
  );


  validateBookingForm();

}


/* =========================================================
   VALIDATION
   ========================================================= */

function validateBookingForm() {

  const name =
    studentName.value.trim();

  const mssv =
    studentMssv.value.trim();

  const email =
    studentEmail.value.trim();

  const topic =
    studentTopic.value.trim();


  let valid = true;


  nameError.textContent = '';
  mssvError.textContent = '';
  emailError.textContent = '';
  topicError.textContent = '';


  if (!name) {

    nameError.textContent =
      'Vui lòng nhập họ và tên.';

    valid = false;

  } else if (
    name.length < 2
  ) {

    nameError.textContent =
      'Họ và tên chưa hợp lệ.';

    valid = false;

  }


  if (!mssv) {

    mssvError.textContent =
      'Vui lòng nhập MSSV.';

    valid = false;

  }


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (!email) {

    emailError.textContent =
      'Vui lòng nhập email.';

    valid = false;

  } else if (
    !emailPattern.test(email)
  ) {

    emailError.textContent =
      'Email chưa đúng định dạng.';

    valid = false;

  }


  if (!topic) {

    topicError.textContent =
      'Vui lòng nhập nội dung cần trao đổi.';

    valid = false;

  } else if (
    topic.length < 5
  ) {

    topicError.textContent =
      'Vui lòng mô tả nội dung chi tiết hơn.';

    valid = false;

  }


  confirmButton.disabled =
    !valid;


  return valid;

}


/* =========================================================
   HIDDEN FIELD
   ========================================================= */

function addHiddenField_(
  form,
  name,
  value
) {

  const input =
    document.createElement(
      'input'
    );


  input.type =
    'hidden';


  input.name =
    name;


  input.value =
    value;


  form.appendChild(
    input
  );

}


/* =========================================================
   FORM EVENTS
   ========================================================= */

function setupFormEvents() {

  [
    studentName,
    studentMssv,
    studentEmail,
    studentTopic
  ].forEach(
    field => {

      field.addEventListener(
        'input',
        validateBookingForm
      );

    }
  );


  bookingForm.addEventListener(
    'submit',
    event => {

      event.preventDefault();


      if (
        !validateBookingForm()
      ) {

        return;

      }


      if (
        !selectedDate ||
        !selectedTime
      ) {

        formMessage.textContent =
          'Vui lòng chọn khung giờ meeting.';

        return;

      }


      confirmButton.disabled =
        true;


      confirmButton.textContent =
        'Đang xác nhận...';


      formMessage.textContent =
        'Đang kiểm tra và xác nhận lịch meeting...';


      const slot =
        `${formatSelectedDate_()} | ${selectedTime}`;


      const bookingId =
        'BK-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .slice(2, 8);


      const postForm =
        document.createElement(
          'form'
        );


      postForm.method =
        'POST';


      postForm.action =
        API_URL;


      postForm.target =
        '_self';


      postForm.style.display =
        'none';


      addHiddenField_(
        postForm,
        'action',
        'book'
      );


      addHiddenField_(
        postForm,
        'bookingId',
        bookingId
      );


      addHiddenField_(
        postForm,
        'slot',
        slot
      );


      addHiddenField_(
        postForm,
        'student',
        studentName.value.trim()
      );


      addHiddenField_(
        postForm,
        'mssv',
        studentMssv.value.trim()
      );


      addHiddenField_(
        postForm,
        'email',
        studentEmail.value.trim()
      );


      addHiddenField_(
        postForm,
        'topic',
        studentTopic.value.trim()
      );


      document.body.appendChild(
        postForm
      );


      postForm.submit();

    }
  );

}


/* =========================================================
   APP START
   ========================================================= */

function startApp() {

  try {

    initDOM();

    checkRequiredElements();

    setupFormEvents();

    initialize();

  } catch (error) {

    console.error(
      'APP START ERROR:',
      error
    );


    /**
     * Try to show error
     * even if normal DOM is incomplete.
     */
    const errorElement =
      document.getElementById('error');


    const statusElement =
      document.getElementById('status');


    if (statusElement) {

      statusElement.classList.add(
        'hidden'
      );

    }


    if (errorElement) {

      errorElement.textContent =
        error.message;


      errorElement.classList.remove(
        'hidden'
      );

    }

  }

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    startApp
  );

} else {

  startApp();

}
