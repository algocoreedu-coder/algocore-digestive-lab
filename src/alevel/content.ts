import type { LessonStep, ModuleSpec } from './types';

const syllabus = { title: 'Cambridge Biology 9700 · 2025–2027 syllabus', url: 'https://www.cambridgeinternational.org/Images/664560-2025-2027-syllabus.pdf' };
const book = (section: string, slug: string) => ({ title: `OpenStax Biology 2e · ${section}`, url: `https://openstax.org/books/biology-2e/pages/${slug}` });
const anatomy = (section: string, slug: string) => ({ title: `OpenStax Anatomy and Physiology 2e · ${section}`, url: `https://openstax.org/books/anatomy-and-physiology-2e/pages/${slug}` });
const coral = '#ee887a', amber = '#e7b466', teal = '#75cfc4', violet = '#ae9bd8', rose = '#d393ac', blue = '#83afcf';

/** Original teaching text and questions. Links identify background references, not borrowed assessments. */
export const MODULES: ModuleSpec[] = [
  {
    id: 'BIO-010', title: 'Fluid mosaic membrane', level: 'AS', bundle: 'Membranes & transport', kicker: 'Topic 4 · Structure and function',
    description: 'Explore the two leaflets and the molecules that make a selective, flexible boundary.',
    outcome: 'Relate the position of each membrane component to its function.',
    structures: [
      { id: 'bilayer', label: 'Phospholipid bilayer', color: coral, description: 'Two leaflets separate the aqueous compartments.' },
      { id: 'heads', label: 'Hydrophilic heads', color: rose, description: 'Polar heads face water on both sides.' },
      { id: 'tails', label: 'Hydrophobic tails', color: amber, description: 'Non-polar tails face inward, away from water.' },
      { id: 'channel', label: 'Channel protein', color: teal, description: 'A selective hydrophilic passage through the membrane.' },
      { id: 'carrier', label: 'Carrier protein', color: violet, description: 'Binds a substance and changes conformation to transfer it.' },
      { id: 'cholesterol', label: 'Cholesterol', color: amber, description: 'Between phospholipids; moderates fluidity and permeability.' },
      { id: 'glycoprotein', label: 'Glycoprotein', color: violet, description: 'A protein with an outward-facing carbohydrate chain; recognition or signalling.' },
      { id: 'glycolipid', label: 'Glycolipid', color: teal, description: 'A lipid with an outward-facing carbohydrate chain; cell recognition.' },
    ],
    steps: [
      { title: 'Build the bilayer', description: 'Find the water-facing heads and inward-facing tails in both leaflets.', keyIdea: 'The membrane has a hydrophobic interior.', focus: ['bilayer', 'heads', 'tails'] },
      { title: 'Add transport proteins', description: 'Compare a channel pore with a carrier that changes conformation.', keyIdea: 'Proteins provide selective routes across the barrier.', focus: ['channel', 'carrier'] },
      { title: 'Regulate fluidity', description: 'Locate cholesterol among the phospholipid tails.', keyIdea: 'Membrane components can move laterally; this is a dynamic mosaic.', focus: ['cholesterol', 'bilayer'] },
      { title: 'Recognise the outer surface', description: 'Follow the carbohydrate chains projecting into the extracellular space.', keyIdea: 'The two membrane faces have different compositions.', focus: ['glycoprotein', 'glycolipid'] },
    ],
    question: { prompt: 'Which arrangement is correct in an animal cell surface membrane?', options: ['Tails face the water on both sides.', 'Heads face water; tails form the interior.', 'Carbohydrate chains project into the cytoplasm only.'], answer: 1, explanation: 'The polar heads interact with water. The non-polar tails face each other inside the bilayer.' },
    sources: [syllabus, book('5.1 Components and structure', '5-1-components-and-structure')],
    limitation: 'Enlarged schematic components, not an atomic structure. Colours identify components; spacing and molecular ratios are illustrative.',
  },
  {
    id: 'BIO-011', title: 'Transport across membranes', level: 'AS', bundle: 'Membranes & transport', kicker: 'Topic 4 · Compare six mechanisms',
    description: 'Change the pathway, gradient and energy supply to explain movement between compartments.',
    outcome: 'Distinguish passive transport, ATP-driven pumping and vesicle transport.',
    structures: [
      { id: 'membrane', label: 'Cell surface membrane', color: coral, description: 'A selectively permeable boundary between outside and cytoplasm.' },
      { id: 'channel', label: 'Channel protein', color: teal, description: 'Allows suitable particles down their gradient.' },
      { id: 'carrier', label: 'Carrier / pump', color: violet, description: 'Binds cargo; the active preset couples transfer to ATP.' },
      { id: 'solute', label: 'Solute / cargo', color: amber, description: 'Illustrative particles, not a measured concentration.' },
      { id: 'water', label: 'Water', color: blue, description: 'Net osmosis follows the water-potential gradient.' },
      { id: 'vesicle', label: 'Transport vesicle', color: rose, description: 'A membrane-enclosed compartment for bulk cargo.' },
      { id: 'atp', label: 'ATP supply', color: amber, description: 'Energy is needed for the pump and vesicle transport shown here.' },
    ],
    variants: [
      { id: 'simple', label: 'Simple diffusion', description: 'Small non-polar molecules cross the bilayer: net high to low concentration.' },
      { id: 'facilitated', label: 'Facilitated diffusion', description: 'A selective protein enables net movement down a gradient, without ATP use.' },
      { id: 'active', label: 'Active transport', description: 'The illustrated pump uses ATP to move cargo against its concentration gradient.' },
      { id: 'osmosis', label: 'Osmosis', description: 'Net water movement: higher to lower water potential across a selectively permeable membrane.' },
      { id: 'endocytosis', label: 'Endocytosis', description: 'Membrane encloses extracellular cargo and buds inward as a vesicle.' },
      { id: 'exocytosis', label: 'Exocytosis', description: 'An intracellular vesicle fuses with the surface membrane and releases cargo outside.' },
    ],
    steps: [
      { title: 'Establish the compartments', description: 'Choose a pathway. Identify outside and cytoplasm, then compare the two sides.', keyIdea: 'A concentration gradient and a water-potential gradient are different quantities.', focus: ['membrane', 'solute', 'water'] },
      { title: 'Meet the barrier', description: 'Check whether the selected cargo uses the bilayer, a protein or a vesicle.', keyIdea: 'The pathway depends on the cargo and mechanism.', focus: ['membrane', 'channel', 'carrier', 'vesicle'] },
      { title: 'Cross by the selected route', description: 'Follow the transfer. Remove ATP to test the pump and vesicle pathways.', keyIdea: 'Passive movement needs no ATP; the illustrated pump and vesicle processes do.', focus: ['solute', 'water', 'vesicle', 'atp'] },
      { title: 'Explain the net result', description: 'Use the selected pathway description to explain direction and energy requirement.', keyIdea: 'At equilibrium particles still move, but there is no net passive transfer.', focus: ['membrane', 'solute', 'water'] },
    ],
    question: { prompt: 'A membrane protein transfers solute from lower to higher concentration using ATP. What is this?', options: ['Facilitated diffusion', 'Active transport', 'Osmosis'], answer: 1, explanation: 'This pump uses an energy supply to move solute against its concentration gradient. Osmosis concerns water.' },
    sources: [syllabus, book('5.2 Passive transport', '5-2-passive-transport'), book('5.3 Active transport', '5-3-active-transport'), book('5.4 Bulk transport', '5-4-bulk-transport')],
    limitation: 'Qualitative net-transfer illustration. Particle counts are not concentration measurements. Ion voltage gradients and transport kinetics are not calculated.',
  },
  {
    id: 'BIO-013', title: 'Chromosomes & chromatids', level: 'AS', bundle: 'Chromosomes & mitosis', kicker: 'Topic 5 · Count what is copied',
    description: 'Separate chromosome identity, sister chromatids and DNA content before following division.',
    outcome: 'Explain why DNA replication doubles DNA content without doubling chromosome number.',
    structures: [
      { id: 'dna', label: 'DNA', color: teal, description: 'Each chromatid contains one continuous DNA double helix.' },
      { id: 'histones', label: 'Histone proteins', color: amber, description: 'DNA associates with histones in chromatin.' },
      { id: 'chromatid', label: 'One chromatid', color: coral, description: 'One longitudinal copy within a replicated chromosome.' },
      { id: 'sisters', label: 'Sister chromatids', color: coral, description: 'Copies produced by replication of the same chromosome.' },
      { id: 'centromere', label: 'Centromere region', color: violet, description: 'The region where sisters remain joined before separation.' },
      { id: 'telomeres', label: 'Telomeres', color: teal, description: 'Protective DNA regions at the chromosome ends.' },
    ],
    steps: [
      { title: 'Before replication', description: 'Follow one unreplicated chromosome and its single DNA molecule.', keyIdea: 'A chromosome is not always X-shaped.', focus: ['dna', 'histones', 'chromatid'], metrics: [{ label: 'Chromosomes shown', value: '1' }, { label: 'DNA molecules', value: '1' }] },
      { title: 'After replication', description: 'Two sister chromatids remain joined at the centromere region.', keyIdea: 'Two chromatids still form one replicated chromosome.', focus: ['sisters', 'centromere', 'telomeres'], metrics: [{ label: 'Chromosomes shown', value: '1' }, { label: 'DNA molecules', value: '2' }] },
      { title: 'After sister separation', description: 'Each separated sister is now counted as a daughter chromosome.', keyIdea: 'Separation changes the chromosome count; it does not copy DNA again.', focus: ['chromatid', 'centromere'], metrics: [{ label: 'Daughter chromosomes shown', value: '2' }, { label: 'DNA molecules in both', value: '2' }] },
    ],
    question: { prompt: 'Immediately after DNA replication, one chromosome consists of…', options: ['Two sister chromatids, each with a DNA molecule.', 'Two homologous chromosomes.', 'One chromatid with no DNA.'], answer: 0, explanation: 'Replication produces sisters of the same chromosome. Homologues are corresponding chromosomes inherited from different parents.' },
    sources: [syllabus, { title: 'NHGRI · Chromosome', url: 'https://www.genome.gov/genetics-glossary/Chromosome' }, { title: 'NHGRI · Chromatid', url: 'https://www.genome.gov/genetics-glossary/Chromatid' }, book('10.1 Cell division', '10-1-cell-division')],
    limitation: 'Condensed shapes make counting clear. Chromatin is usually less condensed in interphase. This single-chromosome close-up does not define cell ploidy.',
  },
  {
    id: 'BIO-014', title: 'Cell cycle & mitosis', level: 'AS', bundle: 'Chromosomes & mitosis', kicker: 'Topic 5 · One replication, one division',
    description: 'Track an illustrative diploid animal cell through interphase, mitosis and cytokinesis.',
    outcome: 'Explain how chromosome separation preserves the chromosome complement in daughter cells.',
    structures: [
      { id: 'chromosomes', label: 'Chromosomes / chromatin', color: coral, description: 'Two homologous pairs are represented: the model has 2n = 4.' },
      { id: 'spindle', label: 'Spindle fibres', color: teal, description: 'Microtubules position and separate chromosomes.' },
      { id: 'poles', label: 'Spindle poles', color: amber, description: 'Opposite ends of the mitotic spindle.' },
      { id: 'nucleus', label: 'Nuclear envelope', color: violet, description: 'Breaks down in early mitosis and reforms around daughter sets.' },
      { id: 'membrane', label: 'Cell surface membrane', color: rose, description: 'A cleavage furrow divides this animal-cell model.' },
    ],
    steps: [
      { title: 'G1 · growth', description: 'The nucleus contains the diploid chromosome complement as decondensed chromatin.', keyIdea: 'The reference cell has 2n = 4.', focus: ['nucleus', 'chromosomes'], metrics: [{ label: 'Cell state', value: '2n · 2C' }, { label: 'Chromosomes', value: '4' }] },
      { title: 'S · DNA replication', description: 'DNA is copied; sister chromatids form for each chromosome.', keyIdea: 'DNA content rises; chromosome number stays four.', focus: ['chromosomes'], metrics: [{ label: 'DNA content', value: '2C → 4C' }, { label: 'Chromosomes', value: '4' }] },
      { title: 'G2 · preparation', description: 'The cell grows and prepares for division after DNA replication.', keyIdea: 'Four replicated chromosomes contain eight chromatids.', focus: ['nucleus', 'chromosomes'], metrics: [{ label: 'Cell state', value: '2n · 4C' }, { label: 'Chromatids', value: '8' }] },
      { title: 'Prophase', description: 'Chromosomes condense, the spindle forms and the nuclear envelope breaks down.', keyIdea: 'Sisters remain joined at this stage.', focus: ['chromosomes', 'spindle', 'nucleus'], metrics: [{ label: 'Cell state', value: '2n · 4C' }] },
      { title: 'Metaphase', description: 'Replicated chromosomes align individually at the equator.', keyIdea: 'Homologous pairs do not form bivalents in mitosis.', focus: ['chromosomes', 'spindle'], metrics: [{ label: 'Chromosomes at equator', value: '4 replicated' }] },
      { title: 'Anaphase', description: 'Sister chromatids separate. Daughter chromosomes move to opposite poles.', keyIdea: 'Each pole receives a complete diploid set.', focus: ['chromosomes', 'spindle', 'poles'], metrics: [{ label: 'At each pole', value: '4 chromosomes · 2C' }] },
      { title: 'Telophase', description: 'Chromosomes decondense and a nuclear envelope reforms around each set.', keyIdea: 'Each daughter nucleus is 2n, with 2C DNA.', focus: ['nucleus', 'chromosomes'], metrics: [{ label: 'Per daughter nucleus', value: '2n · 2C' }] },
      { title: 'Cytokinesis', description: 'The cytoplasm divides, forming two daughter cells.', keyIdea: 'Each daughter retains 2n = 4, barring mutation or segregation error.', focus: ['membrane', 'nucleus'], metrics: [{ label: 'Per daughter cell', value: '2n · 2C' }, { label: 'Products', value: '2 cells' }] },
    ],
    question: { prompt: 'In this 2n = 4 model, how many chromosomes should each normal daughter nucleus receive?', options: ['2', '4', '8'], answer: 1, explanation: 'Mitosis preserves the chromosome complement. Each daughter nucleus receives four chromosomes; DNA was copied before mitosis.' },
    sources: [syllabus, book('10.2 The cell cycle', '10-2-the-cell-cycle'), book('10.1 Cell division', '10-1-cell-division')],
    limitation: 'Schematic animal cell with two chromosome pairs, not a human karyotype. C is relative nuclear DNA content; 1C is one unreplicated haploid genome. Plant cytokinesis uses a cell plate.',
  },
  {
    id: 'BIO-031', title: 'Inside a mitochondrion', level: 'A Level', bundle: 'Mitochondria & ATP', kicker: 'Topic 12 · Compartments and surfaces',
    description: 'Reveal the double membrane and follow how its folds organise aerobic respiration.',
    outcome: 'Locate the matrix, intermembrane space and inner membrane, then relate them to respiration.',
    structures: [
      { id: 'outer', label: 'Outer membrane', color: coral, description: 'The outer boundary of the mitochondrial envelope.' },
      { id: 'inner', label: 'Inner membrane', color: teal, description: 'Contains the electron transport chain and ATP synthase.' },
      { id: 'cristae', label: 'Cristae', color: teal, description: 'Inner-membrane folds increase surface area.' },
      { id: 'matrix', label: 'Matrix', color: amber, description: 'Inside the inner membrane; site of the link reaction and Krebs cycle.' },
      { id: 'ims', label: 'Intermembrane space', color: violet, description: 'Between the two membranes; protons accumulate here during pumping.' },
      { id: 'dna', label: 'Mitochondrial DNA', color: rose, description: 'Small circular DNA molecules in the matrix.' },
      { id: 'ribosomes', label: 'Mitochondrial ribosomes', color: violet, description: 'Translate mitochondrial messenger RNA in the matrix.' },
    ],
    steps: [
      { title: 'Two membranes', description: 'Rotate the envelope. Use the cutaway to see the separate outer and inner membranes.', keyIdea: 'Each membrane is itself a phospholipid bilayer.', focus: ['outer', 'inner'] },
      { title: 'Folded inner surface', description: 'Trace a crista into the organelle without crossing the inner membrane.', keyIdea: 'Cristae add surface for oxidative phosphorylation.', focus: ['inner', 'cristae'] },
      { title: 'Matrix compartment', description: 'Find the central aqueous compartment, mitochondrial DNA and ribosomes.', keyIdea: 'The link reaction and Krebs cycle occur in the matrix.', focus: ['matrix', 'dna', 'ribosomes'] },
      { title: 'Intermembrane space', description: 'Locate the space outside the inner membrane and inside the outer membrane.', keyIdea: 'The inner membrane separates matrix from intermembrane space.', focus: ['ims', 'inner', 'matrix'] },
    ],
    question: { prompt: 'Which compartment receives the protons pumped out of the matrix during oxidative phosphorylation?', options: ['Cytoplasm', 'Intermembrane space', 'Mitochondrial DNA'], answer: 1, explanation: 'Pumping across the inner membrane moves protons from the matrix into the intermembrane space.' },
    sources: [syllabus, book('4.3 Eukaryotic cells', '4-3-eukaryotic-cells'), book('7.4 Oxidative phosphorylation', '7-4-oxidative-phosphorylation')],
    limitation: 'A cutaway teaching reconstruction. Cristae vary among mitochondria; dimensions, folds and molecular numbers are illustrative. Crista lumens and junction topology are abbreviated rather than reconstructed from microscopy.',
  },
  {
    id: 'BIO-033', title: 'Proton gradient & ATP synthase', level: 'A Level', bundle: 'Mitochondria & ATP', kicker: 'Topic 12 · Oxidative phosphorylation',
    description: 'Connect electron transfer, proton pumping and chemiosmosis across the inner mitochondrial membrane.',
    outcome: 'Explain how electron-transfer energy establishes a gradient that drives ATP synthesis.',
    structures: [
      { id: 'inner', label: 'Inner membrane', color: teal, description: 'Separates the matrix from the intermembrane space.' },
      { id: 'matrix', label: 'Matrix', color: amber, description: 'Protons return here through ATP synthase.' },
      { id: 'ims', label: 'Intermembrane space', color: violet, description: 'The higher-proton side of the energised membrane.' },
      { id: 'donor', label: 'Reduced NAD / FAD', color: rose, description: 'Supply electrons to the electron transport chain.' },
      { id: 'etc', label: 'Electron transport chain', color: coral, description: 'Electron transfers release energy used for proton pumping.' },
      { id: 'protons', label: 'Protons · H+', color: amber, description: 'Pumped matrix → intermembrane space; return through ATP synthase.' },
      { id: 'synthase', label: 'ATP synthase', color: teal, description: 'Uses proton flow to drive ATP formation from ADP and phosphate.' },
      { id: 'atp', label: 'ATP', color: amber, description: 'Formed on the matrix side of the inner membrane.' },
      { id: 'oxygen', label: 'Oxygen / water', color: blue, description: 'Oxygen is the final electron acceptor; reduction produces water.' },
    ],
    steps: [
      { title: 'Supply electrons', description: 'Reduced NAD and reduced FAD donate electrons to the chain.', keyIdea: 'The donors become oxidised.', focus: ['donor', 'etc'] },
      { title: 'Pump protons', description: 'Electron-transfer energy drives H+ from matrix into intermembrane space.', keyIdea: 'Electron movement and proton pumping are distinct processes.', focus: ['etc', 'protons', 'matrix', 'ims'] },
      { title: 'Store a gradient', description: 'The inner membrane restricts free proton return, sustaining an electrochemical gradient.', keyIdea: 'The gradient has both concentration and electrical components.', focus: ['inner', 'protons', 'ims'] },
      { title: 'Make ATP by chemiosmosis', description: 'H+ returns to the matrix through ATP synthase, driving ADP + phosphate → ATP.', keyIdea: 'The synthase does not pump these protons out to make ATP.', focus: ['synthase', 'protons', 'atp'] },
      { title: 'Reduce oxygen to water', description: 'At the end of the chain, oxygen accepts electrons and combines with protons to form water.', keyIdea: 'This terminal reaction operates alongside pumping and ATP synthesis.', focus: ['oxygen', 'etc'] },
    ],
    question: { prompt: 'Which proton movement directly drives ATP synthesis in this model?', options: ['Matrix → intermembrane space through ATP synthase', 'Intermembrane space → matrix through ATP synthase', 'Cytoplasm → nucleus'], answer: 1, explanation: 'Protons return down their electrochemical gradient through ATP synthase into the matrix, coupling this flow to ATP formation.' },
    sources: [syllabus, book('7.4 Oxidative phosphorylation', '7-4-oxidative-phosphorylation')],
    limitation: 'A qualitative mechanism with illustrative carriers and particles. Pumping stoichiometry, membrane voltage and ATP yield are not calculated. The stages describe linked events, not isolated batches.',
  },
  {
    id: 'BIO-037', title: 'Kidney & nephron', level: 'A Level', bundle: 'Kidney & osmoregulation', kicker: 'Topic 14 · From blood to urine',
    description: 'Move from the kidney cutaway to one enlarged nephron and keep blood separate from filtrate.',
    outcome: 'Trace ultrafiltration, selective reabsorption and the route to the ureter.',
    structures: [
      { id: 'capsule', label: 'Fibrous capsule', color: coral, description: 'Protective outer covering of the kidney.' },
      { id: 'cortex', label: 'Cortex', color: rose, description: 'Outer region containing renal corpuscles and convoluted tubules.' },
      { id: 'medulla', label: 'Medulla', color: violet, description: 'Inner region traversed by loops of Henle and collecting ducts.' },
      { id: 'pelvis', label: 'Renal pelvis', color: amber, description: 'Collects urine before it enters the ureter.' },
      { id: 'ureter', label: 'Ureter', color: amber, description: 'Carries urine from kidney to bladder.' },
      { id: 'artery', label: 'Renal artery / blood route', color: coral, description: 'Supplies blood; afferent arterioles lead to glomeruli.' },
      { id: 'vein', label: 'Renal vein / returning blood', color: blue, description: 'Blood returns after the glomerular and peritubular circulation.' },
      { id: 'glomerulus', label: 'Glomerulus', color: coral, description: 'Capillary tuft where blood pressure drives ultrafiltration.' },
      { id: 'bowman', label: "Bowman's capsule", color: amber, description: 'Receives filtrate across the glomerular filtration barrier.' },
      { id: 'pct', label: 'Proximal convoluted tubule', color: teal, description: 'Reabsorbs glucose, amino acids, ions and much water.' },
      { id: 'loop', label: 'Loop of Henle', color: violet, description: 'Its limbs help establish the medullary osmotic gradient.' },
      { id: 'dct', label: 'Distal convoluted tubule', color: teal, description: 'Adjusts filtrate composition after the ascending limb.' },
      { id: 'collecting', label: 'Collecting duct', color: amber, description: 'ADH regulates water permeability as fluid passes through the medulla.' },
    ],
    steps: [
      { title: 'Locate the kidney regions', description: 'Find the cortex, medulla, pelvis and ureter; then inspect the enlarged nephron.', keyIdea: 'The kidney and nephron views use different scales.', focus: ['capsule', 'cortex', 'medulla', 'pelvis', 'ureter'] },
      { title: 'Ultrafiltration', description: 'Water and small solutes enter Bowman’s space. Blood cells and most plasma proteins remain in blood.', keyIdea: 'Filtrate leaves the capillaries; whole blood does not enter the tubule.', focus: ['glomerulus', 'bowman', 'artery'] },
      { title: 'Selective reabsorption', description: 'Useful solutes and water return from the proximal tubule to surrounding blood.', keyIdea: 'Reabsorption means tubule → blood.', focus: ['pct', 'vein'] },
      { title: 'Loop and distal tubule', description: 'Trace the descending and ascending limbs, then the distal convoluted tubule.', keyIdea: 'The loop helps maintain conditions for concentrating urine.', focus: ['loop', 'dct', 'medulla'] },
      { title: 'Collect and drain urine', description: 'Fluid enters a collecting duct, then drains through the pelvis into the ureter.', keyIdea: 'Excreted urine differs greatly from the original glomerular filtrate.', focus: ['collecting', 'pelvis', 'ureter'] },
    ],
    question: { prompt: 'Which statement correctly describes selective reabsorption?', options: ['Blood cells pass into Bowman’s capsule.', 'Useful substances move from tubule fluid back to blood.', 'The ureter returns all filtrate to blood.'], answer: 1, explanation: 'Reabsorption returns substances from the nephron lumen to blood. Blood cells normally remain in the glomerular capillaries.' },
    sources: [syllabus, { title: 'NIDDK · Your kidneys and how they work', url: 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work' }, book('41.2 Kidneys and osmoregulatory organs', '41-2-the-kidneys-and-osmoregulatory-organs'), anatomy('25.5 Physiology of urine formation', '25-5-physiology-of-urine-formation')],
    limitation: 'One enlarged nephron represents many units. The collecting duct receives multiple nephrons. Paths are schematic; filtration pressure and transport rates are not calculated.',
  },
  {
    id: 'BIO-038', title: 'ADH & aquaporins', level: 'A Level', bundle: 'Kidney & osmoregulation', kicker: 'Topic 14 · Negative feedback',
    description: 'Compare high and low ADH while following the collecting-duct wall from lumen to blood.',
    outcome: 'Explain how ADH changes water permeability and urine concentration.',
    structures: [
      { id: 'hypothalamus', label: 'Hypothalamus', color: violet, description: 'Osmoreceptors detect blood-water-potential changes; ADH is synthesised here.' },
      { id: 'pituitary', label: 'Posterior pituitary', color: rose, description: 'Stores and releases ADH into blood.' },
      { id: 'adh', label: 'ADH', color: amber, description: 'A bloodborne hormone acting on collecting-duct cells.' },
      { id: 'receptor', label: 'ADH receptor', color: violet, description: 'Binds ADH on the blood-facing side of a collecting-duct cell.' },
      { id: 'aquaporin', label: 'Aquaporins', color: teal, description: 'Water channels inserted into the lumen-facing membrane in response to ADH.' },
      { id: 'collecting', label: 'Collecting duct', color: coral, description: 'Its variable water permeability changes the final water reabsorption.' },
      { id: 'interstitium', label: 'Medullary interstitium / blood', color: violet, description: 'Lower water potential draws water out of the permeable duct.' },
      { id: 'water', label: 'Water', color: blue, description: 'Moves by osmosis; ADH does not actively pump water.' },
    ],
    variants: [
      { id: 'low', label: 'Low ADH', description: 'Fewer apical aquaporins, less water reabsorbed: larger volume of dilute urine.' },
      { id: 'high', label: 'High ADH', description: 'More apical aquaporins, more water reabsorbed: smaller volume of concentrated urine.' },
    ],
    steps: [
      { title: 'Detect the change', description: 'Compare low blood water potential with a higher-water-potential state.', keyIdea: 'A fall in blood water potential normally stimulates greater ADH release.', focus: ['hypothalamus', 'water'] },
      { title: 'Release the hormone', description: 'ADH made in the hypothalamus is released from the posterior pituitary.', keyIdea: 'Production and release occur in different locations.', focus: ['hypothalamus', 'pituitary', 'adh'] },
      { title: 'Reach the target cells', description: 'Blood carries ADH to receptors on the blood-facing side of collecting-duct cells.', keyIdea: 'ADH binds a receptor; it does not flow through the tubule as filtrate.', focus: ['adh', 'receptor', 'collecting'] },
      { title: 'Change water permeability', description: 'High ADH promotes insertion of aquaporins into the lumen-facing membrane; low ADH favours fewer channels.', keyIdea: 'The channel change regulates permeability to water.', focus: ['aquaporin', 'collecting'] },
      { title: 'Reabsorb water by osmosis', description: 'Where permeable, water moves from duct lumen toward the lower water potential of the medulla, then returns to blood.', keyIdea: 'Water recovery raises blood water potential, reducing the original stimulus.', focus: ['water', 'interstitium', 'aquaporin'] },
    ],
    question: { prompt: 'With the medullary gradient unchanged, what is the expected effect of increased ADH?', options: ['Fewer apical aquaporins and more dilute urine.', 'More apical aquaporins and a smaller volume of concentrated urine.', 'Active pumping of water into the duct.'], answer: 1, explanation: 'ADH increases collecting-duct water permeability. Water leaves by osmosis, so less water remains in the urine.' },
    sources: [syllabus, anatomy('25.8 Endocrine regulation of kidney function', '25-8-endocrine-regulation-of-kidney-function'), anatomy('17.3 Pituitary gland and hypothalamus', '17-3-the-pituitary-gland-and-hypothalamus')],
    limitation: 'Qualitative high/low comparison with a maintained medullary gradient. Hormone concentration, urine volume and channel numbers are illustrative. Intracellular signalling is abbreviated.',
  },
  {
    id: 'BIO-044', title: 'Meiosis & genetic variation', level: 'A Level', bundle: 'Meiosis & inheritance', kicker: 'Topic 16 · One replication, two divisions',
    description: 'Follow two homologous pairs through crossing over, independent assortment and haploid-product formation.',
    outcome: 'Distinguish separation of homologues in meiosis I from sister separation in meiosis II.',
    structures: [
      { id: 'homologs', label: 'Homologous chromosomes', color: coral, description: 'Corresponding maternal and paternal chromosomes carry the same gene loci.' },
      { id: 'sisters', label: 'Sister chromatids', color: teal, description: 'Replicated copies; crossing over may make their allele combinations differ.' },
      { id: 'centromere', label: 'Centromere region', color: violet, description: 'Sisters remain associated through the first meiotic division.' },
      { id: 'chiasma', label: 'Chiasma / crossover', color: amber, description: 'Marks exchange between non-sister chromatids of homologues.' },
      { id: 'spindle', label: 'Spindle fibres', color: teal, description: 'Orient and separate chromosome sets during each division.' },
      { id: 'gametes', label: 'Haploid products', color: rose, description: 'Four schematic products, each with one chromosome of each pair.' },
    ],
    variants: [
      { id: 'orientation-a', label: 'Assortment A', description: 'A fixed orientation of both homologous pairs. Replay preserves this arrangement.' },
      { id: 'orientation-b', label: 'Assortment B', description: 'Reverse one pair at metaphase I to compare another possible assortment.' },
    ],
    steps: [
      { title: 'G1 · diploid starting cell', description: 'Two homologous pairs are shown before DNA replication.', keyIdea: 'The illustrative parent is 2n = 4, not a human cell.', focus: ['homologs'], metrics: [{ label: 'Parent cell', value: '2n · 2C' }, { label: 'Chromosomes', value: '4' }] },
      { title: 'Replicate once', description: 'Each chromosome is copied to form two sister chromatids before meiosis begins.', keyIdea: 'There is one S phase before two divisions.', focus: ['sisters', 'centromere'], metrics: [{ label: 'After replication', value: '2n · 4C' }, { label: 'Chromatids', value: '8' }] },
      { title: 'Prophase I · crossing over', description: 'Homologues pair. Non-sister chromatids exchange corresponding DNA segments reciprocally.', keyIdea: 'Crossing over changes allele combinations, not chromosome number.', focus: ['homologs', 'chiasma', 'sisters'], metrics: [{ label: 'Cell state', value: '2n · 4C' }] },
      { title: 'Metaphase I · assortment', description: 'Bivalents align at the equator. Compare the two fixed orientation presets.', keyIdea: 'Each homologous pair can orient independently of another pair.', focus: ['homologs', 'spindle'], metrics: [{ label: 'Pairs at equator', value: '2 bivalents' }] },
      { title: 'Anaphase I · separate homologues', description: 'Homologous chromosomes move apart while sister chromatids remain associated.', keyIdea: 'This division separates homologues, not sisters.', focus: ['homologs', 'sisters', 'spindle'], metrics: [{ label: 'At each pole', value: 'n · 2C' }] },
      { title: 'Telophase I → prophase II', description: 'Two haploid sets enter a second division without another S phase.', keyIdea: 'Each set still contains replicated chromosomes.', focus: ['sisters', 'spindle'], metrics: [{ label: 'Per daughter set', value: 'n · 2C' }] },
      { title: 'Metaphase II', description: 'Replicated chromosomes align individually in each haploid cell.', keyIdea: 'The second spindle attaches sisters toward opposite poles.', focus: ['sisters', 'centromere', 'spindle'], metrics: [{ label: 'Per cell', value: 'n · 2C' }] },
      { title: 'Anaphase II · separate sisters', description: 'Sister chromatids separate and are now daughter chromosomes.', keyIdea: 'DNA is divided again without being replicated again.', focus: ['sisters', 'spindle'], metrics: [{ label: 'At each final pole', value: 'n · 1C' }] },
      { title: 'Telophase II', description: 'Four haploid nuclear sets form, each carrying one chromosome of each pair.', keyIdea: 'The chromosome number has been reduced relative to the parent.', focus: ['gametes'], metrics: [{ label: 'Per product nucleus', value: 'n · 1C' }] },
      { title: 'Four haploid products', description: 'Compare exchanged segments and parental chromosome combinations across the four products.', keyIdea: 'Crossing over and assortment generate genetic variation.', focus: ['gametes', 'chiasma'], metrics: [{ label: 'Per product', value: 'n = 2 · 1C' }, { label: 'Products shown', value: '4' }] },
    ],
    question: { prompt: 'Which event distinguishes anaphase I from anaphase II?', options: ['Homologues separate in I; sisters separate in II.', 'DNA replication occurs in both.', 'Sisters separate in I; homologues separate in II.'], answer: 0, explanation: 'Meiosis I separates homologues and reduces the chromosome set. Meiosis II separates sisters without an intervening DNA replication.' },
    sources: [syllabus, book('11.1 The process of meiosis', '11-1-the-process-of-meiosis'), { title: 'NHGRI · Meiosis', url: 'https://www.genome.gov/genetics-glossary/Meiosis' }],
    limitation: 'Two homologous pairs and one illustrated crossover simplify the process. C is relative DNA content, separate from ploidy. Four equal products illustrate meiosis; human oogenesis produces unequal cells.',
  },
];

/** Teaching snapshots follow the same explicit conditions as the scene. */
export function getSteps(spec: ModuleSpec, variant: string, gradient: 'forward' | 'reverse', energy: boolean): LessonStep[] {
  if (spec.id === 'BIO-011') {
    const high = gradient === 'forward' ? 'outside' : 'cytoplasm';
    const low = gradient === 'forward' ? 'cytoplasm' : 'outside';
    const variantId = spec.variants?.some(item => item.id === variant) ? variant : 'simple';
    const route = spec.variants!.find(item => item.id === variantId)!;
    const active = variantId === 'active';
    const vesicle = variantId === 'endocytosis' || variantId === 'exocytosis';
    const needsEnergy = active || vesicle;
    const blocked = needsEnergy && !energy;
    const water = variantId === 'osmosis';
    const source = active ? low : high;
    const destination = active ? high : low;
    const pathway = variantId === 'simple' ? 'the hydrophobic bilayer' : water ? 'the water-permeable route across the membrane' : variantId === 'facilitated' ? 'a selective channel or carrier' : active ? 'the ATP-driven carrier' : 'a membrane vesicle';
    const direction = vesicle ? variantId === 'endocytosis' ? 'outside → cytoplasm' : 'cytoplasm → outside' : `${source} → ${destination}`;
    const measure = water ? 'water potential' : 'solute concentration';
    return [
      {
        title: `${route.label} · starting conditions`,
        description: vesicle ? `${route.description} Cargo direction is ${direction}; it is not set by the concentration switch.` : `${high} has higher ${measure}; ${low} has lower ${measure}. ${water ? 'The solute is retained by the membrane.' : 'The particles represent qualitative concentration, not a measured value.'}`,
        keyIdea: water ? 'Water potential, not solute concentration, determines the displayed net water direction.' : vesicle ? 'Bulk cargo remains enclosed by membrane until uptake or release.' : 'Gradient direction and membrane route both matter.',
        focus: ['membrane', water ? 'water' : 'solute'],
        metrics: [{ label: vesicle ? 'Cargo direction' : 'Expected net direction', value: direction }, { label: 'ATP supply', value: energy ? 'Available' : 'Removed' }],
      },
      {
        title: `${route.label} · meet the barrier`,
        description: variantId === 'endocytosis' ? 'The cell surface membrane curves around extracellular cargo.' : variantId === 'exocytosis' ? 'An intracellular cargo vesicle approaches the cell surface membrane.' : `The selected substance encounters ${pathway}.`,
        keyIdea: needsEnergy ? 'This illustrated pathway requires cellular energy.' : 'No ATP is consumed by this passive transport pathway.',
        focus: ['membrane', vesicle ? 'vesicle' : active ? 'carrier' : variantId === 'facilitated' || water ? 'channel' : 'solute'],
      },
      {
        title: blocked ? `${route.label} · energy-dependent step blocked` : `${route.label} · transfer`,
        description: blocked ? 'With ATP removed, this model stops the energy-dependent transfer. Select ATP available to resume the mechanism.' : variantId === 'endocytosis' ? 'Membrane closes around cargo and a vesicle buds into the cytoplasm.' : variantId === 'exocytosis' ? 'Vesicle membrane fuses with the surface membrane and cargo is released outside.' : `${water ? 'Net water movement' : 'Net solute movement'} is ${direction} through ${pathway}.`,
        keyIdea: blocked ? 'Particles are held at the starting condition; no energy-driven crossing occurs.' : active ? 'ATP-coupled transfer opposes the concentration gradient.' : water ? 'Osmosis transfers water, while the displayed solute remains on its side.' : vesicle ? 'Vesicle transport moves bulk cargo without passage through a channel pore.' : 'Random motion occurs in both directions; the net movement is down the gradient.',
        focus: [water ? 'water' : 'solute', vesicle ? 'vesicle' : active ? 'carrier' : 'membrane', ...(needsEnergy ? ['atp'] : [])],
        metrics: [{ label: 'Transfer', value: blocked ? 'Blocked without ATP' : direction }],
      },
      {
        title: `${route.label} · explain the result`,
        description: blocked ? 'No pump or vesicle transfer is completed without the required energy supply in this illustration.' : active ? `The pump moves solute ${direction}, helping maintain a concentration difference.` : water ? `Water moves ${direction} down its water-potential gradient; cell volume may change in living cells.` : vesicle ? `Cargo is transferred ${direction}. Gradient reversal does not reverse endocytosis or exocytosis.` : `There is net movement ${direction}. At equilibrium random movement continues without net transfer.`,
        keyIdea: blocked ? 'Removing ATP does not directly prevent simple diffusion, facilitated diffusion or osmosis.' : route.description,
        focus: ['membrane', water ? 'water' : 'solute'],
      },
    ];
  }
  if (spec.id === 'BIO-038') {
    const high = variant === 'high';
    return [
      { ...spec.steps[0], description: high ? 'A fall in blood water potential is detected by hypothalamic osmoreceptors.' : 'Higher blood water potential reduces the osmotic stimulus for ADH release.' },
      { ...spec.steps[1], description: high ? 'More ADH is released from the posterior pituitary. The hormone was synthesised in hypothalamic neurons.' : 'Less ADH is released from the posterior pituitary; the model compares this lower-hormone state.' },
      { ...spec.steps[2], description: high ? 'Blood carries more ADH to receptors on the blood-facing side of collecting-duct cells.' : 'With less circulating ADH, fewer collecting-duct receptors are stimulated.' },
      { ...spec.steps[3], description: high ? 'The ADH response inserts more aquaporins into the lumen-facing membrane, increasing water permeability.' : 'Fewer aquaporins remain in the lumen-facing membrane, so water permeability is lower.', metrics: [{ label: 'Apical water permeability', value: high ? 'Higher' : 'Lower' }] },
      { ...spec.steps[4], description: high ? 'With the medullary gradient maintained, more water leaves by osmosis and returns to blood. Less water remains in the urine.' : 'With lower permeability, less water is reabsorbed from the collecting duct. More water remains in the urine.', keyIdea: high ? 'Water recovery raises blood water potential, reducing the original ADH stimulus.' : 'Lower water recovery helps prevent excessive water retention.', metrics: [{ label: 'Urine volume', value: high ? 'Smaller' : 'Larger' }, { label: 'Urine concentration', value: high ? 'More concentrated' : 'More dilute' }] },
    ];
  }
  return spec.steps;
}
