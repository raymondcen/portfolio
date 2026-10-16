// "YYYY-MM" strings split by hand: no Date object, so no timezone shift
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const month = (ym: string) => {
  const [year, m] = ym.split('-');
  return `${months[Number(m) - 1]} ${year}`;
};

export const dates = ({ start, end }: { start: string; end?: string }) =>
  end === start ? month(start) : `${month(start)} – ${end ? month(end) : 'Present'}`;

// Newest first: latest end (absent end means present, so it sorts first), then latest start
type Dated = { data: { start: string; end?: string } };
const endKey = (e: Dated) => e.data.end ?? '9999-12';
export const newestFirst = (a: Dated, b: Dated) =>
  endKey(b).localeCompare(endKey(a)) || b.data.start.localeCompare(a.data.start);
