# AlgoCore HUB · Biology Lab

An English-language Biology library with Primary Science 5 activities and 25 selected-concept modules for Cambridge International AS & A Level Biology 9700 (2025–2027 syllabus).

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
| Prokaryotic cells | AS | BIO-002 Inside a bacterial cell |
| Biological molecules | AS | BIO-004 Starch, glycogen & cellulose; BIO-005 Phospholipid or triglyceride?; BIO-006 Levels of protein structure |
| Enzymes & signalling | AS | BIO-007 Enzyme binding & induced fit (includes BIO-008); BIO-009 Enzyme inhibition; BIO-012 Ligand, receptor & response |
| DNA & gene expression | AS | BIO-015 DNA double helix; BIO-016 DNA replication fork; BIO-017 Transcription & translation |
| Respiration pathways | A Level | BIO-032 Aerobic respiration pathway |
| Chloroplasts & photosynthesis | A Level | BIO-034 Inside a chloroplast; BIO-035 Light-dependent reactions; BIO-036 Calvin cycle carbon ledger |
| Genes & regulation | A Level | BIO-043 Homologues, loci & alleles; BIO-046 Lac operon control |

Choose a module in the library, or share a direct hash link such as `#alevel/BIO-044`. Rotate and zoom, select and isolate structures, reveal layers, and control the process with Play/Pause, Next, Back and direct step selection. Transport has six mechanisms with gradient/ATP controls; ADH has low/high comparisons; meiosis has two reproducible assortments.

The 14 AS modules and 11 additional A Level modules address selected concepts. Wave 2 adds 16 modules (10 AS and six A Level), with a library filter and search by title, collection or module ID. Original schematic geometry uses the established teaching colours and HUB interface. Sources and specific limits appear within each lesson. Reduced motion and 2D structure maps preserve the explanations; Wave 2 maps offer a selectable structure index and lesson steps, while layer hiding and isolation are available in 3D.

Wave 2 molecular presets distinguish starch/glycogen/cellulose, lipids, enzyme binding and inhibition. DNA lessons separate nuclear transcription, RNA processing/export and cytoplasmic translation. Photosynthesis distinguishes cyclic and non-cyclic electron flow and accounts for carbon through the Calvin cycle; the lac example holds glucose low. These are qualitative teaching models, without experimental atomic coordinates, quantitative reaction kinetics or a universal ATP yield. BIO-043 uses one homologous pair; the earlier chromosome division lessons use an illustrative 2n = 4 cell.

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

Scientific regression checks cover transport direction and energy dependence, ADH outcomes, crista membrane attachment, chromosome segregation, carbon balance, DNA/RNA complementarity, enzyme/substrate counts, inhibitor outcomes, ligand compartments and structure visibility. Run `npm test` with Node 24. Tests also run before deployment. They complement source review and browser checks; they do not constitute formal educational accreditation.
