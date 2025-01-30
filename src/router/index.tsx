import {lazy} from 'react'
import { useRoutes, createBrowserRouter} from "react-router-dom";
import Layout from "../themes";
//Login page
const Login = lazy(()=>import('@/pages/Login'));
//Error Page
const ErrorPage = lazy(()=>import('@/pages/ErrorPage'));
//Uesr Page
const Sites = lazy(()=>import('@/pages/Sites'));
//Devices Page
const Devices = lazy(()=>import('@/pages/Devices'));
//Aggreator
const Aggreator = lazy(()=>import('@/pages/Aggreator'));
//Industry
const Industry = lazy(()=>import('@/pages/Industry'));
//Inifinite Scroll
//const Inifinite = lazy(()=>import('@/pages/Infinite'));
//==================View Site page============================
const SiteDashbaord = lazy(()=>import('@/pages/Site/Dashboard'));
const Router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/sites",
        element: <Sites />,
        handle : {breadcrumbTitle: "Sites"}
      },
      {
        path: '/devices/:site_uid', // Add parameter segment
        element: <Devices />,
        handle: { breadcrumbTitle: "Devices" } // Fix breadcrumb title
      },
      {
        path: '/aggregator',
        element :<Aggreator/>,
        handle : {breadcrumbTitle: "Aggregator"}
      },
      {
        path: '/industry',
        element :<Industry/>,
        handle : {breadcrumbTitle: "Industry"}
      },
      {
        path : '/site/dashboard',
        element : <SiteDashbaord/>,
        handle : {breadcrumbTitle: "Dashboard"}
      }
    ],
  },
  {
    path: "/",
    element: <Login />,
    index : true
  },
  // {
  //   path: "/register",
  //   element: <Register />,
  // },
  {
    path: "/error-page",
    element: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  }
]);


export default Router;
