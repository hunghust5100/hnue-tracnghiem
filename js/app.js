/* ========================================================
   GLOBAL APP STATE & INITIALIZATION
======================================================== */
let currentQuestions = [];
let currentQuizMode = 'instant'; // 'instant' or 'submit'
let isQuizSubmitted = false;
let allCategoriesData = [];
let timerInterval = null;
let totalSecondsLeft = 0;

let pendingQuizFile = null;
let pendingQuizTitle = "";
let currentSubjectId = "cnxh";
let activeCourseTab = "quizzes"; // "quizzes" or "textbooks"

let activeSubjectGroup = null;
let activeMockFolderName = null;
let selectedMockCount = 20;
let selectedMockTime = 15;
let selectedMockMode = 'instant';

let pendingRetakeSubjectId = null;
let selectedRetakeMode = 'submit';

let accordionStates = { cnxh: true, gdh: true };

let currentTextbookChapter = null;
let currentTextbookFontSize = 1.05;
let currentTextbookTheme = 'light';

function copyAuthorAccount(accNum = '52403022005') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accNum).then(() => {
            alert('✅ Đã sao chép Số tài khoản TPBank: ' + accNum + '\nCảm ơn bạn rất nhiều vì đã ủng hộ tác giả Nguyễn Khánh Hưng!');
        }).catch(() => {
            prompt('Số tài khoản TPBank ủng hộ tác giả Nguyễn Khánh Hưng:', accNum);
        });
    } else {
        prompt('Số tài khoản TPBank ủng hộ tác giả Nguyễn Khánh Hưng:', accNum);
    }
}

window.toggleAppSidebar = function() {
    const sidebar = document.getElementById('app-sidebar-panel');
    if (!sidebar) {
        console.error('Không tìm thấy element #app-sidebar-panel');
        return;
    }
    sidebar.classList.toggle('collapsed');
};

window.initSidebarState = function() {
    const sidebar = document.getElementById('app-sidebar-panel');
    if (!sidebar) return;
    sidebar.classList.remove('collapsed');
};

function openAuthorQrModal() {
    const modal = document.getElementById('author-qr-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAuthorQrModal() {
    const modal = document.getElementById('author-qr-modal');
    if (modal) modal.classList.add('hidden');
}

/* ========================================================
   FAIL-SAFE EMBEDDED DATA LOOKUP (CORS & FILE:// COMPATIBLE)
======================================================== */
function getEmbeddedQuizContent(filePath) {
    if (!window.EMBEDDED_QUIZZES || !filePath) return null;
    let normTarget = filePath;
    try { normTarget = decodeURIComponent(filePath); } catch(e) {}
    normTarget = normTarget.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^data\//, '').trim().toLowerCase();

    for (const key in window.EMBEDDED_QUIZZES) {
        let normKey = key;
        try { normKey = decodeURIComponent(key); } catch(e) {}
        normKey = normKey.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^data\//, '').trim().toLowerCase();

        if (normKey === normTarget || key === filePath) {
            return window.EMBEDDED_QUIZZES[key];
        }
    }
    return null;
}

/* ========================================================
   MULTI-PAGE ROUTER & NAVIGATION WITH RELATIVE URL PARAMS
======================================================== */
async function initPageFromURL(pageName = 'home') {
    initSidebarState();
    if (!allCategoriesData || allCategoriesData.length === 0) {
        await loadMasterCategoriesData();
    }

    const urlParams = new URLSearchParams(window.location.search);

    if (pageName === 'courses') {
        const subject = urlParams.get('subject') || 'cnxh';
        const tab = urlParams.get('tab') || 'quizzes';
        currentSubjectId = subject;
        activeCourseTab = tab;
        renderCourseTabsSelector();
        renderCourseDetailView(subject, tab);
    } else if (pageName === 'quiz-room') {
        const mode = urlParams.get('mode');
        const file = urlParams.get('file');
        const title = urlParams.get('title') || 'Đề trắc nghiệm';
        const quizMode = urlParams.get('quizMode') || 'instant';
        currentQuizMode = quizMode;

        const floatBtn = document.getElementById('floating-textbook-btn');
        if (floatBtn) floatBtn.classList.remove('hidden');

        if (mode === 'mock') {
            activeSubjectGroup = urlParams.get('subject') || 'cnxh';
            activeMockFolderName = urlParams.get('folder') || null;
            selectedMockCount = parseInt(urlParams.get('count') || '20', 10);
            selectedMockTime = parseInt(urlParams.get('time') || '15', 10);
            selectedMockMode = quizMode;
            executeMockExamEngine();
        } else if (mode === 'retake') {
            pendingRetakeSubjectId = urlParams.get('subject') || 'cnxh';
            selectedRetakeMode = quizMode;
            executeRetakeWrongEngine();
        } else if (file) {
            fetchAndLoadQuiz(file, title);
        }
    } else if (pageName === 'quizzes') {
        renderPresetCategories();
    } else if (pageName === 'history') {
        renderHistoryPage();
    } else {
        renderDashboardPage();
    }
}

function openCourseDetail(subjectId, defaultTab = 'quizzes') {
    currentSubjectId = subjectId;
    activeCourseTab = defaultTab;
    const targetUrl = `courses.html?subject=${encodeURIComponent(subjectId)}&tab=${encodeURIComponent(defaultTab)}`;

    if (window.location.pathname.endsWith('courses.html')) {
        renderCourseTabsSelector();
        renderCourseDetailView(subjectId, defaultTab);
        try {
            history.replaceState(null, '', targetUrl);
        } catch(e) {}
    } else {
        window.location.href = targetUrl;
    }
}

function backToConfig() {
    window.location.href = `courses.html?subject=${encodeURIComponent(currentSubjectId)}&tab=quizzes`;
}

function confirmAndStartQuiz() {
    closeStartQuizModal();
    if (pendingQuizFile) {
        const params = new URLSearchParams({
            file: pendingQuizFile,
            title: pendingQuizTitle || 'Đề trắc nghiệm',
            quizMode: currentQuizMode
        });
        window.location.href = `quiz-room.html?${params.toString()}`;
    } else {
        const textVal = document.getElementById('text-input') ? document.getElementById('text-input').value : '';
        if (textVal && textVal.trim()) {
            parseAndStartRawText(textVal, pendingQuizTitle || 'Đề thi Nhập thủ công');
        }
    }
}

function startRandomMockExam() {
    closeMockModal();
    const params = new URLSearchParams({
        mode: 'mock',
        subject: activeSubjectGroup || 'cnxh',
        count: selectedMockCount,
        time: selectedMockTime,
        quizMode: selectedMockMode
    });
    if (activeMockFolderName) params.set('folder', activeMockFolderName);
    window.location.href = `quiz-room.html?${params.toString()}`;
}

function confirmRetakeWrongExam() {
    closeRetakeModal();
    const params = new URLSearchParams({
        mode: 'retake',
        subject: pendingRetakeSubjectId || 'cnxh',
        quizMode: selectedRetakeMode
    });
    window.location.href = `quiz-room.html?${params.toString()}`;
}

/* ========================================================
   DEFAULT CATEGORIES DATA (OFFLINE FALLBACK)
======================================================== */
const defaultCategories = [
  {
    "category": "📕 Chủ nghĩa Xã hội Khoa học (CNXH) - HNUE",
    "subjectId": "cnxh",
    "status": "available",
    "quizzes": [
      {
        "id": "cnxh-moi-ch1",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 1: Nhập môn CNXH Khoa học",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "data/CNXH/Câu hỏi trắc nghiệm (mới)/Chương 1. Nhập môn CNXH Khoa học.enc",
        "icon": "📚"
      }
    ]
  }
];

async function loadMasterCategoriesData() {
    try {
        const res = await fetch('data/quizzes.json?v=' + Date.now());
        if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) allCategoriesData = json;
        }
    } catch (e) {
        allCategoriesData = defaultCategories;
    }
}

/* ========================================================
   PAGE 1: DASHBOARD PAGE (#view-home)
======================================================== */
async function renderDashboardPage() {
    if (!allCategoriesData || allCategoriesData.length === 0) {
        await loadMasterCategoriesData();
    }
    renderDashboardCoursesGrid();
    renderDashboardHistory();
}

function renderDashboardCoursesGrid() {
    const container = document.getElementById('home-courses-grid');
    if (!container) return;
    container.innerHTML = '';

    const courseGroups = allCategoriesData.filter(c => c.type !== 'textbook');

    courseGroups.forEach(group => {
        const subjectId = group.subjectId || 'cnxh';
        const quizCount = group.quizzes ? group.quizzes.length : 0;
        
        let chapterCount = 0;
        const tbGroup = allCategoriesData.find(c => c.type === 'textbook' && c.subjectId === `${subjectId}-textbook`);
        if (tbGroup && tbGroup.volumes) {
            tbGroup.volumes.forEach(v => chapterCount += (v.chapters ? v.chapters.length : 0));
        }

        const card = document.createElement('div');
        card.className = 'card course-home-card';
        card.style.borderTop = subjectId === 'cnxh' ? '4px solid #ef4444' : '4px solid #6366f1';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                <span style="font-size: 2.2rem; line-height: 1;">${subjectId === 'cnxh' ? '📕' : '🎓'}</span>
                <div>
                    <h3 style="font-size: 1.2rem; color: #1e293b; font-weight: 800;">${escapeHTML(group.category.replace(/^[^\s]+\s+/, ''))}</h3>
                    <div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="font-size: 0.78rem; background: #e0e7ff; color: #3730a3; padding: 2px 10px; border-radius: 50px; font-weight: 700;">📝 ${quizCount} Bài thi</span>
                        ${chapterCount > 0 ? `<span style="font-size: 0.78rem; background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 50px; font-weight: 700;">📚 ${chapterCount} Chương bài giảng</span>` : ''}
                    </div>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 18px; line-height: 1.5;">
                Khóa học đầy đủ bộ câu hỏi trắc nghiệm ôn tập và hệ thống bài giảng điện tử chi tiết phục vụ thi học phần.
            </p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; font-size: 0.88rem;" onclick="openCourseDetail('${subjectId}', 'quizzes')">
                    🎓 Khám phá Khóa học
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ========================================================
   PAGE 2: COURSES PAGE & DETAIL VIEW (#view-courses)
======================================================== */
async function renderCourseCatalogPage() {
    if (!allCategoriesData || allCategoriesData.length === 0) {
        await loadMasterCategoriesData();
    }
    renderCourseTabsSelector();
    renderCourseDetailView(currentSubjectId, activeCourseTab);
}

function renderCourseTabsSelector() {
    const container = document.getElementById('course-selector-pills');
    if (!container) return;
    container.innerHTML = '';

    const courseGroups = allCategoriesData.filter(c => c.type !== 'textbook');

    courseGroups.forEach(group => {
        const subId = group.subjectId || 'cnxh';
        const pill = document.createElement('span');
        pill.className = `pill-opt ${currentSubjectId === subId ? 'active' : ''}`;
        pill.innerText = group.category.replace(/^[^\s]+\s+/, '');
        pill.onclick = () => openCourseDetail(subId, activeCourseTab);
        container.appendChild(pill);
    });
}

function switchCourseSubTab(tabName) {
    activeCourseTab = tabName;
    openCourseDetail(currentSubjectId, tabName);
}

function renderCourseDetailView(subjectId, activeTab = 'quizzes') {
    const detailContainer = document.getElementById('course-detail-container');
    if (!detailContainer) return;
    detailContainer.innerHTML = '';

    const group = allCategoriesData.find(g => (g.subjectId || '') === subjectId) || allCategoriesData[0];
    if (!group) return;

    const courseTitle = group.category.replace(/^[^\s]+\s+/, '');
    const tbCategory = allCategoriesData.find(c => c.type === 'textbook' && c.subjectId === `${subjectId}-textbook`);

    let html = `
        <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
                <div>
                    <span style="font-size: 0.8rem; background: #e0e7ff; color: #3730a3; padding: 3px 12px; border-radius: 50px; font-weight: 700;">🎓 Khóa học HNUE</span>
                    <h2 style="font-size: 1.4rem; color: #1e1b4b; margin-top: 6px;">${escapeHTML(courseTitle)}</h2>
                </div>
            </div>

            <!-- Course Sub Tabs (Quizzes vs Lectures) -->
            <div style="display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 2px;">
                <button class="course-tab-btn ${activeTab === 'quizzes' ? 'active' : ''}" onclick="switchCourseSubTab('quizzes')">
                    📝 Đề thi Trắc nghiệm & Thi thử
                </button>
                ${tbCategory ? `
                <button class="course-tab-btn ${activeTab === 'textbooks' ? 'active' : ''}" onclick="switchCourseSubTab('textbooks')">
                    📚 Giáo trình & Bài giảng
                </button>` : ''}
            </div>
        </div>
    `;

    detailContainer.innerHTML = html;

    const contentDiv = document.createElement('div');
    detailContainer.appendChild(contentDiv);

    if (activeTab === 'textbooks' && tbCategory) {
        renderCourseTextbooksContent(contentDiv, tbCategory);
    } else {
        renderCourseQuizzesContent(contentDiv, group);
    }
}

function renderCourseQuizzesContent(container, group) {
    const subjectId = group.subjectId || 'cnxh';

    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.flexWrap = 'wrap';
    header.style.gap = '12px';
    header.style.marginBottom = '18px';

    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn-danger" style="padding: 6px 14px; font-size: 0.82rem; min-height: 34px;" onclick="startRetakeWrongExamForSubject('${subjectId}')">
                🔥 Ôn lại câu sai
            </button>
            <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.82rem; min-height: 34px;" onclick="clearSubjectWrongBank('${subjectId}')">
                Xóa kho câu sai
            </button>
        </div>
        <span class="preset-badge" style="background: rgba(239, 68, 68, 0.08); color: var(--danger-text); box-shadow: none;" id="subject-wrong-badge-${subjectId}">
            🔥 0 câu sai
        </span>
    `;
    card.appendChild(header);

    const pList = document.createElement('div');
    pList.className = 'preset-list';

    // Mock exam card
    const mockCard = document.createElement('div');
    mockCard.className = 'preset-card mock-exam-card';
    mockCard.onclick = () => openMockModalById(subjectId);
    mockCard.innerHTML = `
        <div class="preset-card-left">
            <div class="preset-icon">🎲</div>
            <div class="preset-info">
                <div class="preset-title">Thi thử Ngẫu nhiên môn này</div>
                <div class="preset-desc">Tự động xáo trộn ngẫu nhiên bộ câu hỏi các chương</div>
            </div>
        </div>
        <div class="preset-card-right">
            <span class="preset-badge mock-badge">🎲 Thi thử ngay</span>
        </div>
    `;
    pList.appendChild(mockCard);

    const subfoldersMap = {};
    const ungroupedQuizzes = [];

    if (group.quizzes) {
        group.quizzes.forEach((quiz, qIdx) => {
            if (quiz.folder) {
                if (!subfoldersMap[quiz.folder]) subfoldersMap[quiz.folder] = [];
                subfoldersMap[quiz.folder].push({ quiz, originalIndex: qIdx });
            } else {
                ungroupedQuizzes.push({ quiz, originalIndex: qIdx });
            }
        });
    }

    Object.keys(subfoldersMap).forEach((fName, fIdx) => {
        const subQuizzes = subfoldersMap[fName];

        const sfBlock = document.createElement('div');
        sfBlock.className = 'subfolder-block collapsed';
        sfBlock.id = `subfolder-${subjectId}-${fIdx}`;

        const sfHeader = document.createElement('div');
        sfHeader.className = 'subfolder-header';
        sfHeader.onclick = (e) => {
            e.stopPropagation();
            toggleSubfolderAccordion(subjectId, fIdx);
        };
        sfHeader.innerHTML = `
            <div class="subfolder-title-group">
                <span class="subfolder-arrow">▼</span>
                <span class="subfolder-title">${escapeHTML(fName)}</span>
                <span class="subfolder-count">${subQuizzes.length} bài</span>
            </div>
            <div>
                <button class="btn-secondary" style="padding: 3px 10px; font-size: 0.76rem; min-height: 26px; border-color: rgba(99,102,241,0.3); color: var(--primary);" onclick="event.stopPropagation(); openMockModalById('${subjectId}', '${escapeHTML(fName).replace(/'/g, "\\'")}')">
                    🎲 Thi thử phần này
                </button>
            </div>
        `;
        sfBlock.appendChild(sfHeader);

        const sfContent = document.createElement('div');
        sfContent.className = 'subfolder-content';
        const sfList = document.createElement('div');
        sfList.className = 'preset-list';
        sfList.style.marginTop = '8px';

        subQuizzes.forEach(item => {
            const quiz = item.quiz;
            const qCard = document.createElement('div');
            qCard.className = 'preset-card';
            qCard.onclick = () => openStartQuizModalById(subjectId, item.originalIndex);
            qCard.innerHTML = `
                <div class="preset-card-left">
                    <div class="preset-icon">${quiz.icon || '📖'}</div>
                    <div class="preset-info">
                        <div class="preset-title">${escapeHTML(quiz.title)}</div>
                        <div class="preset-desc">${escapeHTML(quiz.description || '')}</div>
                    </div>
                </div>
                <div class="preset-card-right">
                    <span class="preset-badge">Làm bài</span>
                </div>
            `;
            sfList.appendChild(qCard);
        });

        sfContent.appendChild(sfList);
        sfBlock.appendChild(sfContent);
        pList.appendChild(sfBlock);
    });

    ungroupedQuizzes.forEach(item => {
        const quiz = item.quiz;
        const qCard = document.createElement('div');
        qCard.className = 'preset-card';
        qCard.onclick = () => openStartQuizModalById(subjectId, item.originalIndex);
        qCard.innerHTML = `
            <div class="preset-card-left">
                <div class="preset-icon">${quiz.icon || '📖'}</div>
                <div class="preset-info">
                    <div class="preset-title">${escapeHTML(quiz.title)}</div>
                    <div class="preset-desc">${escapeHTML(quiz.description || '')}</div>
                </div>
            </div>
            <div class="preset-card-right">
                <span class="preset-badge">Làm bài</span>
            </div>
        `;
        pList.appendChild(qCard);
    });

    card.appendChild(pList);
    container.appendChild(card);
    updateSubjectStatsUI(subjectId);
}

function renderCourseTextbooksContent(container, tbCategory) {
    const card = document.createElement('div');
    card.className = 'card';

    if (!tbCategory || !tbCategory.volumes) {
        card.innerHTML = '<p style="color: var(--text-muted);">Chưa có bài giảng cho môn học này.</p>';
        container.appendChild(card);
        return;
    }

    tbCategory.volumes.forEach(vol => {
        const volCard = document.createElement('div');
        volCard.className = 'textbook-volume-card';

        const volTitle = document.createElement('div');
        volTitle.className = 'textbook-volume-title';
        volTitle.innerHTML = escapeHTML(vol.volumeTitle);
        volCard.appendChild(volTitle);

        if (vol.description) {
            const volDesc = document.createElement('div');
            volDesc.className = 'textbook-volume-desc';
            volDesc.innerText = vol.description;
            volCard.appendChild(volDesc);
        }

        const grid = document.createElement('div');
        grid.className = 'textbook-chapter-grid';

        vol.chapters.forEach(ch => {
            const chCard = document.createElement('div');
            chCard.className = 'textbook-chapter-card';
            chCard.innerHTML = `
                <div class="tb-card-header">
                    <div class="tb-card-icon">${ch.icon || '📖'}</div>
                    <div>
                        <div class="tb-card-title">${escapeHTML(ch.title)}</div>
                    </div>
                </div>
                <div class="tb-card-desc">${escapeHTML(ch.description || '')}</div>
                <div class="tb-card-actions">
                    <button class="btn-tb-read" onclick="openTextbookReader('${ch.file}', '${escapeHTML(ch.title).replace(/'/g, "\\'")}', '${ch.id}', '${ch.quizId || ''}')">
                        📖 Đọc bài giảng
                    </button>
                    ${ch.quizId ? `
                    <button class="btn-tb-quiz" onclick="startQuizForChapter('${ch.quizId}', '${escapeHTML(ch.title).replace(/'/g, "\\'")}')">
                        🚀 Bài trắc nghiệm
                    </button>` : ''}
                </div>
            `;
            grid.appendChild(chCard);
        });

        volCard.appendChild(grid);
        card.appendChild(volCard);
    });

    container.appendChild(card);
}

/* ========================================================
   PAGE 3: QUIZZES BANK PAGE (#view-quizzes)
======================================================== */
async function renderPresetCategories() {
    if (!allCategoriesData || allCategoriesData.length === 0) {
        await loadMasterCategoriesData();
    }
    const container = document.getElementById('preset-categories-container');
    if (!container) return;
    container.innerHTML = '';

    const courseGroups = allCategoriesData.filter(c => c.type !== 'textbook');

    courseGroups.forEach(group => {
        const subjectId = group.subjectId || 'cnxh';
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '20px';

        const titleHeader = document.createElement('div');
        titleHeader.className = 'card-title';
        titleHeader.style.display = 'flex';
        titleHeader.style.justifyContent = 'space-between';
        titleHeader.style.alignItems = 'center';
        titleHeader.innerHTML = `
            <span>${escapeHTML(group.category)}</span>
            <button class="btn-primary" style="font-size: 0.82rem; padding: 4px 12px; min-height: 30px;" onclick="openCourseDetail('${subjectId}', 'quizzes')">
                🎓 Vào Khóa học
            </button>
        `;
        card.appendChild(titleHeader);

        renderCourseQuizzesContent(card, group);
        container.appendChild(card);
    });
}

function toggleSubfolderAccordion(subjectId, fIdx) {
    const el = document.getElementById(`subfolder-${subjectId}-${fIdx}`);
    if (el) el.classList.toggle('collapsed');
}

function openStartQuizModalById(subjectId, quizIdx) {
    const group = allCategoriesData.find(g => (g.subjectId || '') === subjectId);
    if (!group || !group.quizzes || !group.quizzes[quizIdx]) return;
    const quiz = group.quizzes[quizIdx];
    currentSubjectId = subjectId;
    openStartQuizModal(quiz.file, quiz.title);
}

function openStartQuizModal(filePath, title) {
    pendingQuizFile = filePath;
    pendingQuizTitle = title;
    const titleEl = document.getElementById('start-modal-title');
    if (titleEl) titleEl.innerText = title;
    selectModalQuizMode('instant');
    const modal = document.getElementById('start-quiz-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeStartQuizModal() {
    const modal = document.getElementById('start-quiz-modal');
    if (modal) modal.classList.add('hidden');
}

function selectModalQuizMode(mode) {
    currentQuizMode = mode;
    document.querySelectorAll('#start-quiz-modal .mode-card').forEach(c => c.classList.remove('active'));
    if (mode === 'instant') {
        const inst = document.getElementById('modal-mode-instant');
        if (inst) inst.classList.add('active');
        const rad = document.querySelector('#modal-mode-instant input');
        if (rad) rad.checked = true;
    } else {
        const sub = document.getElementById('modal-mode-submit');
        if (sub) sub.classList.add('active');
        const rad = document.querySelector('#modal-mode-submit input');
        if (rad) rad.checked = true;
    }
}

/* ========================================================
   RANDOM MOCK EXAM & RETAKE WRONG QUESTIONS MODALS
======================================================== */
function openMockModalById(subjectId, folderName = null) {
    activeSubjectGroup = subjectId;
    activeMockFolderName = folderName;
    const titleEl = document.getElementById('mock-modal-title');
    const subtitleEl = document.getElementById('mock-modal-subtitle');
    const group = allCategoriesData.find(g => g.subjectId === subjectId);
    const subjectName = group ? group.category.replace(/^[^\s]+\s+/, '') : 'Môn học';

    if (folderName) {
        if (titleEl) titleEl.innerText = `🎲 Thi thử Phần: ${folderName}`;
        if (subtitleEl) subtitleEl.innerText = `Tự động gộp tất cả câu hỏi thuộc phần "${folderName}" (${subjectName}).`;
    } else {
        if (titleEl) titleEl.innerText = `🎲 Thi thử Ngẫu nhiên: ${subjectName}`;
        if (subtitleEl) subtitleEl.innerText = `Tự động gộp tất cả câu hỏi thuộc môn ${subjectName}.`;
    }

    setMockCount(20);
    setMockTime(15);
    selectMockQuizMode('instant');
    const modal = document.getElementById('mock-exam-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeMockModal() {
    const modal = document.getElementById('mock-exam-modal');
    if (modal) modal.classList.add('hidden');
}

function setMockCount(count) {
    selectedMockCount = count;
    document.querySelectorAll('#count-pills .pill-opt').forEach(p => p.classList.remove('active'));
    const target = document.querySelector(`#count-pills .pill-opt[data-count="${count}"]`);
    if (target) target.classList.add('active');
    const input = document.getElementById('custom-count-input');
    if (input && typeof count === 'number') input.value = '';
}

function setCustomMockCount(val) {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
        selectedMockCount = num;
        document.querySelectorAll('#count-pills .pill-opt').forEach(p => p.classList.remove('active'));
    }
}

function setMockTime(minutes) {
    selectedMockTime = minutes;
    document.querySelectorAll('#timer-pills .pill-opt').forEach(p => p.classList.remove('active'));
    const target = document.querySelector(`#timer-pills .pill-opt[data-time="${minutes}"]`);
    if (target) target.classList.add('active');
    const input = document.getElementById('custom-time-input');
    if (input && minutes > 0) input.value = '';
}

function setCustomMockTime(val) {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
        selectedMockTime = num;
        document.querySelectorAll('#timer-pills .pill-opt').forEach(p => p.classList.remove('active'));
    }
}

function selectMockQuizMode(mode) {
    selectedMockMode = mode;
    currentQuizMode = mode;
    document.querySelectorAll('#mock-exam-modal .mode-card').forEach(c => c.classList.remove('active'));
    if (mode === 'instant') {
        const inst = document.getElementById('mock-mode-instant');
        if (inst) inst.classList.add('active');
    } else {
        const sub = document.getElementById('mock-mode-submit');
        if (sub) sub.classList.add('active');
    }
}

async function executeMockExamEngine() {
    const group = allCategoriesData.find(g => g.subjectId === activeSubjectGroup);
    if (!group || !group.quizzes || group.quizzes.length === 0) {
        alert("Không tìm thấy câu hỏi thuộc môn này!");
        backToConfig();
        return;
    }

    let targetQuizzes = group.quizzes;
    if (activeMockFolderName) {
        targetQuizzes = group.quizzes.filter(q => q.folder === activeMockFolderName);
    }

    let combinedQuestions = [];
    for (const quiz of targetQuizzes) {
        try {
            let rawText = null;
            const base64Str = getEmbeddedQuizContent(quiz.file);
            if (base64Str) {
                const binary = window.atob(base64Str);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                rawText = await decryptQuizArrayBuffer(bytes.buffer);
            } else {
                try {
                    const res = await fetch(quiz.file);
                    const buf = await res.arrayBuffer();
                    rawText = await decryptQuizArrayBuffer(buf);
                } catch(e) {}
            }
            if (rawText) {
                const parsed = parseQuizText(rawText);
                combinedQuestions.push(...parsed);
            }
        } catch (e) {
            console.error("Lỗi đọc tệp thi thử:", quiz.file, e);
        }
    }

    if (combinedQuestions.length === 0) {
        alert("Không thể nạp dữ liệu câu hỏi thi thử. Vui lòng thử lại.");
        backToConfig();
        return;
    }

    for (let i = combinedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedQuestions[i], combinedQuestions[j]] = [combinedQuestions[j], combinedQuestions[i]];
    }

    let finalCount = combinedQuestions.length;
    if (selectedMockCount !== 'all' && typeof selectedMockCount === 'number') {
        finalCount = Math.min(selectedMockCount, combinedQuestions.length);
    }

    currentQuestions = combinedQuestions.slice(0, finalCount);
    currentQuestions.forEach((q, idx) => {
        q.id = String(idx + 1);
        q.userAnswers = [];
        q.userTFAnswers = {};
        q.isGraded = false;
        q.isCorrect = false;
    });

    currentSubjectId = activeSubjectGroup;
    currentQuizMode = selectedMockMode;
    isQuizSubmitted = false;

    const titleBadge = document.getElementById('active-quiz-title');
    if (titleBadge) {
        titleBadge.innerText = activeMockFolderName ? `🎲 Thi thử: ${activeMockFolderName} (${finalCount} câu)` : `🎲 Thi thử Ngẫu nhiên (${finalCount} câu)`;
    }

    renderQuiz();
    updateProgress();

    if (selectedMockTime > 0) {
        startCountdownTimer(selectedMockTime);
    } else {
        const timerBadge = document.getElementById('quiz-timer-badge');
        if (timerBadge) timerBadge.classList.add('hidden');
    }
}

async function startRetakeWrongExamForSubject(subjectId) {
    const subId = subjectId || 'cnxh';
    const wrongBankAll = await getStoredWrongBank();
    const wrongBank = wrongBankAll.filter(b => (b.subjectId || 'cnxh') === subId);
    if (wrongBank.length === 0) {
        alert("Kho câu hỏi sai của môn này đang trống!");
        return;
    }
    pendingRetakeSubjectId = subId;
    const modalInfo = document.getElementById('retake-modal-info');
    if (modalInfo) modalInfo.innerText = `Hiện có ${wrongBank.length} câu hỏi làm sai trong bộ lưu trữ môn này.`;
    selectRetakeQuizMode('submit');
    const modal = document.getElementById('retake-modal');
    if (modal) modal.classList.remove('hidden');
}

function selectRetakeQuizMode(mode) {
    selectedRetakeMode = mode;
    currentQuizMode = mode;
    document.querySelectorAll('#retake-modal .mode-card').forEach(c => c.classList.remove('active'));
    if (mode === 'instant') {
        const inst = document.getElementById('retake-mode-instant');
        if (inst) inst.classList.add('active');
    } else {
        const sub = document.getElementById('retake-mode-submit');
        if (sub) sub.classList.add('active');
    }
}

function closeRetakeModal() {
    const modal = document.getElementById('retake-modal');
    if (modal) modal.classList.add('hidden');
}

async function executeRetakeWrongEngine() {
    currentSubjectId = pendingRetakeSubjectId || 'cnxh';
    const wrongBankAll = await getStoredWrongBank();
    const wrongBank = wrongBankAll.filter(b => (b.subjectId || 'cnxh') === currentSubjectId);
    if (wrongBank.length === 0) {
        alert("Kho câu sai trống!");
        backToConfig();
        return;
    }

    currentQuestions = JSON.parse(JSON.stringify(wrongBank));
    currentQuestions.forEach((q, idx) => {
        q.id = String(idx + 1);
        q.userAnswers = [];
        q.userTFAnswers = {};
        q.isGraded = false;
        q.isCorrect = false;
    });

    currentQuizMode = selectedRetakeMode;
    isQuizSubmitted = false;

    const titleBadge = document.getElementById('active-quiz-title');
    if (titleBadge) titleBadge.innerText = `🔥 Ôn lại ${wrongBank.length} câu sai`;

    renderQuiz();
    updateProgress();

    const timerBadge = document.getElementById('quiz-timer-badge');
    if (timerBadge) timerBadge.classList.add('hidden');
}

/* ========================================================
   QUIZ EXECUTION & GRADING ENGINE
======================================================== */
async function fetchAndLoadQuiz(filePath, title) {
    try {
        let rawText = null;
        const base64Str = getEmbeddedQuizContent(filePath);
        if (base64Str) {
            const binary = window.atob(base64Str);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            rawText = await decryptQuizArrayBuffer(bytes.buffer);
        } else {
            try {
                const res = await fetch(filePath);
                const buf = await res.arrayBuffer();
                rawText = await decryptQuizArrayBuffer(buf);
            } catch(e) {}
        }

        if (rawText) {
            parseAndStartRawText(rawText, title);
        } else {
            alert("Không thể nạp dữ liệu bài thi. Vui lòng thử lại.");
            backToConfig();
        }
    } catch (e) {
        console.error("Lỗi nạp tệp đề thi:", filePath, e);
        alert("Không thể nạp bài trắc nghiệm này.");
        backToConfig();
    }
}

function parseAndStartRawText(rawText, title) {
    const parsed = parseQuizText(rawText);
    if (!parsed || parsed.length === 0) {
        alert("Không tìm thấy câu hỏi hợp lệ nào trong văn bản đề!");
        backToConfig();
        return;
    }

    currentQuestions = parsed;
    isQuizSubmitted = false;

    const titleBadge = document.getElementById('active-quiz-title');
    if (titleBadge) titleBadge.innerText = title;

    const timerBadge = document.getElementById('quiz-timer-badge');
    if (timerBadge) timerBadge.classList.add('hidden');

    renderQuiz();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuiz() {
    const container = document.getElementById('questions-container');
    const sidebarGrid = document.getElementById('sidebar-q-grid');
    if (!container || !sidebarGrid) return;

    container.innerHTML = '';
    sidebarGrid.innerHTML = '';

    currentQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.id = `card-${q.id}`;
        card.className = `question-card ${q.isGraded ? (q.isCorrect ? 'correct' : 'incorrect') : ''}`;

        let typeLabel = "TRẮC NGHIỆM ĐƠN";
        if (q.type === "multiple") typeLabel = "CHỌN NHIỀU ĐÁP ÁN";
        else if (q.type === "truefalse") typeLabel = "ĐÚNG / SAI (ĐỌC KỸ MỆNH ĐỀ)";
        else if (q.type === "fill") typeLabel = "ĐIỀN TỪ / ĐÁP SỐ";

        let html = `
            <div class="question-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="q-num">Câu ${q.id}</span>
                    <span class="q-type-badge">${typeLabel}</span>
                </div>
            </div>
            <div class="question-body">${escapeHTML(q.question)}</div>
        `;

        if (q.type === "truefalse") {
            html += `<div class="tf-options-container">`;
            q.options.forEach(opt => {
                const userChoice = q.userTFAnswers ? q.userTFAnswers[opt.letter] : undefined;
                const isSelectedDung = userChoice === true;
                const isSelectedSai = userChoice === false;
                const isGradedRow = q.isGraded;
                const isThisRowCorrect = userChoice === opt.isDung;

                let rowGradedClass = '';
                if (isGradedRow) {
                    rowGradedClass = isThisRowCorrect ? 'tf-correct tf-graded' : 'tf-incorrect tf-graded';
                }

                html += `
                    <div class="tf-assertion-row ${rowGradedClass}" id="tf-row-${q.id}-${opt.letter}">
                        <div class="tf-assertion-left">
                            <span class="tf-assertion-letter">${opt.letter})</span>
                            <span class="tf-assertion-text">${escapeHTML(opt.text)}</span>
                        </div>
                `;

                if (!isGradedRow) {
                    html += `
                        <div class="tf-toggle-group">
                            <label class="tf-toggle-btn">
                                <input type="radio" name="tf_${q.id}_${opt.letter}" value="dung" ${isSelectedDung ? 'checked' : ''} onchange="handleTFSelection('${q.id}', '${opt.letter}', true)">
                                <span class="tf-toggle-label">Đúng</span>
                            </label>
                            <label class="tf-toggle-btn">
                                <input type="radio" name="tf_${q.id}_${opt.letter}" value="sai" ${isSelectedSai ? 'checked' : ''} onchange="handleTFSelection('${q.id}', '${opt.letter}', false)">
                                <span class="tf-toggle-label">Sai</span>
                            </label>
                        </div>
                    `;
                } else {
                    let userChoicePill = '';
                    if (userChoice === undefined) {
                        userChoicePill = `<span class="tf-result-pill user-wrong">Chưa chọn</span>`;
                    } else if (isThisRowCorrect) {
                        userChoicePill = `<span class="tf-result-pill user-correct">✓ Chọn: ${userChoice ? 'Đúng' : 'Sai'}</span>`;
                    } else {
                        userChoicePill = `<span class="tf-result-pill user-wrong">✕ Chọn: ${userChoice ? 'Đúng' : 'Sai'}</span>`;
                    }

                    const correctKeyPill = `<span class="tf-result-pill correct-key">Đáp án chuẩn: ${opt.isDung ? 'Đúng' : 'Sai'}</span>`;
                    html += `<div class="tf-result-badge-group">${userChoicePill}${correctKeyPill}</div>`;
                }

                html += `</div>`;
            });
            html += `</div>`;
        } else if (q.type === "fill") {
            const currentVal = q.userAnswers[0] || "";
            const isDisabled = q.isGraded ? "disabled" : "";
            html += `
                <div class="fill-container">
                    <input type="text" class="fill-input" id="fill-input-${q.id}" placeholder="Nhập câu trả lời của bạn..." value="${escapeHTML(currentVal)}" ${isDisabled} oninput="handleFillInput('${q.id}')" onkeydown="handleFillKeyPress(event, '${q.id}')">
                </div>
            `;
            if (q.isGraded && !q.isCorrect) {
                html += `<div class="correct-ans-display">💡 Đáp án chuẩn: <strong>${escapeHTML(q.fillAnswer)}</strong></div>`;
            }
        } else {
            html += `<div class="options-grid">`;
            q.options.forEach(opt => {
                const isChecked = q.userAnswers.includes(opt.letter);
                let optClass = "";
                let choiceBadge = "";
                if (q.isGraded) {
                    if (q.correctAnswers.includes(opt.letter)) {
                        optClass = "correct-opt";
                        choiceBadge = isChecked ? `<span class="opt-badge opt-badge-correct">✓ Bạn đã chọn đúng</span>` : `<span class="opt-badge opt-badge-key">★ Đáp án chuẩn</span>`;
                    } else if (isChecked) {
                        optClass = "incorrect-opt";
                        choiceBadge = `<span class="opt-badge opt-badge-wrong">✕ Bạn chọn sai</span>`;
                    }
                }

                const inputType = q.type === "multiple" ? "checkbox" : "radio";
                const changeHandler = q.type === "multiple" ? `onchange="handleMultipleSelection('${q.id}')"` : `onchange="handleSingleSelection('${q.id}', '${opt.letter}')"`;

                html += `
                    <label class="option-item ${optClass}">
                        <input type="${inputType}" name="q_${q.id}" value="${opt.letter}" ${isChecked ? 'checked' : ''} ${q.isGraded ? 'disabled' : ''} ${changeHandler}>
                        <span class="opt-letter">${opt.letter}</span>
                        <span class="opt-text">${escapeHTML(opt.text)}</span>
                        ${choiceBadge}
                    </label>
                `;
            });
            html += `</div>`;
        }

        // Only show "Kiểm tra câu này" button for True/False questions in Instant mode!
        if (currentQuizMode === 'instant' && !q.isGraded && q.type === 'truefalse') {
            html += `
                <div style="margin-top: 16px; text-align: right;">
                    <button class="btn-primary" style="padding: 6px 14px; font-size: 0.85rem;" onclick="gradeIndividualQuestion('${q.id}')">
                        ⚡ Kiểm tra câu này
                    </button>
                </div>
            `;
        }

        if (q.isGraded && q.explanation) {
            html += `
                <div class="explanation-box">
                    <div class="exp-title">💡 Giải thích chi tiết & Quy luật suy luận:</div>
                    <div class="exp-content">${formatExplanationHTML(q.explanation)}</div>
                </div>
            `;
        }

        card.innerHTML = html;
        container.appendChild(card);

        const sidebarBtn = document.createElement('button');
        sidebarBtn.id = `nav-btn-${q.id}`;
        sidebarBtn.className = 'q-nav-btn';
        sidebarBtn.innerText = q.id;
        sidebarBtn.onclick = () => scrollToQuestion(q.id);
        sidebarGrid.appendChild(sidebarBtn);
    });

    updateProgress();
}

function handleSingleSelection(qId, letter) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;
    q.userAnswers = [letter];
    updateProgress();
    if (currentQuizMode === 'instant') {
        gradeIndividualQuestion(qId);
    }
}

function handleMultipleSelection(qId) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;
    setTimeout(() => {
        const checkedBoxes = document.querySelectorAll(`input[name="q_${qId}"]:checked`);
        q.userAnswers = Array.from(checkedBoxes).map(cb => cb.value);
        updateProgress();
    }, 0);
}

function handleFillInput(qId) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;
    const inputVal = document.getElementById(`fill-input-${qId}`).value;
    q.userAnswers = [inputVal];
    updateProgress();
}

function handleFillKeyPress(e, qId) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentQuizMode === 'instant') {
            gradeIndividualQuestion(qId);
        }
    }
}

function handleTFSelection(qId, letter, isDung) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;
    if (!q.userTFAnswers) q.userTFAnswers = {};
    q.userTFAnswers[letter] = isDung;
    q.userAnswers = Object.keys(q.userTFAnswers);
    updateProgress();
}

function gradeIndividualQuestion(qId) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;
    q.isGraded = true;

    if (q.type === "fill") {
        const userVal = normalizeString(q.userAnswers[0]);
        const correctVal = normalizeString(q.fillAnswer);
        q.isCorrect = (userVal !== "" && userVal === correctVal);
    } else if (q.type === "truefalse") {
        let allAssertionsCorrect = true;
        if (!q.options || q.options.length === 0) allAssertionsCorrect = false;
        else {
            q.options.forEach(opt => {
                const userChoice = q.userTFAnswers ? q.userTFAnswers[opt.letter] : undefined;
                if (userChoice !== opt.isDung) allAssertionsCorrect = false;
            });
        }
        q.isCorrect = allAssertionsCorrect;
    } else {
        const userSorted = [...q.userAnswers].sort().join(',');
        const correctSorted = [...(q.correctAnswers || [])].sort().join(',');
        q.isCorrect = (userSorted !== "" && userSorted === correctSorted);
    }

    renderQuiz();
    saveWrongQuestions(currentSubjectId, [q]);
}

function submitFullQuiz() {
    let correctCount = 0;
    currentQuestions.forEach(q => {
        if (!q.isGraded) gradeIndividualQuestion(q.id);
        if (q.isCorrect) correctCount++;
    });

    isQuizSubmitted = true;
    if (timerInterval) clearInterval(timerInterval);

    const total = currentQuestions.length;
    const scoreSummary = document.getElementById('score-summary');
    const finalScore = document.getElementById('final-score');
    const finalDesc = document.getElementById('final-desc');

    if (finalScore) finalScore.innerText = `${correctCount} / ${total}`;
    if (finalDesc) {
        const pct = Math.round((correctCount / total) * 100);
        finalDesc.innerText = `Đạt ${pct}% tổng số điểm (${correctCount} câu đúng trên tổng ${total} câu).`;
    }
    if (scoreSummary) scoreSummary.classList.remove('hidden');

    saveQuizHistoryItem(currentSubjectId, pendingQuizTitle || 'Đề trắc nghiệm', `${correctCount}/${total}`, correctCount, total);
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startCountdownTimer(minutes) {
    if (timerInterval) clearInterval(timerInterval);
    totalSecondsLeft = minutes * 60;
    const timerBadge = document.getElementById('quiz-timer-badge');
    const timerText = document.getElementById('timer-text');

    if (timerBadge) timerBadge.classList.remove('hidden');

    function tick() {
        if (totalSecondsLeft <= 0) {
            clearInterval(timerInterval);
            if (timerText) timerText.innerText = "00:00 - Hết giờ!";
            alert("⏰ Hết thời gian làm bài! Hệ thống tự động nộp bài thi của bạn.");
            submitFullQuiz();
            return;
        }
        const m = Math.floor(totalSecondsLeft / 60).toString().padStart(2, '0');
        const s = (totalSecondsLeft % 60).toString().padStart(2, '0');
        if (timerText) timerText.innerText = `${m}:${s}`;
        totalSecondsLeft--;
    }

    tick();
    timerInterval = setInterval(tick, 1000);
}

function updateProgress() {
    const total = currentQuestions.length;
    let answeredCount = 0;

    currentQuestions.forEach(q => {
        const btn = document.getElementById(`nav-btn-${q.id}`);
        const stateClass = q.isGraded ? (q.isCorrect ? 'correct' : 'incorrect') : (q.userAnswers.length > 0 ? 'answered' : '');
        if (btn) btn.className = `q-nav-btn ${stateClass}`.trim();
        if (q.isGraded || q.userAnswers.length > 0) answeredCount++;
    });

    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    const summaryText = `${answeredCount}/${total} (${percent}%)`;
    const pBadge = document.getElementById('progress-badge');
    if (pBadge) pBadge.innerText = summaryText;
}

function setMobileNavVisibility(visible) {
    const sidebar = document.getElementById('quiz-sidebar');
    if (visible) {
        if (sidebar) sidebar.classList.remove('nav-hidden');
    } else {
        if (sidebar) sidebar.classList.add('nav-hidden');
    }
}

function scrollToQuestion(qId) {
    const card = document.getElementById(`card-${qId}`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('highlight-flash');
    void card.offsetWidth;
    card.classList.add('highlight-flash');
}

function resetQuiz() {
    currentQuestions.forEach(q => {
        q.userAnswers = [];
        q.userTFAnswers = {};
        q.isGraded = false;
        q.isCorrect = false;
    });
    isQuizSubmitted = false;
    const scoreSummary = document.getElementById('score-summary');
    if (scoreSummary) scoreSummary.classList.add('hidden');
    renderQuiz();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (selectedMockTime > 0) {
        startCountdownTimer(selectedMockTime);
    }
}

/* ========================================================
   LAST READ TEXTBOOK STORAGE & FLOATING QUICK READER
======================================================== */
function saveLastReadChapter(chapterObj) {
    try {
        localStorage.setItem('hnue_last_read_chapter', JSON.stringify(chapterObj));
    } catch(e) {}
}

function getLastReadChapter() {
    try {
        const str = localStorage.getItem('hnue_last_read_chapter');
        return str ? JSON.parse(str) : null;
    } catch(e) {
        return null;
    }
}

function toggleQuickTextbookPicker() {
    const modal = document.getElementById('quick-textbook-picker-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        renderQuickTextbookPickerList();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function renderQuickTextbookPickerList() {
    const container = document.getElementById('quick-tb-list-container');
    if (!container) return;
    container.innerHTML = '';

    const tbCategories = allCategoriesData.filter(c => c.type === 'textbook');
    if (!tbCategories || tbCategories.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">Không tìm thấy tệp bài giảng nào.</p>';
        return;
    }

    const lastRead = getLastReadChapter();

    tbCategories.forEach(tbCategory => {
        const subjectGroup = allCategoriesData.find(c => c.subjectId === (tbCategory.subjectId || '').replace('-textbook', ''));
        const subjectTitle = subjectGroup ? subjectGroup.category.replace(/^[^\s]+\s+/, '') : tbCategory.category;

        const subHeader = document.createElement('div');
        subHeader.style.fontWeight = '800';
        subHeader.style.fontSize = '1.05rem';
        subHeader.style.color = '#1e1b4b';
        subHeader.style.margin = '16px 0 8px 0';
        subHeader.style.paddingBottom = '4px';
        subHeader.style.borderBottom = '2px solid #e0e7ff';
        subHeader.innerText = `🎓 Môn: ${subjectTitle}`;
        container.appendChild(subHeader);

        if (tbCategory.volumes) {
            tbCategory.volumes.forEach(vol => {
                const volHeader = document.createElement('div');
                volHeader.style.fontWeight = '700';
                volHeader.style.fontSize = '0.88rem';
                volHeader.style.color = '#4338ca';
                volHeader.style.margin = '8px 0 6px 0';
                volHeader.innerText = vol.volumeTitle;
                container.appendChild(volHeader);

                vol.chapters.forEach(ch => {
                    const isLast = lastRead && lastRead.fileEncPath === ch.file;
                    const item = document.createElement('div');
                    item.className = `preset-card ${isLast ? 'active-last-read' : ''}`;
                    item.style.padding = '10px 14px';
                    item.style.marginBottom = '8px';
                    if (isLast) {
                        item.style.border = '2px solid #6366f1';
                        item.style.background = '#e0e7ff';
                    }
                    item.onclick = () => {
                        document.getElementById('quick-textbook-picker-modal').classList.add('hidden');
                        openTextbookReader(ch.file, ch.title, ch.id, ch.quizId || '');
                    };
                    item.innerHTML = `
                        <div class="preset-card-left">
                            <span style="font-size: 1.3rem;">📖</span>
                            <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b;">
                                ${escapeHTML(ch.title)}
                                ${isLast ? '<span style="font-size:0.75rem; color:#4f46e5; margin-left:6px; font-weight:800;">(Đang đọc)</span>' : ''}
                            </div>
                        </div>
                        <div class="preset-card-right">
                            <span class="preset-badge" style="font-size: 0.78rem; padding: 4px 12px;">Đọc bài giảng</span>
                        </div>
                    `;
                    container.appendChild(item);
                });
            });
        }
    });
}

/* ========================================================
   POP-UP READER FUNCTIONS FOR TEXTBOOKS
======================================================== */
async function openTextbookReader(fileEncPath, title, chapterId, quizId) {
    // If called with no specific file, try opening last read chapter if available!
    if (!fileEncPath) {
        const lastRead = getLastReadChapter();
        if (lastRead && lastRead.fileEncPath) {
            fileEncPath = lastRead.fileEncPath;
            title = lastRead.title;
            chapterId = lastRead.chapterId;
            quizId = lastRead.quizId;
        }
    }

    if (!fileEncPath) {
        toggleQuickTextbookPicker();
        return;
    }

    const modal = document.getElementById('textbook-reader-modal');
    const titleEl = document.getElementById('reader-modal-title');
    const bodyEl = document.getElementById('reader-modal-body');
    const quizBtn = document.getElementById('reader-btn-quiz');

    currentTextbookChapter = { fileEncPath, title, chapterId, quizId };
    saveLastReadChapter(currentTextbookChapter);

    if (titleEl) titleEl.innerText = title;
    if (bodyEl) {
        bodyEl.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">⌛ Đang nạp bài giảng...</div>';
    }
    if (modal) modal.classList.remove('hidden');

    if (quizBtn) {
        if (quizId) {
            quizBtn.classList.remove('hidden');
            quizBtn.onclick = () => {
                closeTextbookReader();
                startQuizForChapter(quizId, title);
            };
        } else {
            quizBtn.classList.add('hidden');
        }
    }

    try {
        let mdText = null;
        const base64Str = getEmbeddedQuizContent(fileEncPath);
        if (base64Str) {
            const binary = window.atob(base64Str);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            mdText = await decryptQuizArrayBuffer(bytes.buffer);
        } else {
            try {
                const response = await fetch(fileEncPath);
                const arrayBuffer = await response.arrayBuffer();
                mdText = await decryptQuizArrayBuffer(arrayBuffer);
            } catch(e) {}
        }

        if (!mdText) {
            bodyEl.innerHTML = '<div style="color: var(--danger); padding: 40px;">❌ Không thể nạp nội dung bài giảng.</div>';
            return;
        }

        const html = renderMarkdownToHtml(mdText);
        bodyEl.innerHTML = html;
        bodyEl.scrollTop = 0;

        const toc = extractTocFromMarkdown(mdText);
        renderReaderToc(toc);

    } catch (e) {
        console.error("Open textbook reader error:", e);
        if (bodyEl) bodyEl.innerHTML = '<div style="color: var(--danger); padding: 40px;">❌ Lỗi đọc tệp bài giảng.</div>';
    }
}

function renderReaderToc(toc) {
    const dropdown = document.getElementById('reader-toc-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    if (!toc || toc.length === 0) {
        dropdown.innerHTML = '<div style="padding: 10px; font-size: 0.82rem; color: #64748b;">Không có mục lục.</div>';
        return;
    }

    toc.forEach(item => {
        const div = document.createElement('div');
        div.className = `reader-toc-item level-${item.level}`;
        div.innerText = item.title;
        div.onclick = () => {
            jumpToTocHeading(item.slug);
            toggleTocDropdown(false);
        };
        dropdown.appendChild(div);
    });
}

function toggleTocDropdown(forceState) {
    const dropdown = document.getElementById('reader-toc-dropdown');
    if (!dropdown) return;
    if (typeof forceState === 'boolean') {
        if (forceState) dropdown.classList.remove('hidden');
        else dropdown.classList.add('hidden');
    } else {
        dropdown.classList.toggle('hidden');
    }
}

function jumpToTocHeading(slug) {
    const heading = document.getElementById(slug);
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function closeTextbookReader() {
    const modal = document.getElementById('textbook-reader-modal');
    if (modal) modal.classList.add('hidden');
    toggleTocDropdown(false);
}

function setTextbookTheme(theme) {
    currentTextbookTheme = theme;
    const bodyEl = document.getElementById('reader-modal-body');
    if (bodyEl) {
        bodyEl.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
        bodyEl.classList.add(`theme-${theme}`);
    }
}

function changeTextbookFontSize(delta) {
    currentTextbookFontSize = Math.min(Math.max(currentTextbookFontSize + delta, 0.85), 1.5);
    const bodyEl = document.getElementById('reader-modal-body');
    if (bodyEl) {
        bodyEl.style.fontSize = `${currentTextbookFontSize}rem`;
    }
}

function startQuizForChapter(quizId, title) {
    for (const cat of allCategoriesData) {
        if (!cat.quizzes) continue;
        const qIdx = cat.quizzes.findIndex(q => q.id === quizId);
        if (qIdx !== -1) {
            openStartQuizModalById(cat.subjectId, qIdx);
            return;
        }
    }
    openStartQuizModal(null, title);
}

/* ========================================================
   DASHBOARD & HISTORY PAGE RENDERERS
======================================================== */
async function renderDashboardHistory() {
    const container = document.getElementById('dashboard-recent-history');
    if (!container) return;

    const history = await getStoredHistory();
    if (!history || history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Chưa có lịch sử làm bài. Hãy chọn một khóa học để bắt đầu ôn tập!</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    history.slice(0, 5).forEach(item => {
        html += `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 700; color: #1e293b;">${escapeHTML(item.title)}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">⏱️ ${item.time}</div>
                </div>
                <div style="text-align: right;">
                    <span style="font-weight: 800; color: #4f46e5; font-size: 1.05rem;">${item.scoreText || item.correctCount + '/' + item.totalCount}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

async function renderHistoryPage() {
    const container = document.getElementById('history-page-content');
    if (!container) return;

    const history = await getStoredHistory();
    const wrongBank = await getStoredWrongBank();

    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 18px; text-align: center;">
                <div style="font-size: 0.85rem; color: #3730a3; font-weight: 700;">TỔNG SỐ LẦN THI</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #1e1b4b; margin-top: 4px;">${history.length}</div>
            </div>
            <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; padding: 18px; text-align: center;">
                <div style="font-size: 0.85rem; color: #991b1b; font-weight: 700;">TỔNG SỐ CÂU HỎI LÀM SAI</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #7f1d1d; margin-top: 4px;">${wrongBank.length}</div>
            </div>
        </div>

        <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 12px; font-weight: 800;">📜 Nhật ký 30 Lần Thi Gần Nhất</h3>
    `;

    if (!history || history.length === 0) {
        html += '<p style="color: var(--text-muted); padding: 20px 0;">Chưa có lịch sử làm bài nào được lưu.</p>';
    } else {
        html += '<div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">';
        history.forEach(item => {
            html += `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; color: #1e293b;">${escapeHTML(item.title)}</div>
                        <div style="font-size: 0.82rem; color: #64748b;">⏱️ Thời gian: ${item.time}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.1rem; font-weight: 800; color: #4f46e5;">${item.scoreText || item.correctCount + '/' + item.totalCount}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

/* ========================================================
   FILE UPLOAD & SAMPLE HANDLERS
======================================================== */
function loadSampleText() {
    const textInput = document.getElementById('text-input');
    if (!textInput) return;
    textInput.value = `Câu 1: Đối tượng nghiên cứu của Giáo dục học là gì?
*A. Quá trình giáo dục con người trong các giai đoạn phát triển xã hội.
B. Các hiện tượng tự nhiên và sinh học của con người.
C. Lịch sử phát triển của các hình thái kinh tế xã hội.
D. Hệ thống chính trị và thể chế nhà nước.
Giải thích: Giáo dục học nghiên cứu bản chất, quy luật và phương pháp của quá trình giáo dục con người.

Câu 2: Nguyên lý giáo dục của Việt Nam hiện nay bao gồm những nội dung nào?
*A. Học đi đôi với hành, giáo dục kết hợp với lao động sản xuất, nhà trường gắn liền với xã hội.
B. Giáo dục thuần túy lý thuyết và coi trọng bằng cấp.
C. Chỉ tập trung giáo dục trong môi trường gia đình.
D. Tách rời nhà trường khỏi thực tiễn đời sống xã hội.
Giải thích: Nguyên lý giáo dục Việt Nam khẳng định học đi đôi với hành, lý luận gắn liền với thực tiễn.`;
}

function clearInput() {
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const fileStatus = document.getElementById('file-status');
    if (textInput) textInput.value = '';
    if (fileInput) fileInput.value = '';
    if (fileStatus) fileStatus.innerText = '📄 Click hoặc kéo thả để chọn tệp câu hỏi trắc nghiệm';
}
