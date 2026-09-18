let allSlots = [];

let selectedMonth = null;
let selectedWeekday = null;
let selectedDate = null;
let selectedTime = null;


/* =====================================================
   LANGUAGE
   ===================================================== */

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


/* =====================================================
   DOM
   ===================================================== */

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


/* =====================================================
   HELPERS
   ===================================================== */

function parseDate(dateString) {

  const [year, month, day] =
    dateString.split('-').map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


function getMonthKey(date) {

  return (
    date.getFullYear() +
    '-' +
    String(
      date.getMonth() + 1
    ).padStart(2, '0')
  );

}


function sortDates(a, b) {

  return (
    parseDate(a.date) -
    parseDate(b.date)
  );

}


/* =====================================================
   LOAD
   ===================================================== */

function initialize() {

  statusText.textContent =
    'Đang tải lịch...';


  loadSlots()

    .then(slots => {

      allSlots =
        slots.sort(sortDates);


      statusText.textContent =
        `Đã tải ${allSlots.length} slot.`;


      renderMonths();

    })

    .catch(error => {

      statusText.classList.add(
        'hidden'
      );

      errorText.textContent =
        error.message;

      errorText.classList.remove(
        'hidden'
      );

    });

}


/* =====================================================
   MONTH
   ===================================================== */

function renderMonths() {

  monthOptions.innerHTML = '';


  const months = [
    ...new Set(
      allSlots.map(
        slot => slot.date.slice(0, 7)
      )
    )
  ];


  months.forEach(
    monthKey => {

      const button =
        document.createElement('button');


      button.className =
        'option';


      const [year, month] =
        monthKey
          .split('-')
          .map(Number);


      button.textContent =
        MONTHS[month - 1] +
        ' ' +
        year;


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


          renderWeekdays();

          dateSection.classList.add(
            'hidden'
          );

          timeSection.classList.add(
            'hidden'
          );

          summarySection.classList.add(
            'hidden'
          );

        }
      );


      monthOptions.appendChild(
        button
      );

    }
  );

}


/* =====================================================
   WEEKDAY
   ===================================================== */

function renderWeekdays() {

  weekdayOptions.innerHTML = '';

  weekdaySection.classList.remove(
    'hidden'
  );


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
          parseDate(slot.date)
            .getDay()
      )
    )
  ];


  weekdays.sort(
    (a, b) => {

      if (a === 0) {
        return 7;
      }

      if (b === 0) {
        return -7;
      }

      return a - b;

    }
  );


  weekdays.forEach(
    weekday => {

      const button =
        document.createElement('button');


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


          renderDates();

          timeSection.classList.add(
            'hidden'
          );

          summarySection.classList.add(
            'hidden'
          );

        }
      );


      weekdayOptions.appendChild(
        button
      );

    }
  );

}


/* =====================================================
   DATE
   ===================================================== */

function renderDates() {

  dateOptions.innerHTML = '';

  dateSection.classList.remove(
    'hidden'
  );


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
        slot => slot.date
      )
    )
  ];


  uniqueDates.sort();


  uniqueDates.forEach(
    dateString => {

      const date =
        parseDate(dateString);


      const card =
        document.createElement('button');


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


          renderTimes();

          summarySection.classList.add(
            'hidden'
          );

        }
      );


      dateOptions.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   TIME
   ===================================================== */

function renderTimes() {

  timeOptions.innerHTML = '';

  timeSection.classList.remove(
    'hidden'
  );


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


/* =====================================================
   SUMMARY
   ===================================================== */

function showSummary() {

  const date =
    parseDate(
      selectedDate
    );


  const formattedDate =
    `${String(
      date.getDate()
    ).padStart(2, '0')}/${
      String(
        date.getMonth() + 1
      ).padStart(2, '0')
    }/${
      date.getFullYear()
    }`;


  summaryValue.textContent =
    `${formattedDate} — ${selectedTime}`;


  summarySection.classList.remove(
    'hidden'
  );


  studentSection.classList.remove(
    'hidden'
  );


  validateBookingForm();

}


/* =====================================================
   ACTIVE STATE
   ===================================================== */

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


/* =====================================================
   START
   ===================================================== */

initialize();
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


  /* -----------------------------------------------------
     NAME
     ----------------------------------------------------- */

  nameError.textContent = '';


  if (!name) {

    nameError.textContent =
      'Vui lòng nhập họ và tên.';

    isValid = false;

  } else if (name.length < 2) {

    nameError.textContent =
      'Họ và tên chưa hợp lệ.';

    isValid = false;

  }


  /* -----------------------------------------------------
     MSSV
     ----------------------------------------------------- */

  mssvError.textContent = '';


  if (!mssv) {

    mssvError.textContent =
      'Vui lòng nhập MSSV.';

    isValid = false;

  }


  /* -----------------------------------------------------
     EMAIL
     ----------------------------------------------------- */

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


  /* -----------------------------------------------------
     TOPIC
     ----------------------------------------------------- */

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
  function (event) {

    event.preventDefault();


    /* ===================================================
       VALIDATE
       =================================================== */

    if (!validateBookingForm()) {
      return;
    }


    /* ===================================================
       CHECK SLOT
       =================================================== */

    if (!selectedDate || !selectedTime) {

      formMessage.textContent =
        'Vui lòng chọn khung giờ meeting.';

      return;

    }


    /* ===================================================
       UI: PROCESSING
       =================================================== */

    confirmButton.disabled = true;

    confirmButton.textContent =
      'Đang xác nhận...';

    formMessage.textContent =
      'Đang kiểm tra và xác nhận lịch meeting...';


    /* ===================================================
       BUILD SLOT
       =================================================== */

    const slot =
      `${formatSelectedDate_()} | ${selectedTime}`;


    /* ===================================================
       CREATE NATIVE POST FORM
       =================================================== */

    const postForm =
      document.createElement('form');


    postForm.method = 'POST';

    postForm.action = API_URL;

    postForm.target = '_self';

    postForm.style.display = 'none';


    /* ===================================================
       HIDDEN FIELDS
       =================================================== */

    addHiddenField_(
      postForm,
      'action',
      'book'
    );


    addHiddenField_(
      postForm,
      'bookingId',
      'BK-' + Date.now()
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


    /* ===================================================
       SUBMIT
       =================================================== */

    document.body.appendChild(
      postForm
    );


    postForm.submit();

  }
);

    /* -----------------------------------------------------
       Validate
       ----------------------------------------------------- */

    if (
      !validateBookingForm()
    ) {

      return;

    }


    /* -----------------------------------------------------
       Check selected slot
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
       Prevent double click
       ----------------------------------------------------- */

    confirmButton.disabled = true;

    confirmButton.textContent =
      'Đang xác nhận...';

    formMessage.textContent =
      'Đang kiểm tra và xác nhận lịch meeting...';


    /* -----------------------------------------------------
       Build booking data
       ----------------------------------------------------- */

    const bookingId =
      'BK-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 8);


    const slot =
      `${formatSelectedDate_()} | ${selectedTime}`;


    /* -----------------------------------------------------
       Create POST form
       ----------------------------------------------------- */

    const form =
      document.createElement('form');


    form.method =
      'POST';


    form.action =
      API_URL;


    form.target =
      '_self';


    /* -----------------------------------------------------
       Add hidden fields
       ----------------------------------------------------- */

    addHiddenField_(
      form,
      'action',
      'book'
    );


    addHiddenField_(
      form,
      'bookingId',
      bookingId
    );


    addHiddenField_(
      form,
      'slot',
      slot
    );


    addHiddenField_(
      form,
      'student',
      studentName.value.trim()
    );


    addHiddenField_(
      form,
      'mssv',
      studentMssv.value.trim()
    );


    addHiddenField_(
      form,
      'email',
      studentEmail.value.trim()
    );


    addHiddenField_(
      form,
      'topic',
      studentTopic.value.trim()
    );


    /* -----------------------------------------------------
       Submit
       ----------------------------------------------------- */

    document.body.appendChild(
      form
    );


    form.submit();

  }
);
function addHiddenField_(
  form,
  name,
  value
) {

  const input =
    document.createElement('input');


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
function formatSelectedDate_() {

  const date =
    parseDate(
      selectedDate
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
