/**
 * TruthGuard AI - Browser Extension Content Script
 * Injects contextual fact-checking widgets on selected text.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

(() => {
  const TOOLTIP_ID = 'truthguard-floating-card';

  function removeExistingTooltip() {
    const existing = document.getElementById(TOOLTIP_ID);
    if (existing) existing.remove();
  }

  function createFactCheckTooltip(selectedText: string, x: number, y: number) {
    removeExistingTooltip();

    const card = document.createElement('div');
    card.id = TOOLTIP_ID;
    card.style.position = 'absolute';
    card.style.left = `${Math.min(window.innerWidth - 320, Math.max(10, x))}px`;
    card.style.top = `${y + 15}px`;
    card.style.width = '300px';
    card.style.backgroundColor = '#0f172a';
    card.style.color = '#f8fafc';
    card.style.border = '1px solid #38bdf8';
    card.style.borderRadius = '10px';
    card.style.padding = '12px 14px';
    card.style.zIndex = '999999';
    card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    card.style.fontSize = '13px';
    card.style.fontFamily = 'system-ui, sans-serif';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:bold; color:#38bdf8;">🛡️ TruthGuard AI</span>
        <button id="tg-close-btn" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:14px;">✕</button>
      </div>
      <div style="font-size:11px; color:#cbd5e1; margin-bottom:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        "${selectedText.substring(0, 75)}..."
      </div>
      <div style="display:flex; gap:6px;">
        <button id="tg-verify-btn" style="flex:1; background:#0284c7; color:#fff; border:none; border-radius:6px; padding:6px; cursor:pointer; font-size:12px; font-weight:600;">
          تحقق الآن (Verify)
        </button>
      </div>
    `;

    document.body.appendChild(card);

    document.getElementById('tg-close-btn')?.addEventListener('click', removeExistingTooltip);
    document.getElementById('tg-verify-btn')?.addEventListener('click', () => {
      window.open(`https://truthguard.ai/verify?q=${encodeURIComponent(selectedText)}`, '_blank');
      removeExistingTooltip();
    });
  }

  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 15 && selection.length < 500) {
      createFactCheckTooltip(selection, e.pageX, e.pageY);
    }
  });

  document.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`#${TOOLTIP_ID}`)) {
      removeExistingTooltip();
    }
  });
})();
