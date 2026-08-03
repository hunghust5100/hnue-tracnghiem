const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const css = fs.readFileSync(path.join(rootDir, 'css/styles.css'), 'utf8');
const quizzesDataJs = fs.existsSync(path.join(rootDir, 'js/quizzes-data.js')) ? fs.readFileSync(path.join(rootDir, 'js/quizzes-data.js'), 'utf8') : '';
const cryptoJs = fs.readFileSync(path.join(rootDir, 'js/crypto.js'), 'utf8');
const storageJs = fs.readFileSync(path.join(rootDir, 'js/storage.js'), 'utf8');
const parserJs = fs.readFileSync(path.join(rootDir, 'js/parser.js'), 'utf8');
let appJs = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf8');

if (fs.existsSync(path.join(rootDir, 'quizzes.json'))) {
    const quizzesJsonText = fs.readFileSync(path.join(rootDir, 'quizzes.json'), 'utf8');
    appJs = appJs.replace(/const defaultCategories = \[[\s\S]*?\n\];/m, `const defaultCategories = ${quizzesJsonText};`);
}

const logoB64 = fs.existsSync(path.join(rootDir, 'hnue-logo.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'hnue-logo.png')).toString('base64') : 'hnue-logo.png';
const qrB64 = fs.existsSync(path.join(rootDir, 'vietqr-tpbank.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'vietqr-tpbank.png')).toString('base64') : 'vietqr-tpbank.png';

function generateHeaderHTML(activePage) {
    return `
    <header>
        <div class="header-brand">
            <img src="${logoB64}" alt="Logo HNUE" class="header-logo" onclick="window.location.href='index.html'">
            <div class="header-text-group">
                <span class="header-univ-tag">🎓 Trường Đại học Sư phạm Hà Nội - HNUE</span>
                <h1 onclick="window.location.href='index.html'">Trắc nghiệm & Giáo trình HNUE</h1>
            </div>
        </div>
        <p class="header-subtag">Hệ thống Ôn tập & Thi thử Trắc nghiệm Thông minh</p>

        <nav class="app-main-nav">
            <a href="index.html" class="nav-item ${activePage === 'index' ? 'active' : ''}">
                <span class="nav-icon">🏠</span> Trang Chủ
            </a>
            <a href="courses.html" class="nav-item ${activePage === 'courses' ? 'active' : ''}">
                <span class="nav-icon">📚</span> Khóa học & Giáo trình
            </a>
            <a href="quizzes.html" class="nav-item ${activePage === 'quizzes' ? 'active' : ''}">
                <span class="nav-icon">📝</span> Ngân hàng Đề thi
            </a>
            <a href="history.html" class="nav-item ${activePage === 'history' ? 'active' : ''}">
                <span class="nav-icon">📊</span> Lịch sử & Thống kê
            </a>
        </nav>
    </header>
    `;
}

function generateFooterHTML() {
    return `
    <footer style="margin-top: 40px; text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid rgba(99,102,241,0.15);">
        <p>© 2026 Hệ thống Trắc nghiệm & Giáo trình HNUE. Trường Đại học Sư phạm Hà Nội.</p>
        <p style="margin-top: 6px;">Phát triển phục vụ Sinh viên & Học viên Ôn tập các môn Lý luận Chính trị & Giáo dục học.</p>
    </footer>
    `;
}

function buildHTMLPage(pageName, activeNav, bodyContent) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName} - Trắc nghiệm & Giáo trình HNUE</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body class="has-mobile-nav page-${activeNav}">

<div class="container">
    ${generateHeaderHTML(activeNav)}
    ${bodyContent}
    ${generateFooterHTML()}
</div>

<script>
${quizzesDataJs}
${cryptoJs}
${storageJs}
${parserJs}
${appJs}
</script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initMPAPage === 'function') {
        initMPAPage();
    }
});
</script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. INDEX.HTML (Home Dashboard)
// -------------------------------------------------------------
const indexBody = `
    <!-- Hero Dashboard Banner -->
    <div class="card" style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #e0e7ff 100%); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
                <h2 style="font-size: 1.5rem; color: #1e1b4b; margin-bottom: 8px;">👋 Chào mừng bạn đến với Cổng Ôn tập HNUE</h2>
                <p style="color: #475569; font-size: 0.95rem; max-width: 650px;">
                    Hệ thống tích hợp đầy đủ <strong>Giáo trình Bài giảng chuẩn định dạng Markdown</strong> và <strong>Ngân hàng Đề thi Trắc nghiệm phân loại cao</strong> dành cho Sinh viên Sư phạm.
                </p>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn-primary" onclick="window.location.href='courses.html'">📚 Đọc Giáo trình ngay</button>
                <button class="btn-secondary" onclick="window.location.href='quizzes.html'">🚀 Làm Đề thi thử</button>
            </div>
        </div>
    </div>

    <!-- Quick Subject Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 28px;">
        <!-- CNXH Subject Card -->
        <div class="card" style="border-top: 4px solid #ef4444;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                <span style="font-size: 2rem;">📕</span>
                <div>
                    <h3 style="font-size: 1.15rem; color: #1e293b;">Chủ nghĩa Xã hội Khoa học</h3>
                    <span style="font-size: 0.8rem; background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 50px; font-weight: 700;">7 Chương • 27 Bộ đề</span>
                </div>
            </div>
            <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 16px; line-height: 1.5;">
                Bộ câu hỏi trắc nghiệm chất lượng cao và giáo trình môn Chủ nghĩa Xã hội Khoa học Mác - Lênin.
            </p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; font-size: 0.85rem;" onclick="window.location.href='quizzes.html?subject=cnxh'">📝 Vào làm Đề thi</button>
            </div>
        </div>

        <!-- Giáo dục học Subject Card -->
        <div class="card" style="border-top: 4px solid #6366f1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                <span style="font-size: 2rem;">🎓</span>
                <div>
                    <h3 style="font-size: 1.15rem; color: #1e293b;">Giáo dục học Đại cương</h3>
                    <span style="font-size: 0.8rem; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 50px; font-weight: 700;">19 Chương • Tập 1 & 2</span>
                </div>
            </div>
            <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 16px; line-height: 1.5;">
                Đầy đủ 19 Chương bài giảng Giáo trình Markdown và Ngân hàng câu hỏi trắc nghiệm cơ bản & mới.
            </p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="flex: 1; font-size: 0.85rem;" onclick="window.location.href='courses.html'">📚 Đọc Bài giảng</button>
                <button class="btn-secondary" style="flex: 1; font-size: 0.85rem;" onclick="window.location.href='quizzes.html?subject=gdh'">📝 Đề trắc nghiệm</button>
            </div>
        </div>
    </div>

    <!-- Recent Activity Dashboard -->
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div class="card-title" style="margin-bottom: 0;">📊 Tiến độ & Lịch sử học tập gần đây</div>
            <a href="history.html" style="font-size: 0.88rem; font-weight: 700; color: var(--primary); text-decoration: none;">Xem tất cả lịch sử ➔</a>
        </div>
        <div id="dashboard-recent-history" style="font-size: 0.9rem; color: var(--text-muted);">
            ⌛ Đang tải dữ liệu tiến độ...
        </div>
    </div>
`;

// -------------------------------------------------------------
// 2. COURSES.HTML (Khóa học & Giáo trình)
// -------------------------------------------------------------
const coursesBody = `
    <div class="card">
        <div class="card-title">📚 Danh mục Giáo trình & Bài giảng điện tử (Markdown)</div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
            Đọc giáo trình trực quan, tra cứu mục lục thông minh và mở bài thi trắc nghiệm luyện tập ngay lập tức.
        </p>
        
        <div id="textbook-categories-container"></div>
    </div>

    <!-- Textbook Reader Modal -->
    <div class="reader-modal-overlay hidden" id="textbook-reader-modal">
        <div class="reader-modal-card">
            <div class="reader-header">
                <div class="reader-title-area">
                    <span style="font-size: 1.2rem;">📖</span>
                    <div class="reader-chapter-title" id="reader-modal-title">Tiêu đề bài giảng</div>
                </div>
                <div class="reader-toolbar">
                    <div class="reader-toc-wrapper">
                        <button class="reader-tool-btn" onclick="toggleTocDropdown()">
                            📋 Mục lục
                        </button>
                        <div class="reader-toc-dropdown hidden" id="reader-toc-dropdown"></div>
                    </div>
                    <button class="reader-tool-btn" onclick="changeTextbookFontSize(-0.1)">A-</button>
                    <button class="reader-tool-btn" onclick="changeTextbookFontSize(0.1)">A+</button>
                    <button class="reader-tool-btn" onclick="setTextbookTheme('light')" title="Giao diện Sáng">☀️</button>
                    <button class="reader-tool-btn" onclick="setTextbookTheme('sepia')" title="Giao diện Vàng kem">📜</button>
                    <button class="reader-tool-btn" onclick="setTextbookTheme('dark')" title="Giao diện Tối">🌙</button>
                    <button class="reader-tool-btn" onclick="closeTextbookReader()" style="color: var(--danger); font-weight: 800;">✕</button>
                </div>
            </div>
            <div class="reader-body theme-light" id="reader-modal-body"></div>
            <div class="reader-footer">
                <button class="btn-secondary" onclick="closeTextbookReader()">Trở về</button>
                <button class="btn-primary" id="reader-btn-quiz">🚀 Làm bài trắc nghiệm Chương này</button>
            </div>
        </div>
    </div>
`;

// -------------------------------------------------------------
// 3. QUIZZES.HTML (Ngân hàng Đề thi)
// -------------------------------------------------------------
const quizzesBody = `
    <div class="card" id="input-card">
        <div class="card-title">📝 Danh mục Môn học & Đề thi Trắc nghiệm</div>
        
        <div id="preset-categories-container"></div>

        <div id="custom-upload-section">
            <div class="section-label" style="margin-top: 24px;">📁 Tự nhập hoặc upload file đề riêng khác:</div>
            <div class="file-upload-wrapper" onclick="document.getElementById('file-input').click()">
                <p id="file-status">📄 Kéo thả hoặc click để chọn file cấu trúc .txt</p>
                <input type="file" id="file-input" accept=".txt">
            </div>

            <div class="input-group">
                <textarea id="text-input" placeholder="Nhập hoặc dán văn bản raw câu hỏi vào đây..."></textarea>
            </div>

            <div class="btn-container">
                <button class="btn-primary" onclick="openStartQuizModal(null, 'Đề nhập tay / Raw text')">Bắt đầu làm bài</button>
                <button class="btn-secondary" onclick="loadSampleText()">Sử dụng đề mẫu</button>
                <button class="btn-secondary" onclick="clearInput()">Xóa</button>
            </div>
        </div>
    </div>

    <!-- Modal for Selecting Quiz Mode -->
    <div class="modal-overlay hidden" id="start-quiz-modal">
        <div class="modal-card">
            <div class="modal-title" id="start-modal-title">📖 Xác nhận Bài Trắc nghiệm</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 18px;" id="start-modal-desc">
                Vui lòng chọn chế độ làm bài trước khi bắt đầu.
            </p>
            <div class="form-group">
                <label class="form-label">⚙️ Chọn Chế độ Làm bài:</label>
                <div class="mode-grid">
                    <label class="mode-card active" id="modal-mode-instant" onclick="selectModalQuizMode('instant')">
                        <input type="radio" name="modal_quiz_mode" value="instant" checked>
                        <div class="mode-icon">⚡</div>
                        <div>
                            <div class="mode-title">Phản hồi tức thì</div>
                            <div class="mode-desc">Chấm điểm & xem giải thích ngay sau khi chọn đáp án từng câu</div>
                        </div>
                    </label>
                    <label class="mode-card" id="modal-mode-submit" onclick="selectModalQuizMode('submit')">
                        <input type="radio" name="modal_quiz_mode" value="submit">
                        <div class="mode-icon">📋</div>
                        <div>
                            <div class="mode-title">Nộp bài mới xem kết quả</div>
                            <div class="mode-desc">Làm toàn bộ bài thi; chấm điểm & xem giải thích sau khi Nộp bài</div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="btn-container" style="margin-top: 20px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="closeStartQuizModal()">Hủy</button>
                <button class="btn-primary" onclick="confirmAndStartQuiz()">🚀 Bắt đầu ngay</button>
            </div>
        </div>
    </div>

    <!-- Modal for Random Mock Exam Configuration -->
    <div class="modal-overlay hidden" id="mock-exam-modal">
        <div class="modal-card">
            <div class="modal-title" id="mock-modal-title">🎲 Cấu hình Thi thử Ngẫu nhiên</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;" id="mock-modal-subtitle">
                Tự động gộp tất cả câu hỏi thuộc môn học.
            </p>
            <div class="form-group">
                <label class="form-label">🔢 Chọn số lượng câu hỏi:</label>
                <div class="option-pills" id="count-pills">
                    <span class="pill-opt" data-count="10" onclick="setMockCount(10)">10 câu</span>
                    <span class="pill-opt active" data-count="20" onclick="setMockCount(20)">20 câu</span>
                    <span class="pill-opt" data-count="30" onclick="setMockCount(30)">30 câu</span>
                    <span class="pill-opt" data-count="40" onclick="setMockCount(40)">40 câu</span>
                    <span class="pill-opt" data-count="all" onclick="setMockCount('all')">Tất cả câu</span>
                </div>
                <input type="number" id="custom-count-input" class="custom-num-input" placeholder="Hoặc nhập số lượng câu tùy ý..." min="1" oninput="setCustomMockCount(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⏱️ Chọn thời gian làm bài (Phút):</label>
                <div class="option-pills" id="timer-pills">
                    <span class="pill-opt" data-time="10" onclick="setMockTime(10)">10 phút</span>
                    <span class="pill-opt active" data-time="15" onclick="setMockTime(15)">15 phút</span>
                    <span class="pill-opt" data-time="30" onclick="setMockTime(30)">30 phút</span>
                    <span class="pill-opt" data-time="45" onclick="setMockTime(45)">45 phút</span>
                    <span class="pill-opt" data-time="0" onclick="setMockTime(0)">Không giới hạn</span>
                </div>
                <input type="number" id="custom-time-input" class="custom-num-input" placeholder="Hoặc nhập số phút tùy ý..." min="0" oninput="setCustomMockTime(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⚙️ Chế độ làm bài:</label>
                <div class="mode-grid">
                    <label class="mode-card active" id="mock-mode-instant" onclick="selectMockQuizMode('instant')">
                        <input type="radio" name="mock_quiz_mode" value="instant" checked>
                        <div class="mode-icon">⚡</div>
                        <div>
                            <div class="mode-title">Phản hồi tức thì</div>
                            <div class="mode-desc">Chấm điểm ngay từng câu trong quá trình làm</div>
                        </div>
                    </label>
                    <label class="mode-card" id="mock-mode-submit" onclick="selectMockQuizMode('submit')">
                        <input type="radio" name="mock_quiz_mode" value="submit">
                        <div class="mode-icon">📋</div>
                        <div>
                            <div class="mode-title">Nộp bài mới xem kết quả</div>
                            <div class="mode-desc">Làm toàn bộ bài thi; tính thời gian & chấm điểm sau khi nộp</div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="btn-container" style="margin-top: 24px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="closeMockModal()">Hủy</button>
                <button class="btn-primary" onclick="startRandomMockExam()">🚀 Bắt đầu Thi thử</button>
            </div>
        </div>
    </div>

    <!-- Retake Wrong Questions Modal -->
    <div class="modal-overlay hidden" id="retake-modal">
        <div class="modal-card" style="max-width: 480px;">
            <div class="modal-title">🔥 Ôn lại câu sai</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;" id="retake-modal-info">Luyện lại các câu đã làm sai.</p>
            <div class="form-group">
                <label class="form-label">⚙️ Chế độ làm bài:</label>
                <div class="mode-grid">
                    <label class="mode-card active" id="retake-mode-submit" onclick="selectRetakeQuizMode('submit')">
                        <input type="radio" name="retake_quiz_mode" value="submit" checked>
                        <div class="mode-icon">📋</div>
                        <div>
                            <div class="mode-title">Nộp bài mới xem kết quả</div>
                            <div class="mode-desc">Làm toàn bộ rồi nộp bài & chấm điểm</div>
                        </div>
                    </label>
                    <label class="mode-card" id="retake-mode-instant" onclick="selectRetakeQuizMode('instant')">
                        <input type="radio" name="retake_quiz_mode" value="instant">
                        <div class="mode-icon">⚡</div>
                        <div>
                            <div class="mode-title">Phản hồi tức thì</div>
                            <div class="mode-desc">Chấm điểm ngay từng câu trong quá trình làm</div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="btn-container" style="margin-top: 24px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="closeRetakeModal()">Hủy</button>
                <button class="btn-primary" onclick="startRetakeQuizNow()">🚀 Bắt đầu ngay</button>
            </div>
        </div>
    </div>
`;

// -------------------------------------------------------------
// 4. QUIZ-ROOM.HTML (Phòng thi tập trung)
// -------------------------------------------------------------
const quizRoomBody = `
    <!-- Quiz Interface (Active Room) -->
    <div id="quiz-app">
        <div class="quiz-top-bar">
            <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="backToConfig()">
                    ⬅️ Thoát phòng thi
                </button>
                <div class="quiz-title-badge" id="active-quiz-title">Tên Đề thi</div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="timer-badge hidden" id="quiz-timer-badge">
                    ⏱️ <span id="timer-text">15:00</span>
                </div>
                <div class="progress-badge" id="progress-badge">0/0 (0%)</div>
            </div>
        </div>

        <div class="quiz-layout">
            <!-- Questions List Area -->
            <div class="quiz-main-content">
                <div id="score-summary" class="score-summary-card hidden">
                    <div class="score-title">🎉 KẾT QUẢ BÀI THI</div>
                    <div class="score-number" id="final-score">0 / 10</div>
                    <div class="score-desc" id="final-desc">Hoàn thành bài trắc nghiệm!</div>
                    <div class="btn-container" style="justify-content: center; margin-top: 14px;">
                        <button class="btn-primary" onclick="resetQuiz()">🔄 Làm lại đề này</button>
                        <button class="btn-secondary" onclick="backToConfig()">📋 Chọn đề khác</button>
                    </div>
                </div>

                <div id="questions-container"></div>

                <div class="quiz-bottom-actions" style="margin-top: 24px;">
                    <button class="btn-success" id="btn-submit-quiz" onclick="submitFullQuiz()">
                        📋 Nộp bài & Chấm điểm
                    </button>
                </div>
            </div>

            <!-- Quiz Navigation Sidebar (Desktop) -->
            <div class="quiz-sidebar" id="quiz-sidebar">
                <div class="sidebar-title">Danh sách câu hỏi</div>
                <div class="q-grid-nav" id="sidebar-q-grid"></div>
                <div style="margin-top: 18px;">
                    <button class="btn-secondary" style="width: 100%; font-size: 0.85rem;" onclick="resetQuiz()">
                        🔄 Làm lại từ đầu
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

// -------------------------------------------------------------
// 5. HISTORY.HTML (Lịch sử & Thống kê)
// -------------------------------------------------------------
const historyBody = `
    <div class="card">
        <div class="card-title">📊 Lịch sử Làm bài & Thống kê Học tập</div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
            Theo dõi điểm số 30 bài thi gần nhất và quản lý kho các câu hỏi làm sai theo môn.
        </p>

        <div id="history-page-content">
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">⌛ Đang nạp dữ liệu thống kê...</div>
        </div>
    </div>
`;

// Build and output all 5 HTML files
console.log('--- START BUILDING MULTI-PAGE APPLICATION (MPA) ---');

fs.writeFileSync(path.join(rootDir, 'index.html'), buildHTMLPage('Trang Chủ', 'index', indexBody), 'utf8');
console.log('Build index.html (Dashboard) successfully!');

fs.writeFileSync(path.join(rootDir, 'courses.html'), buildHTMLPage('Khóa học & Giáo trình', 'courses', coursesBody), 'utf8');
console.log('Build courses.html (Textbooks) successfully!');

fs.writeFileSync(path.join(rootDir, 'quizzes.html'), buildHTMLPage('Ngân hàng Đề thi', 'quizzes', quizzesBody), 'utf8');
console.log('Build quizzes.html (Quiz Bank) successfully!');

fs.writeFileSync(path.join(rootDir, 'quiz-room.html'), buildHTMLPage('Phòng Thi Tập Trung', 'quizzes', quizRoomBody), 'utf8');
console.log('Build quiz-room.html (Quiz Room) successfully!');

fs.writeFileSync(path.join(rootDir, 'history.html'), buildHTMLPage('Lịch sử & Thống kê', 'history', historyBody), 'utf8');
console.log('Build history.html (Analytics) successfully!');

console.log('--- ALL MULTI-PAGE HTML FILES BUILT SUCCESSFULLY ---');
