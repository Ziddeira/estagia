// Localização do aparelho e distância até o ponto cadastrado pelo polo.

export function obterPosicao() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este navegador não oferece localização.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, precisao: Math.round(p.coords.accuracy) }),
      (e) => {
        const msg = {
          1: 'Permissão de localização negada. Libere a localização para este site nas configurações do navegador.',
          2: 'Não foi possível descobrir a localização agora. Verifique se o GPS está ligado.',
          3: 'A localização demorou demais para responder. Tente de novo.'
        }[e.code] || 'Não foi possível obter a localização.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

// Distância em metros entre dois pontos (fórmula de haversine)
export function distanciaMetros(a, b) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

export function textoDistancia(m) {
  if (m >= 1000) return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  return `${m} m`;
}

// Faz o check-in contra um local cadastrado. Devolve o registro pronto para salvar.
export async function checkinNoLocal(local) {
  const pos = await obterPosicao();
  const dist = distanciaMetros(pos, local);
  return { dist, precisao: pos.precisao, dentro: dist <= local.raio, lat: pos.lat, lng: pos.lng };
}
