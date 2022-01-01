# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

## 坑

所使用的的 element-plus 把 theme-chalk 文件夹从 lib 拉到外面来了，导致引入的时候老是找不到 base.css,然后里面的组件都放置在 components 里了，引入的时候如果不是 element/lib/components，样式会直接找向 element-plus/lib/theme-chalk/，会出现找不到样式的错误。
