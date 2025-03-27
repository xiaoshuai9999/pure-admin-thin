<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增"
    width="40%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <div>
      <el-alert
        title="JSON格式，且必须是数组！title和type必须！"
        type="error"
      />
      <el-input
        v-model="formString"
        type="textarea"
        :rows="22"
        placeholder="请输入"
        style="font-size: 16px"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { collectRecordType } from "@/store/types";
import { ElMessage } from "element-plus";

const emit = defineEmits<{ dialogConfirm: [data: collectRecordType] }>();
const dialogVisible = defineModel(false);
const formString = ref<string>(
  `[{"title":"","site":"","desc":"","type":"tool"}]`
);

const parseJsonString = (str: string): { isValid: boolean; data: object } => {
  try {
    const parsed = JSON.parse(str);
    const isValid = Array.isArray(parsed);
    return { isValid: isValid, data: parsed };
  } catch (error) {
    return { isValid: false, data: undefined };
  }
};

const confirm = () => {
  if (!formString.value) {
    ElMessage.error("请输入内容");
    return;
  }
  const { isValid, data } = parseJsonString(formString.value);
  if (!isValid) {
    ElMessage.error("请输入正确的json格式");
    return;
  }
  emit("dialogConfirm", data);
};
</script>

<style scoped lang="scss"></style>
