import axios from 'axios';
import { JSDOM } from 'jsdom';

const res = await axios.get('https://nickspatties.com')
const dom = new JSDOM(res.data)
const header = dom.window.document.querySelector('h1')?.textContent;
console.log(header)

