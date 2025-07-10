const axios = require("axios");
const Client = require("../models/Client");

function sendCallback(clientId, paymentId, status) {
  Client.findById(clientId)
    .then(client => {
      if (!client || !client.callbackUrl) {
        console.error(`Không tìm thấy URL : ${clientId}`);
        return;
      }

      const payload = { paymentId, status };
      const callbackUrl = client.callbackUrl;

      let attempt = 0;

      function trySend() {
        axios.post(callbackUrl, payload, {
          headers: { "Content-Type": "application/json" },
          timeout: 3000
        })
        .then(response => {
          console.log(`Callback sent to ${callbackUrl}, status: ${response.status}`);
        })
        .catch(err => {
          attempt++;
          console.warn(`Attempt ${attempt} failed to send callback to ${callbackUrl}: ${err.message}`);
          if (attempt < 3) {
            trySend(); // retry
          } else {
            console.error(` Callback failed after 3 attempts for payment ${paymentId}`);
          }
        });
      }

      trySend();
    })
    .catch(err => {
      console.error(`Callback service error: ${err.message}`);
    });
}

module.exports = { sendCallback };
