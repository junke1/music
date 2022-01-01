import app from '@utils/app';
import 'element-plus/theme-chalk/base.css';
import {
  ElIcon,
  ElContainer,
  ElHeader,
  ElMain,
  ElCol,
  ElRow,
  ElInput,
  ElImage,
  ElMessage,
  ElSkeleton,
  ElSkeletonItem,
  ElCarousel,
  ElCarouselItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElPopover,
  ElPagination,
  ElInfiniteScroll,
  ElBacktop,
  ElMessageBox,
  ElTooltip,
} from 'element-plus/lib/components';
const components = [
  ElIcon,
  ElContainer,
  ElHeader,
  ElMain,
  ElCol,
  ElRow,
  ElInput,
  ElImage,
  ElSkeleton,
  ElSkeletonItem,
  ElCarousel,
  ElCarouselItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElPopover,
  ElPagination,
  ElBacktop,
  ElTooltip,
];

// 无限滚轮，信息弹窗  ————插件
const plugins = [ElMessage, ElInfiniteScroll, ElMessageBox];

// 在主组件里依次注册所导入的组件
components.forEach((component) => {
  app.component(component.name, component);
});

// 依次使用插件
plugins.forEach((plugin) => {
  app.use(plugin);
});

// 将常用的插件定义为app的全局变量
app.config.globalProperties['$msg'] = ElMessage;
app.config.globalProperties['$msgBox'] = ElMessageBox;
