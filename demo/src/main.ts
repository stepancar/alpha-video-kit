import { createHeroSection } from './sections/hero.js';
import { createBackstorySection } from './sections/backstory.js';
import { createLiveDemoSection } from './sections/live-demo.js';
import { createConverterSection } from './sections/converter.js';
import { createComparisonSection } from './sections/comparison.js';
import { createApiDocsSection } from './sections/api-docs.js';

const app = document.getElementById('app')!;

// Navigation
const nav = document.createElement('nav');
nav.className = 'nav';
nav.innerHTML = `
  <div class="nav-inner">
    <a href="#" class="nav-logo">Alpha Video Kit</a>
    <ul class="nav-links">
      <li><a href="#demo">Demo</a></li>
      <li><a href="#converter">Converter</a></li>
      <li><a href="#comparison">Comparison</a></li>
      <li><a href="#api">API</a></li>
      <li><a href="#backstory">Backstory</a></li>
    </ul>
  </div>
`;

app.appendChild(nav);
app.appendChild(createHeroSection());
app.appendChild(createLiveDemoSection());
app.appendChild(createConverterSection());
app.appendChild(createComparisonSection());
app.appendChild(createApiDocsSection());
app.appendChild(createBackstorySection());

// Footer
const footer = document.createElement('footer');
footer.className = 'footer';
footer.innerHTML = `
  <p>
    Alpha Video Kit &mdash; MIT License &mdash;
    <a href="https://github.com/stepancar/alpha-video-kit" target="_blank">GitHub</a>
  </p>
`;
app.appendChild(footer);
