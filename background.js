// 扩展初始化监听
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// 创建定时检查的Alarm
function createCheckAlarm() {
    chrome.alarms.create('nexusCheck', {
        delayInMinutes: 0.1,  // 首次检查延迟（0.1分钟=6秒）
        periodInMinutes: 0.1  // 后续检查间隔
    });
}

// 处理Alarm事件
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'nexusCheck') {
        chrome.tabs.query({url: "*://app.nexus.xyz/*"}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        function: contentScriptLogic
                    });
                }
            });
        });
    }
});

// 实际执行DOM操作的内容脚本逻辑
function contentScriptLogic() {
    const getElementByXPath = (xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
    };

    const textElement = getElementByXPath('/html/body/div[3]/div[2]/main/main/div[2]/div/div/div[1]/div[2]/div/div/p');
    
    if (textElement?.textContent === "CONNECT TO NEXUS") {
        const button = getElementByXPath("/html/body/div[3]/div[2]/main/main/div[2]/div/div/div[1]/div[1]/div/div/div/div/div[2]");
        button?.click();
    }

    // 返回状态给background
    return {status: textElement ? 'checked' : 'no_element'};
}

// 初始化Alarm
createCheckAlarm();
