import { IoBookOutline } from "react-icons/io5";

export default function Resume() {
  return (
    <article className="resume active">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <IoBookOutline />
          </div>

          <h3 className="h3">Education</h3>
        </div>

        <ol className="timeline-list">
          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">
              Lovely Professional University
            </h4>

            <span>2025 — 2029 (Pursuing)</span>

            <p className="timeline-text">
              B.Tech in Computer Science and Engineering Relevant Coursework:
              Data Structures & Algorithms, Database Systems, Object-Oriented
              Programming
            </p>
          </li>
        </ol>
      </section>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <IoBookOutline />
          </div>
          <h3 className="h3">Technical Skills</h3>
        </div>

        <ol className="timeline-list">
          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Frontend</h4>
            <p className="timeline-text">
              HTML5, CSS3, JavaScript (ES6+), React.js, Tailwind CSS, Bootstrap
            </p>
          </li>

          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Backend</h4>
            <p className="timeline-text">
              Node.js, Express.js, REST APIs, JWT Authentication, Role-Based
              Access Control
            </p>
          </li>

          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Database</h4>
            <p className="timeline-text">MongoDB, MySQL, Mongoose</p>
          </li>

          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Programming</h4>
            <p className="timeline-text">
              Java, Data Structures & Algorithms, OOP
            </p>
          </li>

          <li className="timeline-item">
            <h4 className="h4 timeline-item-title">Tools & Deployment</h4>
            <p className="timeline-text">
              Git, GitHub, Hoppscotch, MongoDB Atlas, Vercel, Render
            </p>
          </li>
        </ol>
      </section>
    </article>
  );
}
