import utils from '@utils/util';

// 定义一个歌曲类，包括歌曲的id，名字，mv的id，歌手，专辑，alia,歌曲长度，路径，是否vip，有无版权，发布时间
export default class Song {
  constructor({
    id,
    name,
    mvId,
    singer,
    album,
    alia,
    duration,
    url,
    vip,
    license,
    publishTime,
  }) {
    this.id = id;
    this.name = name;
    this.mvId = mvId;
    this.singer = singer;
    this.album = album;
    this.alia = alia;
    this.duration = duration;
    this.url = url;
    this.vip = vip;
    this.license = license;
    this.publishTime = publishTime;
  }
}

// 导出格式化的歌曲信息
export function formatSongInfo(params) {
  return new Song({
    id: String(params.id),
    name: params.name,
    mvId: params.mv,
    singer: params.ar,
    album: params.al,
    alia: params.alia,
    vip: params.fee === 1,
    license: params.license,
    duration: utils.formatSongTime(params.dt),
    url: `https://music.163.com/song/media/outer/url?id=${params.id}.mp3`,
    publishTime: utils.formatMsgTime(params.publishTime),
  });
}
