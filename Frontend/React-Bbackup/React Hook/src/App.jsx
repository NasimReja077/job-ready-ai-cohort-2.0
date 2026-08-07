import Card from "./componets/Card.jsx";
import { useState } from "react";

const App = () => {
  const [postData, setPostData] = useState([
    {
      id: 1,
      name: "rohit",
      age: 23,
      desc: "lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, consequuntur.",
      likeCount: 1,
    },
    {
      id: 2,
      name: "sheik",
      age: 23,
      desc: "lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, consequuntur.",
      likeCount: 1,
    },
    {
      id: 3,
      name: "nasim",
      age: 25,
      desc: "lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, consequuntur.",
      likeCount: 1,
    },
  ]);

  const likeHandler = (id) => {
    setPostData((prev)=>prev.map((item) => item.id === id ? { ...item, likeCount: item.likeCount+1}: item))
  }
  const disLikeHandler = (id) => {
    setPostData((prev) => prev.map((item) => item.id === id && item.likeCount >=1 ? { ...item, likeCount: item.likeCount - 1} : item))
  }
  return (
     <div className='px-10 py-5'>
      <Card postData={postData} likeHandler={likeHandler} disLikeHandler={disLikeHandler} />
    </div>
  );
};

export default App;
