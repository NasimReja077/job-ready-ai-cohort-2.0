import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import Home from '../pages/Home.jsx'

const About = lazy(() => import("../pages/About.jsx"));
const Product = lazy(()=> import('../pages/Product.jsx'))

import Users from '../pages/Users.jsx'
import Contact from '../pages/Contact.jsx'
import MainLayout from '../layout/MainLayout.jsx'
import Skeleton from '../components/Skeleton.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx'
const routerProvider = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'product',
        // element: <Suspense fallback={<h2>Loading...</h2>}>
        //   <Product  />
        // </Suspense>,
        element: <ErrorBoundary>
          <Product/>
        </ErrorBoundary>
      },
      {
        path: 'users',
        element: <Suspense fallback={<Skeleton/>}>
          <Users />
        </Suspense>,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
    ],
  },
])

export default routerProvider
