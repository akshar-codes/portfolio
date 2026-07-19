export default function ErrorPage({
  statusCode = 404,
  message = "Page Not Found",
  description = "The page you are looking for does not exist.",
}) {
  return (
    <div className="error-page">
      <h1>{statusCode}</h1>
      <h2>{message}</h2>
      {description && <p>{description}</p>}
      <a href="/" className="btn">
        Go Home
      </a>
    </div>
  );
}
