import React from 'react'
import loader from '@/assets/images/loader.gif';
import logo from '@/assets/images/EnWise_Logo-min.png'
import './index.css';

function index() {
  return (
    <>
    <div className="logo_center">
      <div className="loader_content">
      <img src={logo} className='logo_img'/>
        <img src={loader} className="loader_img" alt="Loading..." />
        <h3>Please wait we are preparing awesome things to preview...</h3>
      </div>
    </div>
    </>
  )
}

export default index
