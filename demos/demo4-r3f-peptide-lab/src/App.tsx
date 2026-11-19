import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Atom,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Dna,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BEATS_1MIN,
  BEATS_3MIN,
  CITATIONS,
  UI_I18N,
} from './data/peptideCourseData';
import type { CourseMode, Lang, RepMode, SceneObjectSpec } from './types';
import { askScience3D } from './lib/r3fProtocol';
import { bioAudio } from './lib/bioAudio';
import { PeptideScene3D } from './components/PeptideScene3D';

const VALID_LANGS: Lang[] = ['en', 'zh', 'th'];

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param && VALID_LANGS.includes(param as Lang)) return param as Lang;
  try {
    const saved = localStorage.getItem('ai_course_lang');
    if (saved && VALID_LANGS.includes(saved as Lang)) return saved as Lang;
  } catch {
    // ignore storage errors
  }
  return 'en';
}

interface ChatEntry {
  id: string;
  role: 'user' | 'ai';
  text: string;
  source?: 'gemini' | 'offline-sim';
  rawJson?: string;
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());
  const [mode, setMode] = useState<CourseMode>('1min');
  const [repMode, setRepMode] = useState<RepMode>('ball-stick');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [autoCamera, setAutoCamera] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [drawerTab, setDrawerTab] = useState<'citations' | 'gemini'>('citations');

  // Gemini [3D_OBJECT] Sandbox state
  const [apiKey, setApiKey] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [aiObjects, setAiObjects] = useState<SceneObjectSpec[]>([]);
  const [chatFeed, setChatFeed] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState<boolean>(false);

  const beats = mode === '1min' ? BEATS_1MIN : BEATS_3MIN;
  const totalDuration = mode === '1min' ? 60 : 180;
  const ui = UI_I18N[lang];

  const activeBeat = useMemo(() => {
    return (
      beats.find((b) => currentTime >= b.start && currentTime < b.end) ??
      beats[beats.length - 1]
    );
  }, [beats, currentTime]);

  const prevSceneIdxRef = useRef<number>(activeBeat.sceneIdx);

  // Language persistence + parent portal postMessage listener
  const setLang = (next: Lang) => {
    setLangState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : next;
      document.title = UI_I18N[next].appTitle;
    }
    try {
      localStorage.setItem('ai_course_lang', next);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.title = ui.appTitle;
  }, [lang, ui.appTitle]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SET_LANG' && VALID_LANGS.includes(e.data.lang)) {
        setLang(e.data.lang as Lang);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Playback timer
  useEffect(() => {
    if (!playing) return;
    let rafId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setPlaying(false);
          return totalDuration;
        }
        return next;
      });
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [playing, totalDuration]);

  // Trigger audio cues on scene change
  useEffect(() => {
    if (prevSceneIdxRef.current !== activeBeat.sceneIdx) {
      prevSceneIdxRef.current = activeBeat.sceneIdx;
      if (playing && !muted) {
        bioAudio.playBeatTransition(activeBeat.sceneIdx);
        if (activeBeat.sceneIdx === 0) bioAudio.playDehydrationSnap();
        if (activeBeat.sceneIdx === 1) bioAudio.playHydrogenBond();
        if (activeBeat.sceneIdx === 3) bioAudio.playCampBurst();
      }
    }
  }, [activeBeat.sceneIdx, playing, muted]);

  const handleTogglePlay = () => {
    if (!playing) {
      setAiObjects([]);
      void bioAudio.unlock().then((ok) => {
        if (ok && !muted) bioAudio.startAmbient();
      });
      if (currentTime >= totalDuration - 0.1) {
        setCurrentTime(0);
      }
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = bioAudio.toggleMute();
    setMuted(nextMuted);
  };

  const handleSwitchMode = (nextMode: CourseMode) => {
    setAiObjects([]);
    setMode(nextMode);
    setPlaying(false);
    setCurrentTime(0);
    setAutoCamera(true);
  };

  const jumpToBeat = (startSec: number) => {
    setAiObjects([]);
    setCurrentTime(startSec);
    setAutoCamera(true);
    if (!muted) {
      const target = beats.find((b) => Math.abs(b.start - startSec) < 0.05);
      if (target) bioAudio.playBeatTransition(target.sceneIdx);
    }
  };

  const stepBeat = (dir: -1 | 1) => {
    setAiObjects([]);
    const idx = beats.findIndex((b) => b.id === activeBeat.id);
    const nextIdx = Math.max(0, Math.min(beats.length - 1, idx + dir));
    jumpToBeat(beats[nextIdx].start);
  };

  const runAiPrompt = async (text: string) => {
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    setDrawerOpen(true);
    setDrawerTab('gemini');

    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };
    setChatFeed((prev) => [...prev, userMsg]);

    try {
      const res = await askScience3D(clean, lang, apiKey);
      setAiObjects(res.objects);
      const aiMsg: ChatEntry = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: res.cleanText,
        source: res.source,
        rawJson: res.objects
          .map((o) => `[3D_OBJECT]\n${JSON.stringify(o, null, 2)}\n[/3D_OBJECT]`)
          .join('\n'),
      };
      setChatFeed((prev) => [...prev, aiMsg]);
      if (!muted) bioAudio.playAiSpawn();
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = promptInput;
    setPromptInput('');
    void runAiPrompt(text);
  };

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <div className="lab-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Dna size={19} color="#03111c" strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <h1>{ui.appTitle}</h1>
            <p>{ui.appSubtitle}</p>
          </div>
        </div>

        <div className="top-controls">
          {/* Mode: 1-Min Video vs 3-Min Interactive */}
          <div className="pill-group" role="group" aria-label="Course Mode">
            <button
              type="button"
              className={`pill-btn ${mode === '1min' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('1min')}
            >
              🎬 {ui.modeLabels['1min']}
            </button>
            <button
              type="button"
              className={`pill-btn ${mode === '3min' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('3min')}
            >
              🎓 {ui.modeLabels['3min']}
            </button>
          </div>

          {/* Molecular Representation Switch */}
          <div className="pill-group" role="group" aria-label="Molecular Style">
            {(['ball-stick', 'ribbon', 'surface'] as RepMode[]).map((rm) => (
              <button
                key={rm}
                type="button"
                className={`pill-btn amber ${repMode === rm ? 'active' : ''}`}
                title={ui.repDescriptions[rm]}
                onClick={() => setRepMode(rm)}
              >
                {ui.repLabels[rm]}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="pill-group" role="group" aria-label={ui.controls.languageLabel}>
            <button
              type="button"
              className={`pill-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`pill-btn ${lang === 'zh' ? 'active' : ''}`}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
            <button
              type="button"
              className={`pill-btn ${lang === 'th' ? 'active' : ''}`}
              onClick={() => setLang('th')}
            >
              ไทย
            </button>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setDrawerOpen((v) => !v)}
            title="Toggle Evidence & Gemini 3D Panel"
          >
            {drawerOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            <Sparkles size={14} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="workspace">
        <main className="stage-area">
          <PeptideScene3D
            mode={mode}
            currentTime={currentTime}
            activeBeat={activeBeat}
            repMode={repMode}
            showLabels={showLabels}
            autoCamera={autoCamera}
            lang={lang}
            aiObjects={aiObjects}
            onUserOrbitStart={() => setAutoCamera(false)}
          />

          {/* Top-Left Scientific Narration Card */}
          <section className="hud-caption">
            <div className="hud-badge-row">
              <span className="hud-badge">{activeBeat.badge[lang]}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {ui.repLabels[repMode]} · {ui.repDescriptions[repMode]}
              </span>
            </div>
            <h2 className="hud-title">{activeBeat.title[lang]}</h2>
            <div className="hud-subtitle">{activeBeat.subtitle[lang]}</div>
            <p className="hud-narration">{activeBeat.narration[lang]}</p>
            <div className="hud-mech">
              <strong>{ui.controls.mechanismLabel}:</strong> {activeBeat.mechanism[lang]}
            </div>
          </section>

          {/* Top-Right CPK Standard Color Legend */}
          <div className="cpk-legend">
            <div className="cpk-bar">
              <span className="atom-dot"><i style={{ background: '#94a3b8', color: '#94a3b8' }} /> C</span>
              <span className="atom-dot"><i style={{ background: '#3b82f6', color: '#3b82f6' }} /> N</span>
              <span className="atom-dot"><i style={{ background: '#ef4444', color: '#ef4444' }} /> O</span>
              <span className="atom-dot"><i style={{ background: '#f8fafc', color: '#f8fafc' }} /> H</span>
              <span className="atom-dot"><i style={{ background: '#eab308', color: '#eab308' }} /> S-S</span>
              <span className="atom-dot"><i style={{ background: '#f59e0b', color: '#f59e0b' }} /> C18</span>
            </div>
          </div>

          {/* Bottom Timeline & Controls */}
          <section className="timeline-dock">
            <div className="beat-pills">
              {beats.map((b) => {
                const isActive = b.id === activeBeat.id;
                const prog =
                  currentTime <= b.start
                    ? 0
                    : currentTime >= b.end
                      ? 100
                      : ((currentTime - b.start) / Math.max(0.01, b.end - b.start)) * 100;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`beat-pill ${isActive ? 'active' : ''}`}
                    onClick={() => jumpToBeat(b.start)}
                  >
                    <div>{b.badge[lang]} · {b.title[lang]}</div>
                    <div className="beat-pill-prog">
                      <i style={{ width: `${prog.toFixed(1)}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="transport-row">
              <button type="button" className="icon-btn active" onClick={handleTogglePlay}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
                <span>{playing ? ui.controls.pause : ui.controls.play}</span>
              </button>
              <button type="button" className="icon-btn" onClick={() => stepBeat(-1)}>
                {ui.controls.prev}
              </button>
              <button type="button" className="icon-btn" onClick={() => stepBeat(1)}>
                {ui.controls.next}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setPlaying(false);
                  setCurrentTime(0);
                  setAutoCamera(true);
                }}
                title={ui.controls.reset}
              >
                <RotateCcw size={14} />
              </button>

              <input
                type="range"
                className="scrubber"
                min={0}
                max={totalDuration}
                step={0.1}
                value={currentTime}
                aria-label={ui.controls.timelineLabel}
                onChange={(e) => {
                  setPlaying(false);
                  setCurrentTime(parseFloat(e.target.value));
                }}
              />

              <span className="time-readout">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>

              <button
                type="button"
                className={`icon-btn ${autoCamera ? 'active' : ''}`}
                onClick={() => setAutoCamera((v) => !v)}
                title="Auto-Director Camera"
              >
                <Camera size={14} />
              </button>
              <button
                type="button"
                className={`icon-btn ${showLabels ? 'active' : ''}`}
                onClick={() => setShowLabels((v) => !v)}
                title="3D Annotations"
              >
                <Tag size={14} />
              </button>
              <button
                type="button"
                className={`icon-btn ${!muted ? 'active' : ''}`}
                onClick={handleToggleMute}
                title={muted ? ui.controls.unmute : ui.controls.mute}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </section>
        </main>

        {/* Right Side Drawer: Authoritative Papers + Gemini [3D_OBJECT] Sandbox */}
        <aside className={`side-drawer ${drawerOpen ? '' : 'collapsed'}`}>
          <div className="drawer-tabs">
            <button
              type="button"
              className={`drawer-tab ${drawerTab === 'citations' ? 'active' : ''}`}
              onClick={() => setDrawerTab('citations')}
            >
              <BookOpen size={14} />
              <span>{ui.controls.citationsLabel}</span>
            </button>
            <button
              type="button"
              className={`drawer-tab ${drawerTab === 'gemini' ? 'active' : ''}`}
              onClick={() => setDrawerTab('gemini')}
            >
              <Atom size={14} />
              <span>{ui.aiLab.protocolBadge}</span>
            </button>
          </div>

          {drawerTab === 'citations' ? (
            <div className="drawer-body">
              <div className="disclaimer-bar">{ui.disclaimer}</div>
              {CITATIONS.map((c) => {
                const isActive = activeBeat.citationIds.includes(c.id);
                return (
                  <article
                    key={c.id}
                    className={`citation-card ${isActive ? 'highlighted' : ''}`}
                  >
                    <div className="citation-head">
                      <span className="citation-journal">
                        {c.journal} · {c.year}
                      </span>
                      {c.pdb && (
                        <span className="citation-pdb">
                          {ui.controls.pdbBadge}: {c.pdb}
                        </span>
                      )}
                    </div>
                    <h3 className="citation-title">{c.title}</h3>
                    <div className="citation-authors">{c.authors}</div>
                    <p className="citation-takeaway">{c.takeaway[lang]}</p>
                    <a
                      className="citation-link"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={12} />
                      <span>{ui.controls.openCitation}</span>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="drawer-body">
              <div className="api-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.82rem' }}>{ui.aiLab.panelTitle}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--teal)' }}>
                    {ui.aiLab.objectsCountLabel}: {aiObjects.length}
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{ui.aiLab.panelSubtitle}</p>
                <label htmlFor="gemini-api-key">{ui.aiLab.apiKeyLabel}</label>
                <input
                  id="gemini-api-key"
                  type="password"
                  className="api-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={ui.aiLab.apiKeyPlaceholder}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                  {ui.aiLab.apiKeyHint}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, marginBottom: '6px', color: '#cbd5e1' }}>
                  {ui.aiLab.presetsTitle}
                </div>
                <div className="prompt-chips">
                  {ui.presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="prompt-chip"
                      onClick={() => void runAiPrompt(p.prompt[lang])}
                    >
                      ✨ {p.label[lang]}
                    </button>
                  ))}
                  {aiObjects.length > 0 && (
                    <button
                      type="button"
                      className="prompt-chip"
                      style={{ borderColor: 'rgba(244,63,94,0.4)', color: '#fda4af' }}
                      onClick={() => setAiObjects([])}
                    >
                      <Trash2 size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {ui.aiLab.clearObjectsButton}
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-feed">
                {chatFeed.length === 0 ? (
                  <div className="citation-card" style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
                    {ui.aiLab.emptyCanvasHint}
                  </div>
                ) : (
                  chatFeed.map((msg) => (
                    <div key={msg.id} className={`chat-msg ${msg.role}`}>
                      {msg.source && (
                        <div style={{ fontSize: '0.66rem', color: 'var(--teal)', marginBottom: 4 }}>
                          {msg.source === 'gemini' ? ui.aiLab.sourceGemini : ui.aiLab.sourceOffline}
                        </div>
                      )}
                      <div>{msg.text}</div>
                      {msg.rawJson && (
                        <details style={{ marginTop: 6 }}>
                          <summary style={{ fontSize: '0.7rem', color: 'var(--cyan)', cursor: 'pointer' }}>
                            {ui.aiLab.protocolJsonTitle}
                          </summary>
                          <pre className="json-preview">{msg.rawJson}</pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form className="chat-form" onSubmit={handleFormSubmit}>
                <input
                  className="api-input"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={ui.aiLab.promptPlaceholder}
                  disabled={sending}
                />
                <button type="submit" className="icon-btn active" disabled={sending}>
                  <Send size={13} />
                  <span>{sending ? ui.aiLab.sendingButton : ui.aiLab.sendButton}</span>
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
