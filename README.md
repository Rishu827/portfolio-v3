# The Observer Effect — Portfolio v3

A personal portfolio built with **Angular 21**, featuring interactive 3D graphics, a D3 force-directed career graph, and a quantum computing aesthetic. Hosted at [rishu827.github.io/portfolio-v3](https://rishu827.github.io/portfolio-v3/).

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21 (standalone components, zoneless) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4, PostCSS |
| 3D Graphics | Three.js |
| Data Visualization | D3.js v7 |
| Math Rendering | KaTeX |
| Markdown | marked |
| Build | Angular CLI / esbuild |
| Deployment | GitHub Pages (angular-cli-ghpages) |

---

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — hero with Three.js rotating icosahedron and quick navigation |
| `/career` | Career graph — D3 force-directed entanglement map + timeline view |
| `/lab` | Research lab — flip-card gallery of publications with equations |
| `/repository` | Projects — showcase with markdown descriptions, video embeds, tech tags |
| `/theory` | Theoretical computing — expandable cards with KaTeX math equations |
| `/achievements` | Awards, certifications, and grants |
| `/blog` | Blog posts with tag filtering |
| `/contact` | Contact — LinkedIn, email, GitHub, and embedded feedback form |

---

## Features

- **Three.js icosahedron** with pulse ring animations on the dashboard
- **D3 force graph** — interactive, draggable, zoomable career node map with search and detail panels
- **Quantum canvas background** — two-source wave interference pattern that reacts to mode toggle
- **Engineer / Researcher mode** — toggles accent color between cyan and purple app-wide
- **KaTeX** for rendering LaTeX math equations
- **Flip cards** with 3D CSS perspective transform on the publications page
- **Magnetic buttons** — mouse-tracking translation effect on interactive elements
- **Custom cursor** replacing the default browser pointer
- **Reveal animations** via IntersectionObserver on scroll
- **Glassmorphism** design system throughout

---

## Getting Started

```bash
npm install
npm start        # dev server at http://localhost:4200
```

---

## Build & Deploy

```bash
# Production build (local)
npm run build

# Build + deploy to GitHub Pages
npm run deploy
```

The deploy script builds with `--base-href=/portfolio-v3/` and publishes the `dist/portfolio-v3/browser/` directory to the `gh-pages` branch.

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── directives/   # reveal, magnetic, quantum-observer
│   │   ├── models/       # portfolio schema types
│   │   ├── pipes/        # markdown, katex
│   │   └── services/     # quantum-state, quantum-canvas
│   ├── layout/           # shell, nav, footer, toolbar, cursor
│   ├── shared/           # quantum-tag, glass-card
│   └── dimensions/       # one component per route
├── assets/data/          # JSON data files
└── styles.css            # Tailwind + custom theme tokens
```

### Data files (`src/assets/data/`)

| File | Contents |
|---|---|
| `experience.json` | Work history (company, role, dates, bullets) |
| `career-nodes.json` | D3 graph nodes and links |
| `publications.json` | Papers, thesis, patent, poster with equations and links |
| `projects.json` | Projects with stack, GitHub/demo/video URLs |
| `achievements.json` | Awards, competitions, certifications, grants |
| `blog-posts.json` | Blog posts with tags and read time |

---

## Page Themes — Physics & Mathematics

Each page is built around a specific concept from quantum mechanics, physics, or mathematics. The themes drive the naming, animations, UI language, and background visuals on every route.

---

### Dashboard — Quantum Observation & Measurement

The landing page is built around the **quantum measurement problem**: the act of observing a system collapses its wavefunction into a definite state. The portfolio itself is framed as a quantum system being observed.

- The status badge reads `SYSTEM STATE: OBSERVING` and stats are labelled `MEASUREMENT OUTCOMES`
- The background shows **two-source wave interference** — two coherent sources produce a spatial amplitude pattern `ψ(x,y) ∝ cos(k·r₁) + cos(k·r₂)`, visualised as a shimmering grid
- The centrepiece is a **wireframe icosahedron** (20 faces, 12 vertices) rendered in Three.js — a Platonic solid with full icosahedral symmetry (Iₕ), chosen because it appears in geodesic structures, viral capsids, and fullerene chemistry
- Five concentric **pulse rings** expand outward from the icosahedron, animating from scale 0.25 → 1.0, simulating the radial propagation of a quantum disturbance: `ψ(r,t) ∝ e^(i(kr−ωt))/r`

---

### Career — Worldlines & Energy Levels

The career page draws from **special relativity** and **quantum energy level transitions**.

- The subtitle reads: *"A worldline through phase space — from classical systems to quantum architectures"* — a worldline is a path through 4D spacetime `(x, y, z, t)` that traces an object's entire history
- The force-directed graph is called the **ENTANGLEMENT MAP** — nodes (skills, companies, projects, education) are connected by weighted edges representing conceptual dependencies, mirroring quantum entanglement where subsystems cannot be described independently
- The D3 physics simulation uses real force equations: gravitational attraction (`forceManyBody`), link spring forces (`forceLink`), and centering — the graph reaches equilibrium just as a physical system minimises potential energy
- The timeline view labels each job as a **quantum energy level**: `ENERGY LEVEL E₄`, `E₃`, `E₂`, `E₁`, with transitions labelled `QUANTUM JUMP · Eₙ → Eₙ₊₁`, referencing the Bohr model where electrons absorb/emit photons to jump between discrete energy states: `ΔE = hf`

---

### Lab — Quantum Entanglement & Spin

The research page visualises **quantum entanglement** and **particle spin** through a live canvas animation.

- Ten **entangled particle pairs** are simulated — each particle carries a spin value of `+1` or `−1` (up/down), and paired particles are connected by bezier curves whose colour pulses as a function of their shared phase
- Each particle evolves a phase `φ` over time: `φ(t) = φ₀ + ωt`, and spatial offsets are computed as `(sin φ, cos φ)` — mimicking the oscillating probability amplitude of a quantum state
- A **spin arc** is drawn at each particle: for spin `+1` the arc starts at `−0.8π`, for spin `−1` at `+0.2π`, visualising the two eigenstates of the spin-½ operator
- Pulses travel along the bezier paths using quadratic interpolation `B(t) = (1−t)²P₀ + 2(1−t)tP₁ + t²P₂`, representing the non-local correlations that make entanglement distinct from classical correlation
- The publications themselves include real quantum research — the **flip cards** on each paper show equations like `|T⟩ = (1/√2)(|0⟩ + e^(iπ/4)|1⟩)` (magic state) and stabiliser code notation `[[n, k, d]]₃`

---

### Repository — Quantum Circuits

The projects page frames each project as a **quantum gate operation** acting on the universe.

- The subtitle reads: *"Quantum circuit — operations shipped into the universe"*
- The background canvas draws **35 circuit traces** — grid-snapped paths with 90° turns, styled after the schematic of a quantum circuit diagram where wires carry qubit states between gates
- **20 pulses** travel along these traces at varying speeds (`0.002–0.005` progress per frame), rendered as radial glows in cyan (`#00F2FF`) or teal — representing quantum information propagating through a circuit
- Each project card implicitly represents a gate: a discrete, unitary transformation applied to a system. The featured projects use a `⬢` hexagon glyph (referencing the hexagonal symmetry of many gate representations and lattice models)

---

### Theory — Hilbert Space & Wave Superposition

The theoretical computing page is set inside **Hilbert space** — the infinite-dimensional complex vector space where quantum states live.

- The subtitle reads: *"Hilbert space — mathematical foundations of quantum algorithms, machine learning, and complexity theory"*
- The background renders a **three-source wave superposition** on a pixel grid. Each source has a wave vector `(kₓ, kᵧ)` and angular frequency `ω`. The total complex amplitude at each point is:

  ```
  ψ(x, y, t) = Σ e^(i(kₓx + kᵧy − ωt))
  ```

  The real and imaginary parts are summed separately, and the display brightness maps to the magnitude `|ψ| = √(re² + im²)`

- The theory cards present actual research with full notation:
  - **Qutrit magic states**: `|T⟩ = (1/√2)(|0⟩ + e^(iπ/4)|1⟩)`, distillation threshold `p_out = pₖ/(pₖ + (1−p)ᵏ)`
  - **Stabiliser codes**: `[[n, k, d]]₃` over GF(3), Pauli commutation `HᵢHⱼ = ω^(δᵢⱼ) HⱼHᵢ` with `ω = e^(2πi/3)`
  - **Conflict-free graph colouring**: `χ_CF(G)`
  - **Graphlet degree vectors**: `GDV_i ∈ ℤ⁷³` — a 73-dimensional signature encoding a node's local topology across all 2–5-node graphlets

---

### Achievements — Wave Function Collapse

The achievements page treats each award as a **collapsed quantum event** — a measurement outcome that pulled a definite result from a superposition of possible futures.

- The subtitle reads: *"Detected events — quantum collapses of effort into recognition"*
- Each achievement is labelled with an event ID in the format `EVT-{year}-{n}`, styled like a particle physics detector log entry
- The background runs three **spotlight beams** — triangular cone projections sweeping across the canvas — evoking the detection apparatus in a particle accelerator or the photomultiplier tubes in an optical measurement setup
- **Sparkle particles** spawn, evolve a full lifespan with alpha fade, and disappear — mimicking the brief signal traces left by a detected particle in a cloud chamber

---

### Blog — Thought Experiments & Observation

The blog page extends the measurement metaphor to writing itself — each post is framed as a **thought experiment** that collapses quantum uncertainty into words.

- The subtitle reads: *"Thought experiments — observations that collapse quantum uncertainty into words"*
- The featured post is badged as `◈ OBSERVATION`
- Post dates are labelled `WAVEFUNCTION COLLAPSED ON {date}` — the act of publishing is the measurement event that fixes the outcome
- The read action on each card is labelled `OBSERVE →`, not "read", reinforcing that engaging with an idea is itself an act of quantum observation

---

### Contact — Quantum Tunneling

The contact page is themed around **quantum tunneling** — the phenomenon where a particle's wavefunction penetrates a potential energy barrier and re-emerges on the far side, even though classically it has insufficient energy to cross.

- The subtitle reads: *"Quantum tunneling — signals that bridge the potential barrier between dimensions"*
- The background renders **9 horizontal wave stripes** travelling rightward. At the barrier (~42% of the canvas width), each wave's amplitude decays exponentially: `ψ(x) ∝ e^{−κx}` where `κ = √(2m(V−E))/ħ`. On the far side, the wave re-emerges at 30% of its original amplitude — the transmission coefficient `|T|²`
- The barrier itself glows with a soft cyan gradient, representing the potential energy region `V > E` that a classical particle could not cross but a quantum particle can tunnel through
- Each contact channel is a different **transmission path** — a signal tunnelling through to reach the other side:
  - **LinkedIn** `⬡` — professional network, cyan channel
  - **Email** `◈` — direct line, purple channel
  - **GitHub** `⬢` — code collaboration, green channel
- An **embedded Google Form** sits below the channels for comments, suggestions, or feedback — no account required
- The page status reads `SIG-2025-∞`, logged like a detector event recording a tunnelled signal

---

### Global — The Observer Effect

The name *The Observer Effect* ties every page together. In quantum mechanics, the observer effect states that measuring a system inevitably disturbs it — you cannot observe without interacting. The portfolio inverts this: visiting each dimension is the observation event, and the animations, graphs, and content represent the system collapsing into a legible state in response.

The two global modes reflect two ways of observing:

| Mode | Accent | Metaphor |
|---|---|---|
| **Engineer** | Cyan `#00F2FF` | Classical, deterministic, circuit-level thinking |
| **Researcher** | Purple `#7000FF` | Quantum, probabilistic, theory-first thinking |

---

## GitHub Pages Notes

GitHub Pages doesn't support server-side routing, so a `public/404.html` fallback is included. When navigating directly to a route like `/portfolio-v3/career`, GitHub Pages serves `404.html`, which boots the Angular app and lets the router handle the URL.

All data fetches use relative paths (e.g. `assets/data/experience.json`) so they correctly resolve against the `/portfolio-v3/` base href.
