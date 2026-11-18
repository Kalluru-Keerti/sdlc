import { StructuredListBody, StructuredListCell, StructuredListHead, StructuredListRow, StructuredListWrapper, Tag } from '@carbon/react';

const LAYERS = [
  { title: 'Client layer', items: [['Carbon React UI (g90)', 'Role picker, upload, fit result']] },
  { title: 'Application layer (FastAPI)', items: [['Resume parser', 'PDF, DOCX, RTF, HTML, text'], ['Role catalog', '25 synthetic role profiles'], ['Fit analyser', 'Mock matcher or watsonx.ai']] },
  { title: 'IBM watsonx platform', items: [['watsonx.ai', 'meta-llama/llama-4-maverick-17b-128e-instruct-fp8 via chat()']] },
  { title: 'Safety and governance', items: [['Untrusted resume text', 'Isolated in the user message'], ['Output validation', 'Schema check, score clamp, server-side verdict'], ['Advisory only', 'No hiring decision, nothing stored']] },
];

const INVENTORY = [
  ['Frontend', 'React 18, Vite, @carbon/react v11', 'Local dev server (port 5173)'],
  ['Backend', 'FastAPI, Python 3.11', 'Local uvicorn (port 8000)'],
  ['AI', 'watsonx.ai (ibm-watsonx-ai SDK)', 'Live mode only; mock by default'],
  ['Data', 'Synthetic JSON (roles, resumes)', 'No database; no resume storage'],
];

export default function ArchitecturePage() {
  return (
    <div className="page">
      <h1 className="page__title cds--type-productive-heading-05">Architecture</h1>
      <p className="page__lead cds--type-body-02">
        The demo runs fully in mock mode with no credentials. Set <code>DEMO_MODE=live</code> and watsonx.ai credentials to switch to the live model with no code changes.
      </p>
      <div className="arch-diagram" role="img" aria-label="Layered architecture diagram">
        {LAYERS.map((layer) => (
          <div className="arch-layer" key={layer.title}>
            <div className="arch-layer__title">{layer.title}</div>
            <div className="arch-layer__items">
              {layer.items.map(([name, desc]) => (
                <div className="arch-layer__item" key={name}>
                  <strong>{name}</strong>
                  <div className="cds--type-helper-text-01">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h2 className="cds--type-productive-heading-03" style={{ marginBottom: '1rem' }}>
        Component inventory <Tag type="gray">synthetic data only</Tag>
      </h2>
      <StructuredListWrapper aria-label="Component inventory">
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Component</StructuredListCell>
            <StructuredListCell head>Technology</StructuredListCell>
            <StructuredListCell head>Runtime</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {INVENTORY.map(([a, b, c]) => (
            <StructuredListRow key={a}>
              <StructuredListCell noWrap>{a}</StructuredListCell>
              <StructuredListCell>{b}</StructuredListCell>
              <StructuredListCell>{c}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
}
