import React from "react";
import { useNavigate } from 'react-router-dom';

function Streamline(){
    const navigate = useNavigate();
    return(
     <section id="streamline" className="streamline-section">
        <h1>Streamline Your Chama Operations with Chama</h1>
        <p>The ultimate suite of tools for real-time monitoring, 
            task management, and team collaboration.</p>
        <button onClick={() => navigate('/auth')}>Get Started</button>
        
     </section>
    )
}

export default Streamline;
