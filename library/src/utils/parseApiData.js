/**
 * Unwrap typical SDK API envelope: { success, data: { ... } } or axios res.data.
 * @param {unknown} resOrBody
 */
export function unwrapApiData(resOrBody) {
  const body = resOrBody?.data ?? resOrBody ?? {};
  if (body && typeof body === 'object' && body.data != null && typeof body.data === 'object') {
    return body.data;
  }
  return body;
}
