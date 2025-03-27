<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { getAccessToken } from "@/api/api";
import { useAppStoreHook } from "@/store/modules/app";
import { localForage } from "@/utils/localforage";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return zhCn;
    }
  },
  created() {
    // 这里可以放一些初始化的逻辑，比如获取用户信息等
    this.get123AccessToken();
    const pureApp = useAppStoreHook();
    localForage()
      .getItem("enableOperate")
      .then(enableOperate => {
        if (!enableOperate) {
          localForage().setItem("enableOperate", false);
          pureApp.setEnableOperate(false);
        } else {
          pureApp.setEnableOperate(true);
        }
      })
      .catch(err => {
        console.error("Error getting enableOperate from localForage", err);
        pureApp.setEnableOperate(false);
      });
  },
  methods: {
    get123AccessToken() {
      const pureApp = useAppStoreHook();
      const expiredAt = localStorage.getItem("expiredAt");
      const accessToken123 = localStorage.getItem("accessToken123");
      const currentTime = new Date().getTime();
      if (accessToken123 && expiredAt && currentTime < Number(expiredAt)) {
        pureApp.setAccessToken123(accessToken123);
        pureApp.setExpiredAt(Number(expiredAt));
        return;
      }
      console.log("123网盘 token 过期，重新获取");
      getAccessToken()
        .then(({ data }) => {
          if (data.code === 0) {
            const { accessToken, expiredAt } = data.data;
            localStorage.setItem("accessToken123", accessToken);
            localStorage.setItem("expiredAt", new Date(expiredAt).getTime());
            pureApp.setAccessToken123(accessToken);
            pureApp.setExpiredAt(new Date(expiredAt).getTime());
          } else {
            console.log("getAccessToken-err", data);
          }
        })
        .catch(err => {
          console.log("getAccessToken-err", err);
        });
    }
  }
});
</script>
