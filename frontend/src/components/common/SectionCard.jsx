export default function SectionCard({ children }) {
  return (
    <li
      className="admin-item"
      style={{ alignItems: "flex-start", padding: "16px 18px" }}
    >
      {children}
    </li>
  );
}
