import { useId, useState, type DragEvent } from 'react';
import { ArrowRight, Check, Droplets, GripVertical, Info, Plus, RotateCcw, X } from 'lucide-react';
import { checkPlacement, FOODS, getFood, getGroup, LABEL_FIELDS, MAIN_GROUPS, PLATE_SOURCES, representedGroups, scaleLabel, type FoodGroupId } from './plateContent';
import './balancedPlate.css';

const DRAG_TYPE = 'application/x-algocore-food';
const formatNumber = (value: number) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value);

/** Original SVG illustrations, schematic and not portion-size references. */
function FoodArt({ id, className = '' }: { id: string; className?: string }) {
  return <svg viewBox="0 0 96 96" className={`bp-food-art ${className}`} aria-hidden="true" focusable="false">
    <ellipse cx="48" cy="78" rx="30" ry="5" fill="#223958" opacity=".08" />
    {id === 'broccoli' && <><path d="M43 44 39 75h20L53 43" fill="#78945b" /><path d="m45 56-13-9m20 10 13-14" stroke="#597e45" strokeWidth="6" /><path d="M25 54C8 47 19 29 30 30 29 12 52 11 59 25 76 20 88 40 74 50 67 62 52 56 47 52 40 60 30 60 25 54Z" fill="#4f8057" /><circle cx="40" cy="30" r="12" fill="#64945d" /><circle cx="65" cy="39" r="12" fill="#5d8c56" /></>}
    {id === 'carrot' && <><path d="M41 34C33 28 27 19 31 14 43 16 45 28 46 32 44 18 51 11 57 12 61 23 54 32 51 35 61 23 70 25 73 30 69 40 55 42 51 41" fill="#65946b" /><path d="M35 35C48 28 62 38 59 47 53 64 35 80 30 80 25 78 27 48 35 35Z" fill="#e8994c" stroke="#bd6f34" strokeWidth="2" /><path d="m34 49 11 5m-15 9 10 3m9-25 7 3" stroke="#b76c32" strokeWidth="2.5" strokeLinecap="round" /></>}
    {id === 'apple' && <><path d="M48 32c-9-12-32-4-31 17 0 21 13 33 22 30 6-2 11-3 17 0 13 3 25-17 23-34-2-18-23-23-31-13Z" fill="#d77567" /><path d="M48 32c1-10 1-13 5-19" fill="none" stroke="#765241" strokeWidth="5" strokeLinecap="round" /><path d="M53 25c1-13 15-16 22-12-3 13-12 15-22 12" fill="#689172" /><path d="M28 42c-3 7-3 13-1 18" fill="none" stroke="#f6c0ad" strokeWidth="5" strokeLinecap="round" /></>}
    {id === 'rice' && <><path d="M17 48c3-21 56-23 63 0" fill="#f7f4e8" stroke="#ddd8c4" strokeWidth="2" /><path d="m27 39 7-2m7-1 6-2m10 3 6 2m-24 4 8 1m15-1 6 2" stroke="#d5cdb5" strokeWidth="2" strokeLinecap="round" /><path d="M14 48h68c-2 22-16 31-34 31S18 69 14 48Z" fill="#7c9d9c" /><path d="M18 54h59" stroke="#b7d0cb" strokeWidth="3" /><path d="M34 80h28" stroke="#48686d" strokeWidth="4" strokeLinecap="round" /></>}
    {id === 'bread' && <><path d="M23 34C10 18 30 12 48 14c19-2 38 6 25 21v43H23Z" fill="#bb8350" stroke="#9b683f" strokeWidth="3" /><path d="M30 36C20 25 35 21 48 23c15-2 28 4 18 13v34H30Z" fill="#e2bc83" /><path d="m38 38 3 2m13-8 3 3m-13 18 3-2m11 10 3 1m-27-2 2 2" stroke="#af804f" strokeWidth="3" strokeLinecap="round" /></>}
    {id === 'potato' && <><path d="M20 66C8 43 36 13 61 23c30 12 23 44-2 53-13 5-32 3-39-10Z" fill="#c8a675" stroke="#a2855d" strokeWidth="2" /><path d="M28 48c1-6 5-10 10-13" fill="none" stroke="#e5c797" strokeWidth="5" strokeLinecap="round" /><g fill="#99764c"><ellipse cx="40" cy="61" rx="3" ry="2" /><ellipse cx="62" cy="43" rx="3" ry="2" /><ellipse cx="63" cy="66" rx="2" ry="3" /></g></>}
    {id === 'egg' && <><path d="M23 58C20 40 37 14 48 14s29 27 26 46c-3 24-47 27-51-2Z" fill="#f9f5e7" stroke="#d6cbb4" strokeWidth="2" /><ellipse cx="49" cy="57" rx="17" ry="18" fill="#e5b45c" /><ellipse cx="43" cy="51" rx="5" ry="6" fill="#f5d286" /></>}
    {id === 'lentils' && <><path d="M15 48h66c-3 22-14 31-33 31-18 0-30-9-33-31Z" fill="#b07b68" /><ellipse cx="48" cy="47" rx="33" ry="12" fill="#d5a470" />{[[26,46],[38,40],[50,45],[64,40],[70,49],[39,51],[56,52]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="6" ry="3.5" fill={i%2?'#b17c48':'#8e7347'} stroke="#dfb984" strokeWidth="1" />)}<path d="M25 61c13 9 33 9 46-1" fill="none" stroke="#d2a08a" strokeWidth="3" /></>}
    {id === 'yogurt' && <><path d="m26 33 7 44h31l7-44" fill="#c2d5df" stroke="#6f8b9e" strokeWidth="2" /><ellipse cx="48" cy="32" rx="25" ry="9" fill="#fcfcf4" stroke="#9aaeb9" strokeWidth="2" /><path d="M31 45h35v20H31" fill="#f6f6ef" /><path d="m38 55 7 6 13-13" fill="none" stroke="#789f92" strokeWidth="4" /><path d="m68 26 10-15" stroke="#8292a0" strokeWidth="5" strokeLinecap="round" /></>}
    {id === 'cheese' && <><path d="m17 48 39-27 26 30v25H17Z" fill="#e7be68" stroke="#bb9348" strokeWidth="2" /><path d="m17 48 65 3-26-30Z" fill="#f5d68c" /><g fill="#c99d4d"><circle cx="34" cy="61" r="5" /><circle cx="64" cy="64" r="6" /><ellipse cx="49" cy="40" rx="5" ry="3" /></g></>}
    {id === 'oil' && <><path d="M39 15h18v18l11 13v32H28V46l11-13Z" fill="#e6d697" stroke="#a99856" strokeWidth="2" /><path d="M30 50h36v25H30Z" fill="#c9b45f" /><rect x="37" y="12" width="22" height="11" rx="3" fill="#657d5a" /><path d="M48 47c-9 12-10 14-6 18 4 5 12 2 12-4 0-4-3-8-6-14Z" fill="#f7edbc" /></>}
    {id === 'biscuit' && <><circle cx="48" cy="49" r="29" fill="#c69c68" stroke="#a47b49" strokeWidth="3" /><circle cx="48" cy="49" r="23" fill="#dab37d" stroke="#bb8b53" strokeWidth="1.5" strokeDasharray="2 5" /><g fill="#91704f">{[[39,35],[56,33],[31,48],[48,47],[64,51],[39,63],[56,65]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.5" />)}</g></>}
  </svg>;
}

const SECTORS: { id: FoodGroupId; start: number; end: number; label: [number, number]; food: [number, number] }[] = [
  { id: 'fruit-veg', start: -90, end: 35, label: [408, 174], food: [405, 249] },
  { id: 'starch', start: 35, end: 160, label: [302, 369], food: [299, 306] },
  { id: 'protein', start: 160, end: 245, label: [171, 205], food: [204, 267] },
  { id: 'fats-sugar', start: 245, end: 270, label: [80, 34], food: [266, 111] },
];

function sectorPath(start: number, end: number) {
  const point = (angle: number) => [300 + 194 * Math.cos(angle * Math.PI / 180), 255 + 194 * Math.sin(angle * Math.PI / 180)];
  const [x1, y1] = point(start), [x2, y2] = point(end);
  return `M300 255L${x1} ${y1}A194 194 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2}Z`;
}

export default function BalancedPlate() {
  const [foodIds, setFoodIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('bread');
  const [amount, setAmount] = useState(50);
  const [water, setWater] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropGroup, setDropGroup] = useState<FoodGroupId | null>(null);
  const [notice, setNotice] = useState({ text: 'Choose a food to find out more, then drag it or select Add.', error: false, seq: 0 });
  const unique = useId();
  const selectedFood = getFood(selectedId)!;
  const groupsPresent = representedGroups(foodIds);
  const announce = (text: string, error = false) => setNotice((previous) => ({ text, error, seq: previous.seq + 1 }));
  const selectFood = (id: string) => { setSelectedId(id); setAmount(50); };

  function addFood(foodId: string, groupId: FoodGroupId) {
    const result = checkPlacement(foodId, groupId);
    setDropGroup(null);
    setDraggedId(null);
    if (!result.correct) { announce(result.message, true); return; }
    const food = getFood(foodId)!;
    selectFood(foodId);
    if (foodIds.includes(foodId)) { announce(`${food.name} is already on the plate. Choose a different food for variety.`); return; }
    setFoodIds((previous) => previous.includes(foodId) ? previous : [...previous, foodId]);
    announce(result.message);
  }

  function dropFood(event: DragEvent, groupId: FoodGroupId) {
    event.preventDefault();
    const id = event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData('text/plain');
    addFood(id, groupId);
  }

  function dragOver(event: DragEvent, groupId: FoodGroupId) {
    if (!draggedId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDropGroup(groupId);
  }

  function removeFood(id: string) {
    setFoodIds((previous) => previous.filter((entry) => entry !== id));
    announce(`Removed ${getFood(id)!.name} from the plate.`);
  }

  function reset() {
    setFoodIds([]); setWater(false); setDraggedId(null); setDropGroup(null); selectFood('bread');
    announce('The plate and water reminder have been reset.');
  }

  return <section className="bp-activity" aria-labelledby={`${unique}-title`}>
    <header className="bp-heading">
      <div><p className="bp-eyebrow">4.2 · A balanced diet</p><h2 id={`${unique}-title`}>One plate. Plenty to discover.</h2><p>Sort foods and explore nutrition labels. Think about variety across the day and week.</p></div>
      <button className="ac-btn ac-btn-quiet bp-reset" type="button" onClick={reset}><RotateCcw size={16} aria-hidden="true" />Reset activity</button>
    </header>

    <div className="bp-workspace">
      <section className="bp-plate-panel" aria-label="Food sorting plate">
        <div className="bp-panel-heading"><div><span className="bp-number">01</span><h3>Find the food group</h3></div><span className="bp-count">{foodIds.length} {foodIds.length === 1 ? 'food' : 'foods'} on the plate</span></div>
        <p className="bp-help" id={`${unique}-drag-help`}>Drag a card onto the plate or a group name. You can also select <strong>Add</strong> on each card.</p>
        <figure className="bp-plate-figure">
          <svg className="bp-plate" viewBox="0 0 600 500" role="img" aria-labelledby={`${unique}-plate-title ${unique}-plate-desc`}>
            <title id={`${unique}-plate-title`}>A sorting plate with the lesson’s four food groups</title>
            <desc id={`${unique}-plate-desc`}>One: fruit and vegetables. Two: starchy foods. Three: protein foods. Four: fats, oils and sugar. The regions are for sorting only and do not show recommended portions or official proportions. Use the group buttons below to sort with a keyboard.</desc>
            <ellipse cx="300" cy="461" rx="177" ry="13" fill="#223958" opacity=".055" />
            <circle cx="300" cy="255" r="213" fill="white" stroke="#dce3ed" strokeWidth="2" />
            <circle cx="300" cy="255" r="202" fill="#f8fafc" stroke="#e4e9ef" />
            {SECTORS.map((sector) => {
              const group = getGroup(sector.id);
              const items = foodIds.filter((id) => getFood(id)?.group === group.id);
              return <g key={group.id}>
                <path d={sectorPath(sector.start, sector.end)} fill={group.soft} stroke={dropGroup === group.id ? group.color : 'white'} strokeWidth={dropGroup === group.id ? 5 : 4}
                  onDragOver={(event) => dragOver(event, group.id)} onDrop={(event) => dropFood(event, group.id)} />
                <g pointerEvents="none">
                  {group.id === 'fats-sugar' && <path d="m271 80-22-47H86" fill="none" stroke={group.color} strokeWidth="1.5" />}
                  <text x={sector.label[0]} y={sector.label[1]} textAnchor={group.id === 'fats-sugar' ? 'start' : 'middle'} fill={group.color} className="bp-svg-label">
                    {group.shortLines.map((line, index) => <tspan key={line} x={sector.label[0]} dy={index === 0 ? 0 : 18}>{index === 0 ? `${group.number}. ` : ''}{line}</tspan>)}
                  </text>
                  {items.map((id, index) => <svg key={id} x={sector.food[0] - 28 + (index - (items.length - 1) / 2) * 41} y={sector.food[1] - 25} width="56" height="56" viewBox="0 0 96 96"><FoodArt id={id} /></svg>)}
                  {items.length === 0 && group.id !== 'fats-sugar' && <text x={sector.food[0]} y={sector.food[1] + 7} textAnchor="middle" className="bp-svg-empty" fill={group.color}>+</text>}
                </g>
              </g>;
            })}
            <circle cx="300" cy="255" r="44" fill="white" stroke="#dce3ed" />
            <text x="300" y="252" textAnchor="middle" className="bp-svg-centre">4 GROUPS</text><text x="300" y="270" textAnchor="middle" className="bp-svg-centre-small">food sorting</text>
          </svg>
          <figcaption><Info size={14} aria-hidden="true" />A food sorting diagram. Region sizes and food drawings do not show recommended portions.</figcaption>
        </figure>

        <div className="bp-group-list" aria-label="Food group buttons, an alternative to dragging">
          {MAIN_GROUPS.map((group) => {
            const items = foodIds.filter((id) => getFood(id)?.group === group.id);
            return <div className={`bp-group-row${dropGroup === group.id ? ' bp-drop-active' : ''}`} key={group.id} onDragOver={(event) => dragOver(event, group.id)} onDrop={(event) => dropFood(event, group.id)}>
              <button type="button" className="bp-group-target" onClick={() => addFood(selectedId, group.id)} aria-label={`Place ${selectedFood.name} in ${group.name}`}>
                <span className="bp-group-number" style={{ background: group.soft, color: group.color }}>{group.number}</span><span>{group.name}</span><span className="bp-group-item-count">{items.length}</span><Plus size={14} aria-hidden="true" />
              </button>
              {items.length > 0 && <ul className="bp-placed-list">{items.map((id) => <li key={id}><button type="button" className="bp-placed-name" onClick={() => selectFood(id)}>{getFood(id)!.name}</button><button type="button" className="bp-remove" aria-label={`Remove ${getFood(id)!.name} from the plate`} onClick={() => removeFood(id)}><X size={13} aria-hidden="true" /></button></li>)}</ul>}
            </div>;
          })}
        </div>
        <div className="bp-occasional">
          <div><span className="bp-tray-label">SAME GROUP, DIFFERENT ROLES</span><h4>Are oil and biscuits the same?</h4><p>Fat has a role in a balanced diet. Oils are used in small amounts; foods high in sugar or fat, such as biscuits, are eaten less often. Sharing a group does not make two foods the same.</p></div>
        </div>
        <button type="button" className={`bp-water${water ? ' bp-water-added' : ''}`} aria-pressed={water} onClick={() => { setWater((previous) => !previous); announce(water ? 'Water reminder removed.' : 'Water reminder added: remember to drink water through the day. The picture does not show an amount to drink.'); }}>
          <span className="bp-water-icon"><Droplets size={27} aria-hidden="true" /></span><span><strong>{water ? 'Water remembered' : 'What about water?'}</strong><span>Water matters too. Select to add or remove a reminder.</span></span>{water ? <Check size={19} aria-hidden="true" /> : <Plus size={19} aria-hidden="true" />}
        </button>
      </section>

      <section className="bp-pantry" aria-labelledby={`${unique}-pantry-title`}>
        <div className="bp-panel-heading"><div><span className="bp-number">02</span><h3 id={`${unique}-pantry-title`}>Choose your foods</h3></div><span className="bp-count">12 cards to explore</span></div>
        <div className="bp-food-grid">
          {FOODS.map((food) => {
            const added = foodIds.includes(food.id);
            return <article key={food.id} className={`bp-food-card${selectedId === food.id ? ' bp-food-selected' : ''}${added ? ' bp-food-added' : ''}`}
              draggable onDragStart={(event) => { event.dataTransfer.setData(DRAG_TYPE, food.id); event.dataTransfer.setData('text/plain', food.id); event.dataTransfer.effectAllowed = 'copy'; setDraggedId(food.id); selectFood(food.id); }} onDragEnd={() => { setDraggedId(null); setDropGroup(null); }}>
              <GripVertical size={13} className="bp-drag-handle" aria-hidden="true" />
              <button type="button" className="bp-food-select" onClick={() => selectFood(food.id)} aria-pressed={selectedId === food.id} aria-label={`Explore ${food.name}`} aria-describedby={`${unique}-drag-help`}>
                <FoodArt id={food.id} /><strong>{food.name}</strong><span>{food.nutrients.slice(0, 2).join(' · ')}</span>
              </button>
              <button type="button" className="bp-food-add" disabled={added} onClick={() => addFood(food.id, food.group)} aria-label={added ? `${food.name} added` : `Add ${food.name} to its food group`}>{added ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{added ? 'Added' : 'Add'}</button>
            </article>;
          })}
        </div>
        <div className={`bp-status${notice.error ? ' bp-status-retry' : ''}`} role="status" aria-live="polite" aria-atomic="true"><span key={notice.seq}>{notice.error ? <Info size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}{notice.text}</span></div>
      </section>
    </div>

    <div className="bp-reflection-grid">
      <section className="bp-label-panel" aria-labelledby={`${unique}-label-title`}>
        <div className="bp-panel-heading"><div><span className="bp-number">03</span><h3 id={`${unique}-label-title`}>Take a closer look</h3></div></div>
        <div className="bp-selected-food"><FoodArt id={selectedFood.id} /><div><p className="bp-eyebrow">{getGroup(selectedFood.group).en}</p><h4>{selectedFood.name}</h4><div className="bp-nutrient-tags">{selectedFood.nutrients.map((nutrient) => <span key={nutrient}>{nutrient}</span>)}</div></div></div>
        <p className="bp-food-explanation">{selectedFood.explanation}</p>
        {selectedFood.sampleLabel ? <>
          <div className="bp-sample-heading"><span className="bp-sample-badge">FICTIONAL LABEL</span><label htmlFor={`${unique}-grams`}>Amount to calculate <select id={`${unique}-grams`} value={amount} onChange={(event) => { const grams = Number(event.target.value); setAmount(grams); announce(`Fictional ${selectedFood.name} label: the calculation column now shows ${grams} grams.`); }}>{[25, 50, 100, 150].map((grams) => <option key={grams} value={grams}>{grams} g</option>)}</select></label></div>
          <p className="bp-label-disclaimer">AlgoCore invented these numbers for label reading practice. They are not measured food data or a real product label. The amount selected is not a recommended portion.</p>
          <table className="bp-nutrition-table"><caption>Information often found on food packaging — a fictional example</caption><thead><tr><th scope="col">Information</th><th scope="col">Per 100 g</th><th scope="col">In {amount} g</th></tr></thead><tbody>{LABEL_FIELDS.map((field) => <tr key={field.key}><th scope="row">{field.name} <small>({field.unit})</small></th><td>{formatNumber(selectedFood.sampleLabel![field.key])}</td><td>{formatNumber(scaleLabel(selectedFood.sampleLabel![field.key], amount))}</td></tr>)}</tbody></table>
          <p className="bp-math-note">Explain: 50 g is half of 100 g, so each value is also halved. “Total sugars” can include naturally occurring and added sugars.</p>
        </> : <div className="bp-no-label"><Info size={18} aria-hidden="true" /><p>This card introduces the food group and nutrients. Choose <button type="button" onClick={() => selectFood('bread')}>wholemeal bread</button>, lentils, yoghurt, cheese, oil or a biscuit to explore a fictional label.</p></div>}
      </section>

      <aside className="bp-thinking-panel" aria-labelledby={`${unique}-thinking-title`}>
        <p className="bp-eyebrow">PAUSE & EXPLAIN</p><h3 id={`${unique}-thinking-title`}>What does variety mean?</h3>
        <div className="bp-group-checks">{MAIN_GROUPS.map((group) => <div key={group.id}><span className={groupsPresent.some((item) => item.id === group.id) ? 'bp-check-present' : ''}>{groupsPresent.some((item) => item.id === group.id) ? <Check size={13} aria-hidden="true" /> : group.number}</span><p>{group.name}<small>{groupsPresent.some((item) => item.id === group.id) ? 'Example added' : 'No example yet'}</small></p></div>)}</div>
        <p className="bp-check-note">This list only shows which groups have an example. Ticking every group does not prove that a meal is balanced.</p>
        <ol className="bp-prompts"><li><strong>One food, one nutrient?</strong><p>Why does an apple belong to the fruit group even though it contains carbohydrate?</p></li><li><strong>Try something different.</strong><p>If you chose rice today, which other food from the same group could you try another day?</p></li><li><strong>Think across the day and week.</strong><p>Discuss variety, amounts, frequency and water rather than giving a single meal a score.</p></li></ol>
      </aside>
    </div>
    <details className="bp-sources"><summary>Sources & activity limits</summary><p>The four groups follow Cambridge Primary Science 5 Learner’s Book, lesson 4.2, printed page 96 of the checked edition. This AlgoCore activity does not assess anyone’s diet. Foods contain several nutrients; the drawings and fictional numbers are for learning rather than meal planning.</p><ul>{PLATE_SOURCES.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="ac-sr-only"> (opens a new tab)</span></a><span>{source.note}</span></li>)}</ul></details>
  </section>;
}
