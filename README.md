# AlgoCore HUB · Biology Lab

An English-language Biology library with Primary Science 5 activities and nine selected-concept modules for Cambridge International AS & A Level Biology 9700 (2025–2027 syllabus).

**Open the lesson:** https://algocoreedu-coder.github.io/algocore-digestive-lab/

**Open the AS & A Level library:** https://algocoreedu-coder.github.io/algocore-digestive-lab/#library

## AS & A Level collections

| Collection | Level | Modules |
| --- | --- | --- |
| Membranes & transport | AS | BIO-010 Fluid mosaic membrane; BIO-011 Transport across membranes |
| Chromosomes & mitosis | AS | BIO-013 Chromosomes & chromatids; BIO-014 Cell cycle & mitosis |
| Mitochondria & ATP | A Level | BIO-031 Inside a mitochondrion; BIO-033 Proton gradient & ATP synthase |
| Meiosis | A Level | BIO-044 Meiosis & genetic variation |
| Kidneys & water balance | A Level | BIO-037 Kidney & nephron; BIO-038 ADH & aquaporins |

Choose a module in the library, or share a direct hash link such as `#alevel/BIO-044`. Rotate and zoom, select and isolate structures, reveal layers, and control the process with Play/Pause, Next, Back and direct step selection. Transport has six mechanisms with gradient/ATP controls; ADH has low/high comparisons; meiosis has two reproducible assortments.

The four AS modules and five additional A Level modules address selected concepts, rather than the complete syllabus. Geometry is original and schematic. Chromosome counts use an illustrative 2n = 4 cell; crista lumen/junction topology, transport kinetics and physiological rates are simplified. Sources and specific limits appear within each lesson. Reduced motion and 2D structure maps preserve the explanations; chromosome fallback diagrams follow the process states.

## Activities

- **4.1 Digestive system:** rotate and zoom a procedural 3D specimen, select six organs, show or hide labels, isolate organs, and follow food with Play, Pause, Back and Next.
- **4.2 Balanced plate:** sort food cards and compare fictional nutrition labels, with pointer and keyboard controls.

Reduced-motion settings, keyboard camera controls and an equivalent 2D digestive diagram are included. All lesson interactions run in the browser; no student account is needed.

The model uses conventional teaching colours and simplified proportions. It supports the book's hands-on model-making activity. It is not an anatomical measurement tool or a personalised nutrition assessment.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run dev -- --port 5180
```

For a local production preview:

```sh
npm run build
npm run preview -- --port 4180
```

React, TypeScript, Vite, Three.js and React Three Fiber.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`. In repository Settings → Pages, the publishing source is **GitHub Actions**. The build derives its base URL from the repository name and uploads only `dist/`.

To reproduce the hosted build locally:

```sh
npm run build -- --base /algocore-digestive-lab/
npm run preview -- --port 4180 --base /algocore-digestive-lab/
```

Open `http://127.0.0.1:4180/algocore-digestive-lab/` for that preview. Use a normal local build to return to the root URL.

## Teaching references and assets

The lesson is teacher-created supplementary material for Cambridge Primary Science 5, Unit 4. Book and Workbook files are not distributed. The app links to NIDDK, MedlinePlus, NCI and OpenStax for further reading and explains its model limits in Resources.

Geometry, procedural materials, food illustrations and practice questions were created for these lessons. AlgoCore branding and HUB styling are retained. Montserrat is bundled with its SIL Open Font License in `public/fonts/OFL-Montserrat.txt`.

Scientific regression checks cover transport direction and energy dependence, ADH outcomes, crista membrane attachment, deterministic chromosome segregation and haploid product composition. Run `npm test` with Node 24. Tests also run before deployment. They complement source review and browser checks; they do not constitute formal educational accreditation.
