const moment = require("moment-jalaali");
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment.locale("fa", fa).format("h:mm a"),
  };
}

module.exports = formatMessage;
