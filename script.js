document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const titleInput = document.getElementById('input-title');
    const lyricistInput = document.getElementById('input-lyricist');
    const lyricsInputsContainer = document.getElementById('lyrics-inputs-container');

    // Display Elements (Arrays for top and bottom halves)
    const displayTitles = document.querySelectorAll('.display-title');
    const displayLyricists = document.querySelectorAll('.display-lyricist');
    const displayLyricsContainers = document.querySelectorAll('.display-lyrics'); // Represents the flex container

    // Settings
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeVal = document.getElementById('font-size-val');
    const lineHeightInput = document.getElementById('line-height');
    const lineHeightVal = document.getElementById('line-height-val');
    const textColorInput = document.getElementById('text-color');
    const columnCountInput = document.getElementById('column-count');
    const columnCountVal = document.getElementById('column-count-val');

    // State for lyrics content per column
    let columnContents = [''];

    // --- Update Functions ---

    function updateMeta() {
        const title = titleInput.value || 'タイトル';
        const lyricist = lyricistInput.value || '作詞名';

        displayTitles.forEach(el => el.textContent = title);
        displayLyricists.forEach(el => el.textContent = lyricist);
    }

    function updateLyricsPreview() {
        // Clear current preview columns
        displayLyricsContainers.forEach(container => {
            container.innerHTML = '';
            // Create div for each column
            columnContents.forEach(text => {
                const colDiv = document.createElement('div');
                colDiv.className = 'lyrics-column';
                colDiv.textContent = text;
                container.appendChild(colDiv);
            });
        });
    }

    function handleInputChange(index, value) {
        columnContents[index] = value;
        updateLyricsPreview();
    }

    function updateColumnInputs(count) {
        // Adjust array size
        const currentLength = columnContents.length;
        if (count > currentLength) {
            // Add new empty columns
            for (let i = currentLength; i < count; i++) {
                columnContents.push('');
            }
        } else if (count < currentLength) {
            // Remove columns (no data loss warning for now, just trim)
            columnContents = columnContents.slice(0, count);
        }

        // Re-render inputs
        lyricsInputsContainer.innerHTML = '';
        columnContents.forEach((text, index) => {
            const textarea = document.createElement('textarea');
            textarea.className = 'column-input';
            textarea.placeholder = `${index + 1}列目の歌詞...`;
            textarea.value = text;
            textarea.addEventListener('input', (e) => handleInputChange(index, e.target.value));
            lyricsInputsContainer.appendChild(textarea);
        });

        updateLyricsPreview();
    }

    function updateStyles() {
        const root = document.documentElement;

        // Font Size
        const fontSize = fontSizeInput.value;
        fontSizeVal.textContent = fontSize;
        root.style.setProperty('--font-size', `${fontSize}px`);

        // Line Height
        const lineHeight = lineHeightInput.value;
        lineHeightVal.textContent = lineHeight;
        root.style.setProperty('--line-height', lineHeight);
        // Color
        const color = textColorInput.value;
        root.style.setProperty('--text-color', color);

        // Columns
        const columns = parseInt(columnCountInput.value, 10);
        columnCountVal.textContent = columns;

        // Only update structure if column count changed
        if (columns !== columnContents.length) {
            updateColumnInputs(columns);
        }
    }

    // --- Event Listeners ---

    titleInput.addEventListener('input', updateMeta);
    lyricistInput.addEventListener('input', updateMeta);

    fontSizeInput.addEventListener('input', updateStyles);
    lineHeightInput.addEventListener('input', updateStyles);
    textColorInput.addEventListener('input', updateStyles);
    columnCountInput.addEventListener('input', updateStyles);

    // Initial Run
    updateMeta();
    updateStyles(); // This triggers updateColumnInputs(1) initially

    // JPG Export (350dpi)
    const exportBtn = document.getElementById('export-jpg-btn');
    const printArea = document.querySelector('.print-area');

    exportBtn.addEventListener('click', () => {
        const originalBtnText = exportBtn.textContent;
        exportBtn.textContent = '生成中...';
        exportBtn.disabled = true;

        // 350 dpi / 96 dpi standard ≈ 3.6458
        const pixelRatio = 350 / 96;

        htmlToImage.toJpeg(printArea, {
            quality: 1.0,
            pixelRatio: pixelRatio,
            backgroundColor: '#ffffff',
            style: { margin: '0' }
        })
            .then(function (dataUrl) {
                const link = document.createElement('a');
                link.download = `text-a4-${Date.now()}.jpg`;
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error) {
                console.error('JPG export failed:', error);
                alert('JPG書き出しに失敗しました。');
            })
            .finally(() => {
                exportBtn.textContent = originalBtnText;
                exportBtn.disabled = false;
            });
    });
});
