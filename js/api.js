const API_URL =
  'https://script.google.com/macros/s/AKfycbwDbTkT5KzUkp9tglbKZV9uu0iyZzepXNM6LFQR53ieEiGIY-IdP8yYOUMmxkbWn6EF/exec';


function loadSlots() {

  return new Promise((resolve, reject) => {

    const callbackName =
      'handleSlots_' +
      Date.now();


    window[callbackName] =
      function (data) {

        delete window[callbackName];

        script.remove();

        if (!data || !data.success) {

          reject(
            new Error(
              data?.error ||
              'Không thể tải lịch booking.'
            )
          );

          return;
        }

        resolve(data.slots || []);

      };


    const script =
      document.createElement('script');

    script.src =
      API_URL +
      '?action=slots&callback=' +
      callbackName;


    script.onerror =
      function () {

        delete window[callbackName];

        script.remove();

        reject(
          new Error(
            'Không thể kết nối tới hệ thống booking.'
          )
        );

      };


    document.body.appendChild(
      script
    );

  });

}
