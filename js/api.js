const API_URL =
  'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';


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
