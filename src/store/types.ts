import type { RouteRecordName } from "vue-router";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type FileType = {
  fileId: number;
  filename: string;
  parentFileId: number;
  type: number;
  etag: string;
  size: number;
  category: number;
  status: number;
  punishFlag: number;
  s3KeyFlag: string;
  storageNode: string;
  trashed: number;
  createAt: string;
  updateAt: string;
};

export type appType = {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    // 判断是否手动点击Collapse
    isClickCollapse: boolean;
  };
  layout: string;
  device: string;
  viewportSize: { width: number; height: number };
  enableOperate: boolean;
  expiredAt?: number;
  accessToken123?: string;
  collectJson: FileType;
};

export type multiType = {
  path: string;
  name: string;
  meta: any;
  query?: object;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
};

export type userType = {
  avatar?: string;
  username?: string;
  nickname?: string;
  roles?: Array<string>;
  permissions?: Array<string>;
  isRemembered?: boolean;
  loginDay?: number;
};

export type collectRecordType = {
  id?: string;
  title: string;
  site?: string;
  des?: string;
  type: string;
  createTime?: string;
  updateTime?: string;
};
