export type FoodGroupId = 'fruit-veg' | 'starch' | 'protein' | 'fats-sugar';

export interface FoodGroup {
  id: FoodGroupId;
  number: number;
  name: string;
  en: string;
  shortLines: string[];
  description: string;
  color: string;
  soft: string;
}

export const FOOD_GROUPS: FoodGroup[] = [
  { id: 'fruit-veg', number: 1, name: 'Fruit & vegetables', en: 'Fruit & vegetables', shortLines: ['Fruit &', 'vegetables'], description: 'Provide a range of vitamins, minerals and fibre.', color: '#386852', soft: '#e4efdf' },
  { id: 'starch', number: 2, name: 'Starchy foods', en: 'Starchy foods', shortLines: ['Starchy', 'foods'], description: 'Provide carbohydrate, a source of energy for the body.', color: '#825300', soft: '#f8edce' },
  { id: 'protein', number: 3, name: 'Protein foods', en: 'Protein foods', shortLines: ['Protein', 'foods'], description: 'Protein helps the body grow and repair tissues. The book places milk in this group; yoghurt and cheese are extra examples for this activity.', color: '#85544e', soft: '#f3e2db' },
  { id: 'fats-sugar', number: 4, name: 'Fats, oils & sugar', en: 'Fats, oils & sugar', shortLines: ['Fats, oils & sugar'], description: 'Fat has a role in a balanced diet, and oils are used in small amounts. Foods high in sugar, such as biscuits, are eaten less often. Oil and biscuits have different roles.', color: '#71612a', soft: '#eee7c7' },
];

export const MAIN_GROUPS = FOOD_GROUPS;

/** Entirely invented teaching-pack labels. These are not food composition data. */
export interface SampleLabel {
  energyKj: number;
  energyKcal: number;
  fat: number;
  saturates: number;
  sugars: number;
  salt: number;
}

export interface Food {
  id: string;
  name: string;
  en: string;
  group: FoodGroupId;
  nutrients: string[];
  explanation: string;
  sampleLabel?: SampleLabel;
}

export const FOODS: Food[] = [
  { id: 'broccoli', name: 'Broccoli', en: 'Broccoli', group: 'fruit-veg', nutrients: ['Vitamins', 'Minerals', 'Fibre'], explanation: 'Broccoli is a vegetable. Choose a variety of fruit and vegetables across the day.' },
  { id: 'carrot', name: 'Carrot', en: 'Carrot', group: 'fruit-veg', nutrients: ['Vitamins', 'Fibre'], explanation: 'A carrot is a root vegetable. Roots and tubers do not all belong to the same food group: potatoes are starchy foods in this activity.' },
  { id: 'apple', name: 'Apple', en: 'Apple', group: 'fruit-veg', nutrients: ['Carbohydrate', 'Fibre', 'Vitamins'], explanation: 'An apple belongs to the fruit group even though it contains carbohydrate. One food can contain several nutrients.' },
  { id: 'rice', name: 'Rice', en: 'Rice', group: 'starch', nutrients: ['Carbohydrate'], explanation: 'Rice provides starch, a type of carbohydrate. The body uses carbohydrate for energy.' },
  { id: 'bread', name: 'Wholemeal bread', en: 'Wholemeal bread', group: 'starch', nutrients: ['Carbohydrate', 'Fibre', 'Protein'], explanation: 'Bread belongs to the starchy foods group. It also provides protein and fibre.', sampleLabel: { energyKj: 1000, energyKcal: 240, fat: 4, saturates: 1, sugars: 4, salt: 1 } },
  { id: 'potato', name: 'Potato', en: 'Potato', group: 'starch', nutrients: ['Carbohydrate', 'Fibre'], explanation: 'Potatoes belong to the starchy foods group in this activity. Calling a food a vegetable does not always tell us its food group.' },
  { id: 'egg', name: 'Egg', en: 'Egg', group: 'protein', nutrients: ['Protein', 'Fat', 'Vitamins'], explanation: 'Eggs provide protein and other nutrients. Meat is not the only source of protein.' },
  { id: 'lentils', name: 'Lentils', en: 'Lentils', group: 'protein', nutrients: ['Protein', 'Fibre', 'Carbohydrate'], explanation: 'Lentils are a plant source of protein. They also contain fibre and carbohydrate.', sampleLabel: { energyKj: 500, energyKcal: 120, fat: 2, saturates: 0.5, sugars: 2, salt: 0.4 } },
  { id: 'yogurt', name: 'Yoghurt', en: 'Yoghurt', group: 'protein', nutrients: ['Protein', 'Calcium', 'Carbohydrate'], explanation: 'Yoghurt is an extra example in the protein foods group for this activity. It also provides calcium and carbohydrate.', sampleLabel: { energyKj: 300, energyKcal: 72, fat: 2, saturates: 1, sugars: 6, salt: 0.1 } },
  { id: 'cheese', name: 'Cheese', en: 'Cheese', group: 'protein', nutrients: ['Protein', 'Calcium', 'Fat'], explanation: 'Cheese is an extra example of a food providing protein and calcium. It also contains fat: belonging to one group does not mean containing just one nutrient.', sampleLabel: { energyKj: 1500, energyKcal: 360, fat: 28, saturates: 18, sugars: 1, salt: 1.5 } },
  { id: 'oil', name: 'Sunflower oil', en: 'Sunflower oil', group: 'fats-sugar', nutrients: ['Fat'], explanation: 'Fat has a role in a balanced diet. Oils are used in small amounts; the bottle drawing does not show a recommended amount.', sampleLabel: { energyKj: 3700, energyKcal: 900, fat: 100, saturates: 10, sugars: 0, salt: 0 } },
  { id: 'biscuit', name: 'Biscuit', en: 'Biscuit', group: 'fats-sugar', nutrients: ['Carbohydrate', 'Fat', 'Sugars'], explanation: 'A biscuit is an example of a food containing fat and sugar in the top group of the book’s diagram. Discuss amounts and frequency rather than calling a food “good” or “bad”.', sampleLabel: { energyKj: 2000, energyKcal: 480, fat: 20, saturates: 8, sugars: 24, salt: 0.5 } },
];

export const LABEL_FIELDS: { key: keyof SampleLabel; name: string; unit: string }[] = [
  { key: 'energyKj', name: 'Energy', unit: 'kJ' },
  { key: 'energyKcal', name: 'Energy', unit: 'kcal' },
  { key: 'fat', name: 'Fat', unit: 'g' },
  { key: 'saturates', name: 'Of which saturates', unit: 'g' },
  { key: 'sugars', name: 'Total sugars', unit: 'g' },
  { key: 'salt', name: 'Salt', unit: 'g' },
];

export function getFood(id: string) {
  return FOODS.find((food) => food.id === id);
}

export function getGroup(id: FoodGroupId) {
  return FOOD_GROUPS.find((group) => group.id === id)!;
}

/** Book-group classification feedback is not an assessment of dietary adequacy. */
export function checkPlacement(foodId: string, target: FoodGroupId) {
  const food = getFood(foodId);
  if (!food) return { correct: false, message: 'Choose one of the food cards in this activity.' };
  if (food.group !== target) return { correct: false, message: `${food.name} belongs to “${getGroup(food.group).name}” in this activity. One food can still contain several nutrients.` };
  return { correct: true, message: `Added ${food.name} to “${getGroup(target).name}”.` };
}

export function scaleLabel(valuePer100g: number, grams: number) {
  return valuePer100g * grams / 100;
}

export function representedGroups(foodIds: string[]) {
  return MAIN_GROUPS.filter((group) => foodIds.some((id) => getFood(id)?.group === group.id));
}

export const PLATE_SOURCES = [
  { title: 'NHS · Eatwell Guide', url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/', note: 'Further reading about variety across the day or week and drinking water. Its five groups differ from the book’s four groups.' },
  { title: 'GOV.UK · Nutrition labelling', url: 'https://www.gov.uk/government/publications/nutrition-legislation-information-sources/nutrition-legislation-information-sheet--2#nutrition-labelling', note: 'Names and units used on labels. All example numbers in this activity were invented by AlgoCore.' },
  { title: 'Cambridge Primary Science 0097', url: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/science/', note: 'Curriculum context. The food sorting and label reading tasks were written by AlgoCore.' },
];
