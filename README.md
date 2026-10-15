# AlgoCore HUB · Digestive Lab

An English-language interactive lesson for Primary Science 5, Unit 4.

**Open the lesson:** https://algocoreedu-coder.github.io/algocore-digestive-lab/

## Activities

- **4.1 Digestive system:** rotate and zoom a procedural 3D specimen, select six organs, show or hide labels, isolate organs, and follow food with Play, Pause, Back and Next.
- **4.2 Balanced plate:** sort food cards and compare fictional nutrition labels, with pointer and keyboard controls.

Reduced-motion settings, keyboard camera controls and an equivalent 2D digestive diagram are included. All lesson interactions run in the browser; no student account is needed.

The model uses conventional teaching colours and simplified proportions. It supports the book's hands-on model-making activity. It is not an anatomical measurement tool or a personalised nutrition assessment.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
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
npm run preview -- --port 4180
```

Open `http://127.0.0.1:4180/algocore-digestive-lab/` for that preview. Use a normal local build to return to the root URL.

## Teaching references and assets

The lesson is teacher-created supplementary material for Cambridge Primary Science 5, Unit 4. Book and Workbook files are not distributed. The app links to NIDDK, MedlinePlus, NCI and OpenStax for further reading and explains its model limits in Resources.

Geometry, procedural materials, food illustrations and practice questions were created for this lesson. AlgoCore branding and HUB styling are retained. Montserrat is bundled with its SIL Open Font License in `public/fonts/OFL-Montserrat.txt`.
