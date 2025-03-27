import axios from "axios";
import { useAppStoreHook } from "@/store/modules/app";

// 获取123云盘的access_token
export function getAccessToken() {
  let data = JSON.stringify({
    clientID: "9702b83ed6a348de8f2cb2962715788d",
    clientSecret: "b0336b11ff324ddbb7d9d865a915e690"
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/api/v1/access_token",
    headers: {
      Platform: "open_platform",
      "Content-Type": "application/json"
    },
    data: data
  };

  return axios.request(config);
}

// 获取文件列表
export function getFileList() {
  const { getAccessToken123 } = useAppStoreHook();
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/api/v2/file/list?parentFileId=13931525&limit=40",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    }
  };

  return axios.request(config);
}

// 下载文件
export function downloadFile(fileId: number) {
  const { getAccessToken123 } = useAppStoreHook();
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      "https://open-api.123pan.com/api/v1/file/download_info?fileId=" + fileId,
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    }
  };

  return axios.request(config);
}

// 创建文件
export function createFile(data) {
  const { getAccessToken123 } = useAppStoreHook();
  const requestData = JSON.stringify({
    parentFileID: 13931525,
    ...data
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/upload/v1/file/create",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    },
    data: requestData
  };

  return axios.request(config);
}

// 获取上传文件地址
export function getUploadFileUrl(preuploadID: string) {
  const { getAccessToken123 } = useAppStoreHook();
  let data = JSON.stringify({
    preuploadID: preuploadID,
    sliceNo: 1
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/upload/v1/file/get_upload_url",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    },
    data: data
  };
  return axios.request(config);
}

export function sliceUpload(presignedURL, data) {
  let config = {
    method: "put",
    maxBodyLength: Infinity,
    url: presignedURL,
    headers: {
      "Content-Type": "application/octet-stream"
    },
    data: data
  };

  return axios.request(config);
}

// 上传完毕
export function uploadComplete(preuploadID: string) {
  const { getAccessToken123 } = useAppStoreHook();

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/upload/v1/file/upload_complete",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    },
    data: JSON.stringify({
      preuploadID: preuploadID
    })
  };

  return axios.request(config);
}

// 异步获取上传结果
export function asyncGetUploadResult(preuploadID: string) {
  const { getAccessToken123 } = useAppStoreHook();

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/upload/v1/file/upload_async_result",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    },
    data: JSON.stringify({
      preuploadID: preuploadID
    })
  };

  return axios.request(config);
}

export function deleteFile(fileIds: number[]) {
  let data = JSON.stringify({
    fileIDs: fileIds
  });
  const { getAccessToken123 } = useAppStoreHook();
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://open-api.123pan.com/api/v1/file/trash",
    headers: {
      "Content-Type": "application/json",
      Platform: "open_platform",
      Authorization: getAccessToken123
    },
    data: data
  };

  axios
    .request(config)
    .then(response => {
      console.log(JSON.stringify(response.data));
    })
    .catch(error => {
      console.log(error);
    });
}
