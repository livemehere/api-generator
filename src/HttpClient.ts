import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

interface HttpClientProps {
  baseURL: string;
  requestHook?:
    | ((
        value: InternalAxiosRequestConfig<any>,
      ) =>
        | InternalAxiosRequestConfig<any>
        | Promise<InternalAxiosRequestConfig<any>>)
    | null
    | undefined;
}

export default class HttpClient {
  instance: AxiosInstance;

  constructor({ baseURL, requestHook }: HttpClientProps) {
    this.instance = axios.create({
      baseURL,
    });

    if (requestHook) {
      this.instance.interceptors.request.use(requestHook);
    }
  }

  static parseCookie(cookie: string) {
    return Object.fromEntries(
      cookie.split("; ").map((c) => {
        // eslint-disable-next-line prefer-const
        let [key, v] = c.split("=");
        try {
          v = JSON.parse(decodeURIComponent(v));
        } catch (e) {
          /* empty */
        }
        return [key, v];
      }),
    );
  }

  static getFromCookie(key: string) {
    const cookie = document?.cookie ?? "";
    const cookieMap = HttpClient.parseCookie(cookie);
    return cookieMap[key];
  }

  async get<T = any>(url: string, params?: Record<string, any>) {
    return this.instance.get<T>(url, { params }).then((res) => res.data);
  }

  async post<T = any, D = any>(
    url: string,
    params?: Record<string, any>,
    data?: D,
  ) {
    return this.instance.post<T>(url, data, { params }).then((res) => res.data);
  }

  async put<T = any, D = any>(
    url: string,
    params?: Record<string, any>,
    data?: D,
  ) {
    return this.instance.put<T>(url, data, { params }).then((res) => res.data);
  }

  async delete<T = any>(url: string, params?: Record<string, any>) {
    return this.instance.delete<T>(url, { params }).then((res) => res.data);
  }

  async patch<T = any, D = any>(
    url: string,
    params?: Record<string, any>,
    data?: D,
  ) {
    return this.instance
      .patch<T>(url, data, { params })
      .then((res) => res.data);
  }
}
