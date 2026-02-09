import { initFFmpeg, convertToStackedAlpha } from '../utils/ffmpeg-worker.js';

export function createConverterSection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'converter';

  section.innerHTML = `
    <h2 class="section-title">Video Converter</h2>
    <p class="section-subtitle">
      Convert a video with alpha channel into a stacked-alpha video.
      Everything runs in your browser using ffmpeg.wasm &mdash; no upload needed.
    </p>

    <div class="converter">
      <div class="dropzone" id="converter-dropzone">
        <div class="dropzone-icon">&#x1F3AC;</div>
        <div class="dropzone-text">
          <strong>Drop a video here</strong> or click to browse<br/>
          <small>Supports WebM (VP9 alpha), MOV (ProRes 4444)</small>
        </div>
        <input type="file" id="converter-file-input" accept="video/*"
               style="display:none;" />
      </div>

      <div class="progress-bar" id="converter-progress">
        <div class="progress-bar-fill" id="converter-progress-fill"></div>
      </div>
      <div class="progress-status" id="converter-status"></div>

      <div class="converter-result" id="converter-result">
        <button class="download-btn" id="converter-download">
          Download Stacked-Alpha MP4
        </button>
        <div style="margin-top: 16px;">
          <video id="converter-preview" controls muted loop playsinline
                 style="max-width:100%;border-radius:8px;border:1px solid var(--color-border);"></video>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const dropzone = section.querySelector('#converter-dropzone') as HTMLElement;
    const fileInput = section.querySelector('#converter-file-input') as HTMLInputElement;
    const progressBar = section.querySelector('#converter-progress') as HTMLElement;
    const progressFill = section.querySelector('#converter-progress-fill') as HTMLElement;
    const statusEl = section.querySelector('#converter-status') as HTMLElement;
    const resultEl = section.querySelector('#converter-result') as HTMLElement;
    const downloadBtn = section.querySelector('#converter-download') as HTMLButtonElement;
    const preview = section.querySelector('#converter-preview') as HTMLVideoElement;

    let resultBlob: Blob | null = null;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer?.files[0];
      if (file) processFile(file);
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) processFile(file);
    });

    downloadBtn.addEventListener('click', () => {
      if (!resultBlob) return;
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stacked-alpha.mp4';
      a.click();
      URL.revokeObjectURL(url);
    });

    async function processFile(file: File) {
      progressBar.classList.add('active');
      statusEl.classList.add('active');
      resultEl.classList.remove('active');
      progressFill.style.width = '0%';
      statusEl.textContent = 'Loading ffmpeg.wasm...';

      try {
        await initFFmpeg((ratio) => {
          progressFill.style.width = `${Math.round(ratio * 100)}%`;
        });

        statusEl.textContent = 'Converting video...';
        progressFill.style.width = '10%';

        resultBlob = await convertToStackedAlpha(file);

        progressFill.style.width = '100%';
        statusEl.textContent = 'Done!';
        resultEl.classList.add('active');

        const url = URL.createObjectURL(resultBlob);
        preview.src = url;
      } catch (err) {
        statusEl.textContent = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        progressFill.style.width = '0%';
      }
    }
  });

  return section;
}
