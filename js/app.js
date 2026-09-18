/* =========================================================
   STUDENT MEETING BOOKING
   FRONTEND APPLICATION
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

const monthOptions =
  document.getElementById('monthOptions');

const weekdayOptions =
  document.getElementById('weekdayOptions');

const dateOptions =
  document.getElementById('dateOptions');

const timeOptions =
  document.getElementById('timeOptions');

const statusText =
  document.getElementById('status');

const errorText =
  document.getElementById('error');

const weekdaySection =
  document.getElementById('weekdaySection');

const dateSection =
  document.getElementById('dateSection');

const timeSection =
  document.getElementById('timeSection');

const summarySection =
  document.getElementById('summarySection');

const summaryValue =
  document.getElementById('summaryValue');

const studentSection =
  document.getElementById('studentSection');

const bookingForm =
  document.getElementById('bookingForm');

const studentName =
  document.getElementById('studentName');

const studentMssv =
  document.getElementById('studentMssv');

const studentEmail =
  document.getElementById('studentEmail');

const studentTopic =
  document.getElementById('studentTopic');

const confirmButton =
  document.getElementById('confirmButton');

const formMessage =
  document.getElementById('formMessage');

const nameError =
  document.getElementById('nameError');

const mssvError =
  document.getElementById('mssvError');

const emailError =
  document.getElementById('emailError');

const topicError =
  document.getElementById('topicError');


/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseDate(dateString) {

  const parts =
    dateString.split('-').map(Number);

  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );

}


function formatDateForDisplay(dateString) {

  const date =
    parseDate(dateString);

  return (
    String(date.getDate()).padStart(2, '0') +
    '/' +
    String(date.getMonth() + 1).padStart(2, '0') +
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
   UI HELPERS
   ========================================================= */

function showError(message) {

  if (statusText) {
    statusText.classList.add('hidden');
  }

  if (errorText) {
    errorText.textContent = message;
    errorText.classList.remove('hidden');
  }

}


function hideError() {

  if (errorText) {
    errorText.textContent = '';
    errorText.classList.add('hidden');
  }

}


function updateActiveButtons(
  container,
  activeButton
) {

  if (!container) {
    return;
  }

  [...container.children].forEach(
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


function addHiddenField_(
  form,
  name,
  value
) {

  const input =
    document.createElement('input');

  input.type = 'hidden';
  input.name = name;
  input.value = value;

  form.appendChild(input);

}


/* =========================================================
   LOAD DATA
   ========================================================= */

function initialize() {

  hideError();


  if (
    typeof loadSlots !==
    'function'
  ) {

    showError(
      'Không thể tải hệ thống booking. ' +
      'Vui lòng kiểm tra api.js.'
    );

    return;

  }


  if (statusText) {
    statusText.textContent =
      'Đang tải lịch...';
  }


  loadSlots()

    .then(slots => {

      allSlots =
        Array.isArray(slots)
          ? slots.sort(sortDates)
          : [];


      if (statusText) {

        statusText.textContent =
          `Đã tải ${allSlots.length} slot.`;

      }


      if (
        allSlots.length === 0
      ) {

        showError(
          'Hiện chưa có slot meeting.'
        );

        return;

      }


      renderMonths();

    })

    .catch(error => {

      console.error(
        'Load slots error:',
        error
      );

      showError(
        error.message ||
        'Không thể tải lịch booking.'
      );

    });

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

      const button =
        document.createElement('button');


      button.type =
        'button';

      button.className =
        'option';


      const [
        year,
        month
      ] =
        monthKey
          .split('-')
          .map(Number);


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
        document.createElement('button');


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
          parseDate(slot.date)
            .getDay() ===
          selectedWeekday
      );


  const uniqueDates = [
    ...new Set(
      slots.map(
        slot =>
          slot.date
      )
    )
  ];


  uniqueDates.sort();


  uniqueDates.forEach(
    dateString => {

      const date =
        parseDate(
          dateString
        );


      const card =
        document.createElement('button');


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
    allSlots
      .filter(
        slot =>
          slot.date ===
          selectedDate
      );


  slots.forEach(
    slot => {

      const card =
        document.createElement('button');


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
   FORM VALIDATION
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


  let isValid = true;


  /* -------------------------------------------------------
     NAME
     ------------------------------------------------------- */

  nameError.textContent = '';


  if (!name) {

    nameError.textContent =
      'Vui lòng nhập họ và tên.';

    isValid = false;

  } else if (
    name.length < 2
  ) {

    nameError.textContent =
      'Họ và tên chưa hợp lệ.';

    isValid = false;

  }


  /* -------------------------------------------------------
     MSSV
     ------------------------------------------------------- */

  mssvError.textContent = '';


  if (!mssv) {

    mssvError.textContent =
      'Vui lòng nhập MSSV.';

    isValid = false;

  }


  /* -------------------------------------------------------
     EMAIL
     ------------------------------------------------------- */

  emailError.textContent = '';


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (!email) {

    emailError.textContent =
      'Vui lòng nhập email.';

    isValid = false;

  } else if (
    !emailPattern.test(email)
  ) {

    emailError.textContent =
      'Email chưa đúng định dạng.';

    isValid = false;

  }


  /* -------------------------------------------------------
     TOPIC
     ------------------------------------------------------- */

  topicError.textContent = '';


  if (!topic) {

    topicError.textContent =
      'Vui lòng nhập nội dung cần trao đổi.';

    isValid = false;

  } else if (
    topic.length < 5
  ) {

    topicError.textContent =
      'Vui lòng mô tả nội dung chi tiết hơn.';

    isValid = false;

  }


  confirmButton.disabled =
    !isValid;


  return isValid;

}


/* =========================================================
   FORM INPUT EVENTS
   ========================================================= */

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


/* =========================================================
   BOOKING SUBMIT
   ========================================================= */

bookingForm.addEventListener(
  'submit',
  function (event) {

    event.preventDefault();


    /* -----------------------------------------------------
       Validate
       ----------------------------------------------------- */

    if (
      !validateBookingForm()
    ) {

      return;

    }


    /* -----------------------------------------------------
       Validate selected slot
       ----------------------------------------------------- */

    if (
      !selectedDate ||
      !selectedTime
    ) {

      formMessage.textContent =
        'Vui lòng chọn khung giờ meeting.';

      return;

    }


    /* -----------------------------------------------------
       Loading state
       ----------------------------------------------------- */

    confirmButton.disabled =
      true;

    confirmButton.textContent =
      'Đang xác nhận...';


    formMessage.textContent =
      'Đang kiểm tra và xác nhận lịch meeting...';


    /* -----------------------------------------------------
       Create booking data
       ----------------------------------------------------- */

    const slot =
      `${formatSelectedDate_()} | ${selectedTime}`;


    const bookingId =
      'BK-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 8);


    /* -----------------------------------------------------
       Create POST form
       ----------------------------------------------------- */

    const postForm =
      document.createElement('form');


    postForm.method =
      'POST';

    postForm.action =
      API_URL;

    postForm.target =
      '_self';

    postForm.style.display =
      'none';


    /* -----------------------------------------------------
       Hidden data
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       Submit
       ----------------------------------------------------- */

    document.body.appendChild(
      postForm
    );


    postForm.submit();

  }
);


/* =========================================================
   START APPLICATION
   ========================================================= */

initialize();
