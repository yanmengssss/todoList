import { request } from "@/lib/request";

export const WxLoginButton = () => {
  //  Math.floor(Math.random() * 4) + 5
    const access_token = "";
  //获取二维码
  const getTicket = (scene) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: "POST",
        url: "https://api.weixin.qq.com/cgi-bin/qrcode/create",
        params: {
          access_token: access_token,
        },
        headers: { "content-type": "application/json" },
        data: {
          expire_seconds: 604800, //有效时间
          action_name: "QR_STR_SCENE", //类型
          action_info: { scene: { scene_str: scene } }, //场景值，我用的是随机
        },
      };
      request(options)
        .then(function (response: any) {
          const qr =
            "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" +
            response.data.ticket;
          resolve(qr);
        })
        .catch(function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
};
