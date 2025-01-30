//import ScrollToTop from "@/components/Base/ScrollToTop";
import {Suspense} from 'react';
import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import "./assets/css/app.css";

//React router dom
import {RouterProvider} from 'react-router-dom';
import Router from "./router";
//Loader Componet
import Loader from '@/pages/Loader';
//React query
//import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

//const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  //<QueryClientProvider client={queryClient}>
  <Suspense fallback={<><Loader/></>}>
    <Provider store={store}>
      <RouterProvider router={Router} />
    </Provider>
  </Suspense>
  //</QueryClientProvider>


  // <BrowserRouter>
  //   <Provider store={store}>
  //     <Router />
  //   </Provider>
  //   <ScrollToTop />
  // </BrowserRouter>
);
