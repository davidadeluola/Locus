export function toIso(date = new Date()) {
  return new Date(date).toISOString();
}

export function isPast(iso) {
  return new Date(iso) < new Date();
}
const dateUtils = {
  now() {
    return new Date();
  },
  toISO(date) {
    return date ? new Date(date).toISOString() : null;
  }
};

export default dateUtils;
