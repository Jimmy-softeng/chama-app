import React from "react";

import Navbar from './Navbar'
import Streamline from './Streamline'
import Features from './Features'
import CallToAction from './CallToAction'
import Footer from './Footer'

function Landingpage(){
    
    return(
        <div className="app">
            <Navbar />
            <Streamline/>
            <Features/>
            <CallToAction/>
            <Footer/>
        </div>  
    );
}

export default Landingpage;