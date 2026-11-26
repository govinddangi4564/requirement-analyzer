import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAnalysis, listAnalyses } from "../api.js";

export default function HomePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    listAnalyses()
      .then(setRecent)
      .catch(() => setRecent([]));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file && !text.trim()) {
      setError("Paste requirements or upload a file.");
      return;
    }

    setLoading(true);
    try {
      const created = await createAnalysis({ text, file });
      navigate(`/analyses/${created.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      <section className="page-intro">
        <p className="eyebrow">New analysis</p>
        <h1>Turn client input into <span className="highlight-text">clear project direction.</span></h1>
        <p className="intro-copy">Bring together the scope, priorities, delivery plan, and open questions from a client conversation or requirements document.</p>
      </section>

      <div className="intake-layout">
      <form onSubmit={handleSubmit} className="card intake-card">
        <div className="card-heading">
          <div className="section-icon" aria-hidden="true">↗</div>
          <div><h2>Project source</h2><p>Paste notes below or attach the original document.</p></div>
        </div>
        <label htmlFor="requirements">Client conversation or requirements</label>
        <textarea
          id="requirements"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          placeholder="Paste the client's messages or requirement notes here..."
        />
        <p className="input-meta"><span>Clear source material produces a stronger brief.</span><span>{text.trim().length.toLocaleString()} characters</span></p>

        <div className="upload-row"><div><label htmlFor="file">Attach a document</label><p className="field-hint">PDF, DOCX, or TXT · maximum 4 MB</p></div><label className="file-button" htmlFor="file"><span aria-hidden="true">+</span> Choose file<input id="file" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files[0] || null)} disabled={loading} /></label></div>
        {file && <p className="file-selected"><span aria-hidden="true">✓</span> {file.name} <small>Document input will be used.</small></p>}

        {error && <p className="error">{error}</p>}

        <div className="submit-row"><button type="submit" className="primary" disabled={loading}>{loading ? "Preparing your brief..." : "Create project brief"}</button><p className="field-hint">Usually ready in 20–40 seconds.</p></div>
      </form>
      <aside className="brief-preview" aria-label="What your project brief includes">
        <p className="eyebrow">Included in every brief</p>
        <h2>From conversation to a practical plan.</h2>
        <ul className="benefit-list">
          <li><span className="benefit-icon">01</span><div><strong>Aligned scope</strong><small>Objectives and features organized by priority.</small></div></li>
          <li><span className="benefit-icon">02</span><div><strong>Delivery outline</strong><small>Technical needs, suggested stack, and milestones.</small></div></li>
          <li><span className="benefit-icon">03</span><div><strong>Clear next steps</strong><small>Questions to resolve before work begins.</small></div></li>
        </ul>
        <div className="preview-note"><span aria-hidden="true">✓</span> Built for sharing with your team or client.</div>
      </aside>
      </div>

      {recent.length > 0 && (
        <section className="card recent-card">
          <div className="card-heading compact-heading"><div><p className="eyebrow">History</p><h2>Recent briefs</h2></div></div>
          <ul className="recent">
            {recent.map((item) => (
              <li key={item.id}>
                <Link to={`/analyses/${item.id}`}>{item.title}<span aria-hidden="true">→</span></Link>
                <span className="muted">{new Date(item.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
