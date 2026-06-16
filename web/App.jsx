// ========================================
// AutoPost Pro - Modern React Application
// ========================================

const { useState, useEffect, useCallback, useRef, createContext, useContext } = React;

// ========================================
// Contexts & Global State
// ========================================
const ThemeContext = createContext(null);
const LanguageContext = createContext(null);
const AppContext = createContext(null);

const storage = {
    get: (key, defaultValue) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
};

const translations = {
    vi: {
        app_name: 'AutoPost Pro',
        dashboard: 'Dashboard',
        new_campaign: 'Chiến dịch mới',
        campaign_desc: 'Thiết lập nội dung và cấu hình tự động đăng bài lên nhóm Facebook.',
        system_active: 'Hệ thống hoạt động',
        login_fb: 'Đăng nhập Facebook',
        logout: 'Đăng xuất',
        editor_title: 'Soạn Thảo Nội Dung',
        gen_gemini: 'Gen với Gemini',
        gen_generating: 'Đang tạo...',
        prompt_label: 'Prompt cho Gemini',
        prompt_select: '-- Chọn prompt có sẵn --',
        custom_prompt: 'Tự nhập prompt...',
        image_label: 'Hình ảnh đính kèm',
        drag_drop: 'Kéo thả ảnh hoặc tải lên',
        spin_content: 'Spin nội dung',
        spin_desc: 'Tự động trộn nội dung để tránh spam',
        groups_title: 'Nhóm Facebook',
        scan_groups: 'Quét Nhóm từ Facebook',
        scanning: 'Đang quét...',
        search_placeholder: 'Tìm kiếm nhóm...',
        selected: 'Đã chọn:',
        select_all: 'Chọn tất cả',
        deselect_all: 'Bỏ chọn tất cả',
        start_post: 'Bắt đầu đăng',
        posting: 'Đang đăng...',
        progress_title: 'Kết Quả Đăng Bài',
        progress: 'Tiến độ:',
        stop: 'Dừng lại',
        ideas_title: 'Ý tưởng & Prompts đã lưu',
        add_idea: 'Thêm ý tưởng',
        no_ideas: 'Chưa có ý tưởng nào. Nhấn "Thêm ý tưởng" để lưu lại.',
        settings_delay: 'Posting Delays',
        min_sec: 'Min (giây)',
        max_sec: 'Max (giây)',
        settings_gemini: 'Gemini AI',
        api_key: 'Gemini API Key',
        model: 'Model',
        get_api_key: 'Lấy API Key',
        save: 'Lưu',
        cancel: 'Hủy',
        title: 'Tiêu đề',
        content: 'Nội dung / Prompt',
        toast_success: 'Thành công',
        toast_error: 'Lỗi',
        toast_warning: 'Cảnh báo',
        toast_info: 'Thông tin'
    },
    en: {
        app_name: 'AutoPost Pro',
        dashboard: 'Dashboard',
        new_campaign: 'New Campaign',
        campaign_desc: 'Setup content and configuration for auto-posting to Facebook groups.',
        system_active: 'System Active',
        login_fb: 'Login Facebook',
        logout: 'Logout',
        editor_title: 'Content Editor',
        gen_gemini: 'Gen with Gemini',
        gen_generating: 'Generating...',
        prompt_label: 'Gemini Prompt',
        prompt_select: '-- Select preset --',
        custom_prompt: 'Custom prompt...',
        image_label: 'Attached Images',
        drag_drop: 'Drag & drop or upload',
        spin_content: 'Spin Content',
        spin_desc: 'Automatically spin content to avoid spam',
        groups_title: 'Facebook Groups',
        scan_groups: 'Scan Groups',
        scanning: 'Scanning...',
        search_placeholder: 'Search groups...',
        selected: 'Selected:',
        select_all: 'Select All',
        deselect_all: 'Deselect All',
        start_post: 'Start Posting',
        posting: 'Posting...',
        progress_title: 'Posting Results',
        progress: 'Progress:',
        stop: 'Stop',
        ideas_title: 'Saved Ideas & Prompts',
        add_idea: 'Add Idea',
        no_ideas: 'No ideas yet. Click "Add Idea" to save one.',
        settings_delay: 'Posting Delays',
        min_sec: 'Min (sec)',
        max_sec: 'Max (sec)',
        settings_gemini: 'Gemini AI',
        api_key: 'Gemini API Key',
        model: 'Model',
        get_api_key: 'Get API Key',
        save: 'Save',
        cancel: 'Cancel',
        title: 'Title',
        content: 'Content / Prompt',
        toast_success: 'Success',
        toast_error: 'Error',
        toast_warning: 'Warning',
        toast_info: 'Info'
    }
};

// ========================================
// Main App Component
// ========================================
function App() {
    const [theme, setTheme] = useState(() => storage.get('theme', 'light'));
    const [lang, setLang] = useState(() => storage.get('lang', 'vi'));
    const t = (key) => translations[lang][key] || key;
    const [extensionStatus, setExtensionStatus] = useState(() => storage.get('extension_status', false));
    const [fbUser, setFbUser] = useState(() => storage.get('fb_user_info', null));
    const [content, setContent] = useState(() => storage.get('fb_post_content', '') || '');
    const [groups, setGroups] = useState(() => storage.get('fb_groups', []));
    const [selectedGroups, setSelectedGroups] = useState(() => new Set(storage.get('fb_selected_groups', [])));
    const [images, setImages] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        document.documentElement.className = theme;
        storage.set('theme', theme);
    }, [theme]);
    useEffect(() => { storage.set('lang', lang); }, [lang]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    const addLog = (type, message) => {
        const time = new Date().toLocaleTimeString('vi-VN');
        setLogs(prev => [...prev, { time, type, message }]);
    };

    // Extension Messaging
    useEffect(() => {
        let intervalId;
        const handleMessage = (event) => {
            if (event.source !== window) return;
            const { type, data } = event.data;
            if (type === 'FB_TOOL_INSTALLED') {
                setExtensionStatus(true);
                storage.set('extension_status', true);
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
            if (type === 'FB_USER_INFO') {
                setFbUser(data);
                storage.set('fb_user_info', data);
                showToast(`Logged in as ${data.userName}`, 'success');
            }
            if (type === 'GROUP_DATA') {
                setGroups(prev => {
                    if (prev.some(g => g.id === data.id)) return prev;
                    return [...prev, data];
                });
            }
        };
        window.addEventListener('message', handleMessage);
        window.postMessage({ type: 'CHECK_EXTENSION' }, '*');
        intervalId = setInterval(() => {
            window.postMessage({ type: 'CHECK_EXTENSION' }, '*');
        }, 1000);
        return () => {
            window.removeEventListener('message', handleMessage);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const handleScan = () => {
        if (!extensionStatus) return showToast('Install Extension first!', 'error');
        setGroups([]);
        window.postMessage({ type: 'START_EXTRACTION' }, '*');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <LanguageContext.Provider value={{ lang, setLang, t }}>
                <AppContext.Provider value={{ showToast, addLog }}>
                    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-main font-display antialiased transition-colors duration-300">
                        <Header extensionStatus={extensionStatus} fbUser={fbUser} />
                        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                            <h1 className="text-3xl font-black mb-8 dark:text-white">{t('new_campaign')}</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <div className="lg:col-span-8 flex flex-col gap-6">
                                    <ContentEditor content={content} onContentChange={setContent} images={images} onImagesChange={setImages} t={t} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-card-light dark:bg-slate-800 p-6 rounded-xl border border-border-light shadow-card">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-primary">timer</span>
                                                <h3 className="font-bold dark:text-white">{t('settings_delay')}</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-500">{t('min_sec')}</label>
                                                    <input type="number" value={delayMin} onChange={e => setDelayMin(parseInt(e.target.value))} className="w-full p-2 border rounded text-center font-mono font-bold bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-500">{t('max_sec')}</label>
                                                    <input type="number" value={delayMax} onChange={e => setDelayMax(parseInt(e.target.value))} className="w-full p-2 border rounded text-center font-mono font-bold bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-card-light dark:bg-slate-800 p-6 rounded-xl border border-border-light shadow-card relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                                <h3 className="font-bold dark:text-white">{t('settings_gemini')}</h3>
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold uppercase mb-1 text-gray-500">{t('api_key')}</label>
                                                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="AIza..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase mb-1 text-gray-500">{t('model')}</label>
                                                <select value={model} onChange={e => setModel(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                                                    <option value="gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                                                    <option value="gemini-1.5-flash-001">Gemini 1.5 Flash</option>
                                                    <option value="gemini-1.5-pro-001">Gemini 1.5 Pro</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-4">
                                    <GroupsPanel groups={groups} selectedGroups={selectedGroups} onToggleGroup={(id) => {
                                        const newSet = new Set(selectedGroups);
                                        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
                                        setSelectedGroups(newSet);
                                    }} t={t} onScan={handleScan} />
                                </div>
                            </div>

                            <ProgressLog logs={logs} progress={progress} t={t} />

                            <div className="mt-8 bg-card-light dark:bg-slate-800 rounded-xl shadow-card border border-border-light overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                                        <h2 className="font-bold text-lg dark:text-white">{t('ideas_title')}</h2>
                                    </div>
                                    <button className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">add</span> {t('add_idea')}
                                    </button>
                                </div>
                                <div className="p-6 text-center text-gray-400">
                                    <p>{t('no_ideas')}</p>
                                </div>
                            </div>
                        </main>
                        <ToastContainer toasts={toasts} removeToast={removeToast} />
                    </div>
                </AppContext.Provider>
            </LanguageContext.Provider>
        </ThemeContext.Provider>
    );
}

// ========================================
// Components
// ========================================

function Header({ extensionStatus, fbUser }) {
    const { theme, setTheme } = useContext(ThemeContext);
    const { lang, setLang, t } = useContext(LanguageContext);
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border-light">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">rocket_launch</span>
                    <span className="font-bold text-xl dark:text-white">{t('app_name')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="p-2 font-bold text-sm">
                        {lang === 'vi' ? '🇺🇸' : '🇻🇳'}
                    </button>
                    {fbUser ? (
                        <div className="flex items-center gap-2">
                            <img src={fbUser.userAvatar} className="w-8 h-8 rounded-full" />
                            <span className="text-sm font-medium dark:text-white">{fbUser.userName}</span>
                        </div>
                    ) : (
                        <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">Login Facebook</button>
                    )}
                </div>
            </div>
        </header>
    );
}

function ContentEditor({ content, onContentChange, images, onImagesChange, t }) {
    const { showToast } = useContext(AppContext);
    const fileInputRef = useRef(null);

    return (
        <div className="bg-card-light dark:bg-slate-800 rounded-xl shadow-card border border-border-light overflow-hidden">
            <div className="p-4 border-b border-border-light bg-gray-50/50 dark:bg-slate-800/50 flex justify-between">
                <h2 className="font-bold dark:text-white">{t('editor_title')}</h2>
                <span className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">{content.length} chars</span>
            </div>
            <div className="p-6">
                <div className="flex gap-2 mb-3">
                    {['format_bold', 'format_italic', 'link', 'sentiment_satisfied'].map(icon => (
                        <button key={icon} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined">{icon}</span></button>
                    ))}
                </div>
                <textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    className="w-full min-h-[150px] p-4 bg-transparent border border-border-light rounded-lg dark:text-white dark:border-slate-600"
                    placeholder={t('campaign_desc')}
                />
                <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800/50"
                    onClick={() => fileInputRef.current?.click()}>
                    <span className="material-symbols-outlined text-4xl text-gray-400">add_photo_alternate</span>
                    <p className="text-sm font-medium dark:text-gray-300">{t('drag_drop')}</p>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => {
                        // Image handling logic
                        const files = Array.from(e.target.files);
                        files.forEach(f => {
                            const reader = new FileReader();
                            reader.onload = (ev) => onImagesChange(prev => [...prev, { id: Date.now(), data: ev.target.result }]);
                            reader.readAsDataURL(f);
                        });
                    }} />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map(img => (
                        <div key={img.id} className="relative aspect-square rounded overflow-hidden">
                            <img src={img.data} className="w-full h-full object-cover" />
                            <button onClick={() => onImagesChange(prev => prev.filter(i => i.id !== img.id))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><span className="material-symbols-outlined text-[10px]">close</span></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GroupsPanel({ groups, selectedGroups, onToggleGroup, t, onScan }) {
    return (
        <div className="bg-card-light dark:bg-slate-800 rounded-xl shadow-card h-[calc(100vh-7rem)] sticky top-20 flex flex-col border border-border-light">
            <div className="p-4 border-b border-border-light flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <h2 className="font-bold dark:text-white">{t('groups_title')}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{groups.length}</span>
            </div>
            <div className="p-4 border-b border-border-light">
                <button onClick={onScan} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined">radar</span> {t('scan_groups')}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">groups</span>
                        <p className="text-sm text-center">No groups found</p>
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} onClick={() => onToggleGroup(group.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-2 transition-colors ${selectedGroups.has(group.id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover" style={{ backgroundImage: `url(${group.image})` }}></div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate dark:text-white">{group.name}</div>
                                <div className="text-xs text-gray-500 truncate">{group.id}</div>
                            </div>
                            <input type="checkbox" checked={selectedGroups.has(group.id)} onChange={() => { }} className="rounded text-blue-600 focus:ring-blue-500" />
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 border-t border-border-light bg-gray-50 dark:bg-slate-800/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium dark:text-gray-300">{t('selected')} {selectedGroups.size}</span>
                </div>
                <button className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                    {t('start_post')} <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {toasts.map(toast => (
                <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-800'}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)}>&times;</button>
                </div>
            ))}
        </div>
    );
}

function ProgressLog({ logs, progress, t }) {
    return (
        <div className="mt-8 bg-card-light dark:bg-slate-800 rounded-xl shadow-card border border-border-light overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-secondary">terminal</span>
                    <h2 className="font-bold text-lg dark:text-white">{t('progress_title')}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-secondary">{t('progress')}</span>
                    <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
            </div>
            <div className="p-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500 relative overflow-hidden" style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
                    </div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs md:text-sm shadow-inner custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-3 mb-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            <span className="text-slate-500 min-w-[70px]">{log.time}</span>
                            <span>{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

