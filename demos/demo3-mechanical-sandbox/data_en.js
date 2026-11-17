/**
 * Demo 3: Interactive Physics & Mechanical Sandbox - English Data Pack
 * Pure native JS module with zero external dependencies.
 * Registers onto (root.SANDBOX_DATA_I18N = root.SANDBOX_DATA_I18N || {}).en
 */
(function (root) {
  "use strict";

  // ==================== Mode A: LLM Probability Pinball Scenarios (4 × 3 Rounds) ====================
  const MODE_A_SCENARIOS = [
    {
      id: "poem",
      title: "Classical English Poetry",
      badge: "Literary Tone / Creative Divergence",
      sub: "Shall I compare thee to a summer's ___",
      rounds: [
        {
          promptPrefix: "Shall I compare thee to a summer's ",
          hint: "Round 1: Under strong corpus memory, 'day' holds a towering logit; raising Temperature wakes up long-tail outliers.",
          candidates: [
            { word: "day", logit: 5.2, risk: 0, note: "Canonical Shakespeare Sonnet 18 line—near-deterministic prior" },
            { word: "dawn", logit: 3.7, risk: 0, note: "Close poetic imagery; surfaces occasionally at mild temperature" },
            { word: "breeze", logit: 2.3, risk: 1, note: "Plausible metaphor, slightly softens the classic iambic cadence" },
            { word: "gold", logit: 1.4, risk: 0, note: "Warm Elizabethan imagery with creative poetic license" },
            { word: "salad", logit: 0.3, risk: 1, note: "Summer food clash—abruptly breaks lyrical mood" },
            { word: "pizza", logit: -0.7, risk: 2, note: "Thermal drift: modern fast food invades 1609 verse" },
            { word: "WiFi", logit: -1.8, risk: 2, note: "Anachronism hallucination: router jargon crashes the sonnet" },
            { word: "alien", logit: -2.9, risk: 2, note: "Severe tail hallucination: context attention collapsed" }
          ]
        },
        {
          promptPrefix: "; thou art more lovely and more ",
          hint: "Round 2: Your Round-1 choice is now baked into the context! Watch how the model keeps rationalizing any weird prior word.",
          candidates: [
            { word: "temperate", logit: 5.3, risk: 0, note: "Exact canonical meter and rhyme setup" },
            { word: "radiant", logit: 3.6, risk: 0, note: "Faithful modern poetic synonym" },
            { word: "serene", logit: 2.5, risk: 0, note: "Preserves classical grace and rhythm" },
            { word: "loud", logit: 1.1, risk: 1, note: "Grammatically valid, yet jolts the tender tone" },
            { word: "crunchy", logit: 0.2, risk: 1, note: "Sensory mismatch unless extending a food hallucination" },
            { word: "buffered", logit: -0.8, risk: 2, note: "Hallucination snowball: inventing network jargon mid-poem" },
            { word: "taxable", logit: -1.9, risk: 2, note: "High-noise perturbation injects bureaucratic jargon" },
            { word: "quantum", logit: -3.0, risk: 2, note: "Forced sci-fi derailment breaks the literary voice" }
          ]
        },
        {
          promptPrefix: ", where rough winds do shake the darling ",
          hint: "Round 3: Final closure! Observe whether three cumulative turns end in timeless verse or an absurd fever dream.",
          candidates: [
            { word: "buds", logit: 5.4, risk: 0, note: "Exact sonnet closure ('darling buds of May')" },
            { word: "blooms", logit: 3.8, risk: 0, note: "Near-synonym preserving botanical imagery" },
            { word: "leaves", logit: 2.4, risk: 0, note: "Coherent seasonal variation" },
            { word: "snacks", logit: 0.9, risk: 1, note: "Casual diction shatters Elizabethan tone" },
            { word: "stocks", logit: -0.3, risk: 2, note: "Wall Street anxiety intrudes on classical love poetry" },
            { word: "GPUs", logit: -1.4, risk: 2, note: "Context-polluted tech gibberish" },
            { word: "UFOs", logit: -2.4, risk: 2, note: "Multi-turn autoregressive hallucination cascade" },
            { word: "bugs", logit: -3.3, risk: 2, note: "Total persona collapse into software panic" }
          ]
        }
      ]
    },
    {
      id: "science",
      title: "Scientific Fact Reasoning",
      badge: "Strict Facts / Low-Temp Required",
      sub: "At standard sea-level pressure, pure water boils at ___",
      rounds: [
        {
          promptPrefix: "At standard sea-level pressure, pure water boils at ",
          hint: "Round 1: Factual science Q&A demands ultra-low Temperature (≤0.3) and tight Top-K to block guesswork.",
          candidates: [
            { word: "100°C", logit: 5.5, risk: 0, note: "Exact standard physical constant" },
            { word: "212°F", logit: 4.1, risk: 0, note: "Equivalent Fahrenheit textbook constant" },
            { word: "373.15K", logit: 2.6, risk: 0, note: "Rigorous thermodynamic Kelvin equivalent" },
            { word: "99.97°C", logit: 1.3, risk: 0, note: "Precise ITS-90 international scale value" },
            { word: "80°C", logit: -0.2, risk: 2, note: "Numeric hallucination: confused with altitude or ethanol" },
            { word: "-5°C", logit: -1.4, risk: 2, note: "Flatly contradicts basic thermodynamics" },
            { word: "nitrogen", logit: -2.3, risk: 2, note: "Category error: answers with a substance instead of a temperature" },
            { word: "quantum", logit: -3.2, risk: 2, note: "Pseudoscientific buzzword hallucination" }
          ]
        },
        {
          promptPrefix: "; on Mount Everest's summit, its boiling point ",
          hint: "Round 2: Causal reasoning link. Notice how high temperature makes the model forget the 'lower air pressure' premise.",
          candidates: [
            { word: "drops", logit: 5.2, risk: 0, note: "Accurate causal physics: lower pressure → lower boiling point" },
            { word: "~71°C", logit: 3.9, risk: 0, note: "High-value quantitative estimate at ~8,849 m" },
            { word: "falls", logit: 2.7, risk: 0, note: "Clear and scientifically accurate verb" },
            { word: "stays", logit: 0.4, risk: 2, note: "Ignores altitude pressure variable—false claim" },
            { word: "rises", logit: -0.6, risk: 2, note: "Inverted causality—classic fluent AI hallucination" },
            { word: "freezes", logit: -1.6, risk: 2, note: "Confuses boiling point with freezing point" },
            { word: "melts", logit: -2.6, risk: 2, note: "Nonsensical phase-transition mix-up" },
            { word: "vanishes", logit: -3.4, risk: 2, note: "Total semantic divergence under high thermal noise" }
          ]
        },
        {
          promptPrefix: ", because high-altitude air is ",
          hint: "Round 3: Test whether the causal explanation stays coherent with the prior two rounds.",
          candidates: [
            { word: "thin", logit: 5.3, risk: 0, note: "Completes the atmospheric-pressure explanation accurately" },
            { word: "less dense", logit: 3.8, risk: 0, note: "Sound physical phrasing for lower vapor resistance" },
            { word: "low-O2", logit: 2.2, risk: 1, note: "True at altitude, yet misses pressure as the direct cause" },
            { word: "freezing", logit: 0.3, risk: 1, note: "Confuses ambient cold air with vapor-pressure physics" },
            { word: "heavier", logit: -1.0, risk: 2, note: "Fabricates an inverted physical law" },
            { word: "singing", logit: -2.0, risk: 2, note: "Poetic anthropomorphism polluting a science answer" },
            { word: "sugary", logit: -3.0, risk: 2, note: "Completely unrelated absurd attribution" },
            { word: "WiFi-free", logit: -3.9, risk: 2, note: "Pure fabrication" }
          ]
        }
      ]
    },
    {
      id: "code",
      title: "Code Autocompletion",
      badge: "Engineering Syntax / Precision & Safety",
      sub: "async function fetchUser(id) { const res = await ___",
      rounds: [
        {
          promptPrefix: "async function fetchUser(id) { const res = await ",
          hint: "Round 1: Code generation fears 'API hallucination' (inventing nonexistent methods). Keep Temperature low.",
          candidates: [
            { word: "fetch(`/api/users/${id}`)", logit: 5.3, risk: 0, note: "Standard browser Fetch API—zero hallucination" },
            { word: "apiClient.getUser(id)", logit: 3.8, risk: 0, note: "Clean engineering wrapper call" },
            { word: "axios.get(`/users/${id}`)", logit: 2.6, risk: 0, note: "Common third-party client (assumes axios installed)" },
            { word: "db.users.findById(id)", logit: 1.3, risk: 1, note: "Boundary leak: looks like server ORM inside client code" },
            { word: "Promise.resolve(null)", logit: 0.2, risk: 1, note: "Dead no-op placeholder returning null" },
            { word: "sleep(9999)", logit: -1.0, risk: 2, note: "Pointless blocking stub" },
            { word: "eval(id)", logit: -2.1, risk: 2, note: "Critical code-injection security vulnerability" },
            { word: "coffee.brew(id)", logit: -3.1, risk: 2, note: "Phantom library hallucination: nonexistent module" }
          ]
        },
        {
          promptPrefix: "; return res.",
          hint: "Round 2: Property access completion. High temperature frequently fabricates fake Response methods!",
          candidates: [
            { word: "json()", logit: 5.2, risk: 0, note: "Matches standard Fetch Response interface" },
            { word: "data", logit: 3.9, risk: 0, note: "Matches wrapped HTTP client response shape" },
            { word: "ok ? res.json() : null", logit: 2.4, risk: 0, note: "Safer defensive status check" },
            { word: "text()", logit: 1.0, risk: 1, note: "Returns raw string—may break JSON callers" },
            { word: "status", logit: -0.2, risk: 1, note: "Drops the user payload and returns only an HTTP code" },
            { word: "undefined", logit: -1.1, risk: 2, note: "Runtime crash / invalid property access" },
            { word: "dropAllTables()", logit: -2.2, risk: 2, note: "Destructive hallucinated method" },
            { word: "summonDragon()", logit: -3.2, risk: 2, note: "Purely fictional method hallucination" }
          ]
        },
        {
          promptPrefix: "; } // Error-handling tip: ",
          hint: "Round 3: Engineering review comment—watch whether poor earlier code drags recommendations off the rails.",
          candidates: [
            { word: "wrap in try/catch & check res.ok", logit: 5.1, risk: 0, note: "Production-grade best practice" },
            { word: "add AbortController timeout", logit: 3.7, risk: 0, note: "Senior reliability engineering advice" },
            { word: "return safe fallback object", logit: 2.3, risk: 0, note: "Reasonable graceful degradation" },
            { word: "ignore errors & continue", logit: 0.1, risk: 1, note: "Anti-pattern that hides silent bugs" },
            { word: "console.log('pray it works')", logit: -1.1, risk: 2, note: "Meme comment unfit for production codebases" },
            { word: "reboot user laptop", logit: -2.2, risk: 2, note: "Absurd operational advice" },
            { word: "log raw API keys", logit: -3.1, risk: 2, note: "Severe security & compliance violation" },
            { word: "quit coding forever", logit: -3.9, risk: 2, note: "Complete off-topic derailment" }
          ]
        }
      ]
    },
    {
      id: "history",
      title: "Historical Fact Q&A",
      badge: "Hallucination Hotspot / Anachronism",
      sub: "In 49 BCE, after crossing the Rubicon, Julius Caesar marched on ___",
      rounds: [
        {
          promptPrefix: "In 49 BCE, after crossing the Rubicon River, Julius Caesar marched on ",
          hint: "Round 1: History Q&A often triggers 'anachronism hallucinations' (placing later cities or empires into ancient Rome).",
          candidates: [
            { word: "Rome", logit: 5.4, risk: 0, note: "Historically exact (sparked the Roman Civil War)" },
            { word: "Italy", logit: 3.6, risk: 0, note: "Broadly accurate regional campaign target" },
            { word: "Ariminum", logit: 1.9, risk: 1, note: "First garrison town taken, though incomplete as main goal" },
            { word: "Constantinople", logit: 0.8, risk: 2, note: "Classic anachronism! Founded by Constantine ~380 years later" },
            { word: "London", logit: -0.6, risk: 2, note: "Geographic & chronological mix-up with later Britain" },
            { word: "Napoleon", logit: -1.7, risk: 2, note: "1,800-year historical collision" },
            { word: "Cthulhu", logit: -2.6, risk: 2, note: "Cosmic fiction invading primary history" },
            { word: "Cybertron", logit: -3.5, risk: 2, note: "Total sci-fi nonsense" }
          ]
        },
        {
          promptPrefix: ", sparking a civil war against rival general ",
          hint: "Round 2: Watch plausible-sounding distractors like 'Mark Antony' or 'Spartacus'—fluent prose hiding factual mix-ups!",
          candidates: [
            { word: "Pompey", logit: 5.4, risk: 0, note: "Historically exact: Pompey the Great led the Senate forces" },
            { word: "Pompey Magnus", logit: 3.7, risk: 0, note: "Accurate full Roman title of Caesar's main rival" },
            { word: "Mark Antony", logit: 1.7, risk: 2, note: "Famous mix-up! Antony was Caesar's ally here, not rival" },
            { word: "Spartacus", logit: 0.6, risk: 2, note: "Anachronism: Spartacus died in 71 BCE, 22 years earlier" },
            { word: "Genghis Khan", logit: -1.1, risk: 2, note: "Cross-millennium, cross-continent hallucination" },
            { word: "Darth Vader", logit: -2.2, risk: 2, note: "Pop-culture invasion" },
            { word: "Einstein", logit: -3.0, risk: 2, note: "Science-history mashup fabrication" },
            { word: "Godzilla", logit: -3.7, risk: 2, note: "Absurd monster crossover" }
          ]
        },
        {
          promptPrefix: ", and ultimately reshaping the ancient ",
          hint: "Round 3: Check whether the full historical arc finishes in rigorous history or absurd fan fiction.",
          candidates: [
            { word: "Roman Republic", logit: 5.3, risk: 0, note: "Exact constitutional turning point" },
            { word: "Mediterranean world", logit: 3.8, risk: 0, note: "Accurate geopolitical framing" },
            { word: "Byzantine Empire", logit: 0.4, risk: 2, note: "Anachronism: Eastern empire emerged centuries later" },
            { word: "Space Station", logit: -1.1, risk: 2, note: "Sci-fi derailment" },
            { word: "WiFi Grid", logit: -2.2, risk: 2, note: "Modern infrastructure hallucination" },
            { word: "Jurassic Park", logit: -3.1, risk: 2, note: "Complete comedic drift" },
            { word: "Bitcoin Ledger", logit: -3.8, risk: 2, note: "Crypto anachronism" },
            { word: "Mars Colony", logit: -4.2, risk: 2, note: "Off-planet finale" }
          ]
        }
      ]
    }
  ];

  // ==================== Mode B: Cognitive Alchemy Forge (4 Frontier Domains × 4 Lenses) ====================
  const MODE_B_PERSPECTIVES = [
    {
      id: "designer",
      name: "Visual Designer",
      tag: "Aesthetic Translation · Signal Clarity",
      desc: "Turns cold, opaque engineering black boxes into visual products people grasp in three seconds—and feel excited to use."
    },
    {
      id: "teacher",
      name: "High School Teacher",
      tag: "Concept Scaffolding · Learning Flow",
      desc: "Knows exactly where beginners get stuck and builds 'understand-it-in-15-minutes' interactive labs and bootcamps."
    },
    {
      id: "finance",
      name: "Financial Auditor",
      tag: "Unit Economics · Risk Pricing",
      desc: "Spots hidden cost curves, insurance gaps, fraud vectors, and exactly who will pay real money for measurable risk reduction."
    },
    {
      id: "gamer",
      name: "Senior Game Designer",
      tag: "Flow Loops · Dopamine Feedback",
      desc: "Transforms tedious, high-failure real-world workflows using quests, instant feedback, and competitive leaderboards."
    }
  ];

  const MODE_B_DOMAINS = [
    {
      id: "synthetic_bio",
      name: "Synthetic Biology",
      short: "Genetic Circuits / Cell-Free Factories",
      jargons: [
        { term: "CRISPR Gene Circuits", plain: "Programming living cells to run tiny biological if-else logic gates" },
        { term: "Cell-Free Expression", plain: "Extracting the cell's protein assembly line into a test tube so you skip growing live bacteria" },
        { term: "Metabolic Flux Optimization", plain: "Widening congested biochemical highways inside a microbe to boost target yield" }
      ],
      essences: [
        { title: "First Principle 01 | DNA Is Just Programmable Base-4 Code", body: "A-T-G-C base pairs act as a chemical hard drive; synthetic biology assembles standard parts into self-replicating micro-factories." },
        { title: "First Principle 02 | The Real Bottleneck Isn't Editing Genes—It's Slow Iteration", body: "Growing wet-lab colonies takes days per trial. Anyone who halves simulation, scheduling, or failure triage owns the chokepoint." },
        { title: "First Principle 03 | Consumer Adoption Runs on Safety & Storytelling", body: "Shoppers recoil at 'GMO', yet happily buy 'cruelty-free collagen' or 'precision-brewed vanilla' when the story is transparent." }
      ],
      socraticSteps: [
        { q: "Q1 · Strip Away the Jargon", a: "If an engineered microbe is just a 'micro-brewery running on sugar water', what is it actually selling? Not buzzwords—cheaper, cleaner molecules (fragrances, skincare peptides, pharma intermediates)." },
        { q: "Q2 · Pinpoint the Counter-Intuitive Bottleneck", a: "Biotech teams aren't short on academic papers; they bleed 90% of their week manually cleaning messy assay sheets and failing to explain molecule ROI to non-scientist buyers and investors." },
        { q: "Q3 · 72-Hour Cross-Domain Wedge", a: "You don't need a $1M DNA synthesizer! Pair open biological databases with AI translation to build interactive molecule storyboards or yield risk calculators for beauty brands and labs." }
      ],
      pains: [
        { forId: "designer", title: "Lab software looks stuck in 1995; beauty & food buyers can't visualize molecule value", body: "Scientists pitch grey plasmid charts that put brand directors and investors to sleep—stalling commercial deals." },
        { forId: "teacher", title: "Interdisciplinary talent gap: coders don't know wet labs, biologists fear Python", body: "Textbooks lag years behind industry, intimidating IB/AP students with Latin names instead of drag-and-drop circuit sandboxes." },
        { forId: "finance", title: "Scale-up burn is a black box: VCs & insurers can't price 'flask-to-fermenter' failure", body: "A strain thriving in a 100 mL flask often collapses in a 10,000 L vat, yet investors lack standardized unit-economics audit tools." },
        { forId: "gamer", title: "Wet-lab iteration has a 99% failure rate and soul-crushing pipetting monotony", body: "Researchers burn out repeating tiny plate screens, starved for rapid simulation loops and crowdsourced pathway optimization." }
      ]
    },
    {
      id: "bci",
      name: "Brain-Computer Interface",
      short: "Flexible Electrodes / Intent Decoding",
      jargons: [
        { term: "Local Field Potential (LFP)", plain: "The low-frequency electrical hum produced by thousands of neurons chatting together" },
        { term: "Flexible Polyimide Probes", plain: "Micro-thin ribbons as soft as cling wrap that flex with brain tissue instead of scarring it" },
        { term: "Motor-Intent Neural Decoder", plain: "An AI translator converting brainwave bursts into cursor moves or robotic grip commands" }
      ],
      essences: [
        { title: "First Principle 01 | It's Microvolt Noise Filtering & Translation", body: "Neural signals measure millionths of a volt—one eye blink or jaw clench creates a tsunami of noise. Signal-to-noise ratio is king." },
        { title: "First Principle 02 | Calibration UX Matters More Than Raw Electrode Count", body: "Every brain folds differently. Twenty tedious minutes of daily setup determines whether users love the headset or toss it in a drawer." },
        { title: "First Principle 03 | Non-Invasive Focus & Sleep Loops Dwarf Surgical Niches", body: "Brain implants serve vital clinical cases, while millions of students and knowledge workers want lightweight headbands for calm focus." }
      ],
      socraticSteps: [
        { q: "Q1 · Strip Away the Jargon", a: "Drop the sci-fi telepathy hype: consumer BCIs are basically 'heart-rate watches for your forehead', reading attention drift, stress load, and drowsiness." },
        { q: "Q2 · Pinpoint the Counter-Intuitive Bottleneck", a: "Open-SDK EEG headbands already cost under $150—so why doesn't everyone wear one? Because their apps only show jagged hospital line charts nobody knows how to act on." },
        { q: "Q3 · 72-Hour Cross-Domain Wedge", a: "Skip building custom chips! Stream data from an off-the-shelf EEG headband (or simulated sample stream) and spend 72 hours crafting one delightful human-centered app layer." }
      ],
      pains: [
        { forId: "designer", title: "EEG apps look like ICU monitors, making healthy wearers feel like hospital patients", body: "Stark clinical waveforms and clumsy headgear kill everyday aesthetic appeal and spark social stigma." },
        { forId: "teacher", title: "Students can't feel when their focus drifts, turning study sessions into nagging battles", body: "Saying 'pay attention!' gives zero biofeedback—learners need calm visual mirrors showing flow vs. cognitive overload." },
        { forId: "finance", title: "High-stakes operators (long-haul drivers, shift traders) lack objective fatigue guardrails", body: "Drowsy-eye cameras trigger too late; spotting neural micro-sleep 10 minutes earlier prevents catastrophic fleet and trading losses." },
        { forId: "gamer", title: "Stroke motor-imagery rehab and EEG calibration are so boring patients quit in 3 days", body: "Imagining 'squeeze right hand' 500 times at a blank screen feels like punishment—it desperately needs game loops." }
      ]
    },
    {
      id: "space_debris",
      name: "Orbital Debris Capture",
      short: "LEO Sweepers / Compliant Arms",
      jargons: [
        { term: "Kessler Syndrome", plain: "A domino cascade where space junk smashes satellites into more junk, trapping Earth in a shrapnel shell" },
        { term: "Non-Cooperative Tumbling Target", plain: "A dead, unpowered satellite spinning wildly in zero-G with zero docking beacons" },
        { term: "Electrodynamic Tether De-Orbit", plain: "Trailing a conductive wire off junk so Earth's magnetic field brakes it into burning up on reentry" }
      ],
      essences: [
        { title: "First Principle 01 | Zero-G Angular Momentum Is Unforgiving at 7.8 km/s", body: "Dead satellites spin unpredictably at 10× rifle-bullet speed—grabbing one rigidly shatters both chaser and target." },
        { title: "First Principle 02 | Minutes of Capture Require Months of Ground Simulation", body: "Every launch costs millions; ground digital twins, collision risk pricing, and trajectory sandboxes carry massive daily demand." },
        { title: "First Principle 03 | Real Revenue Comes from Insurance & Licenses, Not 'Space Charity'", body: "Operators don't pay out of altruism—they pay to protect active revenue satellites and satisfy orbital licensing mandates." }
      ],
      socraticSteps: [
        { q: "Q1 · Strip Away the Jargon", a: "Orbital debris removal is 'highway tow trucks plus air-traffic radar'—except every lane moves at 28,000 km/h and one fender-bender ruins the entire highway." },
        { q: "Q2 · Pinpoint the Counter-Intuitive Bottleneck", a: "Robotic-arm engineers don't lack CAD models; the market stalls because insurers can't price close-approach risk cleanly and students/executives can't visualize 3D orbital mechanics." },
        { q: "Q3 · 72-Hour Cross-Domain Wedge", a: "Tap free Space-Track / CelesTrak orbital TLE feeds—zero rockets needed—to ship an interactive risk dashboard, insurer calculator, or physics game in 72 hours." }
      ],
      pains: [
        { forId: "designer", title: "Mission control screens drown decision-makers in cryptic green coordinate tables", body: "Executives and regulators struggle to grasp 12-hour conjunction risk and tumbling geometry from raw orbital numbers." },
        { forId: "teacher", title: "High school gravitation lessons feel like dry algebra with zero orbital intuition", body: "Students memorize escape velocity formulas without ever feeling how Hohmann transfers or debris avoidance actually behave." },
        { forId: "finance", title: "Satellite insurance underwriting relies on coarse averages despite exploding LEO congestion", body: "Reinsurers lack real-time orbital traffic congestion indices and fuel-burn avoidance ledgers per inclination shell." },
        { forId: "gamer", title: "Debris mission planning moves slowly; indie puzzle minds have no sandbox to optimize routes", body: "Capturing five tumbling boosters under brutal delta-V fuel limits is naturally one of the coolest hard-sci-fi strategy puzzles." }
      ]
    },
    {
      id: "ai_exoskeleton",
      name: "AI Elder Exoskeletons",
      short: "Assistive Myoelectric Suits / Ultra-Light",
      jargons: [
        { term: "sEMG Surface Sensors", plain: "Skin patches reading muscle electrical sparks milliseconds before your leg actually lifts" },
        { term: "Compliant Bowden-Cable Drive", plain: "Routing heavy motor torque from a waist pack down bicycle-style cables so knees stay feather-light" },
        { term: "Human-Robot Damping Control", plain: "Smoothly boosting normal steps while instantly locking joints like a crutch the millisecond balance slips" }
      ],
      essences: [
        { title: "First Principle 01 | Seniors Don't Reject Help—They Reject Looking 'Frail'", body: "Exposed metal struts and hazard stripes trigger stigma at the park; soft fabric braces hidden under trousers get worn proudly." },
        { title: "First Principle 02 | Motors Are Cheap; Learning Each Senior's Gait Is Hard", body: "Every knee wears asymmetrically. On-device AI must adapt gently to an elder's cadence within the first few walks." },
        { title: "First Principle 03 | The Buyer (Adult Kids / Clinics) ≠ The Wearer (Seniors)", body: "Wearers need zero-button dignity and comfort; buyers need clear fall-prevention proof and effortless weekly peace of mind." }
      ],
      socraticSteps: [
        { q: "Q1 · Strip Away the Jargon", a: "Forget Iron Man armor: an elder exoskeleton is 'smart powered leggings' built for one priceless outcome—buying ten extra years of walking to the market independently." },
        { q: "Q2 · Pinpoint the Counter-Intuitive Bottleneck", a: "Hardware teams build impressive actuators that still collect dust in closets because manuals read like engineering theses, straps take 5 minutes to buckle, and families fear wasting money." },
        { q: "Q3 · 72-Hour Cross-Domain Wedge", a: "Use browser webcam pose estimation (MediaPipe) or open IMU gait datasets to prototype elder-friendly onboarding, clinic pay-per-step billing, or joyful walking motivation." }
      ],
      pains: [
        { forId: "designer", title: "Exposed wires and industrial yellow decals make seniors feel strapped into medical gear", body: "Clinical hardware design triggers embarrassment outdoors; seniors need tailored textile wrapping and warm zero-jargon audio cues." },
        { forId: "teacher", title: "Physiotherapists are overbooked; families & care aides can't calibrate gait modes at home", body: "Caregivers face dozens of cryptic controller sliders without friendly, step-by-step voice coaching." },
        { forId: "finance", title: "$2,000+ retail stickers stall home sales while care homes lack pay-per-walk risk ledgers", body: "Families dread buying dusty gear and factories fear extending credit; metered 'safe-step + fall-claim reduction' billing unlocks adoption." },
        { forId: "gamer", title: "Post-surgery leg rehab is painful and repetitive, causing seniors to skip daily walks", body: "Without gentle pride and emotional reward, seniors stay seated out of fear—accelerating muscle loss." }
      ]
    }
  ];

  // ==================== 4 × 4 Cross-Disciplinary Project Matrix ====================
  const MODE_B_MATRIX = {
    synthetic_bio: {
      designer: {
        code: "UNICORN-BIO-DES",
        name: "BioStory Studio · Living Molecule Visual Narratives",
        pitch: "Replace drab 1990s plasmid viewers with interactive 3D web canvases that translate engineered fermentation strains into clear, consumer-ready stories for skincare and food brands.",
        leverage: "Open-source Mol* protein viewer wrapper + AI science-to-story pipeline + embeddable WebGL brand templates",
        mvp72h: "Day 1: Audit 3 clean-beauty or bio-ingredient startup pages whose science diagrams confuse buyers. Day 2: Build one interactive rotatable molecule card explaining efficacy cleanly. Day 3: Pitch their marketing lead a pilot.",
        monetization: "Custom interactive ingredient microsites and investor pitch visual kits ($1,500–$4,000 per project)."
      },
      teacher: {
        code: "UNICORN-BIO-EDU",
        name: "CellCraft Lab · Drag-and-Drop Gene Circuit Sandbox",
        pitch: "Turn memorized IB/AP Biology promoters and operons into a playful browser LEGO sandbox where high schoolers wire living circuits and debug failure modes.",
        leverage: "Curated iGEM Registry BioBricks + lightweight browser rule engine + AI Socratic lab tutor",
        mvp72h: "Day 1: Script 1 starter quest ('make E. coli glow green when heavy metals appear'). Day 2: Ship a 4-step clickable web puzzle. Day 3: Recruit 20 high schoolers or iGEM rookies to test a $29 weekend workshop.",
        monetization: "Cohort bootcamps for international school & iGEM teams ($49/student) plus annual school department licenses."
      },
      finance: {
        code: "UNICORN-BIO-FIN",
        name: "FermentAudit · Bio-Scale-Up Unit Economics Engine",
        pitch: "Give climate-tech VCs and specialty underwriters a 30-minute audit desk that stress-tests lab titer claims against real 10,000 L fermentation cost decay curves.",
        leverage: "Public feedstock price feeds + AI literature yield extraction + Monte Carlo unit-economics (UE) sensitivity model",
        mvp72h: "Day 1: Compile scale-up cost curves for 5 benchmark bio-chemicals. Day 2: Build a clean calculator flagging negative gross margins from titer/recovery inputs. Day 3: Demo to 2 deep-tech analysts for feedback.",
        monetization: "Annual diligence SaaS seats for deep-tech funds and per-deal technical-economic audit briefs."
      },
      gamer: {
        code: "UNICORN-BIO-GAM",
        name: "BioTycoon · Cellular Factory Strategy Simulator",
        pitch: "Turn metabolic flux balancing into an addictive Factorio-style browser sim—while harvesting top player routing heuristics to inspire real pathway design.",
        leverage: "Lightweight Canvas pathway flow engine + simplified real stoichiometry tables + global efficiency leaderboard",
        mvp72h: "Day 1: Abstract microbial vanillin synthesis into 6 nodes and 3 competing enzymes. Day 2: Build a playable 10-minute web puzzle balancing heat, toxins, and yield. Day 3: Launch on itch.io & bio forums to measure retention.",
        monetization: "Indie game purchase ($9) plus sponsored 'Optimal Strain Design' hackathons with biotech incubators."
      }
    },
    bci: {
      designer: {
        code: "UNICORN-BCI-DES",
        name: "AuraWave · Ambient Neural Light & Sound Companion",
        pitch: "Ditch scary hospital squiggles—transform consumer EEG focus and calm telemetry into soothing desktop fluid light art and adaptive generative soundscapes.",
        leverage: "WebBluetooth open EEG stream + Canvas/WebGL organic shaders + Web Audio generative drone synth",
        mvp72h: "Day 1: Connect a $120 consumer headband (or simulated EEG stream) in browser. Day 2: Craft 3 serene 'deep-sea breathwork' visual themes. Day 3: Post a 30-second real-time color-shift demo on TikTok/Instagram to validate waitlists.",
        monetization: "One-time desktop art companion license ($15) plus co-branded theme packs bundled with EEG hardware makers."
      },
      teacher: {
        code: "UNICORN-BCI-EDU",
        name: "FocusMirror · Exam-Prep Attention Biofeedback Coach",
        pitch: "Replace nagging with a 5-minute gentle EEG focus mirror that lets IB/AP exam students literally see mind-wandering happen and rebuild deep focus like a muscle.",
        leverage: "Low-cost single-channel EEG stream + AI study reflection log + distraction-free Pomodoro timer",
        mvp72h: "Day 1: Script a 25-minute deep-study protocol for evening study blocks. Day 2: Build a minimal web gauge logging focus streaks and drift triggers. Day 3: Test with 3 high school students and compare past-paper throughput.",
        monetization: "21-day guided focus cohort ($39/month software or bundled headband rental)."
      },
      finance: {
        code: "UNICORN-BCI-FIN",
        name: "NeuroGuard · High-Stakes Cognitive Fatigue Sentinel",
        pitch: "Protect logistics fleets and night-shift desks by flagging EEG micro-sleep signatures 15 minutes before costly human errors or crashes occur.",
        leverage: "Open fatigue EEG Theta/Alpha ratio classifier + shift-dispatch webhook alerts + loss-prevention audit ledger",
        mvp72h: "Day 1: Benchmark early-warning rules on open driver-fatigue EEG datasets. Day 2: Prototype a risk supervisor dashboard estimating avoided claim losses. Day 3: Interview 1 fleet safety manager to validate ROI.",
        monetization: "Per-seat monthly safety SaaS plus commercial fleet insurance premium-discount revenue share."
      },
      gamer: {
        code: "UNICORN-BCI-GAM",
        name: "MindDuel · Telekinetic Focus Tug-of-War Arena",
        pitch: "Turn tedious EEG calibration and stroke motor-imagery rehab into exhilarating 2-minute focus duels where calm concentration charges shield spells.",
        leverage: "WebSocket 1v1 match state machine + focus-mapped Canvas particle beams + progression badges",
        mvp72h: "Day 1: Design clean 'charge-focus-to-cast' duel rules. Day 2: Build a 2-minute web demo supporting both EEG headbands and keyboard simulation fallback. Day 3: Run live playtests with 10 pairs at school maker fairs.",
        monetization: "Pop-up campus/expo arcade licensing plus gamified neuro-rehab software subscriptions for clinics."
      }
    },
    space_debris: {
      designer: {
        code: "UNICORN-SPC-DES",
        name: "OrbitLens · Live LEO Traffic & Conjunction Theater",
        pitch: "Transform cryptic two-line orbital element (TLE) spreadsheets into breathtaking real-time industrial risk maps that satellite CEOs and journalists understand instantly.",
        leverage: "Public CelesTrak TLE feeds + browser SGP4 orbital propagator + high-contrast blueprint canvas",
        mvp72h: "Day 1: Pull live Starlink and ISS orbital feeds. Day 2: Render a crisp interactive conjunction-hotspot map. Day 3: Share high-resolution close-approach posters with aerospace newsletters and satellite ops teams.",
        monetization: "Custom mission-control lobby displays for satellite startups and pro conjunction-watch memberships."
      },
      teacher: {
        code: "UNICORN-SPC-EDU",
        name: "KeplerPlay · Orbital Sweeper Physics Sandbox",
        pitch: "Rescue dry gravitation lectures by letting students launch satellites, fire Hohmann transfer burns, and net tumbling junk right inside their browser.",
        leverage: "Canvas 2D Newtonian gravity solver + AP/IB Physics mission pack + automated trajectory feedback",
        mvp72h: "Day 1: Map 3 core high-school orbital mechanics puzzles into interactive levels. Day 2: Ship a zero-login web sandbox. Day 3: Have 5 physics teachers run a 15-minute live class trial and gather feedback.",
        monetization: "Interactive STEM lab bundles sold to international schools, science museums, and physics departments."
      },
      finance: {
        code: "UNICORN-SPC-FIN",
        name: "SpaceActuary · Dynamic LEO Collision Underwriting Engine",
        pitch: "With 100,000 satellites crowding low Earth orbit, empower aerospace reinsurers to price per-satellite collision risk dynamically from shell density and avoidance fuel.",
        leverage: "Public orbital density models + Monte Carlo encounter simulator + delta-V fuel-depreciation ledger",
        mvp72h: "Day 1: Dissect a sample satellite in-orbit insurance policy to locate blind spots. Day 2: Build an Expected Annual Loss (EAL) calculator by altitude/inclination/cross-section. Day 3: Validate with 2 space insurance brokers.",
        monetization: "Underwriting API licensing for insurers plus independent pre-launch orbital risk audit memos."
      },
      gamer: {
        code: "UNICORN-SPC-GAM",
        name: "OrbitalSweeper · Hardcore Fuel-Constrained Debris Puzzle",
        pitch: "Turn the brutal delta-V fuel economics of orbital rendezvous into a brain-burning strategy game—and surface surprisingly frugal player trajectories.",
        leverage: "Symplectic orbital integrator + Hohmann transfer preview arcs + global lowest-fuel leaderboard",
        mvp72h: "Day 1: Nail crisp two-body thrust and rendezvous feel. Day 2: Craft 3 levels modeled after real derelict rocket bodies. Day 3: Post devlogs on Reddit r/IndieGaming & aerospace Discords to track completion rates.",
        monetization: "Indie digital release ($12) plus themed historical aerospace DLC mission packs."
      }
    },
    ai_exoskeleton: {
      designer: {
        code: "UNICORN-EXO-DES",
        name: "WarmStep · Invisible-Dignity Elder Wearable UX",
        pitch: "Re-skin clinical exoskeleton frames with breathable everyday apparel wraps, zero-button voice guidance, and reassuring family progress cards seniors feel proud to wear outside.",
        leverage: "Elder-accessible typography & audio system + tailored soft-goods patterns + lightweight mobile care summary",
        mvp72h: "Day 1: Interview 5 elders using knee braces or walkers at a local park to catalog stigma pain points. Day 2: Sketch an invisible under-trouser wrap and 3-screen family digest. Day 3: Pitch 1 rehab hardware PM.",
        monetization: "Industrial & human-centered UX redesign retainers for assistive-robotics manufacturers ($5k–$15k/engagement)."
      },
      teacher: {
        code: "UNICORN-EXO-EDU",
        name: "KinectGrandma · Gentle Home Gait & Mobility Coach",
        pitch: "Turn any living-room phone camera into a patient weekly walking coach that spots risky sit-to-stand lean angles and praises progress in slow, familiar voices.",
        leverage: "In-browser skeletal pose detection + large-type slow-cadence voice prompts + weekly family check-in card",
        mvp72h: "Day 1: Ask a physical therapist for the top 3 fall-risk posture errors. Day 2: Build a webcam demo detecting forward-lean deficits with warm voice encouragement. Day 3: Test usability with grandparents or neighbors.",
        monetization: "Family care subscription ($7/month paid by adult children) plus community senior-center group plans."
      },
      finance: {
        code: "UNICORN-EXO-FIN",
        name: "CarePay · Pay-Per-Safe-Step Exoskeleton Leasing Ledger",
        pitch: "Break the $2,000+ upfront price wall! Connect hardware makers, senior care homes, and long-term care insurers via verified safe-step billing and fall-claim savings.",
        leverage: "Verified active-step & gait telemetry logs + automated clinic revenue-share ledger + fall-cost savings calculator",
        mvp72h: "Day 1: Model payback math at $2.50 per assisted rehab session for a care home. Day 2: Build an ROI sandbox tracking depreciation, aide incentives, and avoided fall claims. Day 3: Review numbers with 1 clinic director.",
        monetization: "3%–5% transaction clearing fee on metered device leases plus insurer risk-telemetry integration."
      },
      gamer: {
        code: "UNICORN-EXO-GAM",
        name: "WalkTheWorld · Living-Room Memory Walk with Grandkids",
        pitch: "Turn painful daily rehab steps into a cozy intergenerational quest—unlocking postcards from Kyoto, Paris, or old family neighborhoods paired with grandkid voice notes.",
        leverage: "Simple pedometer/exoskeleton sync + illustrated street-view panorama strip + family voice-postcard loop",
        mvp72h: "Day 1: Design a '1,000 steps unlocks 1 archival photo + 30s grandchild audio clip' loop. Day 2: Build a single-button tablet prototype. Day 3: Pilot with 5 seniors at a local day-care center.",
        monetization: "B2B wellness content licensing bundled onto assistive walkers, exoskeletons, and rehab treadmills."
      }
    }
  };

  /**
   * Build the Station 2 Socratic AI deep-dive prompt (preset or custom domain).
   */
  function buildStation2Prompt(domainName, essences, perspective) {
    const e1 = essences[0] ? essences[0].title : "First-principles decomposition";
    const e2 = essences[1] ? essences[1].title : "Core physical & operational bottleneck";
    return [
      `I am using the "Cognitive Alchemy Forge" to rapidly decode an unfamiliar frontier field: [${domainName}].`,
      `My personal background & advantage lens is: [${perspective.name} (${perspective.tag})].`,
      ``,
      `Initial underlying principles extracted so far:`,
      `1. ${e1}`,
      `2. ${e2}`,
      ``,
      `Act as an elite cross-disciplinary product mentor and guide me through this 3-step rapid Socratic chain:`,
      `1) [Kill the Jargon] Using analogies any high schooler instantly gets, translate the 3 most intimidating buzzwords in this field into real physical mechanics.`,
      `2) [Spot the Human Cracks] Where scientists obsess over hardware/algorithm limits, what are the 3 biggest "everyday human pains, trust gaps, or pricing frictions" they ignore?`,
      `3) [72-Hour Solo-Founder MVP] Leveraging my strength as a "${perspective.name}", design a lean experiment requiring zero custom labs or heavy hardware—using open datasets, public APIs, or AI—that I can ship as a live demo in 72 hours for my first real user feedback or pilot payment.`
    ].join("\n");
  }

  function resolvePerspective(perspectiveOrId) {
    if (perspectiveOrId && typeof perspectiveOrId === "object" && perspectiveOrId.id) {
      return MODE_B_PERSPECTIVES.find((p) => p.id === perspectiveOrId.id) || perspectiveOrId;
    }
    return (
      MODE_B_PERSPECTIVES.find((p) => p.id === perspectiveOrId) || MODE_B_PERSPECTIVES[0]
    );
  }

  /**
   * Custom domain generator: dynamically synthesizes all 4 stations & promptText in English.
   */
  function buildCustomData(cleanName, perspective) {
    const resolvedName = (typeof cleanName === "string" ? cleanName.trim() : "") || "Nuclear Fusion";
    const persp = resolvePerspective(perspective);

    const jargons = [
      {
        term: `${resolvedName} · Boundary Parameters`,
        plain: "The critical physical dials that keep the system stable instead of drifting out of control"
      },
      {
        term: `${resolvedName} · Real-World Coupling Noise`,
        plain: "All the dust, heat, human error, and messy friction that show up once lab gear enters real life"
      },
      {
        term: `${resolvedName} · Scale-Up Decay Rate`,
        plain: "The inevitable drop between cherry-picked journal metrics and reliable daily factory unit cost"
      }
    ];

    const essences = [
      {
        title: `First Principle 01 | Strip the Buzzwords—${resolvedName} Is Efficient Conversion of Energy, Info, or Matter`,
        body: `Every deep-tech field boils down to turning an input into a human-valued output with lower loss. Understand its input cost and buyer value, and you leap past 80% of the barrier.`
      },
      {
        title: `First Principle 02 | Labs Never Lack Breakthroughs—They Lack the "Last Mile to Humans"`,
        body: `Inventors obsess over pushing accuracy from 98% to 99.1%, while ignoring why buyers stay confused, terrified of failure risk, or stuck with clunky interfaces.`
      },
      {
        title: `First Principle 03 | Cross-Domain Builders Wrap Deep Tech in Software, UX & Trust`,
        body: `Your edge isn't out-publishing PhDs—it's serving as the translator, workflow architect, and risk framer between raw capability and everyday users.`
      }
    ];

    const socraticSteps = [
      {
        q: `Q1 · Strip the Jargon off ${resolvedName}`,
        a: `With zero acronyms allowed, how would you explain to a neighborhood cafe owner whose money or time ${resolvedName} actually saves?`
      },
      {
        q: `Q2 · Spot the Non-Technical Bottleneck`,
        a: `If ${resolvedName}'s core tech became free and open-source tomorrow, why would 90% of real customers still fail to adopt it? The answer usually hides in training, risk pricing, compliance, or UX.`
      },
      {
        q: `Q3 · 72-Hour Flanking Move as a ${persp.name}`,
        a: `Using your intuition as a [${persp.name}], how can you combine "${resolvedName} open datasets + visual explainer / ROI audit / interactive sim" to ship a high-signal micro-product in 72 hours?`
      }
    ];

    const painMap = {
      designer: `[${resolvedName}] is buried in unreadable whitepapers and 1990s-style dashboards, making fundraising pitches and buyer demos exhausting`,
      teacher: `[${resolvedName}] suffers a massive talent bottleneck because newcomers lack step-by-step interactive sandboxes to grasp core mechanics`,
      finance: `[${resolvedName}] hides heavy upfront CapEx inside a black box—investors and buyers lack clear payback and risk-sensitivity calculators`,
      gamer: `[${resolvedName}] validation, team onboarding, or public outreach feels painfully slow and dry without interactive simulation feedback loops`
    };

    const pains = [
      {
        forId: persp.id,
        title: `Bullseye for Your Lens: Core Friction Through ${persp.tag}`,
        body: painMap[persp.id] || painMap.designer
      },
      {
        forId: "other1",
        title: "Translation Chasm: Labs Speak Specs While Buyers Ask About Payback",
        body: "Engineering teams brag about lab benchmarks; customers only care how fast it pays back, who covers downtime, and whether staff need retraining."
      },
      {
        forId: "other2",
        title: "Black-Box Fear: What Customers Cannot See, They Delay Buying",
        body: "Until complex workflows become transparent, visual, and verifiable, sales cycles stall indefinitely."
      }
    ];

    const unicornMap = {
      designer: {
        code: `CUSTOM-${persp.id.toUpperCase()}`,
        name: `${resolvedName} · Interactive Visual Storyboard & Pitch Studio`,
        pitch: `Build a "3-minute clarity" interactive web sandbox and visual deck helping [${resolvedName}] startups win non-technical investors and enterprise buyers.`,
        leverage: "HTML5 Canvas interactive explainer templates + AI jargon-to-metaphor workflow + public benchmark parameters",
        mvp72h: `Day 1: Grab the most confusing diagram from 5 [${resolvedName}] company sites. Day 2: Rebuild one as a crisp clickable visual demo. Day 3: Send the free prototype to a founder to land your first pilot.`,
        monetization: "Technical commercialization visual kits ($1,200–$3,500/pack) plus ongoing product explainer retainers."
      },
      teacher: {
        code: `CUSTOM-${persp.id.toUpperCase()}`,
        name: `${resolvedName} · Zero-Barrier Interactive Discovery Lab`,
        pitch: `Transform dry [${resolvedName}] theory into a tunable web simulator so career-switchers, IB/AP students, and non-tech leaders build real intuition fast.`,
        leverage: "Lightweight browser physics/logic sandbox + AI 1-on-1 Socratic tutor + cohort challenge prompts",
        mvp72h: `Day 1: Isolate the single most counter-intuitive causal law in [${resolvedName}]. Day 2: Turn it into a clickable micro-lab with 3 puzzle quests. Day 3: Test paid conversion with an early-bird cohort.`,
        monetization: "Weekend frontier-literacy bootcamps ($39–$99/seat) and corporate cross-team onboarding toolkits."
      },
      finance: {
        code: `CUSTOM-${persp.id.toUpperCase()}`,
        name: `${resolvedName} · Diligence & Unit-Economics Risk Engine`,
        pitch: `Cut through academic hype with an instant ROI and bottleneck-sensitivity workbench tailored for funds, banks, and supply-chain buyers eyeing [${resolvedName}].`,
        leverage: "Public supply-chain cost benchmarks + AI paper/filing parameter extraction + Monte Carlo breakeven model",
        mvp72h: `Day 1: Read 3 sector briefs to pinpoint the top 3 profit variables in [${resolvedName}]. Day 2: Ship a live breakeven & risk sandbox. Day 3: Share with 3 deep-tech analysts for paid validation.`,
        monetization: "Sector diligence SaaS subscriptions and custom feasibility audit memos ($1,000+ per report)."
      },
      gamer: {
        code: `CUSTOM-${persp.id.toUpperCase()}`,
        name: `${resolvedName} · Hardcore Trade-Off Strategy Simulator`,
        pitch: `Turn [${resolvedName}]'s brutal engineering trade-offs (cost vs. stability vs. throughput) into an addictive strategy sim that also spots sharp engineering talent.`,
        leverage: "Browser state-machine simulation + randomized crisis event cards + global optimization leaderboard",
        mvp72h: `Day 1: Distill [${resolvedName}] into 4 interlocking resource gauges. Day 2: Build a playable 10-minute browser scenario. Day 3: Launch a community high-score challenge to attract players and industry recruiters.`,
        monetization: "Indie game purchase ($9) plus sponsored challenge assessments for technical recruiting."
      }
    };

    const unicornCard = unicornMap[persp.id] || unicornMap.designer;

    return {
      id: "custom",
      name: resolvedName,
      short: "Custom Cross-Domain Breakdown",
      jargons,
      essences,
      socraticSteps,
      pains,
      unicornCard,
      promptText: buildStation2Prompt(resolvedName, essences, persp),
      isCustom: true
    };
  }

  /**
   * Matches data.js signature: generates full 4-station blueprint from raw user input & perspectiveId.
   */
  function generateCustomDomainBlueprint(rawDomain, perspectiveId) {
    const cleanName = (rawDomain || "").trim() || "Nuclear Fusion";
    const perspective = resolvePerspective(perspectiveId);
    return buildCustomData(cleanName, perspective);
  }

  /**
   * Matches data.js signature: fetches unified blueprint for a preset domain + perspective lens.
   */
  function getPresetBlueprint(domainId, perspectiveId) {
    const domain = MODE_B_DOMAINS.find((d) => d.id === domainId) || MODE_B_DOMAINS[0];
    const perspective = resolvePerspective(perspectiveId);
    const matrixEntry =
      (MODE_B_MATRIX[domain.id] && MODE_B_MATRIX[domain.id][perspective.id]) ||
      MODE_B_MATRIX.synthetic_bio.designer;

    return {
      id: domain.id,
      name: domain.name,
      short: domain.short,
      jargons: domain.jargons,
      essences: domain.essences,
      socraticSteps: domain.socraticSteps,
      pains: domain.pains,
      unicornCard: matrixEntry,
      promptText: buildStation2Prompt(domain.name, domain.essences, perspective),
      isCustom: false
    };
  }

  const EN_DATA = {
    MODE_A_SCENARIOS,
    MODE_B_PERSPECTIVES,
    MODE_B_DOMAINS,
    MODE_B_MATRIX,
    buildStation2Prompt,
    buildCustomData,
    getPresetBlueprint,
    generateCustomDomainBlueprint
  };

  (root.SANDBOX_DATA_I18N = root.SANDBOX_DATA_I18N || {}).en = EN_DATA;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = EN_DATA;
  }
})(typeof window !== "undefined" ? window : globalThis);
