// api.config.ts

import { ApiConfig } from "./src/typings";

const config: ApiConfig = {
  path: "result/api", // output directory
  ignorePattern: ["**/useCustomApiHook.ts"], // glob pattern for ignore files
  services: {
    serviceB: {
      baseURL: "https://api.serviceB.com",
      apis: [
        {
          name: "uploadFile",
          method: "POST",
          formData: true,
          path: "/upload",
          body: {
            file: `<raw>File</raw>`,
          },
        },
      ],
    },
  },
};

export default config;
