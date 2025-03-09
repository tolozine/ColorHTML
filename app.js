document.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('colorInput');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const colorPreview = document.getElementById('colorPreview');
  const htmlCode = document.getElementById('htmlCode');
  const historyList = document.getElementById('historyList');

  // 生成配色方案
  generateBtn.addEventListener('click', () => {
    const colors = extractColors(colorInput.value);
    if (colors.length === 0) {
      showAlert('请按正确格式输入颜色代码（例如：#4A90E2）', 'error');
      return;
    }
    updatePreview(colors);
    updateCode(colors);
    saveToHistory(colors);
    showAlert('配色方案已生成！', 'success');
  });

  // 复制代码
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(htmlCode.textContent)
      .then(() => showAlert('代码已复制到剪贴板！', 'success'))
      .catch(err => showAlert('复制失败，请手动复制', 'error'));
  });

  // 颜色提取函数
  function extractColors(text) {
    const colorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
    return [...new Set(text.match(colorRegex) || [])];
  }

  // 更新预览
  function updatePreview(colors) {
    colorPreview.innerHTML = colors.map(color => `
      <div class="color-block" style="background: ${color}">
        ${color.toUpperCase()}
      </div>
    `).join('');
  }

  // 生成HTML代码
  function updateCode(colors) {
    const code = `<div class="color-palette">\n${
      colors.map(color => `  <div style="background: ${color}; padding: 20px">${color}</div>`).join('\n')
    }\n</div>`;
    htmlCode.textContent = code;
  }

  // 历史记录功能
  function saveToHistory(colors) {
    chrome.storage.local.get({ history: [] }, data => {
      const history = data.history;
      history.unshift({
        timestamp: new Date().toISOString(),
        colors: colors
      });
      
      if (history.length > 20) history.pop();
      
      chrome.storage.local.set({ history }, loadHistory);
    });
  }

  function loadHistory() {
    chrome.storage.local.get({ history: [] }, data => {
      historyList.innerHTML = data.history.map((record, index) => `
        <li data-colors='${JSON.stringify(record.colors)}'>
          <span class="timestamp">${new Date(record.timestamp).toLocaleString()}</span>
          <span class="color-preview">${record.colors.map(c => `<span style="background: ${c}"></span>`).join('')}</span>
        </li>
      `).join('');
    });
  }

  // 历史记录点击事件
  historyList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) {
      const colors = JSON.parse(li.dataset.colors);
      colorInput.value = colors.map(c => `${c}`).join(' + ');
      updatePreview(colors);
      updateCode(colors);
    }
  });

  // 提示信息
  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }

  // 初始化加载历史记录
  loadHistory();
});