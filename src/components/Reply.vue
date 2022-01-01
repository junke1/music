<template>
  <!-- 回复评论区 -->
  <div class="reply-comment">
    <h3>我回复@{{ params.user.nickname }}:</h3>
    <div class="comment-textarea">
      <div class="pre">{{ msg }}</div>
      <textarea
        name="leaves-msg"
        id="leaves-msg"
        class="j-inp-box inp-paragraph"
        placeholder="期待你的神评论......"
        v-model="msg"
      ></textarea>
    </div>
    <div class="comment-box-footer">
      <span class="comment-limit">
        <em class="num">
          {{ msg.length }}
        </em>
        /{{ maxLen }}
      </span>
      <el-button type="primary" size="mini" round @click="subReplyComment"
        >评论</el-button
      >
    </div>
  </div>
</template>
<script>
export default {
  name: 'replyComment',
  components: {},
  props: ['params'],
  data() {
    return {
      msg: '',
      maxLen: 140,
    };
  },
  methods: {
    // 往父组件提交emit请求
    subReplyComment() {
      this.$emit('replyMsg', this.msg);
    },
  },
  watch: {
    msg() {
      this.msg =
        this.maxLen >= this.msg ? this.msg : this.msg.substring(0, this.maxLen);
    },
  },
};
</script>
<style scoped lang="less">
.reply-comment {
  padding: 10px 15px;
  background: #efefef;
  border-radius: 4px;

  h3 {
    line-height: 14px;
    padding-bottom: 10px;
    font-size: 14px;
    font-weight: normal;
    color: #999;
  }
}
:deep(.el-button) {
  color: #333;
}
.comment-textarea {
  position: relative;
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  background: #fff;
}

.pre {
  visibility: hidden;
}

.inp-paragraph {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100% - 20px);
  resize: none;
  width: auto;
  padding: 0;
  border: 0;
  margin: 0;
  font-family: inherit;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

.inp-paragraph,
.pre {
  width: calc(100% - 30px);
  padding: 10px 15px;
  line-height: 24px;
  min-height: 24px;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.comment-box-footer {
  padding: 15px 0 0;
  text-align: right;
}

.comment-limit {
  display: inline-block;
  line-height: 28px;
  padding: 0 20px;
  font-size: 14px;
  color: #666;

  em {
    font-style: normal;
  }
}
</style>
