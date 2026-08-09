import { createBrowserRouter } from "react-router";
import Favourite from "../pages/Favourite.jsx";
import Home from "../pages/Home.jsx";
import Games from "../pages/Games.jsx";
import MainLayout from "../layout/MainLayout.jsx";
import { gameDeatilsLoader, gamesLoader } from "../service/gamesLoader.jsx";
import GamesDetails from "../pages/GamesDetails.jsx";

export const AppRouter = createBrowserRouter([
    {
        path:'/',
        element:<MainLayout/>,
        
        children:[
            {
        index:true,
        element:<Home/>,
       loader:gamesLoader,
       hydrateFallbackElement:<p className="text-white absolute top-1/2 left-1/2
       -translate-x-1/2 -translate-y-1/2
       ">Loading....</p>,
      
    },
    {
        path:'favrouite',
        element:<Favourite/>
    },
    {
        path:'games',
        element:<Games/>

    },
    {
        path :'gamesDetails/:id',
        element:<GamesDetails/>,
        loader:gameDeatilsLoader
    }
 
        ]
    }
])