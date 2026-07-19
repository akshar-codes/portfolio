export default function FilePickerField({
  id,
  label,
  required,
  accept,
  file,
  onChange,
  hint,
}) {
  return (
    <div className="admin-form__field">
      <label className="admin-form__label" htmlFor={id}>
        {label}
        {required && <span style={{ color: "var(--a-danger)" }}> *</span>}
      </label>
      <label className={`file-label${file ? " has-file" : ""}`} htmlFor={id}>
        <span className="file-label__icon">{file ? "🖼️" : "📁"}</span>
        <span className="file-label__text">
          {file ? file.name : "Click to upload (JPG, PNG, WEBP)"}
        </span>
        <input
          id={id}
          type="file"
          accept={accept ?? "image/*"}
          onChange={onChange}
          className="file-input"
        />
      </label>
      {hint && (
        <p style={{ fontSize: 11, color: "var(--light-gray)", marginTop: 4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
