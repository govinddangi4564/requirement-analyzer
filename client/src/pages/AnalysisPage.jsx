import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteAnalysis, getAnalysis, markdownUrl } from "../api.js";
import ResultView from "../components/ResultView.jsx";

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnalysis(null);
    setError("");
    getAnalysis(id)
      .then(setAnalysis)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this analysis?")) return;
    try {
      await deleteAnalysis(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="empty-state card">
        <p className="error">{error}</p>
        <Link className="text-link" to="/">Back to workspace</Link>
      </div>
    );
  }

  if (!analysis) {
    return <div className="loading-state"><span className="loading-dot" /> Loading project brief</div>;
  }

  return (
    <div className="analysis-page">
      <div className="toolbar no-print">
        <Link className="back-link" to="/">← All briefs</Link>
        <div className="actions">
          <a className="button" href={markdownUrl(id)} download>Download Markdown</a>
          <button type="button" className="button" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button type="button" className="danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="analysis-heading"><p className="eyebrow">Project brief</p><h1>{analysis.title}</h1></div>
      <ResultView result={analysis.result} />
    </div>
  );
}
