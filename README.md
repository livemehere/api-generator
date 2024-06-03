# Sample Config 

```ts
import { ApiConfig } from "./src/type";

const config: ApiConfig = {
  path: "result/api",
  ignorePattern: ["**/HttpClient.ts", "**/useGetTodo.ts"],
  services: {
    json: {
      baseURL: "https://jsonplaceholder.typicode.com",
      apis: [
        /* Case1. GET (no Params) */
        {
          name: "getTodos",
          method: "get",
          path: "/todos",
          response: [
            {
              userId: 0,
              id: 0,
              title: "",
              completed: false,
            },
          ],
          useQuery: true,
        },
        /* Case2. GET with params & pathParams */
        {
          name: "getTodo",
          method: "get",
          path: "/todos/{id}/{name}",
          response: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          params: {
            id: 0,
            name: "",
            age: 0,
          },
          useQuery: true,
        },
        /* Case3. POST with body & (no pathParams & no params) */
        {
          name: "postTodo",
          method: "post",
          path: "/todos",
          response: {
            res: "",
          },
          body: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case4. POST with body pathParams (no params) */
        {
          name: "postTodo2",
          method: "post",
          path: "/todos/{id}",
          params: {
            id: 0,
          },
          response: {
            res: "",
          },
          body: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case5. PUT with body & pathParams & params */
        {
          name: "putTodo",
          method: "put",
          path: "/todos/{id}",
          params: {
            id: 0,
            pushNotification: true,
          },
          response: {
            res: "",
          },
          body: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case6. DELETE with pathParams & (no params) */
        {
          name: "deleteTodo",
          method: "delete",
          path: "/todos/{id}",
          params: {
            id: 0,
          },
          response: {
            res: "",
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case7. DELETE with params & pathParams */
        {
          name: "deleteTodo2",
          method: "delete",
          path: "/todos/{id}",
          response: {
            res: "",
          },
          params: {
            id: 0,
            name: "",
            age: 0,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos', 'getTodo']",
          },
        },
      ],
    },
  },
};

export default config;
```
