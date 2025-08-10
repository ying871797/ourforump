import CryptoJS from "crypto-js";

console.log(CryptoJS.SHA256("yc3b").toString());
console.log(
  "7abba416dbd55441640e7336ea061b1c1ff4677f4e31d93893d2bcfd29005008" ===
    "7ABBA416DBD55441640E7336EA061B1C1FF4677F4E31D93893D2BCFD29005008"
);

import { MsgType } from "./utils/utils.js";

console.log(MsgType.NORMAL === 0);
console.log(MsgType.NOTICE === 1);
