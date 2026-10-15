import { Component, Suspense, lazy, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronRight, Eye, EyeOff, Focus, Layers3, ListChecks, Maximize2, Menu, Minus, Pause, Play, Plus, RotateCcw, Route, ScanLine, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ACCESSORY_NOTE, MODEL_NOTE, ORGANS, QUIZ, SOURCES, STEPS, type OrganId } from './content';
import DigestiveDiagram from './DigestiveDiagram';
import { initialLessonState, lessonReducer, type LessonMode } from './lessonState';

const DigestiveScene = lazy(() => import('./DigestiveScene'));
const BalancedPlate = lazy(() => import('./BalancedPlate'));
type CameraType = 'reset' | 'left' | 'right' | 'up' | 'down' | 'zoom-in' | 'zoom-out' | 'front';
class SceneBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onError(error.message); }
  render() { return this.state.failed ? null : this.props.children; }
}
function hasWebGL2() { try { const gl = document.createElement('canvas').getContext('webgl2'); if (!gl) return false; gl.getExtension('WEBGL_lose_context')?.loseContext(); return true; } catch { return false; } }
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => { const media = window.matchMedia(query); const update = () => setMatches(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, [query]);
  return matches;
}

function QuickQuiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const attempted = answers.filter((answer) => answer !== null).length;
  return <section id="check" className="ac-card knowledge-check" aria-labelledby="check-title"><div className="ac-card-heading"><div><span className="ac-kicker">EXPLAIN YOUR THINKING</span><h2 id="check-title">Can you explain the journey?</h2></div><span className="ac-badge">{attempted} / {QUIZ.length} answered</span></div><p className="ac-small ac-muted">Choose an answer and read the explanation. You can try again at any time.</p><div className="question-grid">{QUIZ.map((question, q) => <fieldset className="quiz-question" key={question.question}><legend><span>{String(q + 1).padStart(2, '0')}</span>{question.question}</legend><div className="quiz-options">{question.options.map((option, a) => <button key={option} className={`quiz-answer ${answers[q] === a ? a === question.answer ? 'correct' : 'incorrect' : ''}`} aria-pressed={answers[q] === a} onClick={() => setAnswers((previous) => previous.map((value, n) => n === q ? a : value))}><span className="answer-letter">{String.fromCharCode(65 + a)}</span><span>{option}</span>{answers[q] === a && a === question.answer && <Check size={17} />}</button>)}</div><p className="quiz-feedback" aria-live="polite">{answers[q] === null ? 'Choose an answer.' : `${answers[q] === question.answer ? 'Correct. ' : 'Let’s look again. '}${question.explanation}`}</p></fieldset>)}</div><div className="ac-row ac-between quiz-bottom"><span className="ac-caption ac-muted">Teacher-created practice questions, not official examination questions.</span><button className="ac-btn ac-btn-quiet" onClick={() => setAnswers(QUIZ.map(() => null))}><RotateCcw size={16} />Reset questions</button></div></section>;
}

export default function App() {
  const [activity, setActivity] = useState<'digestive' | 'plate'>('digestive');
  const [plateError, setPlateError] = useState(false);
  const [plateAttempt, setPlateAttempt] = useState(0);
  const [lesson, dispatch] = useReducer(lessonReducer, initialLessonState);
  const { mode, selectedId, step, playing } = lesson;
  const [labels, setLabels] = useState(true);
  const [context, setContext] = useState(true);
  const [isolate, setIsolate] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<OrganId[]>([]);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [projection, setProjection] = useState(false);
  const [supported] = useState(hasWebGL2);
  const [fallback, setFallback] = useState(!supported);
  const [sceneError, setSceneError] = useState('');
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [cameraCommand, setCameraCommand] = useState<{ type: CameraType; seq: number }>({ type: 'reset', seq: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('explorer');
  const mobile = useMedia('(max-width: 1024px)');
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const organ = ORGANS.find((entry) => entry.id === selectedId)!;
  const currentStep = STEPS[step];
  const sendCamera = (type: CameraType) => setCameraCommand((value) => ({ type, seq: value.seq + 1 }));
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback((message: string) => { setSceneError(message); setFallback(true); setReady(false); }, []);
  const onSelect = useCallback((id: OrganId) => { dispatch({ type: 'select', id }); setHiddenIds((ids) => ids.filter((value) => value !== id)); }, []);
  const jump = (value: number) => { dispatch({ type: 'jump', step: value }); setHiddenIds([]); setIsolate(false); };
  const changeMode = (value: LessonMode) => { dispatch({ type: 'mode', mode: value }); setHiddenIds([]); setIsolate(false); };
  const resetLesson = () => { dispatch({ type: 'reset' }); setLabels(true); setContext(true); setIsolate(false); setHiddenIds([]); sendCamera('reset'); };
  const toggleHidden = (id: OrganId) => setHiddenIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  const retry = () => { setSceneError(''); setReady(false); setAttempt((value) => value + 1); setFallback(false); };
  const closeSidebar = () => { setSidebarOpen(false); if (mobile) menuButton.current?.focus(); };
  const changeActivity = (value: 'digestive' | 'plate') => {
    dispatch({ type: 'pause' }); setActivity(value); setProjection(false); setSidebarOpen(false);
    setActiveSection('explorer');
    window.requestAnimationFrame(() => document.getElementById('content')?.focus());
  };
  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), 8000);
    return () => window.clearTimeout(timer);
  }, [playing, reducedMotion, step]);
  useEffect(() => { if (reducedMotion) dispatch({ type: 'pause' }); }, [reducedMotion]);
  useEffect(() => { if (mode === 'journey') { setHiddenIds([]); setIsolate(false); } }, [step, mode]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setProjection(false); if (sidebarOpen) closeSidebar(); }
      if (sidebarOpen && mobile && event.key === 'Tab') {
        const focusable = sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sidebarOpen, mobile]);
  useEffect(() => { if (sidebarOpen && mobile) sidebar.current?.querySelector<HTMLElement>('button')?.focus(); }, [sidebarOpen, mobile]);
  useEffect(() => { if (!mobile) setSidebarOpen(false); }, [mobile]);
  const navItems = [{ id: 'explorer', icon: Layers3, label: '3D explorer' }, { id: 'understand', icon: BookOpen, label: 'Understand' }, { id: 'check', icon: ListChecks, label: 'Quick check' }, { id: 'resources', icon: ShieldCheck, label: 'Resources' }];
  return <div className={`ac-app digestive-app ${projection ? 'classroom-mode' : ''}`}>
    <a className="lesson-skip" href="#content">Skip to lesson content</a>
    <div className="app-frame">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebar} aria-label="Lesson navigation" aria-hidden={mobile && !sidebarOpen} inert={mobile && !sidebarOpen}>
        <button className="ac-btn ac-icon-btn sidebar-close" onClick={closeSidebar} aria-label="Close navigation"><X size={20} /></button>
        <a className="brand" href="#content" onClick={() => setSidebarOpen(false)} aria-label="AlgoCore — lesson home"><span className="brand-logo-frame"><img className="brand-logo" src="./brand/algocore-logo.png" alt="AlgoCore Education" /></span></a>
        <p className="workspace-label">UNIT 4 · HUMANS</p><div className="activity-switch" role="group" aria-label="Choose an activity"><button aria-pressed={activity === 'digestive'} onClick={() => changeActivity('digestive')}><span>4.1</span>Digestive system</button><button aria-pressed={activity === 'plate'} onClick={() => changeActivity('plate')}><span>4.2</span>Balanced plate</button></div><p className="workspace-label activity-subnav-label">IN THIS LESSON</p>
        <nav className="side-nav" hidden={activity !== 'digestive'}>{navItems.map(({ id, icon: Icon, label }) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'page' : undefined} onClick={() => { setActiveSection(id); setSidebarOpen(false); }}><Icon size={19} /><span>{label}</span>{id === 'explorer' && <span className="nav-count">3D</span>}</a>)}</nav>
        <div className="sidebar-lesson"><span>PRIMARY SCIENCE 5</span><strong>Unit 4 · Humans</strong><p>{activity === 'digestive' ? <>4.1 Parts and functions<br />of the digestive system</> : <>4.2 A balanced diet<br />Food groups and nutrition labels</>}</p><div className="sidebar-route" aria-hidden="true">{ORGANS.map((item) => <i key={item.id} style={{ background: item.color }} />)}</div></div>
        <div className="sidebar-bottom"><p>Learn by observing</p><span>Rotate the model. Ask questions.<br />Explain what you discover.</span></div>
      </aside>
      {sidebarOpen && mobile && <button className="drawer-backdrop open" onClick={closeSidebar} aria-label="Close navigation" tabIndex={-1} />}
      <div className="workspace-main">
        <header className="app-topbar"><div className="topbar-left"><button ref={menuButton} className="ac-btn ac-icon-btn mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" aria-expanded={sidebarOpen}><Menu size={20} /></button><nav className="breadcrumbs" aria-label="Lesson breadcrumb"><span>Primary Science 5</span><ChevronRight size={14} /><span>Unit 4</span><ChevronRight size={14} /><strong>{activity === 'digestive' ? '4.1 Digestive system' : '4.2 Balanced plate'}</strong></nav></div><button className="ac-btn ac-btn-quiet classroom-button" aria-label={projection ? 'Exit presentation' : 'Present lesson'} aria-pressed={projection} onClick={() => setProjection((value) => !value)}>{projection ? <X size={18} /> : <Maximize2 size={18} />}<span>{projection ? 'Exit presentation' : 'Present'}</span></button></header>
        <main id="content" tabIndex={-1} className="app-content">
          <div className="page-heading"><div><div className="ac-row lesson-meta"><span className="ac-badge ac-badge-info">{activity === 'digestive' ? 'LESSON 4.1' : 'LESSON 4.2'}</span><span className="ac-caption ac-muted">INTERACTIVE LEARNING</span></div><h1>{activity === 'digestive' ? 'Digestive system' : 'Balanced plate'}</h1><p className="subtitle">{activity === 'digestive' ? 'Parts and functions of the digestive system' : 'A balanced diet · Choose foods from different groups'}</p></div><div className="lesson-outcome" hidden={activity !== 'digestive'}><span className="outcome-icon"><Route size={21} /></span><span><strong>One journey, six organs</strong><small>Follow food and discover what happens.</small></span></div></div>
          {activity === 'plate' ? <section className="plate-activity" aria-label="Balanced plate activity">{plateError && <div className="ac-alert ac-alert-warning" role="alert"><div><p>The activity could not load. Please try again.</p><button className="ac-btn" onClick={() => { setPlateError(false); setPlateAttempt((value) => value + 1); }}>Reload activity</button></div></div>}<SceneBoundary key={plateAttempt} onError={() => setPlateError(true)}><Suspense fallback={<div className="ac-card activity-loading" role="status">Loading the balanced plate activity…</div>}><BalancedPlate /></Suspense></SceneBoundary></section> : <>
          <section id="explorer" className="ac-card explorer-card" aria-labelledby="explorer-title"><div className="explorer-card-heading"><div><h2 id="explorer-title">Inside your body</h2><p>Select an organ or follow the journey of food.</p></div><span className="ac-badge specimen-badge">6 CONNECTED ORGANS</span></div>
            <div className="explorer-modebar"><div className="lesson-modes" role="group" aria-label="Explorer mode"><button className={mode === 'explore' ? 'active' : ''} aria-pressed={mode === 'explore'} onClick={() => changeMode('explore')}><Focus size={17} />Explore</button><button className={mode === 'journey' ? 'active' : ''} aria-pressed={mode === 'journey'} onClick={() => changeMode('journey')}><Route size={17} />Food journey</button></div><label className="motion-choice"><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />Reduced motion</label></div>
            <div className="explorer-workspace"><div className="specimen-workspace"><div className="digestive-stage" data-testid="digestive-stage"><div className="stage-topline"><span className="stage-status" role="status"><i className={!ready && !fallback ? 'waiting' : ''} />{fallback ? '2D diagram' : ready ? 'Interactive 3D model' : 'Preparing the model…'}</span><span>ANATOMICAL VIEW</span></div>{fallback ? <DigestiveDiagram selectedId={selectedId} mode={mode} step={step} labels={labels} context={context} isolate={isolate} hiddenIds={hiddenIds} onSelect={onSelect} /> : <SceneBoundary key={attempt} onError={onError}><Suspense fallback={<div className="scene-loading"><span />Loading the model…</div>}><DigestiveScene selectedId={selectedId} mode={mode} step={step} playing={playing} reducedMotion={reducedMotion} labels={labels} context={context} isolate={isolate} hiddenIds={hiddenIds} cameraCommand={cameraCommand} onSelect={onSelect} onReady={onReady} onError={onError} /></Suspense></SceneBoundary>}<div className="stage-bottomline"><span>{fallback ? 'Select an organ in the diagram or list' : 'Drag to rotate · Scroll to zoom'}</span><span>TEACHING COLOURS · NOT TO SCALE</span></div></div>
              <div className="specimen-controls"><div className="view-switches"><button className="control-pill" aria-pressed={labels} onClick={() => setLabels((value) => !value)}><ScanLine size={17} />Labels</button><button className="control-pill" aria-pressed={context} onClick={() => setContext((value) => !value)}><Layers3 size={17} />Body context</button><button className="control-pill" aria-pressed={isolate} onClick={() => setIsolate((value) => !value)}><Focus size={17} />Isolate</button></div><button className="ac-btn ac-btn-quiet reset-camera" disabled={fallback} onClick={() => sendCamera('reset')} title="Reset the camera only"><RotateCcw size={16} />Reset view</button></div>
              <div className="camera-bar" aria-label="Keyboard camera controls"><span>CAMERA</span><div className="camera-actions">{([{ type: 'left', label: 'Rotate camera left', icon: ArrowLeft }, { type: 'right', label: 'Rotate camera right', icon: ArrowRight }, { type: 'up', label: 'Rotate camera up', icon: ArrowUp }, { type: 'down', label: 'Rotate camera down', icon: ArrowDown }, { type: 'zoom-in', label: 'Zoom in', icon: Plus }, { type: 'zoom-out', label: 'Zoom out', icon: Minus }] as const).map(({ type, label, icon: Icon }) => <button key={type} className="ac-btn ac-icon-btn" disabled={fallback} aria-label={label} title={label} onClick={() => sendCamera(type)}><Icon size={17} /></button>)}<button className="ac-btn" disabled={fallback} onClick={() => sendCamera('front')}>Front view</button></div></div>
              <div className="scene-utilities"><button onClick={resetLesson}>Reset lesson</button>{fallback ? <button onClick={retry} disabled={!supported}>{supported ? 'Retry 3D model' : 'Using the 2D diagram'}</button> : <button onClick={() => setFallback(true)}>Use 2D diagram</button>}</div>{(sceneError || !supported) && <p className="fallback-note" role="status">{supported ? 'The 3D model could not load. You can still use the 2D diagram and all lesson content.' : 'This browser does not support WebGL2. The 2D diagram includes all six organs and journey steps.'}</p>}
            </div><aside className="organ-inspector" aria-label="Organ information"><div className="inspector-heading"><span className="ac-kicker">{mode === 'journey' ? `STAGE ${step + 1} / ${STEPS.length}` : 'EXPLORING'}</span><span className="organ-number" style={{ color: organ.color }}>{String(ORGANS.findIndex((item) => item.id === selectedId) + 1).padStart(2, '0')}</span></div><article className="organ-description" aria-live="polite"><div className="organ-title"><i style={{ background: organ.color }} /><div><h2>{organ.en}</h2></div></div><p className="organ-short">{organ.short}</p>{mode === 'journey' ? <><div className="detail-section"><h3>{currentStep.action}</h3><p>{currentStep.explanation}</p></div><div className="key-idea"><Sparkles size={16} /><p>{currentStep.keyIdea}</p></div></> : <><div className="detail-section"><h3>Function</h3><p>{organ.function}</p></div><div className="detail-section"><h3>Shape and position</h3><p>{organ.structure}</p></div><div className="key-idea"><Sparkles size={16} /><p>{organ.teachingTip}</p></div></>}</article><div className="organ-list-heading"><h3>Six organs</h3><button onClick={() => { setHiddenIds([]); setIsolate(false); }}>Show all</button></div><div className="organ-list">{ORGANS.map((item, i) => <div key={item.id} className={`organ-row ${selectedId === item.id ? 'selected' : ''} ${hiddenIds.includes(item.id) ? 'organ-hidden' : ''}`}><button className="organ-select" aria-label={`Select ${item.en}`} aria-pressed={selectedId === item.id} onClick={() => onSelect(item.id)}><span className="organ-row-number">{i + 1}</span><i style={{ background: item.color }} /><span><strong>{item.en}</strong><small>{STEPS[i].action}</small></span>{selectedId === item.id && <ChevronRight size={16} />}</button><button className="organ-visibility" aria-label={`${hiddenIds.includes(item.id) ? 'Show' : 'Hide'} ${item.en}`} aria-pressed={!hiddenIds.includes(item.id)} onClick={() => toggleHidden(item.id)}>{hiddenIds.includes(item.id) ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>)}</div></aside></div>
            {mode === 'journey' && <section className="journey-console" aria-label="Food journey controls"><div className="journey-header"><div><span className="ac-kicker">THE JOURNEY OF FOOD</span><h3>{currentStep.title}</h3></div><span className={`journey-status ${playing ? 'playing' : ''}`} role="status">{playing ? 'Playing · 8 seconds per stage' : reducedMotion ? 'Static view · choose each stage' : 'Paused'}</span></div><ol className="journey-route">{STEPS.map((item, index) => <li key={item.id}><button className={step === index ? 'current' : ''} aria-current={step === index ? 'step' : undefined} onClick={() => jump(index)} aria-label={`Stage ${index + 1}: ${ORGANS[index].en}`}><span style={{ background: step === index ? ORGANS[index].color : undefined }}>{index + 1}</span><strong>{ORGANS[index].en}</strong><small>{STEPS[index].action}</small></button></li>)}</ol><div className="journey-actions"><div className="ac-row"><button className="ac-btn" disabled={step === 0} onClick={() => jump(step - 1)}><ArrowLeft size={17} />Back</button><button className="ac-btn ac-btn-primary play-button" disabled={reducedMotion} aria-label={playing ? 'Pause food journey' : 'Play food journey'} onClick={() => dispatch(playing ? { type: 'pause' } : { type: 'play', allowed: !reducedMotion })}>{playing ? <Pause size={17} /> : <Play size={17} />}{playing ? 'Pause' : 'Play'}</button><button className="ac-btn" disabled={step === STEPS.length - 1} onClick={() => jump(step + 1)}>Next<ArrowRight size={17} /></button></div><button className="ac-btn ac-btn-quiet" onClick={resetLesson}><RotateCcw size={16} />Start again</button></div>{reducedMotion && <p className="motion-note">Reduced motion is on. Use Back, Next or a stage button to explore each static view.</p>}{step === STEPS.length - 1 && !playing && <p className="motion-note">You have reached the end of the journey. Select “Start again” to explore it once more.</p>}</section>}
          </section>
          <section id="understand" className="understanding-section" aria-labelledby="understand-title"><div className="section-title"><span className="ac-kicker">UNDERSTAND</span><h2 id="understand-title">One route, different jobs</h2></div><div className="concept-cards"><article className="ac-card concept-card"><span className="concept-icon digestion-icon"><Layers3 size={23} /></span><span className="ac-caption ac-muted">BREAK FOOD DOWN</span><h3>Digestion</h3><p>Food is broken down into substances small enough for the body to absorb.</p><button onClick={() => { changeMode('journey'); jump(2); document.getElementById('explorer')?.scrollIntoView({ block: 'start' }); }}>Explore the stomach <ArrowRight size={16} /></button></article><article className="ac-card concept-card"><span className="concept-icon absorption-icon"><ArrowUp size={23} /></span><span className="ac-caption ac-muted">TAKE NUTRIENTS IN</span><h3>Absorption</h3><p>Digested nutrients pass through the intestine’s wall into the body. Most nutrients are absorbed in the small intestine.</p><button onClick={() => { changeMode('journey'); jump(3); document.getElementById('explorer')?.scrollIntoView({ block: 'start' }); }}>Explore the small intestine <ArrowRight size={16} /></button></article><article className="ac-card concept-card"><span className="concept-icon egestion-icon"><ArrowDown size={23} /></span><span className="ac-caption ac-muted">REMOVE UNDIGESTED MATERIAL</span><h3>Egestion</h3><p>The remaining material forms faeces. These are stored in the rectum and leave through the anus.</p><button onClick={() => { changeMode('journey'); jump(5); document.getElementById('explorer')?.scrollIntoView({ block: 'start' }); }}>Explore the end of the journey <ArrowRight size={16} /></button></article></div><div className="ac-alert accessory-note"><BookOpen size={21} /><p>{ACCESSORY_NOTE}</p></div></section>
          <QuickQuiz />
          <section id="resources" className="resource-section"><details className="ac-card source-details"><summary><span><ShieldCheck size={20} />Sources and model limits</span><Plus size={18} /></summary><div className="resource-content"><div><h3>What can this model help you learn?</h3><p>{MODEL_NOTE}</p><p>The model focuses on six organs and their basic functions in Primary Science 5, Unit 4.1. It does not show exact anatomical measurements or real digestion times.</p><div className="book-reference"><strong>Lesson references supplied by the teacher</strong><span>Learner’s Book PDF pages 99–101, 103–106 · Workbook pages 51–59.</span><small>The Learner’s Book pages above have been checked. Workbook references were supplied by the teacher; the original Workbook file has not been checked. This 3D activity supports the book’s hands-on model-making activity.</small></div></div><div><h3>Further reading</h3><ul>{SOURCES.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} <span aria-hidden="true">↗</span><span className="ac-sr-only"> (opens a new tab)</span></a></li>)}</ul></div></div></details></section>
          </>}
          <footer className="lesson-footer"><span>AlgoCore · Learn to understand</span><span>Primary Science 5 / {activity === 'digestive' ? 'Unit 4.1' : 'Unit 4.2'}</span></footer>
        </main>
      </div>
    </div>
  </div>;
}
