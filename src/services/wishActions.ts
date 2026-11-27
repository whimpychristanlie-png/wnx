import '../styles/wish-editor.css';
import { changeWish } from './wishes';
import type { Wish } from '../game/types';

/** Shared, accessible editor for both invitation and garden. */
export function manageWish(wish: Wish, action: 'edit' | 'delete'): Promise<void> {
  return new Promise(resolve => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = document.createElement('dialog');
    dialog.className = 'wish-editor';
    dialog.setAttribute('aria-label', action === 'edit' ? 'Edit ucapan' : 'Hapus ucapan');
    const heading = document.createElement('h2');
    heading.textContent = action === 'edit' ? 'Edit ucapan' : 'Hapus ucapan ini?';
    const label = document.createElement('label');
    label.textContent = action === 'edit' ? 'Ucapan (maksimal 200 karakter)' : 'Ucapan akan dihapus. Tindakan ini tidak dapat dibatalkan.';
    const input = document.createElement('textarea');
    input.value = wish.message; input.maxLength = 200; input.rows = 5;
    if (action === 'edit') label.append(input);
    const error = document.createElement('p'); error.setAttribute('role', 'status');
    const controls = document.createElement('div');
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Batal';
    const save = document.createElement('button'); save.type = 'button'; save.textContent = action === 'edit' ? 'Simpan perubahan' : 'Hapus ucapan';
    let busy = false;
    const close = () => { if (!busy) dialog.close(); };
    cancel.addEventListener('click', close);
    dialog.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
    dialog.addEventListener('close', () => { dialog.remove(); opener?.focus(); resolve(); });
    save.addEventListener('click', async () => {
      if (busy) return;
      busy = true; save.disabled = cancel.disabled = true;
      error.textContent = 'Menyimpan…';
      try {
        const updated = await changeWish(wish, action === 'edit' ? input.value : null);
        window.dispatchEvent(new CustomEvent('wish-changed', { detail: { id: wish.id, wish: updated } }));
        busy = false; dialog.close();
      } catch (e) {
        error.textContent = e instanceof Error ? e.message : 'Perubahan belum tersimpan. Coba lagi.';
        busy = false; save.disabled = cancel.disabled = false;
      }
    });
    controls.append(cancel, save); dialog.append(heading, label, error, controls);
    document.body.append(dialog); dialog.showModal();
    (action === 'edit' ? input : cancel).focus();
  });
}
