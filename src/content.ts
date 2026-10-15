export type OrganId =
  | 'mouth'
  | 'oesophagus'
  | 'stomach'
  | 'small-intestine'
  | 'large-intestine'
  | 'anus';

export interface DigestiveOrgan {
  id: OrganId;
  en: string;
  vi: string;
  color: string;
  short: string;
  function: string;
  structure: string;
  teachingTip: string;
}

export interface DigestiveStep {
  id: string;
  organId: OrganId;
  title: string;
  action: string;
  explanation: string;
  keyIdea: string;
}

// Original teaching text. Colours are identifiers, not natural organ colours.
export const ORGANS: DigestiveOrgan[] = [
  {
    id: 'mouth', en: 'Mouth', vi: 'Mouth', color: '#ED7A9B',
    short: 'Chews food and mixes it with saliva',
    function: 'Teeth break food into smaller pieces. Saliva moistens food and begins the digestion of starch.',
    structure: 'A space containing teeth and a tongue. It connects to the oesophagus through the throat.',
    teachingTip: 'Chewing makes smaller pieces. Enzymes break down food molecules.',
  },
  {
    id: 'oesophagus', en: 'Oesophagus', vi: 'Oesophagus', color: '#9875DE',
    short: 'Pushes swallowed food towards the stomach',
    function: 'Waves of muscle contractions move swallowed food to the stomach.',
    structure: 'A muscular tube connecting the throat to the stomach.',
    teachingTip: 'These waves are called peristalsis. Food does not simply fall because of gravity.',
  },
  {
    id: 'stomach', en: 'Stomach', vi: 'Stomach', color: '#EF846F',
    short: 'Churns food and mixes it with digestive juices',
    function: 'Mixes food with stomach juices. Enzymes begin the digestion of proteins.',
    structure: 'A muscular bag in the upper left side of the body’s abdomen.',
    teachingTip: 'Digestion continues after the stomach. Most nutrients are absorbed farther along, in the small intestine.',
  },
  {
    id: 'small-intestine', en: 'Small intestine', vi: 'Small intestine', color: '#E8B45B',
    short: 'Continues digestion and absorbs nutrients',
    function: 'Continues digestion and absorbs most nutrients, as well as water.',
    structure: 'A long, coiled tube between the stomach and the large intestine.',
    teachingTip: 'During absorption, substances pass through the intestine’s wall into the body. Moving along the tube is transport.',
  },
  {
    id: 'large-intestine', en: 'Large intestine', vi: 'Large intestine', color: '#4BBBAD',
    short: 'Absorbs more water and forms faeces',
    function: 'Absorbs more water from the remaining material. Faeces form and are stored in the rectum.',
    structure: 'A wider tube surrounding the coils of the small intestine. Its final section includes the rectum.',
    teachingTip: 'The small intestine absorbs water too. Water absorption does not happen only in the large intestine.',
  },
  {
    id: 'anus', en: 'Anus', vi: 'Anus', color: '#BD7BA8',
    short: 'Allows faeces to leave the body',
    function: 'The opening at the end of the digestive tract, where faeces leave the body.',
    structure: 'An opening after the rectum, controlled by rings of muscle.',
    teachingTip: 'Removing undigested material is called egestion. Excretion removes waste made by the body’s cells.',
  },
];

// Six reproducible teaching snapshots. Step order follows the food route.
export const STEPS: DigestiveStep[] = [
  {
    id: 'chew', organId: 'mouth', title: '1 · Chew and moisten',
    action: 'Chewing',
    explanation: 'Teeth break food into smaller pieces. The tongue mixes it with saliva, making it easier to swallow.',
    keyIdea: 'Digestion begins in the mouth.',
  },
  {
    id: 'propel', organId: 'oesophagus', title: '2 · Push food along',
    action: 'Peristalsis',
    explanation: 'Muscles contract behind the swallowed food, pushing it towards the stomach.',
    keyIdea: 'Waves of muscle contractions move food along the tube.',
  },
  {
    id: 'mix', organId: 'stomach', title: '3 · Mix with stomach juices',
    action: 'Churning and mixing',
    explanation: 'The stomach churns food with acid and enzymes. The thick mixture gradually moves into the small intestine.',
    keyIdea: 'Muscles mix the food. Enzymes carry out chemical digestion.',
  },
  {
    id: 'absorb', organId: 'small-intestine', title: '4 · Digest and absorb',
    action: 'Digestion and absorption',
    explanation: 'Digestion breaks food down into substances small enough to be absorbed. Nutrients pass through the intestine’s wall into the body. The small intestine also absorbs water.',
    keyIdea: 'Digestion breaks food down. Absorption moves substances through the intestine’s wall.',
  },
  {
    id: 'recover-water', organId: 'large-intestine', title: '5 · Absorb more water',
    action: 'Water absorption',
    explanation: 'The large intestine absorbs more water from the remaining material. Faeces move towards the rectum.',
    keyIdea: 'The rectum stores faeces before they leave the body.',
  },
  {
    id: 'egest', organId: 'anus', title: '6 · Remove undigested material',
    action: 'Egestion',
    explanation: 'Faeces pass from the rectum through the anus and out of the body.',
    keyIdea: 'Egestion removes the material left after digestion and absorption.',
  },
];

export const MODEL_NOTE = 'This is a simplified teaching model. Colours identify organs; proportions, particle numbers and timings are illustrative. Arrows along a tube show transport. Arrows crossing its wall show absorption. The enlarged wall detail is a schematic inset.';

export const ACCESSORY_NOTE = 'The liver makes bile, the gallbladder stores it, and the pancreas supplies digestive juices to the small intestine. These organs help digestion, but food does not pass through them.';

export const SOURCES: { label: string; url: string }[] = [
  { label: 'NIDDK · Your Digestive System & How it Works', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works' },
  { label: 'MedlinePlus · Peristalsis', url: 'https://medlineplus.gov/ency/anatomyvideos/000097.htm' },
  { label: 'NCI · Small intestine', url: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/small-intestine' },
  { label: 'NCI · Large intestine', url: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/large-intestine' },
  { label: 'NCI · Stomach', url: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/stomach' },
  { label: 'NCI · Anus', url: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/anus' },
  { label: 'OpenStax Biology 2e · Digestive system processes', url: 'https://openstax.org/books/biology-2e/pages/34-3-digestive-system-processes' },
  { label: 'OpenStax Anatomy and Physiology 2e · The stomach', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-4-the-stomach' },
  { label: 'OpenStax Anatomy and Physiology 2e · The small and large intestines', url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines' },
];

// Author-created retrieval questions, not official examination questions.
export const QUIZ: { question: string; options: string[]; answer: number; explanation: string }[] = [
  {
    question: 'Where does food go after leaving the stomach?',
    options: ['Small intestine', 'Liver', 'Large intestine'], answer: 0,
    explanation: 'The route is stomach → small intestine → large intestine. The liver helps digestion by making bile.',
  },
  {
    question: 'Which arrow shows absorption?',
    options: ['Along the oesophagus towards the stomach', 'From inside the intestine through its wall into the body', 'From the rectum through the anus'], answer: 1,
    explanation: 'Absorption happens across the intestine’s wall. Moving along a tube is transport; removing faeces is egestion.',
  },
  {
    question: 'Which statement about water is correct?',
    options: ['Only the large intestine absorbs water', 'Neither intestine absorbs water', 'Both the small and large intestines absorb water'], answer: 2,
    explanation: 'The small intestine absorbs water as well as nutrients. The large intestine absorbs more of the remaining water.',
  },
];
