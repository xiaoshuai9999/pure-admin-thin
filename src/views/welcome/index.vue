<template>
  <div class="bg-white p-3">
    <div class="h-10 w-full">
      <el-input
        v-model="keyword"
        clearable
        style="width: 200px; margin-right: 16px"
        placeholder="请输入标题/网址/描述"
        @clear="whenKeywordClear"
        @keyup.enter="search"
      />
      <el-select
        v-model="searchType"
        style="width: 160px; margin-right: 16px"
        @change="search"
      >
        <el-option value="all" label="全部" />
        <el-option
          v-for="item in types"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button type="success" @click="refresh">刷新</el-button>
    </div>
    <div class="w-full">
      <div class="flex justify-end items-center mb-3">
        <!--        <el-button type="primary" @click="addFile">测试上传</el-button>-->
        <el-button type="primary" @click="showAddDialog">新增</el-button>
        <el-button color="purple" @click="showBatchAddDialog"
          >批量新增</el-button
        >
      </div>
      <el-table
        border
        :data="tableData"
        :header-cell-style="{ color: '#333', 'background-color': '#F3F8FD' }"
      >
        <el-table-column type="index" width="75" label="序号" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column
          prop="site"
          label="网址"
          min-width="220"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-link
              v-if="isCompliantURL(scope.row.site)"
              :href="scope.row.site"
              target="_blank"
            >
              {{ scope.row.site }}
            </el-link>
            <span v-else>{{ scope.row.site }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="160" />
        <el-table-column prop="type" label="分类" width="150">
          <template #default="scope">
            <span>{{ getTypesLabel(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最后修改时间" width="160" />
        <el-table-column prop="operate" label="操作" width="140">
          <template #default="scope">
            <el-link
              type="primary"
              class="mr-4"
              @click="openModifyDialog(scope.row)"
            >
              修改</el-link
            >
            <el-popconfirm
              title="确定删除该条数据吗?"
              :hide-after="100"
              @confirm="removeOne(scope.row)"
            >
              <template #reference>
                <el-link type="danger">删除</el-link>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <template #empty>
          <div>
            <img
              src="@/assets/no_data.png"
              alt="暂无数据"
              style="width: 280px; height: 280px"
            />
            <p class="text-center text-gray-500">暂无数据</p>
          </div>
        </template>
      </el-table>
    </div>
    <add-form
      v-model="dialogVisible"
      :types="types"
      :isModify="isModify"
      :modifyData="modifyData"
      @dialogConfirm="dialogConfirm"
    />
    <batch-add-form
      v-model="batchDialogVisible"
      @dialogConfirm="dialogConfirm"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  asyncGetUploadResult,
  createFile,
  downloadFile,
  getFileList,
  getUploadFileUrl,
  sliceUpload,
  uploadComplete
} from "@/api/api";
import { collectRecordType, FileType } from "@/store/types";
import axios from "axios";
import { getJSonFileDetail, uuid } from "@/utils";
import AddForm from "@/views/welcome/components/add-form.vue";
import BatchAddForm from "@/views/welcome/components/batch-add-form.vue";
import { localForage } from "@/utils/localforage";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

const keyword = ref("");
const searchType = ref("all");
const tableData = ref<collectRecordType[]>([]);
const types = [
  { label: "开发工具", value: "tool" },
  { label: "开发环境", value: "env" },
  { label: "其它", value: "other" }
];

const getTypesLabel = (value: string) => {
  const type = types.find(item => item.value === value);
  return type ? type.label : "";
};

// 检测网址是否合法
const isCompliantURL = url => {
  const urlRegex =
    /((http|https):\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#?&//=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/;
  return !!urlRegex.test(url);
};

const downloadUrl = ref(localStorage.getItem("downloadUrl") || "");
const getTableDataLocal = async () => {
  const data = (await localForage().getItem("collectRecord")) || "";
  if (data) {
    tableData.value = JSON.parse(data);
  } else {
    ElMessage.warning("本地暂无数据");
  }
};
const getTableData = async () => {
  if (!downloadUrl.value) {
    await getCollectFile();
    return;
  }
  try {
    const res = await axios({
      method: "get",
      url: downloadUrl.value
    });
    console.log("getTableData-res", res.data);
  } catch (error) {
    console.log("getTableData-err", error);
  }
};

const addFile = async () => {
  const file = { name: "李军", age: 18 };
  const { etag, size, buffer } = await getJSonFileDetail(file);
  let data = {
    filename: "测试文件.json",
    etag: etag,
    size: size
  };
  const { data: resData } = await createFile(data);
  if (resData.code === 0) {
    const { fileID, reuse, preuploadID } = resData.data;
    if (reuse) {
      console.log("已上传完毕，fileId", fileID);
      return;
    }
    const { data: uploadResData } = await getUploadFileUrl(preuploadID);
    if (uploadResData.code === 0) {
      const presignedURL = uploadResData.data?.presignedURL;
      await sliceUpload(presignedURL, buffer);
      const { data: completeRes } = await uploadComplete(preuploadID);
      if (completeRes.code === 0) {
        const { async, completed, fileID } = completeRes.data;
        if (!completed && async) {
          await lunXun(preuploadID);
        } else if (completed) {
          console.log("上传完毕，fileId", fileID);
        }
      } else {
        console.log("uploadComplete-err", completeRes);
      }
    }
  } else {
    console.log("createFile-err", resData);
  }
};

// 轮询获取上传结果
const lunXun = async (preuploadID: string) => {
  const { data } = await asyncGetUploadResult(preuploadID);
  if (data.code === 0) {
    const { completed, fileID } = data.data;
    if (!completed) {
      setTimeout(() => {
        lunXun(preuploadID);
      }, 1100);
    } else {
      console.log("上传完毕，fileId", fileID);
    }
  } else {
    console.log("asyncGetUploadResult-err", data);
  }
};

const getCollectFile = async () => {
  try {
    const { data } = await getFileList();
    if (data.code === 0) {
      const fileList: FileType[] = data.data?.fileList || [];
      const file = fileList.find(item => item.filename === "collect.json");
      if (!file) {
        console.log("没有找到 collect.json 文件");
        return;
      }
      const { data: downloadRes } = await downloadFile(file.fileId);
      if (downloadRes.code === 0) {
        const url = downloadRes.data?.downloadUrl;
        console.log("downloadUrl", url);
        localStorage.setItem("downloadUrl", url);
        downloadUrl.value = url;
      } else {
        console.log("downloadFile-err", downloadRes);
      }
    } else {
      console.log("getFileList-err", data);
    }
  } catch (error) {
    console.log("getFileList-err", error);
  }
};

const dialogVisible = ref(false);
// 是否为修改
const isModify = ref(false);
// 当前修改的数据
const modifyData = ref<collectRecordType | null>(null);

// 弹窗显示
const showAddDialog = () => {
  isModify.value = false;
  modifyData.value = null;
  dialogVisible.value = true;
};

// 弹窗确认
const dialogConfirm = (data: collectRecordType) => {
  const newData = {
    ...data,
    updateTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
  };
  if (isModify.value) {
    // 修改tableData中的数据
    const index = tableData.value.findIndex(item => item.id === data.id);
    if (index !== -1) {
      tableData.value[index] = newData;
    }
  } else {
    newData["createTime"] = dayjs().format("YYYY-MM-DD HH:mm:ss");
    newData["id"] = uuid();
    tableData.value.push(newData);
  }
  localForage()
    .setItem("collectRecord", JSON.stringify(tableData.value))
    .then(() => {
      ElMessage.success("数据保存成功");
    })
    .catch(err => {
      console.log("数据保存失败", err);
      ElMessage.error("数据保存失败");
    });
  dialogVisible.value = false;
};

// 修改弹窗显示
const openModifyDialog = (row: collectRecordType) => {
  modifyData.value = row;
  isModify.value = true;
  dialogVisible.value = true;
};

// 删除
const removeOne = (row: collectRecordType) => {
  console.log("removeOne", row);
  const index = tableData.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    tableData.value.splice(index, 1);
    localForage()
      .setItem("collectRecord", JSON.stringify(tableData.value))
      .then(() => {
        ElMessage.success("操作成功！");
      })
      .catch(err => {
        console.log("数据删除失败", err);
        ElMessage.error("数据删除失败");
      });
  }
};

const batchDialogVisible = ref(false);
const showBatchAddDialog = () => {
  batchDialogVisible.value = true;
};

// 搜索
const search = async () => {
  const localData = (await localForage().getItem("collectRecord")) || "";
  if (localData) {
    const data = JSON.parse(localData);
    if (!keyword.value) {
      if (searchType.value === "all") {
        tableData.value = data;
      } else {
        tableData.value = data.filter(item => item.type === searchType.value);
      }
      return;
    } else {
      const filterData = data.filter(
        item =>
          item.title.includes(keyword.value) ||
          item.site.includes(keyword.value) ||
          item.desc.includes(keyword.value)
      );
      if (searchType.value === "all") {
        tableData.value = filterData;
      } else {
        tableData.value = filterData.filter(
          item => item.type === searchType.value
        );
      }
    }
  }
};

const whenKeywordClear = () => {
  getTableDataLocal();
};

// 刷新数据
const refresh = () => {
  getTableDataLocal();
};
onMounted(() => {
  getTableDataLocal();
});
</script>

<style scoped lang="scss"></style>
