const baseURL = "https://api.coze.cn";
const token =
  "sat_yHJbLg08o0l61gRp1bniFlyW1LEf2ZmzSHQBqiouk5MlO2NKjyJFUnHqwe0LYfaT";
export const stream = async (
  url: string,
  options: any,
  onChunkReceived?: (data: any) => void
) => {
  fetch(`${baseURL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(options),
    method: "POST",
  })
    .then((response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // 定义流式读取函数
      function readStream() {
        if (!reader) {
          return;
        }
        reader
          .read()
          .then(({ done, value }) => {
            const data = decoder.decode(value, { stream: true });
            onChunkReceived?.({ data, done });
            if (done) {
              return;
            }
            readStream();
          })
          .catch((error) => {
            console.error("Stream reading error:", error);
          });
      }

      // 开始流式读取
      readStream();
    })
    .catch((error) => console.error("Fetch error:", error));
};

export const getOptions = (user_id, context) => {
  return {
    bot_id: "7570256696950784063",
    user_id: user_id,
    stream: true,
    additional_messages: [
      {
        content: context,
        content_type: "text",
        role: "user",
        type: "question",
      },
    ],
    parameters: {},
    auto_save_history: true,
    enable_card: true,
    custom_variables: {
      time: "",
    },
  };
};
