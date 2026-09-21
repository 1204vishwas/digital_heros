const API_BASE = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('dh_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || response.statusText || 'An error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth & Subscription
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    socialLogin: (data) => request('/auth/social-login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    updateSubscription: (data) => request('/auth/subscription', { method: 'POST', body: JSON.stringify(data) })
  },

  // Scores (PRD § 05)
  scores: {
    get: () => request('/scores'),
    add: (score, scoreDate) => request('/scores', { method: 'POST', body: JSON.stringify({ score, scoreDate }) }),
    update: (id, score, scoreDate) => request(`/scores/${id}`, { method: 'PUT', body: JSON.stringify({ score, scoreDate }) }),
    delete: (id) => request(`/scores/${id}`, { method: 'DELETE' })
  },

  // Draws & Pool (PRD § 06 & § 07)
  draws: {
    getLatest: () => request('/draws/latest'),
    getHistory: (limit = 10) => request(`/draws/history?limit=${limit}`),
    getCurrentPool: () => request('/draws/current-pool'),
    getMyParticipation: () => request('/draws/my-participation'),
    simulate: (mode, customNumbers) => request('/draws/simulate', { method: 'POST', body: JSON.stringify({ mode, customNumbers }) }),
    publish: (mode, customNumbers) => request('/draws/publish', { method: 'POST', body: JSON.stringify({ mode, customNumbers }) })
  },

  // Charities (PRD § 08)
  charities: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/charities${qs ? `?${qs}` : ''}`);
    },
    getCategories: () => request('/charities/categories'),
    getBySlug: (slug) => request(`/charities/${slug}`),
    donate: (id, data) => request(`/charities/${id}/donate`, { method: 'POST', body: JSON.stringify(data) }),
    create: (data) => request('/charities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/charities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/charities/${id}`, { method: 'DELETE' }),
    addEvent: (id, data) => request(`/charities/${id}/events`, { method: 'POST', body: JSON.stringify(data) })
  },

  // Winner Verification & Proofs (PRD § 09)
  winners: {
    uploadProof: (id, formData) => request(`/winners/${id}/proof`, { method: 'POST', body: formData }),
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/winners${qs ? `?${qs}` : ''}`);
    },
    verify: (id, data) => request(`/winners/${id}/verify`, { method: 'PUT', body: JSON.stringify(data) }),
    payout: (id) => request(`/winners/${id}/payout`, { method: 'PUT', body: JSON.stringify({}) })
  },

  // Admin Control Surfaces (PRD § 11)
  admin: {
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    getUser: (id) => request(`/admin/users/${id}`),
    updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateUserScores: (id, scores) => request(`/admin/users/${id}/scores`, { method: 'PUT', body: JSON.stringify({ scores }) }),
    getReports: () => request('/admin/reports'),
    getScoreDistribution: () => request('/admin/score-distribution')
  }
};
