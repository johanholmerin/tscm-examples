import { const_json } from 'tscm-examples';
import _pkg from '../../../package.json';

export const pkgNonConst = _pkg;
export const pkgConst = const_json!!('../../../package.json');
