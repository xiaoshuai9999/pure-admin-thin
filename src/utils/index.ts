import CrytoJS from "crypto-js";

export async function getJSonFileDetail(jsonData) {
  const blob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json"
  });

  const arrayBuffer = await blob.arrayBuffer();
  const wordArray = CrytoJS.lib.WordArray.create(arrayBuffer);
  const hash = CrytoJS.MD5(wordArray).toString();
  return { etag: hash, size: blob.size, buffer: arrayBuffer };
}

export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
