import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);

    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <article className="admin">
      <header className="admin-header">
        <h2 className="h2 article-title">Projects</h2>
        <Link to="/admin/projects/new" className="form-btn">
          + Add Project
        </Link>
      </header>

      <ul className="admin-list">
        {projects.map((project) => (
          <li key={project._id} className="admin-list-item">
            <img
              className="admin-thumb"
              src={project.image.url}
              alt={project.title}
            />

            <div className="admin-project-content">
              <h4 className="admin-title">{project.title}</h4>
              <p className="admin-description">
                {project.description.slice(0, 80)}...
              </p>
            </div>

            <button
              className="danger-btn"
              onClick={() => deleteProject(project._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
