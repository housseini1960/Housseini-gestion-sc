// ⚠️ Remplace ces deux valeurs par celles de VOTRE projet Supabase
// (créez un nouveau projet sur supabase.com si ce n'est pas encore fait,
// et collez le script SQL fourni dans le SQL Editor)
const SUPABASE_URL = "https://yirsgxshujmgyhsrtfmr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cjW1q6Qj4IvvdEIkIsGhDQ_n14Nx4zv";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let MATIERES = [];

/* ---------- Illustrations par matière ---------- */
// Détection par mots-clés dans le nom de la matière, insensible à la casse.
// Chaque icône est un dessin original (SVG fait main), donc zéro souci de droits.
const SUBJECT_VISUALS = [
  { keywords: ["math"], color: "#2f6fed",
    icon: `<path d="M4 20 C 8 14, 10 10, 12 12 C 14 14, 16 6, 20 4" stroke="#6ea8ff" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="4" cy="20" r="1.6" fill="#6ea8ff"/><circle cx="20" cy="4" r="1.6" fill="#6ea8ff"/><path d="M3 12h4M20 16h-4" stroke="#6ea8ff" stroke-width="1.4" opacity="0.6"/>` },
  { keywords: ["francais", "français", "litt", "lecture"], color: "#5fe0a0",
    icon: `<path d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5z" fill="#5fe0a0"/><path d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5z" fill="#5fe0a0" opacity="0.55"/>` },
  { keywords: ["anglais", "english", "langue", "espagnol", "allemand"], color: "#ffb454",
    icon: `<rect x="3" y="5" width="18" height="12" rx="3" fill="#ffb454"/><path d="M8 21l3-4h2l3 4" stroke="#ffb454" stroke-width="1.6" fill="none"/><path d="M7 10h10M7 13h6" stroke="#1a1300" stroke-width="1.4" opacity="0.4"/>` },
  { keywords: ["science", "svt", "physi", "chimi", "biolog"], color: "#8993e6",
    icon: `<circle cx="12" cy="12" r="2.4" fill="#8993e6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="#8993e6" stroke-width="1.6" fill="none"/><ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="#8993e6" stroke-width="1.6" fill="none" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" stroke="#8993e6" stroke-width="1.6" fill="none" transform="rotate(120 12 12)"/>` },
  { keywords: ["histoire", "geo", "géo"], color: "#ff7ab6",
    icon: `<circle cx="12" cy="12" r="9" stroke="#ff7ab6" stroke-width="1.8" fill="none"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="#ff7ab6" stroke-width="1.4" fill="none" opacity="0.7"/>` },
  { keywords: ["info", "nsi", "code", "programm"], color: "#6ea8ff",
    icon: `<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 6l-4 12" stroke="#6ea8ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },
  { keywords: ["sport", "eps", "physique et"], color: "#ffb454",
    icon: `<circle cx="12" cy="5" r="2.2" fill="#ffb454"/><path d="M12 8v6M12 8l-5 3M12 8l5 3M12 14l-4 6M12 14l4 6" stroke="#ffb454" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
  { keywords: ["art", "musique", "dessin"], color: "#ff7ab6",
    icon: `<circle cx="9" cy="17" r="3" fill="#ff7ab6"/><path d="M12 17V5l7-2v12" stroke="#ff7ab6" stroke-width="1.8" fill="none"/><circle cx="19" cy="15" r="2.6" fill="#ff7ab6"/>` },
];
const DEFAULT_VISUAL = { color: "#98a3ba",
  icon: `<path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" stroke="#c7ceda" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" stroke="#c7ceda" stroke-width="1.6" fill="none"/>` };

function getSubjectVisual(nom){
  const n = (nom || "").toLowerCase();
  const match = SUBJECT_VISUALS.find(v => v.keywords.some(k => n.includes(k)));
  return match || DEFAULT_VISUAL;
}

const AVATAR_COLORS = ['#2f6fed','#6ea8ff','#5fe0a0','#8993e6','#ff7ab6','#ffb454'];
function avatarColor(name){
  let hash = 0;
  for(let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(nom, prenom){
  return ((prenom?.[0]||'') + (nom?.[0]||'')).toUpperCase() || '?';
}

/* ---------- Matières ---------- */
async function loadMatieres(){
  const { data, error } = await sb.from('matieres').select('*').order('nom');
  if(error){ document.getElementById('matieresGrid').innerHTML = `<p class="empty">Erreur : ${error.message}</p>`; return; }
  MATIERES = data || [];
  document.getElementById('statMatieres').textContent = MATIERES.length;

  const grid = document.getElementById('matieresGrid');
  grid.innerHTML = MATIERES.length ? MATIERES.map(m => {
    const v = getSubjectVisual(m.nom);
    return `<div class="subject-card">
      <div class="subject-icon" style="background:${v.color}22;"><svg viewBox="0 0 24 24" fill="none">${v.icon}</svg></div>
      <div class="name">${m.nom}</div>
      <div class="code">${m.code||'—'}</div>
      <button class="btn btn-danger deleteMat" data-id="${m.id}">Supprimer</button>
    </div>`;
  }).join('') : '<p class="empty">Aucune matière enregistrée.</p>';

  grid.querySelectorAll('.deleteMat').forEach(btn => btn.addEventListener('click', async () => {
    if(!confirm("Supprimer cette matière ?")) return;
    await sb.from('matieres').delete().eq('id', btn.dataset.id);
    loadMatieres(); loadEnseignants();
  }));

  // met à jour le menu déroulant du formulaire enseignants
  const sel = document.getElementById('ensMatiere');
  const current = sel.value;
  sel.innerHTML = '<option value="">Choisir une matière</option>' + MATIERES.map(m => `<option value="${m.id}">${m.nom}</option>`).join('');
  sel.value = current;
}

document.getElementById('matAddBtn').addEventListener('click', async () => {
  const nom = document.getElementById('matNom').value.trim();
  const code = document.getElementById('matCode').value.trim();
  if(!nom){ alert("Le nom de la matière est obligatoire."); return; }
  const { error } = await sb.from('matieres').insert({ nom, code: code || null });
  if(error){ alert("Erreur : " + error.message); return; }
  document.getElementById('matNom').value = '';
  document.getElementById('matCode').value = '';
  loadMatieres();
});

/* ---------- Enseignants ---------- */
async function loadEnseignants(){
  const { data, error } = await sb.from('enseignants').select('*, matieres(nom)').order('nom');
  if(error){ document.getElementById('enseignantsTable').innerHTML = `<tr><td colspan="6" class="empty">Erreur : ${error.message}</td></tr>`; return; }
  document.getElementById('statEnseignants').textContent = (data||[]).length;

  const tbody = document.getElementById('enseignantsTable');
  tbody.innerHTML = (data && data.length) ? data.map(e => `
    <tr><td><span class="teacher-name"><span class="avatar" style="background:${avatarColor(e.nom+e.prenom)}">${initials(e.nom, e.prenom)}</span>${e.nom}</span></td><td>${e.prenom||'-'}</td><td>${e.email||'-'}</td><td>${e.telephone||'-'}</td><td>${e.matieres?.nom||'-'}</td>
      <td><button class="btn btn-danger deleteEns" data-id="${e.id}">Supprimer</button></td></tr>
  `).join('') : '<tr><td colspan="6" class="empty">Aucun enseignant enregistré.</td></tr>';

  tbody.querySelectorAll('.deleteEns').forEach(btn => btn.addEventListener('click', async () => {
    if(!confirm("Supprimer cet enseignant ?")) return;
    await sb.from('enseignants').delete().eq('id', btn.dataset.id);
    loadEnseignants();
  }));
}

document.getElementById('ensAddBtn').addEventListener('click', async () => {
  const nom = document.getElementById('ensNom').value.trim();
  const prenom = document.getElementById('ensPrenom').value.trim();
  const email = document.getElementById('ensEmail').value.trim();
  const telephone = document.getElementById('ensTelephone').value.trim();
  const matiere_id = document.getElementById('ensMatiere').value || null;
  if(!nom){ alert("Le nom de l'enseignant est obligatoire."); return; }
  const { error } = await sb.from('enseignants').insert({ nom, prenom, email, telephone, matiere_id });
  if(error){ alert("Erreur : " + error.message); return; }
  ['ensNom','ensPrenom','ensEmail','ensTelephone'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ensMatiere').value = '';
  loadEnseignants();
});

/* ---------- Classes ---------- */
async function loadClasses(){
  const { data, error } = await sb.from('classes').select('*').order('nom');
  if(error){ document.getElementById('classesTable').innerHTML = `<tr><td colspan="4" class="empty">Erreur : ${error.message}</td></tr>`; return; }
  document.getElementById('statClasses').textContent = (data||[]).length;

  const tbody = document.getElementById('classesTable');
  tbody.innerHTML = (data && data.length) ? data.map(c => `
    <tr><td>${c.nom}</td><td>${c.niveau||'-'}</td><td>${c.effectif ?? '-'}</td>
      <td><button class="btn btn-danger deleteCla" data-id="${c.id}">Supprimer</button></td></tr>
  `).join('') : '<tr><td colspan="4" class="empty">Aucune classe enregistrée.</td></tr>';

  tbody.querySelectorAll('.deleteCla').forEach(btn => btn.addEventListener('click', async () => {
    if(!confirm("Supprimer cette classe ?")) return;
    await sb.from('classes').delete().eq('id', btn.dataset.id);
    loadClasses();
  }));
}

document.getElementById('claAddBtn').addEventListener('click', async () => {
  const nom = document.getElementById('claNom').value.trim();
  const niveau = document.getElementById('claNiveau').value.trim();
  const effectifVal = document.getElementById('claEffectif').value;
  const effectif = effectifVal ? parseInt(effectifVal, 10) : null;
  if(!nom){ alert("Le nom de la classe est obligatoire."); return; }
  const { error } = await sb.from('classes').insert({ nom, niveau, effectif });
  if(error){ alert("Erreur : " + error.message); return; }
  document.getElementById('claNom').value = '';
  document.getElementById('claNiveau').value = '';
  document.getElementById('claEffectif').value = '';
  loadClasses();
});

loadMatieres();
loadEnseignants();
loadClasses();
