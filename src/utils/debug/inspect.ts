import { inspect as i } from 'node:util';

export const inspect = (data: any) => i(data, { colors: true, depth: null });
