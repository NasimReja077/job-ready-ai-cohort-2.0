```
import { HumanMessage } from "@langchain/core/messages";
import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";

const State = new StateSchema({
     messages: MessagesValue
});

// type JUDGEMENT = {
//      winner: "solution_1" | "solution_2" ;
//      solution_1_score: number;
//      solution_2_score: number;
// }

// type AIBATTLESTATE = {
//      messages: typeof MessagesValue;
//      solution_1: string;
//      solution_2: string;
//      judgement: JUDGEMENT;
// }


// const state: AIBATTLESTATE = {
//   messages: MessagesValue,
//   solution_1: "",
//     solution_2: "",
//     judgement: {
//         winner: "solution_1",
//         solution_1_score: 0,
//         solution_2_score: 0
//     }
// };

const solutionNode: GraphNode<typeof State> = async (state) => {
     console.log(state.messages)
     return {
        messages: state.messages[0]
     }
}

const graph = new StateGraph(State)
    .addNode("solution", solutionNode)
    .addEdge(START, "solution")
    .compile();


export default async function (userMessage: string){
    const result = await graph.invoke({
        messages: [
            new HumanMessage(userMessage)
        ]
    })
    return result.messages
}
```

```text
Server is running on Port 3000
[
  HumanMessage {
    "id": "d6065f24-4a0a-4815-b9b5-c1d17ed3704e",
    "content": "give short description of Langchain in 10 words",
    "additional_kwargs": {},
    "response_metadata": {}
  }
]
```