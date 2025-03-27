<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="40%"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @open="whenOpen"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="auto">
      <el-form-item prop="title" label="标题">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item prop="site" label="网址">
        <el-input v-model="formData.site" placeholder="请输入网址" />
      </el-form-item>
      <el-form-item prop="desc" label="描述">
        <el-input v-model="formData.desc" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item prop="type" label="分类">
        <el-select v-model="formData.type" placeholder="请选择分类">
          <el-option
            v-for="t of types"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel(formRef)">取消</el-button>
        <el-button type="primary" @click="confirm(formRef)"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { collectRecordType } from "@/store/types";
import { FormInstance } from "element-plus";

type collectRecordTypeOrNull = collectRecordType | null;
const {
  types,
  isModify = false,
  modifyData
} = defineProps<{
  types: { label: string; value: string }[];
  isModify: boolean;
  modifyData: collectRecordTypeOrNull;
}>();

const dialogTitle = computed(() => {
  return isModify ? "修改" : "新增";
});

const emit = defineEmits<{ dialogConfirm: [data: collectRecordType] }>();
const dialogVisible = defineModel(false);
const formData = reactive<collectRecordType>({
  id: null,
  title: "",
  site: "",
  desc: "",
  type: "tool",
  createTime: "",
  updateTime: ""
});
const rules = reactive({
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  site: [{ required: false, message: "请输入网址", trigger: "blur" }],
  desc: [{ required: false, message: "请输入描述", trigger: "blur" }]
});
const formRef = ref<FormInstance>("formRef");
const confirm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      emit("dialogConfirm", formData);
    }
  });
};

const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  dialogVisible.value = false;
};

const whenOpen = () => {
  if (isModify) {
    formData.id = modifyData.id;
    formData.title = modifyData.title;
    formData.site = modifyData.site;
    formData.desc = modifyData.desc;
    formData.type = modifyData.type;
    formData.createTime = modifyData.createTime;
  }
};
</script>

<style scoped lang="scss"></style>
