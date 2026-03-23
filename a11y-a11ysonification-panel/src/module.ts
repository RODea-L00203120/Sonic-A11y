import { PanelPlugin } from '@grafana/data';
import { SonificationOptions } from './types';
import { SonificationPanel } from './components/SonificationPanel';

export const plugin = new PanelPlugin<SonificationOptions>(SonificationPanel);
