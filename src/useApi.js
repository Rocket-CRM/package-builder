export function useApi(getUrl, getApiKey, getAccessToken) {
  function buildHeaders() {
    const key = getApiKey?.() || ''
    const token = getAccessToken?.() || key
    return {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${token}`,
    }
  }

  async function rpc(fnName, params = {}) {
    const url = `${getUrl?.() || ''}/rest/v1/rpc/${fnName}`
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err?.message || err?.error || `RPC ${fnName} failed (${res.status})`)
    }
    return res.json()
  }

  async function restGet(path) {
    const url = `${getUrl?.() || ''}/rest/v1/${path}`
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err?.message || err?.error || `GET ${path} failed (${res.status})`)
    }
    return res.json()
  }

  return { rpc, restGet }
}
