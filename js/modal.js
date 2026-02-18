  document.addEventListener("DOMContentLoaded", function () {
      const modal = document.getElementById('project-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalDescription = document.getElementById('modal-description');
	   const modalBody = document.getElementById('modal-body');
      const modalPrev = document.querySelector('.modal-prev');
      const modalNext = document.querySelector('.modal-next');
      const modalClose = document.querySelector('.modal-close-x') || document.querySelector('.modal-close');
	const modalCurrentIndex = document.getElementById('modal-current-index');
	const modalTotalCount = document.getElementById('modal-total-count');
      const imageContainer = document.getElementById('modalImageContainer');

// ===========================================
// BACK BUTTON HANDLER FOR MODAL
// ===========================================
let currentProjectId = null;
let modalHistoryPushed = false;

// Listen for back button
window.addEventListener('popstate', function(event) {
  if (modal && modal.style.display === 'flex') {
    // Modal is open, close it instead of navigating back
    event.preventDefault();
    closeModal();
  }
});

// Override body overflow when modal opens/closes
function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

// === Lightbox Setup ===
const lightboxOverlay = document.getElementById('image-lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

// Close on overlay or X
lightboxOverlay.addEventListener('click', () => {
  lightboxOverlay.style.display = 'none';
});
lightboxClose.addEventListener('click', () => {
  lightboxOverlay.style.display = 'none';
});

// Helper function to get ordered project IDs
function getOrderedProjectIds() {
  const projects = projectData.projects || projectData;
  return projectData.project_order 
    ? projectData.project_order.map(id => String(id))
    : Object.keys(projects).filter(key => key !== 'project_order').sort((a,b) => Number(a) - Number(b));
}

const videos = [

];

const container = document.getElementById('yt-chip-container');
videos.forEach(video => {
  const a = document.createElement('a');
  a.className = 'yt-chip';
  a.href = `https://www.youtube.com/watch?v=${video.id}`;
  a.target = '_blank';

  const img = document.createElement('img');
  img.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  img.alt = video.title;

  const span = document.createElement('span');
  span.textContent = video.title;

  a.appendChild(img);
  a.appendChild(span);
  container.appendChild(a);
});
   
 function openModal(projectId) {
const projects = projectData.projects || projectData;
const data = projects[projectId];
if (!data) return;
  const modalEl = document.getElementById('project-modal');
  const modalContent = modalEl.querySelector('.modal-content');

modalEl.scrollTop = 0; modalContent.scrollTop = 0; requestAnimationFrame(() => { modalEl.scrollTop = 0; modalContent.scrollTop = 0; });

  currentProjectId = String(projectId);

  // Title and description
  modalTitle.textContent = data.title || '';
  modalDescription.innerHTML = data.description || '';

  // Credits
  modalBody.innerHTML = data.creditsHTML || '';

 // Images with lightbox
let isDragging = false;
let startPos = { x: 0, y: 0 };
let currentTranslate = { x: 0, y: 0 };
let zoomLevel = 1;

imageContainer.innerHTML = '';
if (Array.isArray(data.images)) {
  data.images.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = data.title;
    img.classList.add('clickable-lightbox');
    imageContainer.appendChild(img);

    img.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxImg.src = src;
      resetLightboxState();
      lightboxOverlay.style.display = 'flex';
      lightboxOverlay.focus();
    });
  });
}

// Lightbox interactions
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay || e.target === lightboxClose) {
    lightboxOverlay.style.display = 'none';
  }
});

// Unified zoom and drag handlers
lightboxImg.addEventListener('click', handleImageClick);
lightboxOverlay.addEventListener('keydown', handleKeyDown);
lightboxImg.addEventListener('wheel', handleWheelZoom, { passive: false });
lightboxImg.addEventListener('mousedown', startDrag);
lightboxImg.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('mousemove', dragImage);
document.addEventListener('touchmove', dragImage, { passive: false });
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

// Helper functions
function resetLightboxState() {
  zoomLevel = 1;
  currentTranslate = { x: 0, y: 0 };
  updateTransform();
  lightboxImg.style.cursor = 'grab';
}

function updateTransform() {
  lightboxImg.style.transform = `
    scale(${zoomLevel}) 
    translate(${currentTranslate.x}px, ${currentTranslate.y}px)
  `;
}

function handleImageClick(e) {
  e.stopPropagation();
  
  if (zoomLevel === 1) {
    zoomLevel = 2;
  } else {
    resetLightboxState();
    return;
  }
  
  updateTransform();
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    lightboxOverlay.style.display = 'none';
  }
}

function handleWheelZoom(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.2 : 0.2;
  zoomLevel = Math.max(1, Math.min(4, zoomLevel + delta));
  
  if (zoomLevel === 1) {
    resetLightboxState();
  } else {
    updateTransform();
  }
}

function startDrag(e) {
  if (zoomLevel <= 1) return;
  
  isDragging = true;
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  startPos = { x: clientX - currentTranslate.x, y: clientY - currentTranslate.y };
  lightboxImg.style.cursor = 'grabbing';
  lightboxImg.style.transition = 'none';
  e.preventDefault();
}

function dragImage(e) {
  if (!isDragging) return;
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  currentTranslate.x = clientX - startPos.x;
  currentTranslate.y = clientY - startPos.y;
  
  // Calculate boundaries
  const maxX = (lightboxImg.clientWidth * (zoomLevel - 1)) / 2;
  const maxY = (lightboxImg.clientHeight * (zoomLevel - 1)) / 2;
  
  currentTranslate.x = Math.max(-maxX, Math.min(maxX, currentTranslate.x));
  currentTranslate.y = Math.max(-maxY, Math.min(maxY, currentTranslate.y));
  
  updateTransform();
  e.preventDefault();
}

function endDrag() {
  if (isDragging) {
    isDragging = false;
    lightboxImg.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
    lightboxImg.style.transition = 'transform 0.3s ease';
  }
}

  // Main YouTube video
  const videoContainer = document.getElementById('modalVideoContainer');
  videoContainer.innerHTML = '';
  
if (data.youtube) {
    const params = new URLSearchParams({
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1,
        start: data.startTime || 0,
    }).toString();

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${data.youtube}?${params}`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
} else if (data.vimeo) {
    const params = new URLSearchParams({
        autoplay: 1,
        autopause: 0,
    }).toString();

    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${data.vimeo}?${params}`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
} else if (data.twitch) {
    const iframe = document.createElement('iframe');
    // Twitch can be either a video ID or channel name
    if (data.twitch.type === 'video') {
        iframe.src = `https://player.twitch.tv/?video=${data.twitch.id}&parent=${window.location.hostname}&autoplay=true`;
    } else if (data.twitch.type === 'channel') {
        iframe.src = `https://player.twitch.tv/?channel=${data.twitch.id}&parent=${window.location.hostname}&autoplay=true`;
    }
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
}

// Chips
const chipContainer = document.getElementById('yt-chip-container');
chipContainer.innerHTML = '';

// Create a container for URL chips
const urlWrapper = document.createElement('div');
urlWrapper.className = 'url-chip-wrapper';

if (Array.isArray(data.chips)) {
  data.chips.forEach((item) => {
    const chip = document.createElement('a');
    chip.target = '_blank';

    // YouTube chip
    if (item.type === 'youtube') {
      chip.className = 'media-chip yt-chip';
      
      // Build YouTube URL with optional timestamp
      let youtubeUrl = `https://www.youtube.com/watch?v=${item.id}`;
      if (item.startTime) {
        youtubeUrl += `&t=${item.startTime}s`;
      }
      chip.href = youtubeUrl;

      const thumb = document.createElement('img');
      thumb.src = item.thumbnail || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`;
      thumb.alt = item.title;

      const label = document.createElement('span');
      label.textContent = item.title;
      label.className = 'chip-label';

      chip.appendChild(thumb);
      chip.appendChild(label);
      chipContainer.appendChild(chip);

    // Dailymotion chip
    } else if (item.type === 'dailymotion') {
      chip.className = 'media-chip';
      chip.href = `https://www.dailymotion.com/video/${item.id}`;

      const thumb = document.createElement('img');
      // Use custom thumbnail if provided, otherwise use Dailymotion's auto-generated thumbnail
      thumb.src = item.thumbnail || `https://www.dailymotion.com/thumbnail/video/${item.id}`;
      thumb.alt = item.title;

      const label = document.createElement('span');
      label.textContent = item.title;
      label.className = 'chip-label';

      const dmLogo = document.createElement('span');
      dmLogo.className = 'platform-logo dm-logo';
      dmLogo.textContent = 'DM';

      chip.appendChild(thumb);
      chip.appendChild(dmLogo);
      chip.appendChild(label);
      chipContainer.appendChild(chip);

    // URL chip (stacked)
    } else if (item.type === 'url') {
      chip.className = 'url-chips';
      chip.href = item.url;

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'url-chip-content';

      if (item.localImage) {
        const img = document.createElement('img');
        img.src = item.localImage;
        img.alt = item.title;
        img.className = 'url-chip-image';
        contentWrapper.appendChild(img);
      }

      const icon = document.createElement('span');
      icon.className = 'url-icon';
      icon.innerHTML = '↗';
      contentWrapper.appendChild(icon);

      const label = document.createElement('span');
      label.className = 'chip-label';
      label.textContent = item.title;
      contentWrapper.appendChild(label);

      chip.appendChild(contentWrapper);
      urlWrapper.appendChild(chip);
      
    // Vimeo chip
    } else if (item.type === 'vimeo') {
      chip.className = 'media-chip vimeo-chip';
      chip.href = `https://vimeo.com/${item.id}`;

      const thumb = document.createElement('img');
      // Vimeo thumbnail requires API call, using placeholder or custom image
      thumb.src = item.thumbnail || `https://vumbnail.com/${item.id}.jpg`;
      thumb.alt = item.title;

      const label = document.createElement('span');
      label.textContent = item.title;
      label.className = 'chip-label';

      const vimeoLogo = document.createElement('span');
      vimeoLogo.className = 'platform-logo vimeo-logo';
      vimeoLogo.textContent = 'V';

      chip.appendChild(thumb);
      chip.appendChild(vimeoLogo);
      chip.appendChild(label);
      chipContainer.appendChild(chip);

    // Twitch chip
    } else if (item.type === 'twitch') {
      chip.className = 'media-chip twitch-chip';
      
      if (item.videoId) {
        // Add timestamp parameter if provided (format: ?t=1h2m3s or ?t=123s)
        chip.href = `https://www.twitch.tv/videos/${item.videoId}`;
        if (item.timestamp) {
          chip.href += `?t=${item.timestamp}`;
        }
      } else if (item.channel) {
        chip.href = `https://www.twitch.tv/${item.channel}`;
      }

      const thumb = document.createElement('img');
      thumb.src = item.thumbnail || 'images/twitch-placeholder.jpg';
      thumb.alt = item.title;

      const label = document.createElement('span');
      label.textContent = item.title;
      label.className = 'chip-label';

      const twitchLogo = document.createElement('span');
      twitchLogo.className = 'platform-logo twitch-logo';
      twitchLogo.textContent = 'TW';

      chip.appendChild(thumb);
      chip.appendChild(twitchLogo);
      chip.appendChild(label);
      chipContainer.appendChild(chip);

    // Custom iframe chip - RENDERS THE ACTUAL IFRAME
    } else if (item.type === 'iframe') {
      // Don't create an <a> tag, create a container div instead
      const iframeContainer = document.createElement('div');
      iframeContainer.className = 'iframe-chip-container';
      
      // Add title/label above iframe
      const titleLabel = document.createElement('div');
      titleLabel.className = 'iframe-chip-title';
      titleLabel.textContent = item.title;
      iframeContainer.appendChild(titleLabel);
      
      // Create the iframe wrapper
      const iframeWrapper = document.createElement('div');
      iframeWrapper.className = 'iframe-chip-wrapper';
      
      // Check if it has raw iframe HTML or just a src
      if (item.iframe) {
        // Raw HTML iframe string - parse and insert it
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.iframe.trim();
        const parsedIframe = tempDiv.querySelector('iframe');
        
        if (parsedIframe) {
          iframeWrapper.appendChild(parsedIframe);
        }
      } else if (item.src) {
        // Just a URL - create iframe element
        const iframe = document.createElement('iframe');
        iframe.src = item.src;
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; encrypted-media';
        iframe.style.width = '100%';
        iframe.style.height = '400px';
        iframeWrapper.appendChild(iframe);
      }
      
      iframeContainer.appendChild(iframeWrapper);
      chipContainer.appendChild(iframeContainer);
      
      // Skip adding to urlWrapper since this is a full-width embedded player
      return; // Don't execute the urlWrapper append at the end
    }
	
  });

  chipContainer.appendChild(urlWrapper);
}

// YouTube Playlist chip (unchanged)
if (data.playlist) {
  const playlistChip = document.createElement('a');
  playlistChip.href = `https://www.youtube.com/playlist?list=${data.playlist}`;
  playlistChip.target = '_blank';
  playlistChip.className = 'yt-chip';

  const thumb = document.createElement('img');
  thumb.src = `https://img.youtube.com/vi/${data.youtube || data.chips?.[0]?.id}/hqdefault.jpg`;
  thumb.alt = 'Playlist';

  const label = document.createElement('span');
  label.textContent = 'View Playlist';

  playlistChip.appendChild(thumb);
  playlistChip.appendChild(label);
  chipContainer.appendChild(playlistChip);
}

// Hide "Links & Media" section if there are no chips or playlist
const chipsSection = document.querySelector('.chips');
const hasChips = (Array.isArray(data.chips) && data.chips.length > 0) || data.playlist;
if (chipsSection) {
  chipsSection.style.display = hasChips ? 'block' : 'none';
}

  // Push history state when opening modal
  if (!modalHistoryPushed) {
    history.pushState({ modalOpen: true }, '', '');
    modalHistoryPushed = true;
  }

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  lockBodyScroll();

  // Navigation arrows - use ordered IDs
 const ids = getOrderedProjectIds();
const currentIndex = ids.indexOf(String(currentProjectId));

// Update counter
if (modalCurrentIndex && modalTotalCount) {
  modalCurrentIndex.textContent = currentIndex + 1;
  modalTotalCount.textContent = ids.length;
}

// Update navigation button states
if (modalPrev) {
  modalPrev.style.display = currentIndex === 0 ? 'none' : 'flex';
  modalPrev.disabled = currentIndex === 0;
}
if (modalNext) {
  modalNext.style.display = currentIndex === ids.length - 1 ? 'none' : 'flex';
  modalNext.disabled = currentIndex === ids.length - 1;
}
}


function closeModal() {
  const modal = document.getElementById('project-modal');
  const videoContainer = document.getElementById('modalVideoContainer');

  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
  unlockBodyScroll();
  currentProjectId = null;

  // 🛑 Stop YouTube playback by removing the iframe
  videoContainer.innerHTML = '';

  // If we pushed a history state, go back to remove it
  if (modalHistoryPushed) {
    modalHistoryPushed = false;
    // Only go back if the current state is the modal state
    if (history.state && history.state.modalOpen) {
      history.back();
    }
  }
}

      function showNextProject() {
        const ids = getOrderedProjectIds();
        const index = ids.indexOf(String(currentProjectId));
        if (index < ids.length - 1) openModal(ids[index + 1]);
      }

      function showPrevProject() {
        const ids = getOrderedProjectIds();
        const index = ids.indexOf(String(currentProjectId));
        if (index > 0) openModal(ids[index - 1]);
      }

document.addEventListener('click', (e) => {
  const card = e.target.closest('.project');
  if (!card) return;

  const id = card.getAttribute('data-project-id');
  if (id) openModal(id);
});

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (modalNext) {
  modalNext.addEventListener('click', showNextProject);
}

if (modalPrev) {
  modalPrev.addEventListener('click', showPrevProject);
}

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      window.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
          if (e.key === 'Escape') closeModal();
          if (e.key === 'ArrowRight') showNextProject();
          if (e.key === 'ArrowLeft') showPrevProject();
        }
      });
    });
 
