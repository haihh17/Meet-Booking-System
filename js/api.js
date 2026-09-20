/* =========================================================
   STUDENT MEETING BOOKING
   API CONNECTION
   ========================================================= */

const API_URL =
  'https://script.google.com/macros/s/AKfycbwDbTkT5KzUkp9tglbKZV9uu0iyZzepXNM6LFQR53ieEiGIY-IdP8yYOUMmxkbWn6EF/exec';


function loadSlots() {

  return new Promise(
    (resolve, reject) => {

      /* ---------------------------------------------------
         Validate API URL
         --------------------------------------------------- */

      if (
        !API_URL ||
        API_URL.includes(
          'PASTE_YOUR'
        )
      ) {

        reject(
          new Error(
            'API_URL chưa được cấu hình trong api.js.'
          )
        );

        return;

      }


      /* ---------------------------------------------------
         Create unique callback
         --------------------------------------------------- */

      const callbackName =
        'studentMeetingCallback_' +
        Date.now();


      let finished = false;


      /* ---------------------------------------------------
         Create script
         --------------------------------------------------- */

      const script =
        document.createElement(
          'script'
        );


      /* ---------------------------------------------------
         Cleanup
         --------------------------------------------------- */

      const cleanup =
        () => {

          if (script.parentNode) {

            script.parentNode.removeChild(
              script
            );

          }


          try {

            delete window[
              callbackName
            ];

          } catch (error) {

            window[
              callbackName
            ] = undefined;

          }

        };


      /* ---------------------------------------------------
         Success callback
         --------------------------------------------------- */

      window[
        callbackName
      ] = function (data) {

        if (finished) {
          return;
        }


        finished = true;


        cleanup();


        if (
          !data ||
          data.success !== true
        ) {

          reject(
            new Error(
              data &&
              data.error
                ? data.error
                : 'API trả về dữ liệu không hợp lệ.'
            )
          );

          return;

        }


        resolve(
          Array.isArray(
            data.slots
          )
            ? data.slots
            : []
        );

      };


      /* ---------------------------------------------------
         Build API URL
         --------------------------------------------------- */

      try {

        const url =
          new URL(
            API_URL
          );


        url.searchParams.set(
          'action',
          'slots'
        );


        url.searchParams.set(
          'callback',
          callbackName
        );


        /* Cache bust */
        url.searchParams.set(
          '_',
          Date.now()
        );


        script.src =
          url.toString();


      } catch (error) {

        cleanup();


        reject(
          new Error(
            'API_URL không hợp lệ.'
          )
        );

        return;

      }


      /* ---------------------------------------------------
         Script error
         --------------------------------------------------- */

      script.onerror =
        function () {

          if (finished) {
            return;
          }


          finished = true;


          cleanup();


          reject(
            new Error(
              'Không thể kết nối tới Apps Script API.'
            )
          );

        };


      /* ---------------------------------------------------
         Timeout
         --------------------------------------------------- */

      const timeoutId =
        setTimeout(
          () => {

            if (finished) {
              return;
            }


            finished = true;


            cleanup();


            reject(
              new Error(
                'API phản hồi quá lâu. Vui lòng thử tải lại trang.'
              )
            );

          },
          20000
        );


      /* ---------------------------------------------------
         Wrap resolve / reject
         --------------------------------------------------- */

      const originalResolve =
        resolve;


      const originalReject =
        reject;


      resolve = value => {

        clearTimeout(
          timeoutId
        );

        originalResolve(
          value
        );

      };


      reject = error => {

        clearTimeout(
          timeoutId
        );

        originalReject(
          error
        );

      };


      /* ---------------------------------------------------
         Send request
         --------------------------------------------------- */

      document
        .head
        .appendChild(
          script
        );

    }
  );

}
