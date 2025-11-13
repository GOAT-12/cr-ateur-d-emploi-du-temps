// Simple schedule builder logic
(function(){
  const form = document.getElementById('course-form');
  const title = document.getElementById('title');
  const day = document.getElementById('day');
  const start = document.getElementById('start');
  const end = document.getElementById('end');
  const printBtn = document.getElementById('print-pdf');
  const tableBody = document.querySelector('#schedule-table tbody');
  const clearBtn = document.getElementById('clear-all');
  const formError = document.getElementById('form-error');
  const recapEl = document.getElementById('recap-content');

  const COLORS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6'];
  let editingId = null;
  let state = [];

  function load(){
    try{
      const data = getData();
      state = Array.isArray(data) ? data : [];
      refreshViews();
    }catch(e){ console.warn('no schedule'); }
  }

  function save(){
    localStorage.setItem('schedule', JSON.stringify(state));
  }

  function getData(){
    try { return JSON.parse(localStorage.getItem('schedule')||'[]'); }
    catch { return []; }
  }

  // removed list UI; state is the source of truth

  function validate(){
    formError.textContent='';
    if(!title.value.trim()||!day.value||!start.value||!end.value){
      formError.textContent = 'Veuillez remplir tous les champs requis.';
      return false;
    }
    if(end.value<=start.value){
      formError.textContent = 'L\'heure de fin doit être après l\'heure de début.';
      return false;
    }
    return true;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validate()) return;
    const entry = {
      id: editingId || Date.now(),
      title: title.value.trim(),
      day: day.value,
      start: start.value,
      end: end.value,
    };

    // update or add
    if(editingId){
      const idx = state.findIndex(x=>x.id===editingId);
      if (idx>-1) state[idx] = entry;
      editingId = null;
    }else{
      state.push(entry);
    }
    save();
    refreshViews();
    form.reset();
  });

  document.getElementById('reset-form').addEventListener('click',()=>{
    editingId = null; form.reset(); formError.textContent='';
  });

  clearBtn.addEventListener('click',()=>{
    if(confirm('Voulez-vous supprimer tout l\'emploi du temps ?')){
      state = []; save(); refreshViews();
    }
  });
  

  function refreshViews(){
    renderTable();
    renderRecap();
  }

  function renderTable(){
    if (!tableBody) return;
    const data = state;
    tableBody.innerHTML = '';
    data.forEach((e)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(e.title)}</td>
        <td>${e.day}</td>
        <td>${e.start}</td>
        <td>${e.end}</td>
        <td class="actions">
          <button class="btn btn-ghost" data-act="edit"><i class='bx bx-edit-alt'></i></button>
          <button class="btn btn-ghost" data-act="del"><i class='bx bx-trash'></i></button>
        </td>`;
      // Actions
      tr.querySelector('[data-act="edit"]').addEventListener('click', ()=>{
        editingId = e.id;
        title.value = e.title; day.value = e.day; start.value = e.start; end.value = e.end;
        title.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      tr.querySelector('[data-act="del"]').addEventListener('click', ()=>{
        state = state.filter(x=>x.id !== e.id);
        save();
        refreshViews();
      });
      tableBody.appendChild(tr);
    });
    // nothing else
  }

  // removed: day filter

  function renderRecap(){
    if (!recapEl) return;
    const data = state;
    const byDay = new Map();
    data.forEach(e=>{
      if(!byDay.has(e.day)) byDay.set(e.day, []);
      byDay.get(e.day).push(e);
    });
    const totalCourses = data.length;
    const dayOrder = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    const parts = [];
    parts.push(`<p><strong>Total cours:</strong> ${totalCourses}</p>`);
    dayOrder.forEach(d=>{
      const arr = byDay.get(d)||[];
      if(arr.length){
        const totalMinutes = arr.reduce((acc,e)=> acc + diffMinutes(e.start,e.end), 0);
        const h = Math.floor(totalMinutes/60), m = totalMinutes%60;
        parts.push(`<p><strong>${d}:</strong> ${arr.length} cours, ${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}</p>`);
      }
    });
    recapEl.innerHTML = parts.join('');
  }

  function diffMinutes(a,b){
    const [ah,am] = a.split(':').map(Number);
    const [bh,bm] = b.split(':').map(Number);
    return (bh*60+bm) - (ah*60+am);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",
      ">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  // removed: conflict detection and banner

  // removed: filter listeners

  if (printBtn){
    printBtn.addEventListener('click', ()=>{ window.print(); });
  }

  load();
})();
