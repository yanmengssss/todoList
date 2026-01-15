import axios, { AxiosRequestConfig } from "axios";
interface ApiResponse<T = unknown> {
  msg: string;
  code: number;
  data: T;
  mes: string;
}
const baseURL = "http://localhost:3000";
axios.create({
  baseURL: baseURL,
});

interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  mes: string;
}

export const request = <T = unknown>(
  options: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return new Promise<ApiResponse<T>>((resolve, reject) => {
    axios({
      ...options,
      url: options.url?.startsWith("http") 
        ? options.url 
        : `${baseURL}${options.url}`,
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
