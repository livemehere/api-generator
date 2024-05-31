import { jsonService } from "../result/api/JsonService";

// jsonService.getTodos().then((res) => {
//   console.log(res);
// });
//
// jsonService.getTodo({ id: 1, name: "kong",age:20 }).then((res) => {
//   console.log(res);
// });

jsonService
  .postTodo({ userId: 1, id: 1, title: "kong", completed: false })
  .then((res) => {
    console.log(res);
  });
