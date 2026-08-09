import React, { Children, createContext, useState } from "react";
import Favourite from "../pages/Favourite.jsx";

export const GamesDataContext = createContext();

const GamesContext = ({ Children }) => {
  const [favourite, setFavourite] = useState([]);

  const addToFev = (game) => {
    setFavourite((prev) => {
      const axists = prev.find((item) => item.id === game.id);
      if (exists) return prev;
      else return [...prev, game];
    });
  };

  return (
    <GamesDataContext.Provider value={{ addToFav, favourite }}>
      {children}
    </GamesDataContext.Provider>
  );
};

export default GamesContext;