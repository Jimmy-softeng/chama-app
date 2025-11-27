import React from "react";

import customerImg from "../../assets/images/task.png";
import salesImg from "../../assets/images/member.png";
import teamImg from "../../assets/images/payment.png";


function Features(){
    const features=[
        { title: "Task Management", desc: "Assign, track, and manage your team’s tasks effortlessly.", img: customerImg },
        { title: "Member Insights", desc: "Understand your members better and enhance relationships.", img: salesImg },
        { title: "Payment track", desc: "Monitor payment in real-time and optimize strategies.", img: teamImg },

    ]
    return(
      <section id="features" className="features-section">
        <h2>Transform Your Chama with Chama’s Powerful Suite of Tools</h2>
        <div className="feature-grid">
        {features.map(({ title, desc, img }, index) => (
          <div key={index} className="feature-card">
            <img src={img} alt={title} />
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
        </div>

      </section>
    );

}
export default Features;