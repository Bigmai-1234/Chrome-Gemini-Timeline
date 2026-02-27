// 1. 在页面上构建你的专属 UI 界面
function createSidebar() {
    if (document.getElementById('gemini-nav-sidebar')) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'gemini-nav-sidebar';

    const bottomBtn = document.createElement('button');
    bottomBtn.id = 'gemini-nav-bottom-btn';
    bottomBtn.innerText = '⬇️ 跳至最后';
    bottomBtn.onclick = () => {
        // 【升级策略：寻找最后一条消息并滚动】
        // 尝试抓取页面上所有的用户提问或 AI 回答节点
        // 这里加入了多个可能的标签名，以增加兼容性
        const allMessages = document.querySelectorAll('user-query, model-response, .conversation-container > div');
        
        if (allMessages.length > 0) {
            // 拿到最后一条消息
            const lastMessage = allMessages[allMessages.length - 1];
            // 强制平滑滚动，让最后一条消息的底部对齐屏幕底部
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        // 【升级策略：更精准地捕捉富文本输入框】
        // Gemini 的输入框通常是一个带有 contenteditable 属性的特殊区域
        const editor = document.querySelector('[contenteditable="true"], rich-textarea, textarea');
        if (editor) {
            // 聚焦输入框，让你点完按钮就能直接打字
            editor.focus();
        } else {
            console.log("没找到输入框，可能网页结构又变了");
        }
    };
    const listContainer = document.createElement('div');
    listContainer.id = 'gemini-nav-list';

    sidebar.appendChild(bottomBtn);
    sidebar.appendChild(listContainer);
    document.body.appendChild(sidebar);
}

// 2. 扫描网页，提取你的提问并更新大纲
// 2. 扫描网页，提取你的提问并更新大纲
function updateNavList() {
    const listContainer = document.getElementById('gemini-nav-list');
    if (!listContainer) return;

    // 获取所有用户的提问节点
    const userMessages = document.querySelectorAll('user-query'); 

    // 如果数量没变，就不刷新
    if (userMessages.length === listContainer.children.length) return;

    listContainer.innerHTML = ''; 

    userMessages.forEach((msg, index) => {
        let text = '';

        // 【优化3：精准屏蔽附件，只抓取纯文本】
        // 策略 A：优先寻找所有的段落 <p> 标签，因为纯手打的文字都在这里面
        const paragraphs = msg.querySelectorAll('p');
        if (paragraphs.length > 0) {
            // 把所有段落的文字拼接到一起
            paragraphs.forEach(p => {
                text += p.innerText + ' ';
            });
        } else {
            // 策略 B：如果没有找到 <p> 标签（有时只有一句话且没分段）
            // 我们在内存里“克隆”一个这个气泡，然后把常见的附件元素删掉，再读取文字
            let cloneMsg = msg.cloneNode(true);
            // 移除常见的附件标签、图片、按钮等（你可以根据实际情况添加）
            let attachments = cloneMsg.querySelectorAll('img, button, a, [data-test-id="attachment-chip"]');
            attachments.forEach(att => att.remove());
            text = cloneMsg.innerText || cloneMsg.textContent;
        }

        text = text.trim();
        
        // 如果提取完文字发现是空的（比如你这轮只发了一张图，一句话都没说）
        if (!text) {
            text = "[仅发送了附件/图片]";
        }

        // 继续之前的极简“伪概括”处理
        let cleanText = text.replace(/^(你说|我说|请问|帮我|请帮我|你好|我想问|请|给我)/g, '').trim();
        let shortText = cleanText.length > 10 ? cleanText.substring(0, 10) + '...' : cleanText;

        const item = document.createElement('div');
        item.className = 'gemini-nav-item';
        item.innerText = `${index + 1}. ${shortText}`;
        item.title = text; // 鼠标悬停显示完整内容

        item.onclick = () => {
            msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        listContainer.appendChild(item);
    });
}

// 3. 启动引擎
setTimeout(() => {
    createSidebar();
    updateNavList();
    setInterval(updateNavList, 3000);
}, 3000);