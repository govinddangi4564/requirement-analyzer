import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AnalysisPage from "./pages/AnalysisPage.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="site-header no-print">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Requirement Analyzer home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>Requirement Analyzer</span>
          </Link>
          <span className="header-label">Project intake workspace</span>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyses/:id" element={<AnalysisPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
