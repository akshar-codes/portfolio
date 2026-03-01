export default function About() {
  return (
    <article className="about active">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="about-text">
        <p>
          I’m a B.Tech Computer Science student at Lovely Professional
          University focused on Full-Stack MERN development. I build structured,
          scalable web applications using React.js, Node.js, Express, and
          MongoDB.
        </p>

        <p>
          My focus is backend-driven architecture — authentication systems,
          role-based access control, REST APIs, and clean MVC structure. I
          prioritize writing maintainable code over building flashy interfaces.
        </p>

        <p>
          Currently, I’m working on production-style projects including admin
          CMS systems, trading platform simulations, and AI-integrated web
          applications to strengthen real-world problem solving and system
          design skills.
        </p>
      </section>

      {/* Service Section */}
      <section className="service">
        <h3 className="h3 service-title">What I'm doing</h3>

        <ul className="service-list">
          <li className="service-item">
            <div className="service-icon-box">
              <img
                src="/images/icon-dev.svg"
                alt="Web Development icon"
                width="40"
              />
            </div>

            <div className="service-content-box">
              <h4 className="h4 service-item-title">
                Full-Stack Web Development
              </h4>
              <p className="service-item-text">
                Build scalable MERN applications with clean UI, secure
                authentication, and structured backend architecture.
              </p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img
                src="/images/microchip-ai.png"
                alt="AI & ML icon"
                width="40"
              />
            </div>

            <div className="service-content-box">
              <h4 className="h4 service-item-title">AI & Machine Learning</h4>
              <p className="service-item-text">
                Develop Python-based ML models and integrate them into
                real-world web applications.
              </p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img src="/images/chart-tree.png" alt="DSA icon" width="40" />
            </div>

            <div className="service-content-box">
              <h4 className="h4 service-item-title">
                Data Structures & Algorithms
              </h4>
              <p className="service-item-text">
                Solve algorithmic problems in Java with focus on efficiency and
                optimization.
              </p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <img
                src="/images/icon-app.svg"
                alt="App Development icon"
                width="40"
              />
            </div>

            <div className="service-content-box">
              <h4 className="h4 service-item-title">
                Backend & App Development
              </h4>
              <p className="service-item-text">
                Design REST APIs and scalable backend systems with proper
                database integration.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </article>
  );
}
