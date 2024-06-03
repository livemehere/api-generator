# @livemehere/api-generator

![logo.webp](img%2Flogo.webp)

This library is a Typescript code generator for HTTP requests and React hooks based on [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview).   

#### [npm](https://www.npmjs.com/package/@livemehere/api-generator)

## Features

- Configure API with `api.config.ts` file.
- Create `HttpClient.ts` file for HTTP requests based on `axios`.
- Create `params`, `body`, `response` types for every endpoint.
- Create `useQuery`, `useMutation`, `useInfiniteQuery` hooks for every endpoint what you want to use(optional).

## Usage

### Step1. `api.config.ts`

Create `api.config.ts` file in the root of your project.

> ⚠️ Must be on the root and run on root directory.

#### Basic Configuration

```ts
// api.config.ts

import { ApiConfig } from "./src/typings";

const config: ApiConfig = {
    path:'src/api', // output directory
    ignorePattern:['**/useCustomApiHook.ts'], // glob pattern for ignore files
    services:{
        serviceA:{
            baseURL:'https://api.serviceA.com',
            apis:[
                // endpoints
            ]
        },
        serviceB:{
            baseURL:'https://api.serviceB.com',
            apis:[
                // endpoints
            ]
        }
    }
}

export default config;
```

- `path` : Output directory for generated files.
- `ignorePattern` : Glob pattern for ignore files.
- `services` : Service configuration.

### Step2. build code with CLI

There is only one command for generating files.   
Generate code by running the following command.

```bash
yarn api-generator
npx api-generator
```

![example1.png](img%2Fexample1.png)

We can get 1 `HttpClient.ts` file, 2 `Service` file and empty `quries` directory.   
`HttpClient.ts` is just common interface for each Service's HTTP requests.   

> Service name is created by configure file's `key` + `Service`. ex) `youtube` -> `YoutubeService`

There are no other methods in the `Service` file because we didn't configure any endpoints.

```ts
// ServiceAService.ts
import HttpClient from "./HttpClient";

class ServiceAService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://api.serviceA.com",
    requestHook: (config) => {
      return config;
    },
  });
}
export const serviceAService = new ServiceAService();
```

### Step3. Add endpoints

`name`, `method`, `path` are required fields.   
`params`, `body`, `response` are optional fields and they are used for types for typescript. Every field for types are auto generated to `type` from `object` response.

```ts
apis: [
    // endpoints
    {
      name: "getTodos",
      method: "GET",
      path: "/todos",
      response: [
          {
              id: 0,
              title: "",
              description: "",
              isCompleted: true,
          },
      ],
    },
]
```

and build again.

```ts
import HttpClient from "./HttpClient";

export type TGetTodosResponse = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}[];
class ServiceAService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://api.serviceA.com",
    requestHook: (config) => {
      return config;
    },
  });

  async getTodos() {
    return this.httpClient.get<TGetTodosResponse>(`/todos`);
  }
}
export const serviceAService = new ServiceAService();
```

We got `getTodos` method in the `Service` file and `TGetTodosResponse` type.   
If we need params or body type, just add them to the endpoint configuration.   

> That's it! You can use `getTodos` method in your project. And you can use `TGetTodosResponse` type for type checking. If there are any change in the API, just run the generator again and check with your lint tool.

### Step4. Use hooks (For React)

Most in the case, we use React for frontend and we use `TanStack Query` for data fetching. Sorry for other frameworks. Welcome to Contribute!    
This library covers `useQuery`, `useMutation`, `useInfiniteQuery` hooks for every endpoint.   

### `useQuery` option

```ts
apis: [
    // endpoints
    {
      name: "getTodos",
      method: "GET",
      path: "/todos",
      response: [
          {
              id: 0,
              title: "",
              description: "",
              isCompleted: true,
          },
      ],
      useQuery: true,
    },
]
```

then build again, you can get `useGetTodos` hook in the `queries/ServiceAService` directory.   

![example2.png](img%2Fexample2.png)

```ts
// src/api/queries/ServiceAService/useGetTodos.ts

import { useQuery } from "@tanstack/react-query";
import { serviceAService } from "../../ServiceAService";

const useGetTodos = () => {
  return useQuery({
    queryKey: ["getTodos"],
    queryFn: () => serviceAService.getTodos(),
  });
};
export default useGetTodos;
```

#### More options for hooks

Fully customizable options for hooks.   

```ts
// api.config.ts
useQuery: {
    queryKey: "['getTodos','customKey']",
    enabled: "!!window",
    queryFn: "()=> serviceAService.getTodos().then((res)=>res[0])",
}
```

```ts
// result
import { useQuery } from "@tanstack/react-query";
import { serviceAService } from "../../ServiceAService";

const useGetTodos = () => {
  return useQuery({
    queryKey: ["getTodos", "customKey"],
    queryFn: () => serviceAService.getTodos().then((res) => res[0]),
    enabled: !!window,
  });
};
export default useGetTodos;
```

### `useMutation` option

There are little more syntax for `useMutation` option.   

```ts
// api.config.ts
apis: [
    // endpoints
    {
      name: "getTodos",
      method: "POST",
      path: "/todo/{id}", // use variable in path from params
      params: { // query string params for request exclude key used in path
        id: 0,
      },
      body: {
        title: `<raw>string|undefined</raw>`, // raw value for complex type
        description: `<raw>string|undefined</raw>`,
        isCompleted: `<raw>boolean|undefined</raw>`,
      },
      response: {
        id: 0,
        title: "",
        description: "",
        isCompleted: true,
      },
      useMutation: true, // create mutation hook
    },
]   
```

```ts
// src/api/ServiceBService.ts
import HttpClient from "./HttpClient";

export type TGetTodosParams = {
    id: number;
};
export type TGetTodosResponse = {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
};
export type TGetTodosBody = {
    title?: string;
    description?: string;
    isCompleted?: boolean;
};

class ServiceBService {
    private httpClient: HttpClient = new HttpClient({
        baseURL: "https://api.serviceB.com",
        requestHook: (config) => {
            return config;
        },
    });

    async getTodos(params: TGetTodosParams, body: TGetTodosBody) {
        return this.httpClient.post<TGetTodosResponse, TGetTodosBody>(
            `/todo/${params.id}`,
            undefined, // if there are more params except used in path, put here.
            body,
        );
    }
}
export const serviceBService = new ServiceBService();
```

```ts
// src/api/queries/ServiceAService/useMutateGetTodos.ts
import { useMutation } from "@tanstack/react-query";
import {
    TGetTodosParams,
    TGetTodosBody,
    serviceBService,
} from "../../ServiceBService";

const useMutateGetTodos = () => {
    return useMutation({
        mutationFn: ({ params, body }: { params: TGetTodosParams; body: TGetTodosBody; }) =>
            serviceBService.getTodos(params, body)
    });
};
export default useMutateGetTodos;
```

### `useInfiniteQuery` option

Ok! Last one. Let's upgrade our `getTodos` endpoint to `useInfiniteQuery`.   
`pageKey`, `initialPageParam`, `getNextPageParam` are required fields. Sorry for `getNextPageParam` is up to you. We don't know how to get next page from the response. It's up to your Backend API.

```ts
apis: [
    // endpoints
    {
      name: "getTodos",
      method: "GET",
      path: "/todos",
      params: {
        page: 0,
      },
      response: {
        nextPage: 0,
        todos: [
          {
            id: 0,
            title: "",
            description: "",
            isCompleted: true,
          },
        ],
      },
      useInfiniteQuery: {
        pageKey: "page",
        initialPageParam: 1,
        getNextPageParam: "(lastPage)=> lastPage.nextPage",
      },
    },
]
```

Oh, it's messy. But it's worth it.   

```ts
// src/api/queries/ServiceAService/useGetTodos.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { TGetTodosParams, serviceAService } from "../../ServiceAService";

const useInfiniteGetTodos = (
    initialPageParam = 1,
    params: Omit<Partial<TGetTodosParams>, "page">,
) => {
    return useInfiniteQuery({
        queryKey: [
            "getTodos",
            JSON.stringify(
                Object.keys(params).reduce(
                    (acc, key) =>
                        key !== "page"
                            ? {
                                ...acc,
                                [key]: params[key as keyof Omit<TGetTodosParams, "page">],
                            }
                            : acc,
                    {},
                ),
            ),
        ],
        queryFn: ({ pageParam }) =>
            serviceAService.getTodos({
                ...(params as NonNullable<TGetTodosParams>),
                page: pageParam,
            }),
        initialPageParam: initialPageParam,
        enabled: Object.keys(params).every(
            (key) => params[key as keyof Omit<TGetTodosParams, "page">] != null,
        ),
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });
};

export default useInfiniteGetTodos;
```

- Exclude `page` key from `params` because it's not cached per page.
- `enabled` option is for initial fetch. If all params are not null, it's enabled. This mechanism is for every hooks that have `params` option. Of course, you can restrict it.

---

> Done! These are core features of this library. Rest of docs are for Detail options and configurations.


## Tips

- Once created codes by CLI, never remove them. Just add or update by `api.config.ts` file. If you want to reset all, just remove directory and run CLI again.
- Each file rewrite when code different.

### `<raw>value</raw>` tag syntax

`params`, `body`, `response` are auto generated to `type` from `object` response. but you can customize it with `raw` tag.   

```ts
// api.config.ts
{
    params:{
        title:'',
        description:`<raw>string|undefined</raw>`
    }
}
```

### `defaultScript` for `service`, `hooks`

Sometimes you need your own types or something. Import that with `defaultScript` and use it with `<raw>` tag.      

```ts
// api.config.ts
{
    defaultScript:`
        import { TCustomType } from '@src/domain/types';
    `,
    response:{
        list:`<raw>TCustomType[]</raw>`
    }
}
```

### `headers` option for `Service`

Sometimes you need to get value from `localStorage` or `cookie` for `Authorization` header or anything.   
We prepare `headers` option and `<cookie>`, `<localstorage>`, `<sessionstorage>` tag for that.   

```ts   
services:{
    serviceA:{
        baseURL:'https://api.serviceA.com',
        headers: {
            Authorization: "Bearer <cookie>key from cookie</cookie>",
            "x-custom-header1": "<localStorage>userId</localStorage>",
            "x-custom-header2": "<sessionStorage>token</sessionStorage>",
        }
    }
}
```

it converts to below. Read cookie value from browser and put it to `Authorization` header.   
As you see, just string value used for value.

```ts
class ServiceAService {
    private httpClient: HttpClient = new HttpClient({
        // ...
        requestHook: (config) => {
            config.headers["Authorization"] = `Bearer ${HttpClient.getFromCookie("key from cookie")}`;
            config.headers["x-custom-header1"] = `${HttpClient.getFromLocalStorage("userId")}`;
            config.headers["x-custom-header2"] = `${HttpClient.getFromSessionStorage("token")}`;
            return config;
        },
    });
    // ...
}
```

#### code implementation

```ts
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

  static getFromLocalStorage(key: string) {
    return localStorage.getItem(key);
  }

  static getFromSessionStorage(key: string) {
      return sessionStorage.getItem(key);
  }
```

## Done!

That's it! It made from my personal experience and I hope it helps you. And I'll update more features and options when getting more experience.   
I hope you contribute to this library with your experience. Thanks!
