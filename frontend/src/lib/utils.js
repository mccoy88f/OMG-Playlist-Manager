import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility per combinare classi Tailwind
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Formatta una data per la visualizzazione
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

// Genera un URL pubblico per una playlist
export function getPublicPlaylistUrl(token) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/public/playlist/${token}/m3u`;
}

// Raggruppa i canali per gruppo
export function groupChannelsByGroup(channels) {
  return channels.reduce((groups, channel) => {
    const group = channel.group_title || 'No Group';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(channel);
    return groups;
  }, {});
}

// Controlla se una playlist è sincronizzabile
export function isPlaylistSyncable(playlist) {
  return !playlist.is_custom && !!playlist.url;
}

// Estrae i parametri TVG da un file M3U
export function extractTvgParams(content) {
  const params = {};
  const tvgRegex = /tvg-([^=]+)="([^"]+)"/g;
  let match;
  
  while ((match = tvgRegex.exec(content)) !== null) {
    params[match[1]] = match[2];
  }
  
  return params;
}

// Crea un nome file sicuro per il download
export function createSafeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '.m3u';
}

// Download di un file
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Gestisce gli errori dell'API
export function handleApiError(error) {
  if (error.response) {
    // Errore dal server con risposta
    return error.response.data.detail || 'Si è verificato un errore';
  } else if (error.request) {
    // Errore di rete
    return 'Impossibile contattare il server';
  } else {
    // Altri errori
    return error.message || 'Si è verificato un errore';
  }
}

// Controlla se un URL è valido
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
