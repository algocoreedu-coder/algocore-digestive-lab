/** Qualitative teaching states. No physiological rates or experimental coordinates. */
export function lightOutputs(variant: string) {
  return variant === 'cyclic' ? { photosystems: ['PSI'], atp: true, nadph: false, oxygen: false, waterSplit: false }
    : { photosystems: ['PSII', 'PSI'], atp: true, nadph: true, oxygen: true, waterSplit: true };
}
export function calvinState(step: number) {
  const snapshots = [
    { co2:3, rubp:3, gp:0, tp:0, netTp:0, regeneratingTp:0, carbonInCycle:15, exportedCarbon:0 },
    { co2:0, rubp:0, gp:6, tp:0, netTp:0, regeneratingTp:0, carbonInCycle:18, exportedCarbon:0 },
    { co2:0, rubp:0, gp:0, tp:6, netTp:0, regeneratingTp:0, carbonInCycle:18, exportedCarbon:0 },
    { co2:0, rubp:0, gp:0, tp:5, netTp:1, regeneratingTp:5, carbonInCycle:15, exportedCarbon:3 },
    { co2:0, rubp:3, gp:0, tp:0, netTp:1, regeneratingTp:0, carbonInCycle:15, exportedCarbon:3 },
  ];
  return snapshots[Math.max(0,Math.min(4,step))];
}
export function alleleState(variant: string) {
  const replicated=variant==='replicated';
  return { chromosomes:2, chromatids:replicated?4:2, maternalAlleles:replicated?['A','A']:['A'], paternalAlleles:replicated?['a','a']:[variant==='homozygous'?'A':'a'], genotype:variant==='homozygous'?'AA':'Aa' };
}
export function lacState(variant: string) {
  const induced=variant==='lactose';
  return { glucose:'low', allolactose:induced, operatorOccupied:!induced, expression:induced?'induced':'low basal' };
}
export const DNA_BASES = ['A','T','G','C'] as const;
export function complementaryDNA(sequence:string) {
  const bases:Record<string,string>={A:'T',T:'A',G:'C',C:'G'};
  if(!/^[ATGC]*$/.test(sequence))throw new Error('Use DNA bases A, T, G and C.');
  return [...sequence].map(base=>bases[base]).join('');
}
export const TRANSLATION_EXAMPLE = { codingDNA:'ATGGAATTTTAA', templateDNA3to5:'TACCTTAAAATT', mrna:'AUGGAAUUUUAA', codons:['AUG','GAA','UUU','UAA'], aminoAcids:['Met','Glu','Phe'], anticodons3to5:['UAC','CUU','AAA'], stopCodon:'UAA' };
