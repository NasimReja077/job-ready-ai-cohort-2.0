import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import PaginationButton from "./components/PaginationButton";

const App = () => {
  const [postData, setPostData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postParPage, setPostPerPage] = useState(5);

  const fetchData = async () => {
    const res = await axios.get("https://dummyjson.com/products");
    // console.log(res)
    setPostData(res.data.products || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // console.log(postData);

  const lastPostIndex = currentPage * postParPage;
  const firstPostIndex = lastPostIndex - postParPage;
  const currentPost = postData.slice(firstPostIndex, lastPostIndex);
  return (
    <div className="w-full min-h-screen p-10 flex flex-col">
      <div className="w-full hljs-section flex flex-wrap gap-3">
        {currentPost.map((item) => (
          <div
            key={item.id}
            className="w-40 flex items-center justify-center flex-col h-40 bg-gray-200 rounded-md"
          >
            <img className="w-50" src={item.images?.[0]} alt={item.title} />
            <h1 className="text-center">{item.title}</h1>
          </div>
        ))}
      </div>
      <PaginationButton totalPost={postData.length} postPerPage={postParPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
