import axios from "axios";

/* ---验证类函数--- */
/**
 * 验证密码
 * @param pass 密码
 * @param passtype 密码类型
 * @param label 密码名称、标识
 */
export async function verify_pass(pass, passtype, label) {
  try {
    // 等待请求完成
    const response = await axios.post("/server/verify_pass", {
      'password': pass,
      'passtype': passtype,
      'label': label
    });
    // 直接返回布尔结果
    return response.data == 0;
  } catch (error) {
    console.error("验证失败:", error);
    return false;
  }
}

/**
 * 验证ip是否在黑名单中
 * @param ip ip地址
 */
export async function verify_blacklist(ip) {
  try {
    const response = await axios.post("/server/verify_blacklist", { 'ip': ip })
    // 0表不在黑名单中（成功），1表示失败
    return response.data != 0
  } catch (error) {
    // 加上错误处理，防止网络请求报错导致程序中断
    console.error("验证失败:", error);
    return true; // 或者根据需求抛出错误 throw error;
  }
}