import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  FileUploaderDropContainer,
  FileUploaderItem,
  InlineLoading,
  InlineNotification,
  ProgressBar,
  SkeletonText,
  Tag,
} from '@carbon/react';
import { Checkmark, Close, Analytics } from '@carbon/icons-react';
import { analyzeResume, getCategories, getRoles, getSamples } from '../services/api.js';

const ALL = { id: 'ALL', label: 'All categories' };
// Text-based resume formats only. Images/screenshots are not supported.
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.odt', '.pptx', '.xlsx', '.rtf', '.html', '.htm', '.xml', '.txt', '.md', '.csv'];
const UNSUPPORTED_FILE_MESSAGE = 'This file type is not supported. Upload a PDF, DOCX or TXT file instead (images and screenshots cannot be analysed).';
const VERDICT_TAG = { Suitable: 'green', 'Partially suitable': 'cyan', 'Not yet': 'magenta' };
const VERDICT_BAR = { Suitable: 'finished', 'Partially suitable': 'active', 'Not yet': 'error' };

function SkillTags({ items, type, icon }) {
  if (!items?.length) return <p className="cds--type-body-compact-01">None.</p>;
  return (
    <div className="skill-tags">
      {items.map((s) => (
        <Tag key={s} type={type} size="md" renderIcon={icon}>
          {s}
        </Tag>
      ))}
    </div>
  );
}

function Result({ result }) {
  return (
    <div aria-live="polite">
      <h3 className="cds--type-productive-heading-03">
        {result.role.title} <span className="cds--type-label-01">({result.role.category})</span>
      </h3>
      <div className="result-score">
        <span className="result-score__value">{result.score}</span>
        <span className="result-score__of">/ 100 fit score</span>
        <Tag type={VERDICT_TAG[result.verdict]} size="lg">
          {result.verdict}
        </Tag>
      </div>
      <ProgressBar label="Role fit score" hideLabel value={result.score} max={100} status={VERDICT_BAR[result.verdict]} helperText={`${result.score} out of 100`} />
      <p className="result-summary cds--type-body-02">{result.summary}</p>

      <div className="result-block">
        <h4 className="cds--type-productive-heading-02">Core skills you demonstrate</h4>
        <SkillTags items={result.matched_required} type="green" icon={Checkmark} />
      </div>
      <div className="result-block">
        <h4 className="cds--type-productive-heading-02">Core skills not evidenced</h4>
        <SkillTags items={result.missing_required} type="red" icon={Close} />
      </div>
      <div className="result-block">
        <h4 className="cds--type-productive-heading-02">Preferred skills</h4>
        <SkillTags items={result.matched_preferred} type="teal" icon={Checkmark} />
        <SkillTags items={result.missing_preferred} type="gray" />
      </div>

      {result.note && <InlineNotification kind="warning" lowContrast hideCloseButton title="Note" subtitle={result.note} />}
      <InlineNotification kind="info" lowContrast hideCloseButton title="Advisory only" subtitle={result.advisory} />
      <p className="result-meta">
        Model: {result.model} · Mode: {result.mode}
        {result.fallback ? ' (fallback)' : ''} · {result.latencyMs} ms · File: {result.resume.filename} ({result.resume.format})
      </p>
    </div>
  );
}

export default function AnalyzerPage() {
  const [categories, setCategories] = useState([ALL]);
  const [category, setCategory] = useState(ALL);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [samples, setSamples] = useState([]);
  const [sample, setSample] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getCategories(), getRoles(), getSamples()])
      .then(([c, r, s]) => {
        if (!alive) return;
        setCategories([ALL, ...c.categories.map((name) => ({ id: name, label: name }))]);
        setRoles(r.roles);
        setSamples(s.samples);
      })
      .catch((e) => alive && setCatalogError(e.message))
      .finally(() => alive && setLoadingCatalog(false));
    return () => {
      alive = false;
    };
  }, []);

  const visibleRoles = useMemo(
    () => (category.id === 'ALL' ? roles : roles.filter((r) => r.category === category.id)),
    [roles, category]
  );

  const onCategory = ({ selectedItem }) => {
    setCategory(selectedItem);
    if (role && selectedItem.id !== 'ALL' && role.category !== selectedItem.id) setRole(null);
  };

  const onSample = ({ selectedItem }) => {
    setSample(selectedItem);
    setFile(null);
    setError('');
    const suggested = roles.find((r) => r.id === selectedItem?.suggested_role_id);
    if (suggested) {
      setCategory(categories.find((c) => c.id === suggested.category) || ALL);
      setRole(suggested);
    }
  };

  const onFiles = (_e, { addedFiles }) => {
    if (!addedFiles?.length) return;
    const picked = addedFiles[0];
    if (picked.invalidFileType) {
      const tooBig = picked.size > 10 * 1024 * 1024;
      setFile(null);
      setError(tooBig ? 'File is larger than 10 MB.' : UNSUPPORTED_FILE_MESSAGE);
      return;
    }
    setFile(picked);
    setSample(null);
    setError('');
  };

  const canSubmit = !!role && (!!file || !!sample) && !busy;

  const submit = async () => {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await analyzeResume({ roleId: role.id, file, sampleId: sample?.id }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (catalogError) {
    return (
      <div className="page">
        <InlineNotification kind="error" hideCloseButton title="Could not load role catalog" subtitle={`${catalogError}. Is the backend running on port 8000?`} />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title cds--type-productive-heading-05">Is this role right for you?</h1>
      <p className="page__lead cds--type-body-02">
        Upload your resume (PDF, DOCX, TXT and other text-based formats), pick the IBM role you are interested in, and get an advisory fit score with the skills you already show and the ones to build.
      </p>

      <div className="analyzer">
        <section className="panel" aria-labelledby="inputs-heading">
          <h2 id="inputs-heading" className="panel__heading cds--type-productive-heading-03">
            Your inputs
          </h2>

          <div className="step">
            <div className="step__label">
              <span className="step__num">1</span> Choose a role
            </div>
            {loadingCatalog ? (
              <SkeletonText paragraph lineCount={4} />
            ) : (
              <>
                <Dropdown
                  id="category"
                  titleText="Role category"
                  label="Select a category"
                  items={categories}
                  itemToString={(i) => (i ? i.label : '')}
                  selectedItem={category}
                  onChange={onCategory}
                />
                <div style={{ height: '1rem' }} />
                <Dropdown
                  id="role"
                  titleText="Interested role"
                  label={visibleRoles.length ? 'Select a role' : 'No roles in this category'}
                  items={visibleRoles}
                  itemToString={(i) => (i ? i.title : '')}
                  selectedItem={role}
                  onChange={({ selectedItem }) => setRole(selectedItem)}
                  helperText={role ? `${role.level} · ${role.summary}` : `${visibleRoles.length} roles available`}
                />
              </>
            )}
          </div>

          <div className="step">
            <div className="step__label">
              <span className="step__num">2</span> Provide your resume
            </div>
            <FileUploaderDropContainer
              labelText="Drag and drop your resume here or click to upload (PDF, DOCX, TXT, RTF, HTML - no images or screenshots)"
              name="resume"
              multiple={false}
              maxFileSize={10 * 1024 * 1024}
              onAddFiles={onFiles}
              accept={ACCEPTED_EXTENSIONS}
            />
            {file && (
              <div className="file-picked">
                <FileUploaderItem name={file.name} status="edit" size="md" onDelete={() => setFile(null)} />
              </div>
            )}
            <div className="divider-or">or use a synthetic sample (no typing or uploading needed)</div>
            {!loadingCatalog && (
              <Dropdown
                id="sample"
                titleText="Sample resume"
                label="Select a sample"
                items={samples}
                itemToString={(i) => (i ? i.label : '')}
                selectedItem={sample}
                onChange={onSample}
              />
            )}
          </div>

          <div className="actions">
            <Button renderIcon={Analytics} onClick={submit} disabled={!canSubmit}>
              Analyse fit
            </Button>
            {busy && <InlineLoading description="Analysing resume..." />}
          </div>
          {!canSubmit && !busy && (
            <p className="cds--type-helper-text-01" style={{ marginTop: '0.5rem' }}>
              Select a role and provide a resume to continue.
            </p>
          )}
        </section>

        <section className="panel" aria-labelledby="result-heading">
          <h2 id="result-heading" className="panel__heading cds--type-productive-heading-03">
            Role-fit result
          </h2>
          {error && <InlineNotification kind="error" hideCloseButton title="Could not analyse this resume" subtitle={error} />}
          {busy && (
            <div className="result-loading" role="status" aria-label="Analysing">
              <SkeletonText heading width="40%" />
              <SkeletonText paragraph lineCount={5} />
            </div>
          )}
          {!busy && !result && !error && (
            <div className="result-empty">
              <p className="cds--type-productive-heading-02">No analysis yet</p>
              <p className="cds--type-body-02">Pick a role and a resume (or a sample), then choose Analyse fit.</p>
            </div>
          )}
          {!busy && result && <Result result={result} />}
        </section>
      </div>
    </div>
  );
}
