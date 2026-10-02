'use strict';
const CONFIG = {
  male: { hair: ['Kalju','Lyhyt','Keskipitkä','Pitkä','Afro','Rastapalmikot','Pompadour'], extraLabel: 'Parta', extra: ['Ei','Sänki','Lyhyt parta','Täysparta'], body: ['Laiha','Keskiverto','Vahva','Painava'], tags: ['Humoristinen','Romanttinen','Suojeleva','Musiikillinen','Varakas','Seikkailunhaluinen','Älykäs','Uskollinen','Huolehtiva','Itsevarma','Luova','Urheilullinen','Salaperäinen','Lempeä','Kunnianhimoinen','Ruokaguru','Yölintu','Aamuvirkku','Tekniikkaosaaja','Kirjamato','Juhlaeläin','Kotihiiri','Sosiaalinen perhonen','Kamelinratsastaja','Aavikkonavigaattori','Aarteenetsijä'] },
  female: { hair: ['Hyvin lyhyt','Lyhyt','Poninhäntä','Pitkä','Rastapalmikot'], extraLabel: 'Rintojen koko', extra: ['A-kuppi','B-kuppi','C-kuppi','D-kuppi'], body: ['Laiha','Keskiverto','Urheilullinen','Täyteläinen'], tags: ['Humoristinen','Romanttinen','Huolehtiva','Musiikillinen','Varakas','Elegantti','Älykäs','Uskollinen','Itsenäinen','Itsevarma','Luova','Sirokas','Salaperäinen','Lempeä','Kunnianhimoinen','Ruokaguru','Yölintu','Aamuvirkku','Muotitietoinen','Kirjamato','Juhlaeläin','Kotihiiri','Sosiaalinen perhonen','Aavikkoprinsessa','Vatsatanssija','Jalokiviharrastaja'] }
};
const COLORS = ['Musta','Ruskea','Vaalea','Punainen','Valkoinen','Muut'];
const EYES = ['Ruskea','Sininen','Vihreä','Harmaa','Musta'];
const SWATCHES = {Musta:'#242628',Ruskea:'#855438',Vaalea:'#e3c26f',Punainen:'#b76037',Valkoinen:'#f4f4f4',Muut:'#b5a4d9',Sininen:'#5685b3',Vihreä:'#547d56',Harmaa:'#929da3'};
const form = document.querySelector('#calculator');
const draft = { male: {}, female: {} };
let profile = 'male';
let hasResult = false;

function makeChoices(name, title, values, multiple = false, useSwatches = false) {
  const group = document.createElement(multiple ? 'div' : 'fieldset');
  group.className = multiple ? 'tags-list' : 'trait';
  if (!multiple) { const legend = document.createElement('legend'); legend.textContent = title; group.append(legend); }
  const choices = document.createElement('div'); choices.className = multiple ? 'tags' : 'choices';
  values.forEach((value, index) => {
    const label = document.createElement('label'); label.className = 'choice';
    const input = document.createElement('input'); input.type = multiple ? 'checkbox' : 'radio'; input.name = name; input.value = value;
    if (!multiple) { input.required = true; input.checked = draft[profile][name] ? draft[profile][name] === value : index === (name === 'hair' || name === 'body' ? 1 : 0); }
    else input.checked = (draft[profile].tags || []).includes(value);
    const text = document.createElement('span');
    if (useSwatches) { const swatch = document.createElement('i'); swatch.className = 'swatch'; swatch.style.setProperty('--swatch',SWATCHES[value]); swatch.setAttribute('aria-hidden','true'); text.append(swatch); }
    text.append(document.createTextNode(value)); label.append(input,text); choices.append(label);
  }); group.append(choices); return group;
}
function renderTraits() {
  const c = CONFIG[profile]; const traits = document.querySelector('#traits'); traits.replaceChildren();
  traits.append(makeChoices('color','Hiusten väri',COLORS,false,true),makeChoices('hair',profile === 'male' ? 'Hiustyyli' : 'Hiusten pituus',c.hair),makeChoices('eyes','Silmien väri',EYES,false,true),makeChoices('extra',c.extraLabel,c.extra),makeChoices('body',profile === 'male' ? 'Vartalotyyppi' : 'Vartalo',c.body));
  document.querySelector('#tags').replaceChildren(makeChoices('tags','',c.tags,true));
}
function remember() { const data = new FormData(form); ['color','hair','eyes','extra','body'].forEach(key => draft[profile][key] = data.get(key)); draft[profile].tags = data.getAll('tags'); }
function markChanged() { if (hasResult) document.querySelector('#result-note').hidden = false; }
form.addEventListener('change',event => {
  if (event.target.name === 'profile') { remember(); profile = event.target.value; renderTraits(); }
  markChanged();
});
['age','height'].forEach(id => {
  const number = document.getElementById(id), range = document.getElementById(id+'-range');
  range.addEventListener('input',() => {number.value = range.value; markChanged();});
  number.addEventListener('input',() => {if(number.validity.valid)range.value=number.value; markChanged();});
});

// Original, deterministic entertainment score. This is not the reference site's formula.
function calculateReindeer(data) {
  const age = Number(data.age), height = Number(data.height), c = CONFIG[data.profile];
  if (!c || !Number.isInteger(age) || age < 18 || age > 100 || !Number.isInteger(height) || height < 140 || height > 220) throw new Error('Tarkista ikä (18–100) ja pituus (140–220 cm).');
  for (const [key,values] of Object.entries({color:COLORS,hair:c.hair,eyes:EYES,extra:c.extra,body:c.body})) if (!values.includes(data[key])) throw new Error('Valitse kaikki ominaisuudet.');
  let score = 30 + Math.max(0,18-Math.abs(age-30)/4) + Math.max(0,12-Math.abs(height-175)/4);
  score += [5,6,9,8,6,7][COLORS.indexOf(data.color)] + [5,8,9,7,6][EYES.indexOf(data.eyes)];
  score += (data.profile === 'male' ? [5,7,8,9,10,11,12] : [6,8,10,12,11])[c.hair.indexOf(data.hair)];
  score += (data.profile === 'male' ? [5,7,9,11] : [8,8,8,8])[c.extra.indexOf(data.extra)];
  score += [6,8,10,9][c.body.indexOf(data.body)];
  const tags = [...new Set(data.tags || [])].filter(tag => c.tags.includes(tag));
  score += tags.length * 3;
  for(const pair of [['Humoristinen','Romanttinen'],['Uskollinen','Huolehtiva'],['Älykäs','Luova'],['Yölintu','Kotihiiri'],['Musiikillinen','Juhlaeläin']]) if(pair.every(tag => tags.includes(tag)))score+=5;
  return Math.round(score);
}
form.addEventListener('submit',event => {
  event.preventDefault(); const values = new FormData(form); const data = Object.fromEntries(values); data.tags = values.getAll('tags');
  const error = document.querySelector('#form-error');
  try {
    const count = calculateReindeer(data); error.hidden=true; hasResult=true;
    document.querySelector('#count').textContent=count; document.querySelector('#result-value').hidden=false;
    document.querySelector('#result-title').textContent='Sinun poroarvosi';
    document.querySelector('#result-description').textContent=count >= 150 ? 'Kokonainen suurtökka! Tälle porukalle tarvitaan jo kunnon laidun.' : count >= 100 ? 'Melkoinen tokka! Näillä poroilla täyttää jo tunturin rinteen.' : 'Komea oma tokka. Näillä poroilla kelpaa kulkea tunturissa.';
    document.querySelector('#result-note').hidden=true; document.querySelector('#result').classList.add('revealed');
    if(window.matchMedia('(max-width:680px)').matches)document.querySelector('#result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  } catch(e) {error.textContent=e.message; error.hidden=false;}
});
renderTraits();
