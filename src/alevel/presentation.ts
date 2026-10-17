import type { ModuleSpec } from './types';

/** Keep shared IDs available while stating which structures apply to the current preset. */
export function displayedStructures(spec: ModuleSpec, variant: string) {
  const chosen = spec.variants?.some(item => item.id === variant) ? variant : spec.variants?.[0]?.id ?? '';
  const notes: Record<string, string> = {};
  let structures = spec.structures;

  if (spec.id === 'BIO-004') {
    if (chosen === 'cellulose') {
      notes.branch = 'Absent from the cellulose preset: cellulose chains are unbranched and have no α(1→6) branch points.';
    } else {
      notes.hydrogen = 'Not shown in this preset: this label identifies interchain hydrogen bonds in the cellulose comparison.';
      notes.microfibril = 'Absent from this preset: the cellulose microfibril belongs to the cellulose comparison, not starch or glycogen.';
    }
  }
  if (spec.id === 'BIO-005' && chosen === 'triglyceride') {
    notes.phosphate = 'Absent from the triglyceride preset: this molecule has three fatty-acid residues and no phosphate-containing head.';
    notes.head = 'Absent from the triglyceride preset: there is no hydrophilic phosphate head. The three fatty-acid tails make the molecule predominantly hydrophobic.';
  }
  if (spec.id === 'BIO-007') {
    notes.products = 'Two products appear at catalysis and release (steps 4–5); they are absent before the substrate is cleaved.';
    notes.substrate = 'One connected substrate is shown before catalysis (steps 1–3); after cleavage it is represented by the two products.';
  }
  if (spec.id === 'BIO-009') {
    notes.products = chosen === 'competitive-high'
      ? 'Two products are shown in the final step after substrate wins one binding opportunity; the inhibitor remains present.'
      : 'No products are shown for the illustrated blocked enzyme in this preset. This single-enzyme outcome does not mean all enzymes in a population stop.';
    if (!chosen.startsWith('noncompetitive')) notes['allosteric-site'] = 'Shown for comparison, but the competitive inhibitor does not bind this separate site; it competes at the active site.';
  }
  if (spec.id === 'BIO-017') {
    if (chosen === 'translation') {
      notes.template = 'Not shown as an active template in the translation preset: the ribosome reads mRNA, while DNA remains in the reference nucleus.';
      notes['rna-polymerase'] = 'Not shown in the translation preset: RNA polymerase performs transcription in the nuclear preset.';
      notes.pore = 'Not shown in the translation preset: mRNA export through a nuclear pore is represented in the transcription preset.';
      notes.dna = 'Shown only in the small reference nucleus in this preset. The translating ribosome reads mRNA, not DNA.';
    } else {
      for (const id of ['ribosome', 'trna', 'amino-acids', 'polypeptide']) notes[id] = 'Not shown in the transcription preset. Switch to Translation to explore cytoplasmic polypeptide synthesis.';
    }
  }
  if (spec.id === 'BIO-035' && chosen === 'cyclic') {
    notes.psii = 'Not shown in the cyclic preset: PSII does not participate in this electron route.';
    notes.water = 'Not shown as an electron source in the cyclic preset: this route does not oxidise water.';
    notes.nadp = 'Not shown as a terminal acceptor in the cyclic preset: electrons return to PSI, so this route makes no net reduced NADP.';
    notes.oxygen = 'Absent as a product in the cyclic preset: without water oxidation, this route releases no oxygen.';
  }
  if (spec.id === 'BIO-043') {
    const paternal = chosen === 'homozygous' ? 'A' : 'a';
    structures = structures.map(s => s.id === 'allele-a'
      ? { ...s, label: 'Maternal allele A', description: 'Allele A at the illustrated locus on the maternal homologue.' }
      : s.id === 'allele-b'
        ? { ...s, label: 'Paternal allele ' + paternal, description: 'Allele ' + paternal + ' at the matching locus on the paternal homologue. ' + (chosen === 'replicated' ? 'Both sister chromatids carry this copy.' : 'The allele symbols alone do not establish the phenotype.') }
        : s);
    if (chosen !== 'replicated') notes.sisters = 'Absent from this unreplicated preset: each homologue has one DNA molecule. Switch to Replicated to compare sister chromatids.';
  }
  if (spec.id === 'BIO-046' && chosen === 'no-lactose') {
    notes.inducer = 'Absent from the lactose-absent preset: no lactose-derived allolactose is shown binding the repressor.';
  }

  return structures.map(s => notes[s.id] ? { ...s, description: notes[s.id] } : s);
}
