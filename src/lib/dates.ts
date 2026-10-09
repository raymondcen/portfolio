// "YYYY-MM" strings split by hand: no Date object, so no timezone shift
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const month = (ym: string) => {
  const [year, m] = ym.split('-');
  return `${months[Number(m) - 1]} ${year}`;
};

export const dates = ({ start, end }: { start: string; end?: string }) =>
  end === start ? month(start) : `${month(start)} – ${end ? month(end) : 'Present'}`;
