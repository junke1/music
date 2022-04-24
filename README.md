# music

## Project setup

`npm install`

## Compiles and hot-reloads for development

`npm run dev`

## Compiles and minifies for production

`npm run build`

### tip

所使用的的 element-plus 把 theme-chalk 文件夹从 lib 拉到外面来了，导致引入的时候老是找不到 base.css,然后里面的组件都放置在 components 里了，引入的时候如果不是 element/lib/components，样式会直接找向 element-plus/lib/theme-chalk/，会出现找不到样式的错误。
