import './style.css';
import './polish.css';
import { App } from './app';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');
const app = new App(root);
app.start();
export { onEvents } from './director';
