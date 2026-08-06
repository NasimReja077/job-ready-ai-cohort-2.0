import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "./redux/slice/userSlice";

const App = () => {
  // const data = useSelector(state=>state.user)
  // console.log(data)

  const { loading, data, error } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const getProductData = () => {
    dispatch(fetchData());
  };
  return (
    <div>
      <button onClick={getProductData}>Get Products Data</button>

      {loading && <h1>LOADING....</h1>}
      {error && <h2>{error}</h2>}
      { data &&
      data.length > 0 &&
        data.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              margin: "20px",
              padding: "20px",
            }}
          >
            <img src={item.image} alt={item.title} width="120" />

            <h3>{item.title}</h3>

            <p>Price : ${item.price}</p>

            <p>{item.category}</p>

            <p>
              Rating : {item.rating.rate} ⭐ ({item.rating.count})
            </p>
          </div>
        ))}
    </div>
  );
};

export default App;
