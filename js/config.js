const TIME_MAPPING = {
  "M": "6:00 ~ 6:50",
  "N": "7:00 ~ 7:50",
  "A": "8:00 ~ 8:50",
  "B": "9:00 ~ 9:50",
  "C": "10:10 ~ 11:00",
  "D": "11:10 ~ 12:00",
  "X": "12:20 ~ 13:10",
  "E": "13:20 ~ 14:10",
  "F": "14:20 ~ 15:10",
  "G": "15:30 ~ 16:20",
  "H": "16:30 ~ 17:20",
  "Y": "17:30 ~ 18:20",
  "I": "18:30 ~ 19:20",
  "J": "19:30 ~ 20:20",
  "K": "20:30 ~ 21:20",
  "L": "21:30 ~ 22:20"
};
const YEAR = '109', SEMESTER = '1';
const APP_URL = `${location.protocol}//${location.host}${location.pathname}`;

const OAUTH_CLIENT_ID = "3VH1pFMqlVR9RHlfyk83q2tqOnT3zaIL0k0ZyPcz";
const OAUTH_ORIGIN = "https://us-central1-nctuwu-9d0d4.cloudfunctions.net";

const firebaseConfig = {
  apiKey: "AIzaSyCf-vB0ZWg02Xua06yEbVBXYK0-KkuHNaw",
  authDomain: "nctuwu-9d0d4.firebaseapp.com",
  databaseURL: "https://nctuwu-9d0d4.firebaseio.com",
  projectId: "nctuwu-9d0d4",
  storageBucket: "nctuwu-9d0d4.appspot.com",
  messagingSenderId: "915718818939",
  appId: "1:915718818939:web:1a1d4e295e6685914ba6de",
  measurementId: "G-2RS0C00B4C"
};