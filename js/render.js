/* render.js — builds the project grid from projectData */

(function () {
  const grid = document.getElementById('projects-grid');
  const countEl = document.getElementById('project-count');

  if (!grid || typeof projectData === 'undefined') {
    console.error('Missing #projects-grid or projectData');
    return;
  }

  const projects = projectData.projects || projectData;
  const ids = projectData.project_order
    ? projectData.project_order.map(String)
    : Object.keys(projects).filter(k => k !== 'project_order').sort((a, b) => a - b);

  ids.forEach(function (id, i) {
    const p = projects[id];
    if (!p) return;

    const num = String(i + 1).padStart(3, '0');
    const title = p.html_h4 || p.title || '';
    const desc = p.html_description || '';
    const badge = p.html_badge || '';
    const img = p.html_image || '';

    const cell = document.createElement('div');
    cell.className = 'proj-cell';
    cell.setAttribute('data-project-id', id);
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', 'Open project: ' + title);

    cell.innerHTML =
      '<div class="proj-bg"' + (img ? ' style="background-image:url(\'' + img + '\')"' : '') + '></div>' +
      '<div class="proj-top">' +
        '<div class="proj-num">' + num + '</div>' +
        '<div class="proj-title">' + title + '</div>' +
        (desc ? '<div class="proj-desc">' + desc + '</div>' : '') +
      '</div>' +
      '<div class="proj-bottom">' +
        (badge ? '<span class="proj-badge">' + badge + '</span>' : '') +
      '</div>';

    grid.appendChild(cell);
  });

  if (countEl) {
    countEl.textContent = ids.length + ' project' + (ids.length !== 1 ? 's' : '');
  }
})();
