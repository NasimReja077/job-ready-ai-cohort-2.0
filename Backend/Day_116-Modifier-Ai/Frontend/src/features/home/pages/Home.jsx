import React from "react";
import FaceExpression2 from "../../Expression/components/FaceExpression2";
import Player from "../components/Player";
import { useSong } from "../hooks/useSong";

const Home = () => {
  const { handleGetSong } = useSong();

  return (
    <>
      <FaceExpression2
        onClick={(expression) => {
          handleGetSong({ mood: expression });
        }}
      />

      <Player />
    </>
  );
};

export default Home;
