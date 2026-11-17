# LunaShield — Claude Code Build Specification

> **Purpose:** Build a premium, interactive, 3D engineering explainer for LunaShield. It must explain the working theory, component stack, materials, electrical architecture, costs, configurations, and the difference between the professional product concept and the low-cost demonstrator.
>
> **Primary deliverable:** A polished web-based 3D technical experience that feels like an interactive engineering documentary—not a generic SaaS dashboard.
>
> **Truth standard:** Clearly distinguish established EDS physics, published third-party results, LunaShield design hypotheses, demonstrator assumptions, and simulated/illustrative effects. Never present a render as experimental evidence.

---

## 0. Product brief and non-negotiable rules

Build an interactive 3D explainer with two selectable configurations:

1. **Professional LunaShield** — proposed flexible, large-area electrodynamic dust shield (EDS) for spacecraft surfaces such as thermal radiators, optical windows, camera covers and solar-array surfaces.
2. **LunaShield Demonstrator** — a small, low-cost flexible EDS proof-of-concept intended to show the principle and directional particle transport on a benchtop.

The experience must let a user:
- Orbit, pan and zoom around a detailed 3D assembly.
- Explode and reassemble the product layer by layer.
- Select any component/material to open an information panel.
- See each layer's function, candidate material, thickness/range, trade-offs, risks, confidence level and cost basis.
- Play a guided animation of the operating principle.
- Toggle field lines, electrode phases, particle trajectories, dust coverage, cutaway view and labels.
- Change simulation parameters and see the visualization respond.
- Compare Professional and Demonstrator configurations side by side.
- Inspect architecture, BOM, estimated cost, assumptions, validation plan and known unknowns.
- Switch between an engineering view and a cinematic presentation mode.

### Non-negotiable scientific honesty
- EDS is not a new invention by LunaShield. NASA demonstrated EDS on the lunar surface in March 2025.
- Flexible EDS and bendable EDS research already exist. LunaShield's proposed differentiation is to engineer a durable, manufacturable, integrator-ready flexible system. That differentiation is a development thesis, not a proven moat.
- The 3D scene is a **conceptual visualization**, not a finite-element electrostatic solver, CFD model, or experimental result.
- The low-cost demonstrator's ion-generator modules are **candidate components only** until their datasheets and output behaviour under capacitive loading are verified.
- Never claim that the demo is lunar-regolith representative, vacuum-qualified, radiation-qualified, flight-qualified, or proof of commercial readiness.
- Do not fabricate performance values, TRL, test outcomes, supplier quotes, part numbers, material properties or certifications.
- All unverified values must be tagged `ASSUMPTION`, `TARGET`, `ESTIMATE`, or `UNVERIFIED`.
- If a value is not known, show `TBD — requires measurement / supplier confirmation` rather than inventing a value.

---

## 1. Visual direction

### Reference image supplied by the user
Use the uploaded screenshot as a visual direction reference:
- Deep black / charcoal background.
- A highly detailed, metallic, circular mechanical assembly as the hero object.
- Strong cyan/blue energy illumination used selectively.
- Dramatic rim lighting and a dark studio environment.
- Large, minimal title typography.
- Chapter/section navigation that feels like a documentary player.
- The object is the centre of attention; UI supports it rather than competing with it.

Do **not** copy Iron Man, the Arc Reactor, Marvel assets, or any copyrighted design. LunaShield should have its own visual identity: a precision-engineered flexible film, electrode traces, a layered polymer stack and a controlled travelling electric-field visualization.

### Subject Zero Science reference
Study the channel's *editorial approach*, not its exact graphics:
- Forensic engineering explanations.
- First-principles reasoning.
- Clear separation of claims from evidence.
- Technical cutaways and explanatory diagrams.
- A confident, investigative documentary tone.
- Visuals that explain why a mechanism works, not decorative sci-fi effects.

Reference: https://www.youtube.com/@subjectzeroscience

### Visual language
- Background: near-black / graphite.
- Primary accent: electric cyan.
- Secondary accents: warm amber for high-voltage warning / uncertainty, green for verified or measured facts, muted red for failure modes.
- Materials should have physically plausible appearance: copper, polyimide amber/brown, translucent dielectric, matte polymer, glass, aluminium chassis.
- Avoid excessive neon, random HUD elements, fake telemetry, fake serial numbers and meaningless sci-fi labels.
- Use restrained bloom, high-quality shadows, ambient occlusion and subtle depth of field. Do not sacrifice legibility.
- Typography: clean technical sans-serif; strong hierarchy; concise labels.
- Animation: deliberate, smooth, mechanically plausible. Avoid constant spinning when the user is trying to inspect a part.

### Visual storytelling sequence
1. Start with a contaminated protected surface in a dark studio.
2. Camera pushes in; dust particles are visible on the film.
3. Assembly separates into an exploded stack.
4. Each layer illuminates as its name and role appear.
5. Electrode groups A/B/C illuminate in sequence.
6. Field visualization sweeps across the surface.
7. Particles lift/hop/translate away from the surface.
8. Reassemble the stack and reveal the host surface (radiator / optical window / solar glass).
9. Transition into Professional vs Demonstrator comparison.

---

## 2. Recommended technical stack

Use a web-based application. Preferred stack:

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber (`@react-three/fiber`)
- Drei (`@react-three/drei`)
- `@react-three/postprocessing` for restrained visual effects
- Framer Motion for UI transitions
- Zustand or React Context for shared UI/simulation state
- Tailwind CSS for layout and design tokens
- Lucide React for interface icons
- Vitest for unit tests of calculations and configuration data

Do not add a backend unless needed. The first version should be static/client-side and deployable to Vercel or Cloudflare Pages.

### Suggested project structure

```text
lunashield-explainer/
├── CLAUDE.md
├── README.md
├── package.json
├── public/
│   ├── textures/
│   ├── models/
│   └── reference/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.ts
│   │   └── providers/
│   ├── components/
│   │   ├── layout/
│   │   ├── controls/
│   │   ├── data-panels/
│   │   ├── comparison/
│   │   └── charts/
│   ├── three/
│   │   ├── Experience.tsx
│   │   ├── camera/
│   │   ├── materials/
│   │   ├── models/
│   │   ├── effects/
│   │   ├── animations/
│   │   └── simulation/
│   ├── data/
│   │   ├── professional.config.ts
│   │   ├── demonstrator.config.ts
│   │   ├── materials.ts
│   │   ├── cost-model.ts
│   │   └── evidence.ts
│   ├── hooks/
│   ├── state/
│   ├── styles/
│   └── utils/
└── tests/
```

### Implementation principles
- Keep all engineering data in typed configuration files. Do not hard-code values into 3D meshes or UI components.
- Separate 3D scene logic from engineering content.
- Use reusable component models and material definitions.
- Use deterministic animation state so the same configuration always produces the same scene.
- Make all 3D objects selectable with accessible HTML overlays or raycasting.
- Provide a reduced-motion mode and a non-WebGL fallback.
- Optimize for a modern laptop browser. Avoid excessive particle counts and expensive post-processing.
- Use responsive layouts. Desktop is the primary investor presentation target; tablet should remain usable.
- Include a presentation mode with no developer controls visible.

---

## 3. Application information architecture

Top-level navigation:

1. **Overview**
2. **How EDS Works**
3. **Exploded Assembly**
4. **Materials**
5. **Electrical Architecture**
6. **Simulation Lab**
7. **Configurations**
8. **Cost & BOM**
9. **Validation Roadmap**
10. **Evidence & Assumptions**

### Overview page
- Full-screen hero render of LunaShield on a representative spacecraft surface.
- Title: `LUNASHIELD`
- Subtitle: `Flexible Electrodynamic Dust Shield`
- Short value proposition: `An active surface-integrated approach to moving dust away from critical lunar hardware.`
- Primary action: `Explore the system`
- Secondary action: `Run the simulation`
- Clearly state: `Concept visualization — not a flight-qualified product.`

### Chapter navigation
Use a chapter rail or timeline inspired by the supplied reference:
- 01 — The problem
- 02 — The principle
- 03 — The flexible stack
- 04 — The power system
- 05 — Dust transport
- 06 — Professional system
- 07 — Demonstrator
- 08 — What must be proven

Each chapter should move the camera and reveal the relevant part of the assembly.

---

## 4. Scientific working theory

### 4.1 What EDS does
An electrodynamic dust shield uses patterned electrodes and time-varying electrical potentials to create an electric field that changes across a surface and over time. The field can exert forces on particles and move them away from a protected surface.

The relevant mechanisms include:
- Electrostatic force on charged particles.
- Dielectrophoretic force on polarizable particles in a non-uniform electric field.
- Particle lift, hopping, sliding and transport depending on particle charge, dielectric properties, size, shape, adhesion, surface geometry and the applied waveform.

For a charged particle, the simplified force relationship is:

`F = qE`

where:
- `F` = electrostatic force
- `q` = particle charge
- `E` = electric-field vector

For a neutral but polarizable particle, a non-uniform electric field can induce polarization and produce a net dielectrophoretic force. Do not imply all lunar dust is uniformly charged or that every particle follows the same trajectory.

### 4.2 Travelling field concept
A sequence of spatially adjacent electrodes is driven with time-shifted waveforms. The resulting field pattern moves along the surface. The animation should show the *field pattern* propagating, not merely show the electrodes turning on in a random sequence.

For a three-phase conceptual animation:
- Electrode group A: phase 0°
- Electrode group B: phase 120°
- Electrode group C: phase 240°
- Repeat A/B/C across the panel.
- Default illustrative frequency: 10 Hz.
- One cycle at 10 Hz = 100 ms.
- Phase spacing at 10 Hz = approximately 33.3 ms.

Important:
- This three-phase mode is a conceptual travelling-wave configuration.
- NASA's Blue Ghost glass EDS used a two-phase mode; its thermal-radiator EDS used a one-phase mode. Do not call the three-phase simulation a replica of Blue Ghost.
- A unipolar switched-envelope demonstrator, if used, is a different drive implementation from a bipolar square-wave EDS driver. Label it accurately.

### 4.3 Particle animation rules
- Show particles with varied sizes and irregular shapes in the professional scene.
- Demonstrator mode may use a controlled, more uniform particle set.
- Particles should not all move identically.
- Some particles can remain attached; some may hop; some may move across the surface; some may leave the active area.
- Include a toggle for `illustrative idealized transport` vs `variable particle response`.
- Include an optional re-impact trajectory to communicate that vacuum does not guarantee particles disappear permanently.
- Do not show airflow, a fan, a vacuum suction effect or invisible brushes.
- Never imply that the electric field is visible to the naked eye. Field lines are a visualization overlay.

### 4.4 Simulation honesty
This is a visual explanatory model, not a numerical multiphysics solver.
- Use a simplified, tunable field visualization.
- Do not calculate true field strength from arbitrary geometry unless a validated numerical model is implemented.
- Do not label the display `kV/mm` unless the field is actually calculated and the assumptions are disclosed.
- A slider for voltage should change a clearly labelled *illustrative field intensity*, not pretend to be a validated solution.
- Frequency should change the animation timing.
- Phase mode should change the sequence.
- Particle charge/polarizability should change a simplified response parameter, with a clear `conceptual response model` label.
- Display a persistent notice: `Visualization is qualitative. Particle trajectories are illustrative and are not experimental measurements.`

---

## 5. Configuration A — Professional LunaShield

### 5.1 Product concept
A flexible, thin-film EDS intended to be integrated with or retrofitted onto selected spacecraft surfaces. The proposed system consists of:
1. Protective dielectric surface layer.
2. Patterned electrode layer.
3. Flexible polymer substrate.
4. Bonding/interface layer.
5. Host surface (radiator, optical cover, solar glass, or other compatible surface).
6. High-voltage drive electronics.
7. Low-voltage power interface.
8. Controller and optional dust/obscuration sensing.

The architecture is a development concept. The final stack and drive scheme must be selected for the target host surface and mission environment.

### 5.2 Professional stack — candidate materials

Use an exploded 3D model with individually selectable layers. Values below are candidate ranges/starting points from the concept deck, not flight specifications.

| Layer / subsystem | Candidate | Purpose | Key trade-offs / risks | Status |
|---|---|---|---|---|
| Dielectric encapsulation | PTFE or polyimide-based dielectric | Insulates/protects electrodes; helps prevent electrical breakdown | Dielectric strength, adhesion, outgassing, UV/thermal ageing, surface charging | Candidate |
| Electrode pattern | Patterned copper foil / etched copper | Creates spatially varying electric field | Copper fatigue, cracking, trace geometry, edge-field concentration | Candidate baseline |
| Flexible substrate | Kapton / polyimide | Mechanical support and electrical insulation | Flex fatigue, thermal expansion mismatch, bonding | Candidate baseline |
| Transparent electrode option | ITO or CMrGO | Potential use over optical/solar surfaces | ITO brittleness; CMrGO process complexity and micro-discharge risk | Research option |
| Bonding layer | Space-compatible PSA or qualified adhesive | Attaches film to host | Outgassing, peel, thermal cycling, contamination, differential expansion | TBD |
| Host surface | Radiator / optical cover / solar glass | Protected hardware | Each host surface changes thermal, optical and integration requirements | Application-specific |
| HV driver | Custom/qualified multi-phase HV electronics | Drives electrode waveform | Mass, efficiency, isolation, EMI, breakdown, qualification | Architecture TBD |
| Controller | Radiation-tolerant controller or mission computer interface | Scheduling, diagnostics, sensing | Mission interface, fault handling, software assurance | Architecture TBD |
| Sensor | Optical obscuration / dust sensor (optional) | Detects contamination and schedules cleaning | False positives, optical contamination, power | Optional concept |

### 5.3 Candidate stack geometry
Use these as *illustrative model defaults only*:
- Polyimide substrate: 50 μm starting concept value.
- Dielectric encapsulation: 25 μm starting concept value.
- Electrode pitch: configurable; do not hard-code a final design.
- Total stack: show as `target concept <0.1 mm` only if the chosen layer geometry supports it; otherwise show `TBD`.
- Areal mass: show `~300 g/m²` as a founder estimate, not measured data.
- Provide a measurement toggle to display the stack thickness greatly exaggerated for visibility.

### 5.4 Professional electrical architecture
Visualize the signal/power chain:

`Spacecraft low-voltage bus → input protection / power conditioning → HV conversion stage → waveform generation / phase control → electrode array → field interaction with dust`

Optional control chain:

`Obscuration sensor → controller → duty scheduler → driver enable / operating mode`

Conceptual targets from the current LunaShield deck:
- Input bus: 28 V DC (assumption; mission-dependent).
- Electrode drive: target range around 1–3 kV; distinguish peak from peak-to-peak.
- Frequency: around 10 Hz as an initial target, not a settled optimum.
- Current: microamp-class operation is a design intent; no validated LunaShield consumption measurement exists.
- Driver topology: a converter plus waveform-generation stage is required. A flyback transformer alone does not create a controlled three-phase EDS waveform.
- Do not label ZVS + flyback as a completed or validated design.

### 5.5 Professional materials detail panel
For every material, display:
- Common name
- Chemical/material family where known
- Role in the stack
- Why it is being considered
- Main failure modes
- Environmental qualification needed
- Alternatives
- Evidence level
- Cost status (`not quoted`, `estimate`, or `supplier quote required`)

Add an `Evidence level` badge with only these values:
- `Established material family`
- `Published EDS candidate`
- `LunaShield design hypothesis`
- `Requires testing`
- `Flight qualification required`

### 5.6 Professional validation roadmap
Present a stage-gated roadmap. Do not imply these tests have already happened.

**Stage P0 — Benchtop principle**
- Demonstrate repeatable particle movement.
- Measure clearing fraction, time, power and repeatability.
- Establish safe electrical operation.

**Stage P1 — Flexible coupon**
- Flexible copper/polyimide coupon.
- Measure electrical continuity before/after bending.
- Measure dust removal before/after bending.
- Characterize electrode/dielectric adhesion.
- Record waveform and current under representative load.

**Stage P2 — Environmental screening**
- Thermal-vacuum testing.
- Thermal cycling.
- UV exposure.
- Bend-cycle testing.
- Electrical breakdown / partial discharge screening.
- Adhesion and outgassing evaluation.
- Contamination and optical/thermal impact testing as applicable.

**Stage P3 — Host integration**
- Integrate on a representative radiator/optical/solar coupon.
- Measure host-system impact.
- Assess electromagnetic compatibility, power budget, thermal performance and interface constraints.

**Stage P4 — Flight-oriented qualification**
- Mission-specific design and qualification.
- Do not assign a TRL unless a formal assessment has been completed.

### 5.7 Professional cost model
Use the current LunaShield founder planning figures, clearly marked as planning estimates and not supplier quotes:

| Phase | Planning estimate | Scope |
|---|---:|---|
| P0 | ₹2 lakh | Benchtop proof of principle, coupon fabrication, test access and measurements |
| P1 | ₹38 lakh | Flexible coupon development, thermal-vacuum/UV/bend/adhesion testing, early TRL development |
| P2 | ₹2.8 crore | Flight-oriented engineering and hosted-payload / integration / qualification activities |
| Current proposed ask | ₹2.4 crore | Proposed 18-month financing target; exact allocation must be reconciled |

**Critical funding reconciliation note:** P1 + P2 total ₹3.18 crore, which exceeds the proposed ₹2.4 crore ask. The UI must show this discrepancy prominently and require a founder-approved explanation of what is funded by the ask, what is deferred, and what is expected from grants/partners/follow-on capital. Do not silently make the numbers add up.

Cost UI requirements:
- Show phase estimates and scope.
- Show a separate `estimate / quote / actual` status.
- Include an assumptions drawer.
- Include contingency as a separate field only when provided.
- Do not invent vendor quotations or customer revenue.
- Provide editable cost fields in a planning mode, with all edits labelled `user-entered planning assumption`.

---

## 6. Configuration B — Low-cost Demonstrator

### 6.1 Purpose
A small flexible EDS demonstrator that makes the operating principle visible to investors. It should demonstrate:
- A flexible substrate.
- Patterned electrode groups.
- A transparent insulating cover.
- A low-frequency travelling-field sequence (if the electrical architecture supports it).
- Visible particle movement under controlled conditions.
- Before/after measurement and repeatability.

It is not a lunar environment test and must not be presented as a scaled-down flight product.

### 6.2 Candidate demonstrator architecture

`Arduino Uno (existing) → low-voltage isolated control/gating → candidate HV modules / verified HV driver → flexible electrode coupon → dust particles`

Test enclosure:
- Transparent sealed enclosure.
- Humidity sensor.
- Desiccant only if needed for controlled experiments.
- Fixed camera and fixed lighting.
- Safe, characterized particles.

### 6.3 Candidate bill of materials and strict budget handling

The user wants a target total below ₹5,000. Treat this as a **budget target, not a verified procurement quote**. Existing Arduino Uno and existing computer/phone are reused and shown as `₹0 incremental cost`. A 12 V adapter is assumed to be available; if it must be purchased, add it.

Illustrative planning BOM:

| Item | Planning amount | Status / note |
|---|---:|---|
| 100 × 100 mm flexible polyimide flex-PCB coupon | ₹2,000–2,200 | Quote required; specify copper pattern and dielectric construction |
| Three candidate 12 V negative-ion generator modules | ₹1,350 | Based on ₹450/listed unit; not yet approved for EDS use |
| Arduino Uno R3 | ₹0 | Reuse existing board |
| Low-voltage opto-isolated control components / connectors | ₹200–300 | Estimate; exact design depends on module enable behaviour |
| Clear test enclosure | ₹200–350 | Estimate; must contain particles |
| Small hygrometer | ₹150–200 | Estimate |
| Desiccant | ₹100 | Estimate |
| Characterized glass microspheres / safe test particles | ₹150–250 | Supplier/SDS required; do not use uncharacterized fly ash |
| Wires, mounting, fasteners, LED lighting | ₹200–300 | Estimate |
| Contingency | ₹200 | Estimate |
| **Indicative total** | **₹4,550–5,250** | **Not yet verified under ₹5,000** |

The interface must not falsely display a guaranteed under-₹5,000 total. Add a live budget calculator:
- Default values above.
- Reuse items can be toggled.
- User can enter supplier quotes.
- Status changes to `UNDER ₹5,000` only when entered values actually total below ₹5,000.
- If the total exceeds ₹5,000, show the overrun clearly.
- The candidate HV modules remain unverified and may need replacement with a lab driver, which could exceed the cap.

### 6.4 Candidate HV module warning
The proposed hobby module listing is described as:
- Model: 47-HL-ZF18
- Input: 12 V DC
- Advertised output: 4.5 ± 1.0 kV DC
- Advertised input power: ≤1 W
- Advertised price: around ₹450

These are listing claims, not an independently verified datasheet. The `≤1 W` input power figure does not establish a specified output current limit or capacitive-load capability.

Before the module is represented as usable:
- Obtain a manufacturer datasheet or written technical confirmation.
- Verify output voltage with a correctly rated HV measurement instrument in a qualified lab.
- Characterize rise/fall and residual output behaviour under a representative capacitive load.
- Verify current limiting, isolation, discharge behaviour and corona/ozone considerations.
- Confirm the output is suitable for the intended electrode configuration.

Do not provide DIY exposed-kilovolt wiring instructions. Any HV test must be performed by a qualified supervisor using enclosed, current-limited equipment, rated probes, interlocks and a documented discharge procedure.

### 6.5 Demonstrator electrode coupon
The 3D model should show:
- Flexible polyimide substrate.
- Patterned copper electrodes labelled A/B/C.
- Thin transparent dielectric cover.
- Connector tail.
- Protective test frame.
- Optional curved configuration to show conformability.

Do not finalize trace width, gap, pitch or voltage clearance from a simplistic kV/mm calculation. These depend on electrode-edge geometry, dielectric stack, surface contamination, humidity, voltage waveform and manufacturing tolerances. Show electrode geometry as a parameterized concept until the electrical test and design review are complete.

### 6.6 Demonstrator materials
| Part | Candidate material | Why | Limitation |
|---|---|---|---|
| Flexible substrate | Polyimide flex PCB | Flexible, readily fabricated | Copper fatigue and laminate construction need testing |
| Electrodes | Copper traces | Conductive, manufacturable | May crack under repeated bending |
| Dielectric cover | PET / polyimide film or vendor-specified coverlay | Insulation and particle barrier | Not flight-qualified; dielectric performance must be checked |
| Test enclosure | Clear acrylic/polycarbonate | Visibility and containment | Not a vacuum chamber |
| Test particles | Characterized glass microspheres or another supplier-documented safe medium | Repeatable size range | Spherical shape is not representative of angular lunar regolith |
| Controller | Arduino Uno R3 | Existing low-voltage timing controller | Cannot drive HV electrodes directly |
| HV stage | Candidate module only after validation | Potential low-cost source | Output/load behaviour currently unverified |

### 6.7 Demonstrator experiment protocol
Implement this as a guided checklist in the app:

1. Confirm enclosure is closed and test area is clear.
2. Record ambient temperature and relative humidity.
3. Photograph clean coupon.
4. Apply a measured quantity of particles using a repeatable method.
5. Photograph initial dust coverage.
6. Run a no-field control trial.
7. Run an energized trial under approved lab supervision.
8. Photograph final dust coverage.
9. Repeat at least five times.
10. Save trial data and images.

Metrics:
- Initial dust-covered area.
- Remaining dust-covered area.
- Clearing efficiency.
- Time to clear.
- Repeatability across trials.
- Relative humidity.
- Input electrical power (measured, not inferred from an unverified output rating).
- Observed particle transport direction.
- Any electrode damage or visible discharge.

Clearing efficiency:

`η = ((A_initial - A_remaining) / A_initial) × 100%`

Do not pre-populate the dashboard with a successful result. Start with `No experimental data recorded`.

### 6.8 Image-analysis panel
Include an image-analysis module in the product UI:
- Upload before/after images.
- Crop to the same region of interest.
- Normalize brightness/contrast consistently.
- Segment particles from the substrate using a configurable threshold or segmentation method.
- Show before/after mask overlay.
- Calculate area coverage and clearing efficiency.
- Allow manual correction of segmentation.
- Export CSV and a trial report.
- Display uncertainty/limitations: image thresholding is not a mass measurement and can be biased by lighting, shadows and particle overlap.

---

## 7. Interactive 3D scene requirements

### 7.1 Main assembly
Create a physically plausible assembly, not a generic sci-fi reactor.

Professional assembly layers:
1. Host surface coupon (radiator / optical glass / solar glass selectable).
2. Bonding/interface layer.
3. Flexible polymer substrate.
4. Copper electrode pattern.
5. Dielectric encapsulation.
6. Edge connector / electrical interface.
7. Driver electronics enclosure.
8. Low-voltage input connector.
9. Optional sensor module.

Demonstrator assembly:
1. Clear base / test frame.
2. Flexible polyimide coupon.
3. Copper A/B/C electrode traces.
4. Transparent cover film.
5. Edge connector.
6. Three candidate HV modules (visually marked `UNVERIFIED CANDIDATE`).
7. Arduino controller.
8. Clear test enclosure.
9. Test particles and camera/lighting.

### 7.2 Exploded view interaction
- Slider: `Assembled ↔ Exploded`.
- Each layer separates along a controlled axis with smooth easing.
- Clicking a layer highlights it and opens its technical card.
- `Explode all`, `Reassemble`, `Isolate selected`, `Hide selected`.
- Keep labels connected to their physical parts with leader lines.
- Do not allow labels to overlap the main object.
- A `show thickness exaggerated` toggle must be available because the real film is very thin.

### 7.3 Material inspection interaction
When a user clicks a layer, show:
- Name.
- Rendered material appearance.
- Role.
- Candidate composition.
- Nominal thickness or `TBD`.
- Why selected.
- Known weaknesses.
- Alternatives.
- Evidence/status badge.
- Cost estimate and quote status.
- Required validation tests.

### 7.4 Animation modes
1. `Assembly`: layers come together.
2. `Exploded`: components separate.
3. `Energize`: electrode phases animate.
4. `Field`: field visualization sweeps across the surface.
5. `Dust transport`: particles respond to the travelling field.
6. `Bending`: coupon bends around a gentle radius; show strain-risk zones conceptually.
7. `Failure modes`: highlight copper trace cracks, dielectric breakdown, delamination and adhesive failure as annotated failure scenarios—not as measured predictions.
8. `Host integration`: film conforms to a radiator/optical/solar surface.

### 7.5 Simulation controls
- Configuration: Professional / Demonstrator.
- Play / pause / reset.
- Speed: 0.25×, 0.5×, 1×, 2×.
- Frequency: default 10 Hz (illustrative).
- Phase mode: 1-phase / 2-phase / 3-phase (only where the selected configuration supports a meaningful conceptual display).
- Voltage: illustrative slider; label `display parameter — not a validated field solver`.
- Dust loading: low / medium / high.
- Particle size: small / medium / large.
- Particle response: charged / polarizable / mixed illustrative population.
- Surface curvature: flat / mild / curved.
- Field lines: on/off.
- Particle trails: on/off.
- Dust labels: on/off.
- Re-impact: on/off.
- Exploded view: on/off.

Do not expose controls that imply unsupported physical calculations. Use explanatory tooltips.

---

## 8. Architecture and system diagrams

Create two separate architecture diagrams.

### Professional system
```text
SPACECRAFT POWER BUS
        │
        ▼
INPUT PROTECTION + POWER CONDITIONING
        │
        ▼
HIGH-VOLTAGE CONVERSION
        │
        ▼
WAVEFORM GENERATION + PHASE CONTROL
        │
        ▼
FLEXIBLE ELECTRODE ARRAY
        │
        ▼
TIME-VARYING ELECTRIC FIELD
        │
        ▼
DUST LIFT / TRANSPORT

Optional feedback:
OBSCURATION SENSOR → CONTROLLER → DUTY SCHEDULER → DRIVER ENABLE
```

### Demonstrator system
```text
ARDUINO UNO (LOW-VOLTAGE CONTROL ONLY)
        │
        ▼
ISOLATED LOW-VOLTAGE INTERFACE
        │
        ▼
CANDIDATE HV MODULES / VERIFIED LAB DRIVER
        │
        ▼
FLEXIBLE A/B/C ELECTRODE COUPON
        │
        ▼
CONTROLLED TEST PARTICLES

CAMERA + HUMIDITY SENSOR → TRIAL RECORD → IMAGE ANALYSIS
```

Make clear that the Arduino does not supply electrode voltage. The candidate ion-generator modules do not become an approved EDS driver merely because their low-voltage inputs can be switched.

---

## 9. Evidence and claim management

Create an evidence registry with the following categories:

### Established / externally demonstrated
- NASA EDS was demonstrated on the lunar surface during Firefly Blue Ghost Mission 1 in March 2025.
- NASA's EDS principle uses high-voltage square waves across electrodes to create an electric field varying in space and time.
- The Blue Ghost glass EDS used in-plane interdigitated electrodes in two-phase mode.
- The Blue Ghost thermal-radiator EDS used out-of-plane grid electrodes in one-phase mode.
- Published flexible EDS work has evaluated copper electrodes on polyimide and CMrGO-based approaches.
- Published flexible EDS results show that electrode geometry, coating, bending durability and micro-discharges are meaningful engineering variables.

### LunaShield hypotheses / not yet validated
- A flexible, thin, retrofit-friendly product can reduce integration burden.
- A manufacturable stack can survive required bend cycles and lunar environmental conditions.
- A selected film/driver combination can achieve a useful clearing efficiency at an acceptable power level.
- A sensor/controller can schedule cleaning efficiently.
- Terrestrial solar-panel cleaning could be a bridge market.

### Prohibited claims until supported
- `LunaShield removes 90%+ of lunar dust`.
- `LunaShield is flight-ready`.
- `LunaShield is vacuum-qualified`.
- `LunaShield has no requalification burden`.
- `The demo replicates lunar conditions`.
- `The demo uses lunar regolith` unless it actually does.
- `The low-cost ionizer module is a validated EDS driver`.
- `The simulation predicts actual particle trajectories`.

Every key claim on screen should be tagged:
- `NASA DEMONSTRATED`
- `PUBLISHED RESEARCH`
- `LUNASHIELD TARGET`
- `FOUNDER ESTIMATE`
- `UNVERIFIED`
- `MEASURED IN OUR TEST` (only after data is entered)

---

## 10. Performance, UX and accessibility

- Target 60 FPS on a reasonably modern laptop where practical; degrade gracefully.
- Use instancing for particles.
- Use compressed textures and low-poly fallback meshes.
- Lazy-load 3D scenes and high-resolution assets.
- Provide a static technical diagram fallback if WebGL is unavailable.
- Keyboard-accessible navigation and component selection.
- High contrast for technical labels.
- Reduced-motion setting.
- All charts and measurements must have text equivalents.
- No autoplay audio.
- No forced full-screen mode.
- Keep the main presentation usable without a mouse where possible.

---

## 11. Testing requirements

### Unit tests
- Configuration values load correctly.
- Cost totals calculate correctly.
- Phase offsets and animation timing calculate correctly.
- Clearing efficiency calculation handles zero/invalid area safely.
- Missing/unknown values render as `TBD`, not `0` or fabricated values.

### UI tests
- Switching configurations updates geometry, BOM, architecture and material cards.
- Selecting a 3D layer opens the correct data panel.
- Exploded slider works.
- Simulation pause/reset works.
- Cost calculator correctly flags totals above ₹5,000.
- Evidence badges appear on the correct claims.

### Scientific QA checklist
- Does the field animation show a propagating pattern rather than random flashing?
- Does the UI explain that field lines are a visualization?
- Are the one-, two- and three-phase modes described accurately?
- Does the UI avoid calling the three-phase scene a Blue Ghost replica?
- Are candidate materials distinguished from flight-qualified materials?
- Are all cost numbers marked as estimates until quoted?
- Does the demonstrator clearly state that its particles and environment are not lunar regolith/vacuum?
- Does the app avoid claiming actual dust-removal performance before data is uploaded?

---

## 12. Suggested implementation milestones

### Milestone 1 — Visual foundation
- Create the React/Vite/TypeScript project.
- Establish the dark technical design system.
- Build the hero scene and camera controls.
- Add chapter navigation.

### Milestone 2 — 3D assembly
- Model the layered flexible film.
- Add selectable components and exploded view.
- Build material inspection cards.

### Milestone 3 — Working-principle animation
- Add A/B/C electrode groups.
- Animate phase sequence.
- Add field visualization overlay.
- Add illustrative particle transport.
- Add scientific disclaimer and parameter controls.

### Milestone 4 — Two configurations
- Build Professional and Demonstrator data configurations.
- Switch geometry and technical information based on configuration.
- Add comparison view.

### Milestone 5 — Engineering content
- Add materials database.
- Add electrical architecture diagrams.
- Add costs and editable budget calculator.
- Add validation roadmap and evidence registry.

### Milestone 6 — Investor presentation polish
- Add guided 3–5 minute presentation flow.
- Add cinematic transitions and camera bookmarks.
- Add exportable technical summary.
- Optimize performance and responsive layout.

### Milestone 7 — QA
- Run unit and UI tests.
- Verify all numbers and labels.
- Remove placeholder claims and fake measurements.
- Test on the presentation laptop and a second browser/device.

---

## 13. Investor presentation mode

Create a guided presentation that takes approximately 3–5 minutes:

1. **Problem:** lunar dust contaminates critical exposed hardware.
2. **Principle:** EDS creates a time-varying electric field that moves dust.
3. **Assembly:** reveal the flexible film layer by layer.
4. **Operation:** animate A/B/C field progression and particle transport.
5. **Two builds:** compare the professional product with the low-cost demonstrator.
6. **Engineering challenge:** durability, dielectric integrity, adhesion, thermal/UV/vacuum performance and manufacturing yield.
7. **Validation plan:** show the stage gates and the measurements required.
8. **Business case:** show the proposed customer surfaces and integration model, while marking market assumptions as assumptions.

The presentation must never imply that the demonstrator proves lunar qualification or that the professional model already exists as a validated product.

---

## 14. Source references

Use these as the initial technical evidence set. Read the source before using a claim; do not rely only on the summary in this file.

1. NASA — *Electrodynamic Dust Shield on the surface of the Moon* (2025):
   https://ntrs.nasa.gov/citations/20250009407
   - EDS principle, Blue Ghost payload configuration, one-/two-phase surface differences.

2. NASA — *NASA’s Dust Shield Successfully Repels Lunar Regolith on Moon* (27 March 2025):
   https://www.nasa.gov/image-article/nasas-dust-shield-successfully-repels-lunar-regolith-on-moon/
   - Mission-level confirmation and before/after result context.

3. NASA NTRS — *EDS on the Moon!*:
   https://ntrs.nasa.gov/citations/20250006102
   - NASA presentation material on lunar EDS demonstration.

4. *Flexible electrodynamic dust shields for lunar missions*, Acta Astronautica, Volume 244 (July 2026):
   https://doi.org/10.1016/j.actaastro.2026.02.023
   - Flexible copper/polyimide and CMrGO EDS research, bendability, micro-discharge and test results.

5. *Thermoplastic Dielectric Coatings for Flexible Electrodynamic Dust Shields: Structural and Functional Performance*, Advanced Materials Interfaces (first published 23 September 2026):
   https://doi.org/10.1002/admi.70667
   - Flexible laminate construction, encapsulation and bend-cycle failure considerations.

6. NASA — *CLPS EDS Payload Thermal Design and Analysis*:
   https://ntrs.nasa.gov/citations/20250005380
   - Flight payload thermal design context.

7. Visual/editorial reference — Subject Zero Science:
   https://www.youtube.com/@subjectzeroscience
   - Use for forensic engineering storytelling and evidence-led explanation, not for copying its assets.

---

## 15. Claude Code execution instructions

Before writing implementation code:

1. Inspect the existing repository and preserve useful code.
2. Read this entire `CLAUDE.md`.
3. Produce a short implementation plan and identify missing assets/dependencies.
4. Build the app in milestones; do not attempt one giant unreviewed code dump.
5. Keep all technical content in typed data files.
6. Add tests for calculations and configuration switching.
7. Use placeholder geometry only during the first milestone; replace it with a coherent, detailed model before calling the experience complete.
8. Do not fabricate research, test results, supplier quotes or physical properties.
9. If a design choice affects electrical safety or actual HV construction, stop and flag it for qualified engineering review rather than inventing a wiring design.
10. At the end, provide:
   - What was implemented.
   - How to run it.
   - Which values are verified vs assumptions.
   - Known limitations.
   - Missing assets or future work.
   - A list of tests run and their results.

### Definition of done
The project is not done merely because a 3D model renders. It is done when:
- Both configurations are selectable and materially distinct.
- The assembly can be exploded and reassembled.
- Every major component is inspectable.
- The operating principle animation is interactive.
- The simulation controls work and are honestly labelled.
- Cost and BOM data are visible and editable.
- The demonstrator budget does not falsely claim to be under ₹5,000.
- Professional costs and funding mismatch are disclosed.
- Evidence, assumptions and unverified claims are visibly distinguished.
- The investor presentation flow works from beginning to end.
