function List({ items }) {
  if (!items || items.length === 0) return <p className="muted">None found.</p>;
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function ResultView({ result }) {
  return (
    <div className="result">
      <section className="result-section">
        <div className="result-heading"><span className="result-index">01</span><h2>Objectives</h2></div>
        <List items={result.objectives} />
      </section>

      <section className="result-section feature-section">
        <div className="result-heading"><span className="result-index">02</span><h2>Features</h2></div>
        {result.features.length === 0 ? (
          <p className="muted">None found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Priority</th>
                <th>Source quote from client</th>
              </tr>
            </thead>
            <tbody>
              {result.features.map((feature, index) => (
                <tr key={index}>
                  <td>{feature.name}</td>
                  <td><span className={`priority priority-${feature.priority?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{feature.priority}</span></td>
                  <td className="source-quote">“{feature.sourceQuote}”</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="result-section">
        <div className="result-heading"><span className="result-index">03</span><h2>Technical requirements</h2></div>
        <List items={result.technicalRequirements} />
      </section>

      <section className="result-section">
        <div className="result-heading"><span className="result-index">04</span><h2>Suggested stack</h2></div>
        <List items={result.stackSuggestions} />
      </section>

      <section className="result-section">
        <div className="result-heading"><span className="result-index">05</span><h2>Milestones</h2></div>
        <List items={result.milestones} />
      </section>

      <section className="result-section">
        <div className="result-heading"><span className="result-index">06</span><h2>Clarifications needed</h2></div>
        <List items={result.clarificationQuestions} />
      </section>
    </div>
  );
}
