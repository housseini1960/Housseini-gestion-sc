// ⚠️ Remplace ces deux valeurs par celles de VOTRE projet Supabase
// (créez un nouveau projet sur supabase.com si ce n'est pas encore fait,
// et collez le script SQL fourni dans le SQL Editor)
const SUPABASE_URL = "https://yirsgxshujmgyhsrtfmr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cjW1q6Qj4IvvdEIkIsGhDQ_n14Nx4zv";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let MATIERES = [];

/* ---------- Matières ---------- */
async function loadMatieres(){
  const { data, error } = await sb.from('matieres').select('*').order('nom');
  if(error){ document.getElementById('matieresTable').innerHTML = `<tr><td colspan="3" class="empty">Erreur : ${error.message}</td></tr>`; return; }
  MATIERES = data || [];
  document.getElementById('statMatieres').textContent = MATIERES.length;

  const tbody = document.getElementById('matieresTable');
  tbody.innerHTML = MATIERES.length ? MATIERES.map(m => `
    <tr><td>${m.nom}</td><td>${m.code||'-'}</td>
      <td><button class="btn btn-danger deleteMat" data-id="${m.id}">Supprimer</button></td></tr>
  `).join('') : '<tr><td colspan="3" class="empty">Aucune matière enregistrée.</td></tr>';

  tbody.querySelectorAll('.deleteMat').forEach(btn => btn.addEventListener('click', async () => {
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
    <tr><td>${e.nom}</td><td>${e.prenom||'-'}</td><td>${e.email||'-'}</td><td>${e.telephone||'-'}</td><td>${e.matieres?.nom||'-'}</td>
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

