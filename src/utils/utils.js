// 定义（发送）消息的类型
export const MsgType = {
  NORMAL: 0,
  NOTICE: 1,
};

// 定义房间类型
export const RoomType = {
  HOME: 0, // 主页
  PRIVATE: 1, // 私人聊天室
  PUBLIC: 2, // 公共聊天室
};

// 定义获取消息的方式
export const GetMsgWay = {
  NORMAL: 0, // 正常向下获取10条消息
  START: 2, // 初始加载，开始时获取10个消息
  MORE: 1, // 下滑加载更多，获取10条消息
};