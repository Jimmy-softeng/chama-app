import React from "react";
import { useNavigate } from 'react-router-dom';
function CallToAction(){
    const navigate = useNavigate();
    
    return(
        <section id="cta"className="cta-section">
          <h2>Ready to Simplify and Scale Your Chama?</h2>
          <p>Join thousands of CHAMA already using Chama to boost productivity.</p>
          <button onClick={() => navigate('/auth')}>Get Started</button>
        </section>
    );
}
export default CallToAction;
