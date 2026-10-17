import type { LessonStep, ModuleSpec, Structure } from '../types';

const syllabusUrl = 'https://www.cambridgeinternational.org/Images/664560-2025-2027-syllabus.pdf';
const curriculum = (section: string, page: string) => ({ title: `Cambridge 9700 · 2025–2027 · ${section} · syllabus p. ${page}`, url: syllabusUrl });
const book = (section: string, slug: string) => ({ title: `OpenStax Biology 2e · ${section}`, url: `https://openstax.org/books/biology-2e/pages/${slug}` });
const coral = '#ee887a', amber = '#e7b466', teal = '#75cfc4', violet = '#ae9bd8', rose = '#d393ac', blue = '#83afcf';
const part = (id: string, label: string, color: string, description: string): Structure => ({ id, label, color, description });
const step = (title: string, description: string, keyIdea: string, focus: string[], metrics?: LessonStep['metrics']): LessonStep => ({ title, description, keyIdea, focus, ...(metrics ? { metrics } : {}) });

function carbohydrateSteps(variant: string): LessonStep[] {
  const cellulose = variant === 'cellulose';
  const glycogen = variant === 'glycogen';
  const name = cellulose ? 'Cellulose' : glycogen ? 'Glycogen' : 'Starch';
  return [
    step(`${name} · glucose units`, cellulose ? 'Identify β-glucose units; successive residues alternate in orientation.' : 'Identify α-glucose units in this storage polysaccharide.', 'Glucose configuration affects the polymer formed.', ['glucose']),
    step('Read the glycosidic links', cellulose ? 'β(1→4) glycosidic bonds join the straight chain.' : 'α(1→4) bonds extend chains; the next view adds α(1→6) branch points.', 'Glycosidic bonds within each chain are covalent.', ['bond', 'chain']),
    step('Compare the architecture', cellulose ? 'Unbranched chains lie alongside one another; hydrogen bonds help bind them into microfibrils.' : glycogen ? 'Frequent branches provide many chain ends for glucose mobilisation.' : 'Starch contains unbranched, coiled amylose and branched amylopectin.', 'Hydrogen bonds between cellulose chains are not glycosidic bonds.', cellulose ? ['chain', 'hydrogen', 'microfibril'] : ['chain', 'branch']),
    step('Connect structure and function', cellulose ? 'Microfibrils strengthen plant cell walls against tensile forces.' : glycogen ? 'Compact, insoluble glycogen stores glucose in animals and fungi.' : 'Compact, insoluble starch stores glucose in plants.', 'Storage polymers and structural polymers have different architectures.', cellulose ? ['microfibril'] : ['chain', 'branch']),
  ];
}

function lipidSteps(variant: string): LessonStep[] {
  const tri = variant === 'triglyceride';
  return [
    step('Identify the building blocks', tri ? 'Find glycerol and its three fatty-acid residues.' : 'Find glycerol, two fatty-acid residues and a phosphate-containing head.', 'The two lipid types have different component arrangements.', ['glycerol', 'fatty-acids', ...(tri ? [] : ['phosphate'])]),
    step('Locate ester links', tri ? 'Three ester bonds join fatty acids to glycerol.' : 'Two fatty-acid ester bonds join the tails to glycerol.', 'Ester formation involves condensation; hydrolysis breaks ester bonds.', ['glycerol', 'ester']),
    step('Read the whole molecule', tri ? 'Three non-polar tails make the molecule predominantly hydrophobic.' : 'The polar head and non-polar tails make this phospholipid amphipathic.', 'A triglyceride is not a two-tailed phospholipid.', tri ? ['tails'] : ['head', 'tails', 'phosphate']),
    step('Explain the function', tri ? 'Triglycerides form energy stores with little associated water.' : 'In water, heads face the aqueous surroundings and tails associate inside membranes.', 'Chemical structure helps explain biological organisation.', tri ? ['fatty-acids', 'tails'] : ['head', 'tails']),
  ];
}

function enzymeSteps(variant: string): LessonStep[] {
  const induced = variant === 'induced-fit';
  return [
    step('Free enzyme and substrate', 'One substrate approaches the active site in this illustrative cleavage reaction.', 'Enzymes catalyse particular reactions.', ['enzyme', 'active-site', 'substrate']),
    step('Recognise the substrate', induced ? 'Initial binding interactions begin to change the active-site conformation.' : 'The lock-and-key analogy uses a pre-existing complementary pocket.', induced ? 'The active site is flexible.' : 'A rigid pocket is a teaching simplification.', ['active-site', 'substrate']),
    step('Form the enzyme–substrate complex', induced ? 'The enzyme adjusts around the bound substrate, positioning catalytic groups.' : 'The complementary substrate occupies the active site.', 'Binding depends on chemical interactions as well as shape.', ['enzyme', 'active-site', 'substrate']),
    step('Catalyse the reaction', 'The bound substrate becomes two smaller products; water chemistry is omitted from the drawing.', 'The enzyme lowers activation energy without changing the reaction equilibrium.', ['active-site', 'products']),
    step('Release and reuse', 'Products leave. The enzyme can catalyse another reaction cycle.', 'The enzyme is not consumed.', ['enzyme', 'products']),
  ];
}

function inhibitionSteps(variant: string): LessonStep[] {
  const non = variant.startsWith('noncompetitive');
  const high = variant.endsWith('high');
  return [
    step('Set the comparison', `${high ? 'High' : 'Low'} substrate; enzyme amount, inhibitor amount and observation time are fixed.`, 'These are qualitative comparisons, not measured reaction rates.', ['enzyme', 'substrate', 'inhibitor'], [{ label: 'Substrate', value: high ? 'Higher' : 'Lower' }, { label: 'Inhibition', value: non ? 'Pure non-competitive' : 'Competitive' }]),
    step('Locate inhibitor binding', non ? 'The inhibitor binds at a separate site and reduces catalytic competence.' : 'The inhibitor competes with substrate for the active site.', 'Binding site determines the illustrated mechanism.', ['inhibitor', non ? 'allosteric-site' : 'active-site']),
    step('Test substrate opportunity', non ? 'Substrate may still bind, but inhibited enzyme produces less product.' : high ? 'More substrate increases its chance of occupying available active sites.' : 'At low substrate, inhibitor occupancy reduces successful substrate binding.', non ? 'Extra substrate cannot restore inhibited catalytic capacity.' : 'Competition is reversible in this comparison.', ['substrate', 'enzyme', 'active-site']),
    step('Compare the outcome', non ? 'The illustrated inhibitor-bound enzyme remains inactive. Increasing substrate cannot restore the uninhibited population maximum rate in the pure non-competitive model.' : high ? 'This enzyme produces two products after substrate wins a binding opportunity; sufficient substrate can approach the uninhibited maximum rate.' : 'The illustrated inhibitor occupies the active site, so no products are shown for this enzyme. Compare the high-substrate preset.', 'A single blocked enzyme does not mean all enzymes in a population are inactive.', !non && high ? ['products', 'inhibitor'] : ['inhibitor', 'enzyme']),
  ];
}

function expressionSteps(variant: string): LessonStep[] {
  if (variant === 'translation') return [
    step('Cytoplasm · locate mature mRNA', 'An exported mRNA meets a ribosome outside the nucleus.', 'DNA remains in the nucleus in this eukaryotic example.', ['cytoplasm', 'mrna', 'ribosome']),
    step('Initiate at the start codon', 'The ribosome establishes the reading frame at AUG with an initiator tRNA.', 'AUG specifies methionine in this example.', ['ribosome', 'mrna', 'trna']),
    step('Match codon and anticodon', 'A complementary, antiparallel tRNA anticodon recognises the next mRNA codon.', 'A codon is on mRNA; an anticodon is on tRNA.', ['mrna', 'trna', 'amino-acids']),
    step('Form a peptide bond', 'The ribosome links the incoming amino acid to the growing chain.', 'Amino acids are joined; mRNA bases are not translated into amino acids.', ['ribosome', 'trna', 'polypeptide']),
    step('Elongate along the message', 'The ribosome reads mRNA 5′→3′; the polypeptide grows from N to C terminus.', 'Each completed elongation cycle advances by one codon.', ['mrna', 'ribosome', 'polypeptide']),
    step('Terminate and release', 'At a stop codon, a release factor enables polypeptide release.', 'Stop codons do not encode an amino acid or have a matching aminoacyl-tRNA.', ['ribosome', 'polypeptide']),
  ];
  return [
    step('Nucleus · choose one template', 'Locate the gene and its template strand within nuclear DNA.', 'The other DNA strand is the non-transcribed, coding strand.', ['nucleus', 'dna', 'template']),
    step('Initiate transcription', 'RNA polymerase binds near the gene and opens a local DNA region.', 'Only one strand templates this RNA.', ['template', 'rna-polymerase']),
    step('Elongate the RNA', 'RNA polymerase reads template DNA 3′→5′ and synthesises RNA 5′→3′.', 'RNA uses U opposite template A, and A opposite template T.', ['template', 'rna-polymerase', 'mrna']),
    step('Complete the primary transcript', 'A complementary RNA transcript is released; the DNA strands rejoin.', 'The RNA sequence matches the coding strand apart from U replacing T.', ['dna', 'mrna']),
    step('Process the transcript', 'Introns are removed and exons joined to produce mature mRNA.', 'Splicing occurs before export in this simplified eukaryotic sequence.', ['nucleus', 'mrna']),
    step('Export mature mRNA', 'Mature mRNA passes through a nuclear pore into the cytoplasm.', 'Translation occurs on cytoplasmic ribosomes, not on nuclear DNA.', ['pore', 'mrna', 'cytoplasm']),
  ];
}

function lightSteps(variant: string): LessonStep[] {
  const cyclic = variant === 'cyclic';
  return [
    step('Locate the two sides', 'The thylakoid membrane separates stroma from the enclosed lumen.', 'Proton pumping is stroma → lumen; return is lumen → stroma.', ['membrane', 'stroma', 'lumen']),
    step('Photoactivate chlorophyll', cyclic ? 'Light excites electrons in PSI. PSII is not active in this route.' : 'Light excites PSII; water oxidation supplies replacement electrons, H⁺ and O₂.', cyclic ? 'Only PSI participates in cyclic flow.' : 'Released oxygen comes from water.', cyclic ? ['psi', 'electrons'] : ['psii', 'water', 'oxygen', 'electrons']),
    step('Transfer electrons and pump protons', 'Electron transfer through carriers supports H⁺ transfer from stroma into the lumen.', 'The resulting electrochemical gradient stores usable energy.', ['etc', 'electrons', 'protons', 'lumen']),
    step(cyclic ? 'Return electrons to PSI' : 'Reduce NADP⁺', cyclic ? 'Electrons return through carriers to PSI instead of reducing NADP⁺.' : 'Light re-excites electrons at PSI; they ultimately reduce NADP⁺ to reduced NADP (NADPH) on the stromal side.', cyclic ? 'There is no net NADPH production in this route.' : 'Non-cyclic electrons flow from water to NADP⁺.', cyclic ? ['psi', 'etc', 'electrons'] : ['psi', 'nadp', 'electrons']),
    step('Make ATP by chemiosmosis', 'H⁺ returns from lumen to stroma through ATP synthase, supporting ADP + Pi → ATP.', 'ATP is produced on the stromal side.', ['protons', 'atp-synthase', 'atp', 'stroma']),
    step('Audit the products', cyclic ? 'Cyclic flow supplies ATP, with no net NADPH or oxygen production.' : 'Non-cyclic flow supplies ATP and NADPH; water oxidation releases oxygen.', 'This comparison does not impose a universal ATP yield.', cyclic ? ['psi', 'atp'] : ['atp', 'nadp', 'oxygen'], [{ label: 'ATP', value: 'Produced' }, { label: 'NADPH / O₂', value: cyclic ? 'No net production' : 'Produced' }]),
  ];
}

function homologSteps(variant: string): LessonStep[] {
  const replicated = variant === 'replicated';
  const homo = variant === 'homozygous';
  return [
    step('Compare the homologues', 'One maternal and one paternal chromosome form a homologous pair.', 'Homologues carry the same gene loci; their alleles may differ.', ['maternal', 'paternal']),
    step('Find a corresponding locus', 'The gene is marked at the same position on each homologue.', 'A locus is a position; an allele is a gene variant.', ['locus']),
    step('Read the genotype', homo ? 'Both homologues carry A: this locus is homozygous AA.' : 'One homologue carries A and the other a: this locus is heterozygous Aa.', 'Allele symbols do not establish a phenotype without a dominance model.', ['allele-a', 'allele-b'], [{ label: 'Genotype', value: homo ? 'AA' : 'Aa' }]),
    step('Separate identity from DNA copies', replicated ? 'Replication gives A/A sister chromatids on one homologue and a/a sisters on the other.' : 'Each homologue is unreplicated and contains one DNA double helix.', 'Replication doubles DNA copies without creating a new homologous pair.', ['centromere', ...(replicated ? ['sisters'] : ['maternal', 'paternal'])], [{ label: 'Chromosomes shown', value: '2' }, { label: 'DNA molecules shown', value: replicated ? '4' : '2' }]),
  ];
}

function lacSteps(variant: string): LessonStep[] {
  const induced = variant === 'lactose';
  return [
    step('Fix the conditions', `${induced ? 'Lactose is present' : 'Lactose is absent'}. Glucose remains low in both presets; cells have resources for transcription.`, 'Lactose availability is the changed condition.', induced ? ['dna', 'inducer'] : ['dna', 'repressor'], [{ label: 'Glucose', value: 'Low · held constant' }, { label: 'Lactose', value: induced ? 'Present' : 'Absent' }]),
    step('Follow the regulatory protein', induced ? 'Lactose-derived allolactose binds the repressor and changes its conformation.' : 'The separate regulatory gene lacI produces an active repressor.', 'The inducer binds the repressor, not the operator.', ['regulatory-gene', 'repressor', ...(induced ? ['inducer'] : [])]),
    step('Inspect the operator', induced ? 'The inducer-bound repressor has reduced operator affinity, allowing access.' : 'The active repressor occupies the operator and strongly inhibits transcription.', 'Promoter and operator are distinct DNA regions.', ['promoter', 'operator', 'repressor']),
    step('Compare transcription', induced ? 'RNA polymerase transcribes the lacZYA structural genes into one mRNA.' : 'Structural-gene transcription is very low; occasional basal expression is simplified here.', 'The repressor controls transcription, not translation by blocking a ribosome.', ['rna-polymerase', 'structural-genes', 'mrna']),
    step('Connect expression to metabolism', induced ? 'Translation produces proteins including β-galactosidase and lactose permease.' : 'Few lactose-use proteins are produced relative to the induced state.', 'This bacterial operon is one example of gene regulation.', ['mrna', 'enzymes']),
  ];
}

/** Original teaching snapshots and questions; selected concepts, not official exam material. */
export const WAVE2_MODULES: ModuleSpec[] = [
  {
    id: 'BIO-002', title: 'Inside a bacterial cell', level: 'AS', bundle: 'Cell organisation', kicker: 'Topic 1 · Prokaryotic organisation',
    description: 'Explore one schematic bacterium and compare its organisation with eukaryotic cells.', outcome: 'Identify the main bacterial structures without inventing a nucleus or mitochondria.',
    structures: [
      part('capsule', 'Capsule', rose, 'An optional outer protective layer in this example.'), part('wall', 'Peptidoglycan wall', coral, 'A supporting layer outside the plasma membrane.'),
      part('membrane', 'Plasma membrane', teal, 'A selective boundary enclosing cytoplasm.'), part('cytoplasm', 'Cytoplasm', blue, 'Contains enzymes and dispersed ribosomes.'),
      part('ribosomes', '70S ribosomes', amber, 'Sites of protein synthesis.'), part('nucleoid', 'Nucleoid / chromosome', violet, 'Chromosomal DNA without a nuclear envelope.'),
      part('plasmid', 'Plasmid', rose, 'A separate small DNA molecule in this example.'), part('flagellum', 'Flagellum', teal, 'A motility structure present in this example.'),
    ],
    steps: [
      step('Explore the boundary', 'Find membrane, wall and outer capsule from inside to outside.', 'The wall and membrane have different roles.', ['membrane', 'wall', 'capsule']),
      step('Inspect the cytoplasm', 'Locate 70S ribosomes; there is no membrane-bound nucleus or mitochondrion.', 'Bacteria still perform metabolism and protein synthesis.', ['cytoplasm', 'ribosomes']),
      step('Find the genetic material', 'Compare the circular chromosome region with the separate plasmid.', 'The nucleoid is not enclosed by a nuclear membrane.', ['nucleoid', 'plasmid']),
      step('Compare a typical bacterium', 'Find the flagellum, then explain which structures are optional features.', 'Capsules, plasmids and flagella are not universal bacterial features.', ['flagellum', 'capsule', 'plasmid']),
    ],
    question: { prompt: 'Which feature distinguishes this bacterium from a typical animal cell?', options: ['It has DNA.', 'Its chromosomal DNA is not enclosed by a nuclear envelope.', 'It synthesises proteins.'], answer: 1, explanation: 'Both cells have DNA and ribosomes. This bacterial chromosome occupies a nucleoid rather than a membrane-bound nucleus.' },
    sources: [curriculum('1.2.5–6', '16'), book('4.2 Prokaryotic cells', '4-2-prokaryotic-cells')],
    limitation: 'One illustrative bacterium, not every prokaryote. Capsule, plasmid and flagellum are example features. Sizes, DNA loops and ribosome counts are schematic; no measured scale is implied.',
  },
  {
    id: 'BIO-004', title: 'Starch, glycogen & cellulose', level: 'AS', bundle: 'Biological molecules', kicker: 'Topic 2 · Linkage changes function',
    description: 'Compare three glucose polymers through their bonds, branches and packing.', outcome: 'Relate α/β glycosidic linkages and branching to storage or support.',
    structures: [part('glucose', 'Glucose residue', amber, 'A schematic α- or β-glucose unit.'), part('bond', 'Glycosidic bond', coral, 'Covalent linkage joining glucose residues.'), part('branch', 'Branch point', rose, 'An α(1→6) linkage in branched storage polymers.'), part('chain', 'Polysaccharide chain', teal, 'Many covalently linked glucose residues.'), part('hydrogen', 'Interchain hydrogen bonds', violet, 'Non-covalent bonds between cellulose chains.'), part('microfibril', 'Cellulose microfibril', blue, 'An associated bundle of cellulose chains.')],
    variants: [{ id: 'starch', label: 'Starch', description: 'Amylose plus amylopectin: α-glucose storage polymers.' }, { id: 'glycogen', label: 'Glycogen', description: 'An α-glucose polymer with more frequent branching.' }, { id: 'cellulose', label: 'Cellulose', description: 'β(1→4) chains associate into structural microfibrils.' }],
    steps: carbohydrateSteps('starch'),
    question: { prompt: 'What helps cellulose form strong microfibrils?', options: ['Frequent α(1→6) branches.', 'Hydrogen bonding between straight β(1→4)-linked chains.', 'Peptide bonds between glucose units.'], answer: 1, explanation: 'Cellulose chains are unbranched; interchain hydrogen bonds contribute to the strength of the assembled microfibril.' },
    sources: [curriculum('2.2.1, 5, 7–8', '17–18'), book('3.2 Carbohydrates', '3-2-carbohydrates')],
    limitation: 'Short symbolic chains; branching frequency, helical pitch and bond angles are not quantitative. Ring orientation indicates linkage configuration without claiming an atomic structure.',
  },
  {
    id: 'BIO-005', title: 'Phospholipid or triglyceride?', level: 'AS', bundle: 'Biological molecules', kicker: 'Topic 2 · Lipid structure and function',
    description: 'Switch between a two-tailed glycerophospholipid and a three-tailed triglyceride.', outcome: 'Explain how lipid components support membrane organisation or energy storage.',
    structures: [part('glycerol', 'Glycerol backbone', violet, 'Three-carbon component connecting the other groups.'), part('fatty-acids', 'Fatty-acid residues', amber, 'Long predominantly non-polar hydrocarbon chains.'), part('ester', 'Fatty-acid ester links', coral, 'Join fatty-acid residues to glycerol.'), part('phosphate', 'Phosphate group', rose, 'Part of the polar phospholipid head.'), part('head', 'Polar head region', teal, 'Interacts with water in the phospholipid preset.'), part('tails', 'Hydrophobic tails', amber, 'Associate away from water.')],
    variants: [{ id: 'phospholipid', label: 'Phospholipid', description: 'Two fatty-acid tails and a phosphate-containing head.' }, { id: 'triglyceride', label: 'Triglyceride', description: 'Three fatty-acid residues esterified to glycerol.' }],
    steps: lipidSteps('phospholipid'),
    question: { prompt: 'Which combination describes a standard glycerophospholipid?', options: ['Glycerol, three fatty acids and no phosphate.', 'Glycerol, two fatty acids and a phosphate-containing head.', 'A chain of amino acids.'], answer: 1, explanation: 'The hydrophilic head and hydrophobic tails explain its amphipathic behaviour in membranes.' },
    sources: [curriculum('2.2.9–11', '18'), book('3.3 Lipids', '3-3-lipids')],
    limitation: 'A standard glycerophospholipid is shown; not every membrane lipid has this backbone. Chain lengths, saturation and chemistry are simplified. The phosphate head link is not a third fatty-acid ester.',
  },
  {
    id: 'BIO-006', title: 'Levels of protein structure', level: 'AS', bundle: 'Biological molecules', kicker: 'Topic 2 · Sequence to subunits',
    description: 'Follow one chain from sequence to folding, then combine folded subunits.', outcome: 'Distinguish primary, secondary, tertiary and quaternary organisation.',
    structures: [part('amino-acids', 'Amino-acid residues', coral, 'Different residues form a specific sequence.'), part('peptide', 'Peptide bonds', amber, 'Covalent links in the polypeptide backbone.'), part('backbone', 'Polypeptide backbone', teal, 'One continuous peptide-linked chain.'), part('hydrogen', 'Hydrogen bonds', blue, 'Non-covalent interactions; backbone bonds stabilise secondary structure.'), part('r-groups', 'R-group interactions', violet, 'Include ionic, hydrogen and hydrophobic interactions.'), part('disulfide', 'Disulfide link', rose, 'A possible covalent link between cysteine residues.'), part('subunits', 'Folded subunits', coral, 'Separate polypeptides associated in one protein.')],
    steps: [
      step('Primary · sequence', 'Read the order of amino-acid residues connected by peptide bonds.', 'Primary structure is the amino-acid sequence.', ['amino-acids', 'peptide', 'backbone']),
      step('Secondary · local folding', 'Backbone hydrogen bonds stabilise local α-helices and β-sheets.', 'Secondary structure concerns local backbone arrangements.', ['backbone', 'hydrogen']),
      step('Tertiary · one folded chain', 'R-group interactions stabilise the overall three-dimensional form of one chain.', 'Not every stabilising interaction is covalent.', ['r-groups', 'hydrogen', 'disulfide']),
      step('Quaternary · associate subunits', 'Two already-folded polypeptides associate in this generic example.', 'Quaternary structure requires more than one polypeptide chain.', ['subunits']),
      step('Relate folding to function', 'Identify the sequence, local folds, one complete subunit and the assembled protein.', 'The four levels describe organisation, not four separate molecules.', ['backbone', 'subunits', 'r-groups']),
    ],
    question: { prompt: 'Which change specifically establishes quaternary structure?', options: ['A peptide bond joins two amino acids.', 'One chain folds into a compact shape.', 'Two folded polypeptide subunits associate.'], answer: 2, explanation: 'Tertiary structure describes one folded chain; quaternary structure describes the arrangement of multiple polypeptide subunits.' },
    sources: [curriculum('2.3.1–3', '18'), book('3.4 Proteins', '3-4-proteins')],
    limitation: 'A generic two-subunit protein, not haemoglobin or a solved molecular structure. Contact lines are symbolic. Peptide and disulfide links are covalent; hydrogen/ionic interactions and hydrophobic association are not all covalent bonds.',
  },
  {
    id: 'BIO-007', title: 'Enzyme binding & induced fit', level: 'AS', bundle: 'Enzymes & signalling', kicker: 'Topic 3 · Includes BIO-008 induced fit',
    description: 'Compare a lock-and-key analogy with a flexible active site through one reaction.', outcome: 'Explain specificity, conformational change and enzyme reuse.',
    structures: [part('enzyme', 'Enzyme', teal, 'Reusable biological catalyst.'), part('active-site', 'Active site', violet, 'Binding and catalytic region.'), part('substrate', 'Substrate', amber, 'One illustrative molecule cleaved in this reaction.'), part('products', 'Two products', coral, 'Smaller molecules released after catalysis.')],
    variants: [{ id: 'lock-key', label: 'Lock and key', description: 'A rigid complementary pocket is a historical teaching analogy.' }, { id: 'induced-fit', label: 'Induced fit · BIO-008', description: 'Binding changes the enzyme conformation around the substrate.' }],
    steps: enzymeSteps('lock-key'),
    question: { prompt: 'What distinguishes induced fit from the rigid lock-and-key analogy?', options: ['Binding changes enzyme conformation.', 'The enzyme is permanently consumed.', 'Every molecule can bind equally well.'], answer: 0, explanation: 'Interactions during binding adjust the active site. The enzyme releases products and can be reused.' },
    sources: [curriculum('3.1.2', '20'), book('6.5 Enzymes', '6-5-enzymes')],
    limitation: 'One generic cleavage reaction, not a named enzyme or a kinetic simulation. Water, catalytic residues and transition-state geometry are omitted. Not all enzymes catalyse substrate cleavage.',
  },
  {
    id: 'BIO-009', title: 'Enzyme inhibition', level: 'AS', bundle: 'Enzymes & signalling', kicker: 'Topic 3 · Binding site and substrate supply',
    description: 'Compare competitive and pure non-competitive inhibition at two substrate levels.', outcome: 'Predict why added substrate can relieve competition but cannot restore lost catalytic capacity.',
    structures: [part('enzyme', 'Enzyme', teal, 'The enzyme amount is fixed across comparisons.'), part('active-site', 'Active site', violet, 'Substrate and competitive inhibitor compete here.'), part('substrate', 'Substrate', amber, 'Its abundance changes between low and high presets.'), part('inhibitor', 'Inhibitor', coral, 'Reduces the observed catalytic rate.'), part('allosteric-site', 'Separate inhibitor site', rose, 'The pure non-competitive inhibitor binds away from the active site.'), part('products', 'Products', blue, 'Qualitative evidence of successful catalysis.')],
    variants: [{ id: 'competitive-low', label: 'Competitive · low substrate', description: 'Active-site competition with less substrate.' }, { id: 'competitive-high', label: 'Competitive · high substrate', description: 'More substrate competes for the same active sites.' }, { id: 'noncompetitive-low', label: 'Non-competitive · low substrate', description: 'Separate-site inhibition reduces catalytic capacity.' }, { id: 'noncompetitive-high', label: 'Non-competitive · high substrate', description: 'More substrate cannot restore the uninhibited maximum rate.' }],
    steps: inhibitionSteps('competitive-low'),
    question: { prompt: 'Under the pure non-competitive model, why does excess substrate fail to restore the uninhibited maximum rate?', options: ['All inhibitor must occupy the active site.', 'Inhibitor reduces catalytic capacity through a separate binding site.', 'Substrate concentration cannot affect any enzyme reaction.'], answer: 1, explanation: 'Extra substrate does not remove this separate-site reduction of catalytic capacity. Competitive inhibition instead involves competition for the active site.' },
    sources: [curriculum('3.2.3', '20'), book('6.5 Enzymes', '6-5-enzymes')],
    limitation: 'Reversible competitive and ideal pure non-competitive cases only. Mixed, irreversible and uncompetitive mechanisms are outside this comparison. Particle counts and product amounts are not fitted kinetics.',
  },
  {
    id: 'BIO-012', title: 'Ligand, receptor & response', level: 'AS', bundle: 'Enzymes & signalling', kicker: 'Topic 4 · Recognise a signal',
    description: 'Trace an extracellular signal across a membrane-bound receptor to an abstract response.', outcome: 'Distinguish ligand, receptor and target-cell response.',
    structures: [part('membrane', 'Cell surface membrane', coral, 'Separates extracellular and intracellular spaces.'), part('receptor', 'Cell surface receptor', violet, 'A membrane protein recognising a suitable ligand.'), part('ligand', 'Extracellular ligand', amber, 'The signal molecule binds outside the cell.'), part('relay', 'Intracellular relay', teal, 'An abstract link between receptor activation and response.'), part('response', 'Cell response', blue, 'A specific change in the target cell.')],
    steps: [
      step('Deliver the signal', 'A secreted ligand reaches the outside of a target cell.', 'The ligand is a signal, not the receptor.', ['ligand', 'membrane']),
      step('Recognise and bind', 'The ligand binds its complementary cell surface receptor.', 'A suitable receptor helps determine which cells respond.', ['ligand', 'receptor']),
      step('Transmit the information', 'Receptor activation changes intracellular signalling in this schematic relay.', 'The displayed ligand remains extracellular.', ['receptor', 'relay']),
      step('Produce and terminate a response', 'The target cell responds; signal removal and pathway inactivation can end the response.', 'Binding and response are separate events.', ['response', 'relay']),
    ],
    question: { prompt: 'Why may one cell respond to an extracellular ligand while a nearby cell does not?', options: ['Only the responding cell necessarily has DNA.', 'The responding cell has a suitable receptor and signalling machinery.', 'The ligand must enter both nuclei.'], answer: 1, explanation: 'Specific ligand recognition and the cell’s downstream machinery determine the response in this surface-receptor example.' },
    sources: [curriculum('4.1.3–4', '21'), book('9.1 Signalling molecules and cellular receptors', '9-1-signaling-molecules-and-cellular-receptors')],
    limitation: 'An abstract surface-receptor pathway. No named hormone, second messenger or biochemical cascade is claimed; intracellular receptors are not represented.',
  },
  {
    id: 'BIO-015', title: 'DNA double helix', level: 'AS', bundle: 'DNA & protein synthesis', kicker: 'Topic 6 · Complementary and antiparallel',
    description: 'Build a DNA segment from nucleotides and read both strand directions.', outcome: 'Distinguish covalent backbones from complementary base-pair interactions.',
    structures: [part('nucleotide', 'DNA nucleotide', teal, 'Deoxyribose, phosphate and one base.'), part('sugar', 'Deoxyribose', amber, 'The pentose sugar in DNA.'), part('phosphate', 'Phosphate', rose, 'Links sugars along each strand.'), part('bases', 'Complementary bases', coral, 'A pairs with T; C pairs with G.'), part('hydrogen', 'Base-pair hydrogen bonds', blue, 'Two for A–T and three for C–G.'), part('backbone', 'Sugar–phosphate backbone', violet, 'Nucleotides are joined by covalent phosphodiester bonds.')],
    steps: [
      step('Identify a nucleotide', 'Find one sugar, phosphate group and nitrogenous base.', 'A nucleotide is not just a base.', ['nucleotide', 'sugar', 'phosphate', 'bases']),
      step('Join one strand', 'Phosphodiester bonds form a continuous sugar–phosphate backbone.', 'Covalent bonds run along each strand.', ['backbone', 'sugar', 'phosphate']),
      step('Pair the bases', 'A–T pairs have two hydrogen bonds; C–G pairs have three.', 'Complementarity constrains the partner-strand sequence.', ['bases', 'hydrogen']),
      step('Read opposite directions', 'The paired strands run 5′→3′ and 3′→5′ along the same axis.', 'Antiparallel means opposite chemical orientations.', ['backbone', 'bases'], [{ label: 'Strand directions', value: '5′→3′ / 3′→5′' }]),
    ],
    question: { prompt: 'A DNA strand reads 5′-AGTC-3′. Which partner is aligned antiparallel to it?', options: ['5′-TCAG-3′', '3′-TCAG-5′', '3′-AGTC-5′'], answer: 1, explanation: 'A pairs with T and G with C. The directly aligned complementary strand runs in the opposite direction.' },
    sources: [curriculum('6.1.1–3', '24'), book('14.2 DNA structure', '14-2-dna-structure-and-sequencing')],
    limitation: 'A short schematic DNA segment. Colours are identifiers; dimensions, twist and bond positions are not atomic coordinates. No claim about chromatin packing is made.',
  },
  {
    id: 'BIO-016', title: 'DNA replication fork', level: 'AS', bundle: 'DNA & protein synthesis', kicker: 'Topic 6 · One synthesis direction',
    description: 'Compare leading and lagging synthesis at one opened replication fork.', outcome: 'Explain semi-conservative replication and why both new strands grow 5′→3′.',
    structures: [part('template', 'Parental template DNA', violet, 'Old strands supply complementary base sequences.'), part('helicase', 'DNA-opening complex', rose, 'Separates parental strands; optional mechanistic context.'), part('polymerase', 'DNA polymerase', teal, 'Adds nucleotides at a growing 3′ end.'), part('leading', 'Leading strand', amber, 'Continuous synthesis toward fork progression.'), part('lagging', 'Lagging strand', coral, 'Fragments synthesised away from fork progression.'), part('primer', 'Primer', blue, 'Provides an initial 3′ end for extension.'), part('ligase', 'DNA ligase', rose, 'Seals remaining backbone nicks after fragment processing.'), part('new-dna', 'New DNA', teal, 'Pairs with an old strand in each daughter duplex.')],
    steps: [
      step('Open parental DNA', 'An opening complex separates the antiparallel parental strands at the fork.', 'Each old strand can act as a template.', ['template', 'helicase']),
      step('Provide starting ends', 'Short primers provide 3′ ends for polymerase extension.', 'DNA polymerase does not start a strand from nothing.', ['primer', 'polymerase']),
      step('Extend the leading strand', 'Polymerase reads its template 3′→5′ and extends DNA 5′→3′ toward the advancing fork.', 'Nucleotides are added to the new strand’s 3′ end.', ['leading', 'polymerase', 'template']),
      step('Build lagging fragments', 'Repeated priming allows fragments to grow 5′→3′ away from fork progression.', 'Lagging synthesis is discontinuous, never 3′→5′.', ['lagging', 'primer', 'polymerase']),
      step('Process and join fragments', 'Primers are replaced with DNA; ligase seals phosphodiester-backbone nicks.', 'Ligase joins DNA fragments; it does not form base-pair hydrogen bonds.', ['lagging', 'ligase', 'new-dna']),
      step('Compare daughter duplexes', 'Each completed duplex contains one parental strand and one newly synthesised strand.', 'This is semi-conservative replication.', ['template', 'new-dna']),
    ],
    question: { prompt: 'Why are lagging-strand fragments needed?', options: ['Polymerase makes that new strand 3′→5′.', 'Templates are antiparallel and polymerase extends DNA only 5′→3′.', 'Ligase separates the parental strands.'], answer: 1, explanation: 'The two templates face opposite ways. On the lagging template, 5′→3′ extension proceeds away from fork progression in repeated fragments.' },
    sources: [curriculum('6.1.4', '24'), book('14.4 Replication mechanisms', '14-4-dna-replication-in-prokaryotes'), book('14.5 Eukaryotic replication', '14-5-dna-replication-in-eukaryotes')],
    limitation: 'One local fork; origins, rates and polymerase types are omitted. Primer/opening details provide context beyond the enzymes required by the cited syllabus outcome. Strand lengths and timing are schematic.',
  },
  {
    id: 'BIO-017', title: 'Transcription & translation', level: 'AS', bundle: 'DNA & protein synthesis', kicker: 'Topic 6 · Two processes, separate compartments',
    description: 'Switch between nuclear transcription with RNA processing and cytoplasmic translation.', outcome: 'Trace sequence information through template DNA, mRNA, tRNA and a polypeptide.',
    structures: [part('nucleus', 'Nucleus', violet, 'The eukaryotic transcription and processing compartment.'), part('cytoplasm', 'Cytoplasm', blue, 'Contains the translating ribosome in this example.'), part('dna', 'DNA gene', violet, 'Contains transcribed and non-transcribed strands.'), part('template', 'Template strand', rose, 'Read 3′→5′ during RNA synthesis.'), part('rna-polymerase', 'RNA polymerase', teal, 'Synthesises RNA 5′→3′.'), part('mrna', 'RNA transcript / mRNA', amber, 'Primary RNA is processed before mature mRNA export.'), part('pore', 'Nuclear pore', blue, 'Route of mature mRNA export.'), part('ribosome', 'Ribosome', teal, 'Reads mRNA and catalyses peptide-bond formation.'), part('trna', 'tRNA', rose, 'Carries an amino acid and a complementary anticodon.'), part('amino-acids', 'Amino acids', coral, 'Building blocks delivered for polypeptide synthesis.'), part('polypeptide', 'Growing polypeptide', coral, 'Its amino-acid order follows the mRNA reading frame.')],
    variants: [{ id: 'transcription', label: 'Transcription + processing', description: 'Nuclear template → primary RNA → spliced mRNA → export.' }, { id: 'translation', label: 'Translation', description: 'Cytoplasmic ribosome reads mature mRNA and joins amino acids.' }],
    steps: expressionSteps('transcription'),
    question: { prompt: 'Which statement is correct for this eukaryotic example?', options: ['RNA polymerase translates DNA inside the nucleus.', 'mRNA is processed in the nucleus and then translated on a cytoplasmic ribosome.', 'A stop codon recruits a tRNA carrying a stop amino acid.'], answer: 1, explanation: 'Transcription and RNA processing precede mRNA export. Ribosomes perform translation; release factors recognise stop codons.' },
    sources: [curriculum('6.2.1–5', '24–25'), book('15.3 Eukaryotic transcription', '15-3-eukaryotic-transcription'), book('15.4 RNA processing', '15-4-rna-processing-in-eukaryotes'), book('15.5 Translation', '15-5-ribosomes-and-protein-synthesis')],
    limitation: 'Short schematic eukaryotic gene and message; splicing is abbreviated. No bacterial coupling of transcription and translation is implied. Initiation factors, charging enzymes, RNA cap/tail chemistry and folding are omitted.',
  },
  {
    id: 'BIO-032', title: 'Aerobic respiration pathway', level: 'A Level', bundle: 'Respiration & photosynthesis', kicker: 'Topic 12 · Track carbon and reduced carriers',
    description: 'Connect glycolysis, the link reaction, Krebs cycle and oxidative phosphorylation.', outcome: 'Locate each stage and audit carbon and carrier outputs per glucose.',
    structures: [part('cytoplasm', 'Cytoplasm', blue, 'Site of glycolysis.'), part('mitochondrion', 'Mitochondrion', coral, 'Compartment containing later aerobic stages.'), part('matrix', 'Matrix', rose, 'Site of link reaction and most Krebs reactions.'), part('inner-membrane', 'Inner mitochondrial membrane', teal, 'Contains the respiratory chain and ATP synthase.'), part('intermembrane', 'Intermembrane space', blue, 'Receives protons pumped from the matrix.'), part('glycolysis', 'Glycolysis', amber, 'One glucose becomes two pyruvate.'), part('pyruvate', 'Pyruvate', amber, 'Three-carbon product entering the link reaction.'), part('acetyl-coa', 'Acetyl coenzyme A', rose, 'Carries a two-carbon acetyl group.'), part('krebs', 'Krebs cycle', violet, 'Regenerates oxaloacetate and reduces carriers.'), part('carriers', 'NADH / FADH₂', amber, 'Reduced carriers transfer electrons toward the respiratory chain.'), part('etc', 'Electron transport chain', teal, 'Electron transfer supports proton pumping.'), part('atp-synthase', 'ATP synthase', violet, 'Proton return supports ATP synthesis.')],
    steps: [
      step('Glycolysis · cytoplasm', 'One glucose forms two pyruvate, two NADH and a net two ATP.', 'No carbon dioxide is released in glycolysis.', ['cytoplasm', 'glycolysis', 'pyruvate'], [{ label: 'Per glucose', value: '2 × 3C pyruvate; 2 NADH; 2 net ATP' }]),
      step('Link reaction · matrix', 'Two pyruvate yield two acetyl-CoA, two CO₂ and two NADH.', 'Each acetyl group contains two carbon atoms.', ['matrix', 'pyruvate', 'acetyl-coa'], [{ label: 'Per glucose', value: '2 CO₂; 2 NADH' }]),
      step('Krebs cycle · matrix', 'Two turns yield four CO₂, six NADH, two FADH₂ and two ATP equivalents.', 'Oxaloacetate is regenerated, not consumed overall.', ['matrix', 'krebs', 'carriers'], [{ label: 'Per glucose · two turns', value: '4 CO₂; 6 NADH; 2 FADH₂; 2 ATP equivalents' }]),
      step('Electron transfer · inner membrane', 'Reduced carriers donate electrons; transfer supports H⁺ pumping from matrix to intermembrane space.', 'The electron pathway and proton movement are different routes.', ['carriers', 'etc', 'inner-membrane', 'intermembrane']),
      step('Oxygen and ATP synthesis', 'Oxygen is the final electron acceptor, forming water. H⁺ returns to the matrix through ATP synthase.', 'Proton return supports oxidative phosphorylation.', ['etc', 'atp-synthase', 'matrix']),
      step('Audit the pathway', 'Complete glucose oxidation has a net six CO₂; the earlier stages generate ten NADH and two FADH₂ per glucose.', 'Total ATP yield varies; it is not fixed here.', ['glycolysis', 'krebs', 'carriers', 'atp-synthase'], [{ label: 'Carbon balance', value: '6C glucose → net 6 CO₂' }, { label: 'Reduced carriers generated', value: '10 NADH + 2 FADH₂' }]),
    ],
    question: { prompt: 'Which assignment of stage and location is correct?', options: ['Glycolysis in the matrix; Krebs in cytoplasm.', 'Link reaction in the matrix; oxidative phosphorylation at the inner membrane.', 'All stages in the intermembrane space.'], answer: 1, explanation: 'Glycolysis occurs in the cytoplasm. Pyruvate oxidation and most Krebs reactions occur in the matrix; oxidative phosphorylation uses the inner membrane.' },
    sources: [curriculum('12.2.1–9, 11', '33–34'), book('7.2 Glycolysis', '7-2-glycolysis'), book('7.3 Pyruvate oxidation and Krebs cycle', '7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle'), book('7.4 Oxidative phosphorylation', '7-4-oxidative-phosphorylation')],
    limitation: 'A pathway overview under aerobic, glucose-fed conditions. Counts are per glucose, not per pyruvate. ATP equivalents allow ATP/GTP variation. No universal ATP total, shuttle yield or claim that incoming acetyl carbons leave on the first Krebs turn is made.',
  },
  {
    id: 'BIO-034', title: 'Inside a chloroplast', level: 'A Level', bundle: 'Respiration & photosynthesis', kicker: 'Topic 13 · Membranes and compartments',
    description: 'Inspect the envelope and internal thylakoid system in an enlarged cutaway.', outcome: 'Locate stroma, thylakoid membrane and lumen without confusing their boundaries.',
    structures: [part('outer-membrane', 'Outer envelope membrane', coral, 'Outer boundary of the chloroplast envelope.'), part('inner-membrane', 'Inner envelope membrane', rose, 'Separates stroma from the envelope intermembrane space.'), part('stroma', 'Stroma', blue, 'Fluid compartment around the thylakoids.'), part('thylakoid', 'Thylakoid membrane', teal, 'Contains pigments and light-reaction machinery.'), part('granum', 'Granum', teal, 'One stack of thylakoids; plural grana.'), part('lamella', 'Stroma lamella', teal, 'Membrane linking regions of the thylakoid system.'), part('lumen', 'Thylakoid lumen', amber, 'The aqueous space enclosed by thylakoid membrane.'), part('pigments', 'Photosynthetic pigments', amber, 'Membrane-associated molecules absorbing light.'), part('dna', 'Chloroplast DNA', violet, 'Small DNA molecules in the stroma.'), part('ribosomes', '70S ribosomes', rose, 'Chloroplast protein-synthesis machinery.')],
    steps: [
      step('Locate the double envelope', 'Two envelope membranes surround the chloroplast interior.', 'The envelope is distinct from the internal thylakoid membrane.', ['outer-membrane', 'inner-membrane']),
      step('Explore the stroma', 'Find the fluid around thylakoids, chloroplast DNA and ribosomes.', 'The Calvin cycle occurs in the stroma.', ['stroma', 'dna', 'ribosomes']),
      step('Find grana and lamellae', 'Stacked thylakoids form grana; lamellae connect the membrane system.', 'Light reactions use the thylakoid system.', ['granum', 'thylakoid', 'lamella', 'pigments']),
      step('Distinguish lumen from stroma', 'The lumen lies inside a thylakoid, separated from stroma by its membrane.', 'The thylakoid membrane supports a proton gradient.', ['lumen', 'thylakoid', 'stroma']),
    ],
    question: { prompt: 'Where is the Calvin cycle located in a chloroplast?', options: ['The stroma.', 'Inside the envelope intermembrane space.', 'Only inside the thylakoid lumen.'], answer: 0, explanation: 'The Calvin cycle uses stromal enzymes. The thylakoid membrane and lumen participate in the light-dependent stage.' },
    sources: [curriculum('13.1.1–3', '35'), book('8.1 Photosynthesis overview', '8-1-overview-of-photosynthesis')],
    limitation: 'Schematic cutaway with enlarged membranes and few grana. Lamellae and lumen continuity are simplified. Pigment distributions, organelle counts and membrane spacing are not measurements.',
  },
  {
    id: 'BIO-035', title: 'Light-dependent reactions', level: 'A Level', bundle: 'Respiration & photosynthesis', kicker: 'Topic 13 · Cyclic and non-cyclic routes',
    description: 'Follow separate electron and proton routes across the thylakoid membrane.', outcome: 'Explain ATP synthesis and distinguish the outputs of two electron-flow pathways.',
    structures: [part('membrane', 'Thylakoid membrane', teal, 'Separates stroma and lumen.'), part('stroma', 'Stroma', blue, 'Receives ATP and reduced NADP.'), part('lumen', 'Thylakoid lumen', amber, 'Protons accumulate here.'), part('psii', 'Photosystem II', coral, 'Receives electrons from water oxidation in non-cyclic flow.'), part('psi', 'Photosystem I', violet, 'Participates in both electron-flow routes.'), part('etc', 'Electron carriers', teal, 'Transfer electrons and support proton pumping.'), part('atp-synthase', 'ATP synthase', rose, 'Uses proton return to support ATP synthesis.'), part('electrons', 'Electrons', amber, 'Follow the selected carrier route.'), part('protons', 'Protons · H⁺', rose, 'Pumped stroma → lumen; return through ATP synthase.'), part('water', 'Water', blue, 'Electron source during non-cyclic flow.'), part('nadp', 'NADP⁺ / reduced NADP', violet, 'Terminal acceptor pair in non-cyclic flow.'), part('atp', 'ATP', amber, 'Produced from ADP and inorganic phosphate.'), part('oxygen', 'Oxygen', blue, 'Released from water oxidation.')],
    variants: [{ id: 'noncyclic', label: 'Non-cyclic', description: 'Water → PSII → carriers → PSI → NADP⁺; ATP, NADPH and O₂.' }, { id: 'cyclic', label: 'Cyclic', description: 'PSI → carriers → PSI; ATP without net NADPH or O₂ production.' }],
    steps: lightSteps('noncyclic'),
    question: { prompt: 'Which output distinguishes cyclic flow through PSI alone?', options: ['ATP without net NADPH or oxygen production.', 'NADPH and oxygen but no ATP.', 'Oxygen from the breakdown of carbon dioxide.'], answer: 0, explanation: 'Cyclic electron transfer supports the proton gradient and ATP formation. It neither oxidises water nor reduces NADP⁺ overall.' },
    sources: [curriculum('13.1.7–10', '35–36'), book('8.2 Light-dependent reactions', '8-2-the-light-dependent-reactions-of-photosynthesis')],
    limitation: 'A qualitative carrier pathway, not a full Z-scheme or stoichiometric kinetic model. Details of carrier proteins and photosystem architecture are omitted. Gradient and ATP-supply controls are not independent inputs to this preset.',
  },
  {
    id: 'BIO-036', title: 'Calvin cycle carbon ledger', level: 'A Level', bundle: 'Respiration & photosynthesis', kicker: 'Topic 13 · Three carbon dioxide molecules',
    description: 'Audit fixation, reduction and regeneration using one three-CO₂ accounting batch.', outcome: 'Conserve carbon while distinguishing net triose phosphate from recycled intermediates.',
    structures: [part('co2', 'Carbon dioxide · 1C', blue, 'Three molecules supply three new carbon atoms.'), part('rubisco', 'Rubisco', teal, 'Catalyses CO₂ fixation by RuBP.'), part('rubp', 'RuBP · 5C', violet, 'Three acceptors are regenerated per accounting batch.'), part('gp', 'GP · 3C', coral, 'Six glycerate 3-phosphate molecules form after fixation.'), part('tp', 'TP · 3C', amber, 'Six triose phosphate molecules form after reduction.'), part('atp', 'ATP', amber, 'Supplies energy for reduction and regeneration.'), part('nadph', 'Reduced NADP · NADPH', rose, 'Supplies reducing power for GP reduction.'), part('regeneration', 'RuBP regeneration', teal, 'Five TP regenerate three RuBP.')],
    steps: [
      step('Set a three-CO₂ batch', 'Three CO₂ meet three RuBP molecules in the stroma.', 'Input carbon is 3 + 15 = 18 atoms.', ['co2', 'rubp'], [{ label: 'Starting carbon', value: '3 × 1C + 3 × 5C = 18C' }]),
      step('Fix carbon dioxide', 'Rubisco-catalysed fixation produces six GP molecules via unstable six-carbon intermediates.', 'Six 3C molecules retain all 18 carbon atoms.', ['rubisco', 'gp'], [{ label: 'After fixation', value: '6 GP × 3C = 18C' }]),
      step('Reduce GP to TP', 'Six ATP and six reduced NADP support conversion of six GP to the six TP now shown.', 'ATP supplies energy; reduced NADP supplies reducing power.', ['tp', 'atp', 'nadph'], [{ label: 'Reduction cost', value: '6 ATP + 6 NADPH' }]),
      step('Account for net product', 'One TP is available as net product; five TP remain for regeneration.', 'One three-CO₂ batch yields net one 3C TP, not one glucose.', ['tp'], [{ label: 'Partition', value: '1 TP net + 5 TP retained' }]),
      step('Regenerate RuBP', 'Five TP and three more ATP regenerate three RuBP, completing the accounting batch.', 'Regeneration recycles 15C; net gain is 3C.', ['tp', 'regeneration', 'rubp', 'atp'], [{ label: 'Total batch cost', value: '9 ATP + 6 NADPH per net TP' }]),
    ],
    question: { prompt: 'After fixing three CO₂ and reducing six GP to six TP, why are five TP retained?', options: ['They release oxygen by photolysis.', 'Their 15 carbon atoms regenerate three 5C RuBP molecules.', 'They make five glucose molecules immediately.'], answer: 1, explanation: 'Five 3C TP contain 15C, the amount needed for three 5C RuBP. One TP remains as net carbon gain.' },
    sources: [curriculum('13.1.11–12', '36'), book('8.3 Using light energy to make organic molecules', '8-3-using-light-energy-to-make-organic-molecules')],
    limitation: 'A carbon-accounting batch in the stroma, not molecules physically orbiting a ring. GP means glycerate 3-phosphate; OpenStax calls the corresponding intermediate 3-PGA. TP represents the triose-phosphate pool. Enzymes between the named stages are omitted.',
  },
  {
    id: 'BIO-043', title: 'Homologues, loci & alleles', level: 'A Level', bundle: 'Inheritance & gene control', kicker: 'Topic 16 · Identity versus copies',
    description: 'Compare homologous chromosomes, allele combinations and replicated sisters.', outcome: 'Distinguish a matched locus, an allele and a sister chromatid.',
    structures: [part('maternal', 'Maternal homologue', coral, 'One chromosome of the illustrated pair.'), part('paternal', 'Paternal homologue', teal, 'The corresponding chromosome from the other parent.'), part('locus', 'Gene locus', amber, 'The same gene position on both homologues.'), part('allele-a', 'Allele A', rose, 'One variant of the illustrated gene.'), part('allele-b', 'Allele a', blue, 'A second variant; colour does not specify phenotype.'), part('centromere', 'Centromere region', violet, 'Used to distinguish chromosome identity from copies.'), part('sisters', 'Sister chromatids', coral, 'Replicated copies of one homologue before any exchange.')],
    variants: [{ id: 'heterozygous', label: 'Heterozygous · Aa', description: 'Unreplicated homologues carry different alleles.' }, { id: 'homozygous', label: 'Homozygous · AA', description: 'Unreplicated homologues carry the same allele.' }, { id: 'replicated', label: 'Replicated · Aa', description: 'Each homologue has two identical sisters; the genotype remains Aa.' }],
    steps: homologSteps('heterozygous'),
    question: { prompt: 'An Aa cell replicates its DNA without mutation. What is true for the pair shown?', options: ['It now has four homologous chromosomes and genotype AAAa.', 'It still has two chromosomes, now with four DNA molecules.', 'It becomes homozygous because sisters match.'], answer: 1, explanation: 'Replication creates two sisters per chromosome. It doubles DNA copies without changing the two homologues or the Aa genotype.' },
    sources: [curriculum('16.1.2; 16.2.1', '41'), book('13.1 Chromosomal theory', '13-1-chromosomal-theory-and-genetic-linkage'), book('12.1 Mendel’s experiments', '12-1-mendels-experiments-and-the-laws-of-probability')],
    limitation: 'Only one autosomal pair and one locus are shown, not a full karyotype. Replicated sisters are identical in this no-mutation, no-crossing-over example. Allele case alone does not specify a dominance relationship.',
  },
  {
    id: 'BIO-046', title: 'Lac operon control', level: 'A Level', bundle: 'Inheritance & gene control', kicker: 'Topic 16 · A bacterial example',
    description: 'Compare lactose absence and presence while holding glucose low in both conditions.', outcome: 'Explain how an inducer changes repressor–operator binding and transcription.',
    structures: [part('dna', 'Bacterial DNA', violet, 'Carries the regulatory and operon regions.'), part('regulatory-gene', 'Regulatory gene · lacI', rose, 'Separate gene producing the repressor.'), part('promoter', 'Operon promoter', teal, 'DNA region at which RNA polymerase initiates.'), part('operator', 'Operator', amber, 'DNA region bound by the active repressor.'), part('structural-genes', 'Structural genes · lacZYA', coral, 'Encode proteins involved in lactose use.'), part('repressor', 'Lac repressor', violet, 'Binding the operator strongly inhibits transcription.'), part('inducer', 'Allolactose · inducer', amber, 'A lactose-derived molecule binding the repressor.'), part('rna-polymerase', 'RNA polymerase', teal, 'Transcribes the structural genes when access permits.'), part('mrna', 'Operon mRNA', blue, 'A single transcript containing the structural-gene information.'), part('enzymes', 'Lactose-use proteins', coral, 'Include β-galactosidase and lactose permease.')],
    variants: [{ id: 'no-lactose', label: 'Lactose absent', description: 'Low glucose; active repressor strongly suppresses structural-gene transcription.' }, { id: 'lactose', label: 'Lactose present', description: 'Low glucose; allolactose reduces repressor binding and expression increases.' }],
    steps: lacSteps('no-lactose'),
    question: { prompt: 'With glucose held low, how does lactose-derived allolactose increase lac operon expression?', options: ['It binds the repressor and reduces its affinity for the operator.', 'It turns the operator into a ribosome.', 'It removes all bacterial DNA.'], answer: 0, explanation: 'Inducer binding changes the repressor conformation. Reduced operator binding allows greater structural-gene transcription.' },
    sources: [curriculum('16.3.1–2', '42'), book('16.2 Prokaryotic gene regulation', '16-2-prokaryotic-gene-regulation')],
    limitation: 'Only lac operon induction is modelled, with glucose low in both presets. CAP/cAMP and quantitative repression are omitted. Very low basal expression is simplified; absence of lactose does not mean every transcript is impossible. This does not cover all Topic 16.3 gene control.',
  },
];

/** Every variant preserves its module’s step count. Unused global transport controls do not change these presets. */
export function getWave2Steps(spec: ModuleSpec, variant: string, _gradient: 'forward' | 'reverse', _energy: boolean): LessonStep[] {
  const chosen = spec.variants?.some(item => item.id === variant) ? variant : spec.variants?.[0]?.id ?? '';
  switch (spec.id) {
    case 'BIO-004': return carbohydrateSteps(chosen);
    case 'BIO-005': return lipidSteps(chosen);
    case 'BIO-007': return enzymeSteps(chosen);
    case 'BIO-009': return inhibitionSteps(chosen);
    case 'BIO-017': return expressionSteps(chosen);
    case 'BIO-035': return lightSteps(chosen);
    case 'BIO-043': return homologSteps(chosen);
    case 'BIO-046': return lacSteps(chosen);
    default: return spec.steps;
  }
}
