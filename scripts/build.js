const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const css = fs.readFileSync(path.join(rootDir, 'css/styles.css'), 'utf8');
const quizzesDataJs = fs.existsSync(path.join(rootDir, 'js/quizzes-data.js')) ? fs.readFileSync(path.join(rootDir, 'js/quizzes-data.js'), 'utf8') : '';
const cryptoJs = fs.readFileSync(path.join(rootDir, 'js/crypto.js'), 'utf8');
const storageJs = fs.readFileSync(path.join(rootDir, 'js/storage.js'), 'utf8');
const parserJs = fs.readFileSync(path.join(rootDir, 'js/parser.js'), 'utf8');
let appJs = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf8');

if (fs.existsSync(path.join(rootDir, 'data/quizzes.json'))) {
    const quizzesJsonText = fs.readFileSync(path.join(rootDir, 'data/quizzes.json'), 'utf8');
    appJs = appJs.replace(/const defaultCategories = \[[\s\S]*?\n\];/m, `const defaultCategories = ${quizzesJsonText};`);
}

const logoB64 = fs.existsSync(path.join(rootDir, 'assets/hnue-logo.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'assets/hnue-logo.png')).toString('base64') : 'hnue-logo.png';
const qrB64 = fs.existsSync(path.join(rootDir, 'assets/vietqr-tpbank.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'assets/vietqr-tpbank.png')).toString('base64') : 'assets/vietqr-tpbank.png';

function generateHeaderHTML(activeView = 'home') {
    return `
    <header class="app-header-compact">
        <div class="header-left-group">
            <button class="sidebar-toggle-btn" onclick="toggleAppSidebar()">
                <span>☰</span> Menu
            </button>

            <div class="header-brand" style="margin-bottom: 0; padding: 0;">
                <img src="${logoB64}" alt="Logo HNUE" class="header-logo" style="width: 38px; height: 38px;" onclick="window.location.href='index.html'">
                <div class="header-text-group">
                    <span class="header-univ-tag" style="font-size: 0.72rem;">🎓 Trường Đại học Sư phạm Hà Nội - HNUE</span>
                    <h1 style="font-size: 1.1rem; margin: 0;" onclick="window.location.href='index.html'">Cổng Khóa học & Ôn thi Trắc nghiệm HNUE</h1>
                </div>
            </div>
        </div>
    </header>
    `;
}

function generateFooterHTML() {
    return `
    <footer class="app-footer-compact">
        <div>
            <span>© 2026 Cổng Khóa học & Ôn thi Trắc nghiệm. Trường Đại học Sư phạm Hà Nội (HNUE).</span>
            <span style="color: #94a3b8; margin-left: 8px;">Tác giả: <strong>Nguyễn Khánh Hưng</strong></span>
        </div>
        <div class="footer-donation-inline">
            <span>💖 Ủng hộ Tác giả: <strong>TPBank 52403022005</strong> (Nguyễn Khánh Hưng)</span>
            <button class="footer-btn-copy" onclick="copyAuthorAccount('52403022005')">📋 Sao chép STK</button>
            <button class="footer-btn-copy" style="background: #6366f1; color: #fff;" onclick="openAuthorQrModal()">🖼️ Quét mã QR</button>
        </div>
    </footer>
    `;
}

function generateModalsHTML() {
    return `
    <!-- Author QR Donation Modal -->
    <div class="modal-overlay hidden" id="author-qr-modal">
        <div class="modal-card" style="max-width: 380px; text-align: center;">
            <div class="modal-title">💖 Ủng hộ Tác giả Nguyễn Khánh Hưng</div>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px;">
                Quét mã QR bằng App Ngân hàng bất kỳ để ủng hộ tác giả ly cà phê duy trì hệ thống nhé!
            </p>
            <div style="margin-bottom: 14px;">
                <img src="${qrB64}" alt="Mã QR TPBank Nguyễn Khánh Hưng" style="width: 220px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #1e1b4b; margin-bottom: 14px;">
                STK: <span style="color: #4f46e5;">52403022005</span> (TPBank)<br>
                Chủ TK: NGUYỄN KHÁNH HƯNG
            </div>
            <div class="btn-container" style="justify-content: center;">
                <button class="btn-primary" onclick="copyAuthorAccount('52403022005')">📋 Sao chép STK</button>
                <button class="btn-secondary" onclick="closeAuthorQrModal()">Đóng</button>
            </div>
        </div>
    </div>

    <!-- Start Quiz Modal -->
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
                            <div class="mode-desc">Xem đáp án & giải thích ngay sau khi chọn từng câu</div>
                        </div>
                    </label>
                    <label class="mode-card" id="modal-mode-submit" onclick="selectModalQuizMode('submit')">
                        <input type="radio" name="modal_quiz_mode" value="submit">
                        <div class="mode-icon">📋</div>
                        <div>
                            <div class="mode-title">Nộp bài mới xem kết quả</div>
                            <div class="mode-desc">Làm toàn bộ bài thi; xem kết quả sau khi bấm Nộp bài</div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="btn-container" style="margin-top: 20px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="closeStartQuizModal()">Hủy</button>
                <button class="btn-primary" onclick="confirmAndStartQuiz()">🚀 Bắt đầu làm bài</button>
            </div>
        </div>
    </div>

    <!-- Random Mock Exam Modal -->
    <div class="modal-overlay hidden" id="mock-exam-modal">
        <div class="modal-card">
            <div class="modal-title" id="mock-modal-title">🎲 Cấu hình Thi thử Ngẫu nhiên</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;" id="mock-modal-subtitle">
                Tự động gộp tất cả câu hỏi thuộc môn học.
            </p>
            <div class="form-group">
                <label class="form-label">🎯 Số lượng câu hỏi thi thử:</label>
                <div class="option-pills" id="count-pills">
                    <span class="pill-opt active" data-count="20" onclick="setMockCount(20)">20 câu</span>
                    <span class="pill-opt" data-count="30" onclick="setMockCount(30)">30 câu</span>
                    <span class="pill-opt" data-count="40" onclick="setMockCount(40)">40 câu</span>
                    <span class="pill-opt" data-count="50" onclick="setMockCount(50)">50 câu</span>
                    <span class="pill-opt" data-count="all" onclick="setMockCount('all')">Tất cả câu</span>
                </div>
                <input type="number" class="custom-num-input" id="custom-count-input" placeholder="Hoặc nhập số câu tùy chọn..." oninput="setCustomMockCount(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⏱️ Thời gian đếm ngược (Phút):</label>
                <div class="option-pills" id="timer-pills">
                    <span class="pill-opt active" data-time="15" onclick="setMockTime(15)">15 phút</span>
                    <span class="pill-opt" data-time="20" onclick="setMockTime(20)">20 phút</span>
                    <span class="pill-opt" data-time="30" onclick="setMockTime(30)">30 phút</span>
                    <span class="pill-opt" data-time="45" onclick="setMockTime(45)">45 phút</span>
                    <span class="pill-opt" data-time="60" onclick="setMockTime(60)">60 phút</span>
                    <span class="pill-opt" data-time="0" onclick="setMockTime(0)">Không giới hạn</span>
                </div>
                <input type="number" class="custom-num-input" id="custom-time-input" placeholder="Hoặc nhập số phút tùy chọn..." oninput="setCustomMockTime(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⚙️ Chế độ làm bài thi thử:</label>
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
                            <div class="mode-desc">Tính thời gian & xem kết quả sau khi nộp bài</div>
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
                <button class="btn-primary" onclick="confirmRetakeWrongExam()">🚀 Bắt đầu ngay</button>
            </div>
        </div>
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
                    <button class="reader-tool-btn" onclick="toggleQuickTextbookPicker()" style="background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; font-weight: 700;">📚 Danh sách bài giảng</button>
                    <div class="reader-toc-wrapper">
                        <button class="reader-tool-btn" onclick="toggleTocDropdown()">📋 Mục lục</button>
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
                <button class="btn-secondary" onclick="closeTextbookReader()">Đóng bài giảng</button>
                <button class="btn-primary" id="reader-btn-quiz">🚀 Làm bài trắc nghiệm Chương này</button>
            </div>
        </div>
    </div>
    `;
}

function buildPageHTML(pageName, bodyContent) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cổng Khóa học & Trắc nghiệm HNUE - Đại học Sư phạm Hà Nội</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body>

<div class="container">
    ${generateHeaderHTML(pageName)}

    <div class="app-layout-wrapper">
        <aside class="app-sidebar-panel" id="app-sidebar-panel">
            <div class="sidebar-nav-title">📌 Bảng điều hướng</div>
            <nav class="sidebar-nav-list">
                <a href="index.html" class="sidebar-nav-item ${pageName === 'home' ? 'active' : ''}">
                    <span style="font-size: 1.1rem;">🏠</span> Trang Chủ
                </a>
                <a href="courses.html" class="sidebar-nav-item ${pageName === 'courses' ? 'active' : ''}">
                    <span style="font-size: 1.1rem;">📚</span> Danh mục Khóa học
                </a>
                <a href="quizzes.html" class="sidebar-nav-item ${pageName === 'quizzes' ? 'active' : ''}">
                    <span style="font-size: 1.1rem;">📝</span> Ngân hàng Đề thi
                </a>
                <a href="history.html" class="sidebar-nav-item ${pageName === 'history' ? 'active' : ''}">
                    <span style="font-size: 1.1rem;">📊</span> Lịch sử & Thống kê
                </a>
            </nav>

            <div class="sidebar-widget" style="margin-top: 10px;">
                <div class="sidebar-widget-title">⚡ Phím tắt nhanh</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 10px; text-align: left;" onclick="openMockModalById('cnxh')">
                        🎲 Thi thử CNXH
                    </button>
                    <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 10px; text-align: left;" onclick="openMockModalById('gdh')">
                        🎲 Thi thử Giáo dục học
                    </button>
                    <button class="btn-secondary" style="font-size: 0.82rem; padding: 8px 10px; text-align: left;" onclick="openTextbookReader()">
                        📖 Bài giảng đang đọc
                    </button>
                </div>
            </div>
        </aside>

        <main class="app-content-panel" id="app-content-panel">
            ${bodyContent}
        </main>
    </div>

    ${generateModalsHTML()}

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
    if (typeof initPageFromURL === 'function') {
        initPageFromURL('${pageName}');
    }
});
</script>
</body>
</html>`;
}

function generateModalsHTML() {
    return `
    <!-- Start Quiz Modal -->
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
                            <div class="mode-desc">Xem đáp án & giải thích ngay sau khi chọn từng câu</div>
                        </div>
                    </label>
                    <label class="mode-card" id="modal-mode-submit" onclick="selectModalQuizMode('submit')">
                        <input type="radio" name="modal_quiz_mode" value="submit">
                        <div class="mode-icon">📋</div>
                        <div>
                            <div class="mode-title">Nộp bài mới xem kết quả</div>
                            <div class="mode-desc">Làm toàn bộ bài thi; xem kết quả sau khi bấm Nộp bài</div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="btn-container" style="margin-top: 20px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="closeStartQuizModal()">Hủy</button>
                <button class="btn-primary" onclick="confirmAndStartQuiz()">🚀 Bắt đầu làm bài</button>
            </div>
        </div>
    </div>

    <!-- Random Mock Exam Modal -->
    <div class="modal-overlay hidden" id="mock-exam-modal">
        <div class="modal-card">
            <div class="modal-title" id="mock-modal-title">🎲 Cấu hình Thi thử Ngẫu nhiên</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;" id="mock-modal-subtitle">
                Tự động gộp tất cả câu hỏi thuộc môn học.
            </p>
            <div class="form-group">
                <label class="form-label">🎯 Số lượng câu hỏi thi thử:</label>
                <div class="option-pills" id="count-pills">
                    <span class="pill-opt active" data-count="20" onclick="setMockCount(20)">20 câu</span>
                    <span class="pill-opt" data-count="30" onclick="setMockCount(30)">30 câu</span>
                    <span class="pill-opt" data-count="40" onclick="setMockCount(40)">40 câu</span>
                    <span class="pill-opt" data-count="50" onclick="setMockCount(50)">50 câu</span>
                    <span class="pill-opt" data-count="all" onclick="setMockCount('all')">Tất cả câu</span>
                </div>
                <input type="number" class="custom-num-input" id="custom-count-input" placeholder="Hoặc nhập số câu tùy chọn..." oninput="setCustomMockCount(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⏱️ Thời gian đếm ngược (Phút):</label>
                <div class="option-pills" id="timer-pills">
                    <span class="pill-opt active" data-time="15" onclick="setMockTime(15)">15 phút</span>
                    <span class="pill-opt" data-time="20" onclick="setMockTime(20)">20 phút</span>
                    <span class="pill-opt" data-time="30" onclick="setMockTime(30)">30 phút</span>
                    <span class="pill-opt" data-time="45" onclick="setMockTime(45)">45 phút</span>
                    <span class="pill-opt" data-time="60" onclick="setMockTime(60)">60 phút</span>
                    <span class="pill-opt" data-time="0" onclick="setMockTime(0)">Không giới hạn</span>
                </div>
                <input type="number" class="custom-num-input" id="custom-time-input" placeholder="Hoặc nhập số phút tùy chọn..." oninput="setCustomMockTime(this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">⚙️ Chế độ làm bài thi thử:</label>
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
                            <div class="mode-desc">Tính thời gian & xem kết quả sau khi nộp bài</div>
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
                <button class="btn-primary" onclick="confirmRetakeWrongExam()">🚀 Bắt đầu ngay</button>
            </div>
        </div>
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
                    <button class="reader-tool-btn" onclick="toggleQuickTextbookPicker()" style="background: #e0e7ff; color: #3730a3; border-color: #c7d2fe; font-weight: 700;">📚 Danh sách bài giảng</button>
                    <div class="reader-toc-wrapper">
                        <button class="reader-tool-btn" onclick="toggleTocDropdown()">📋 Mục lục</button>
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
                <button class="btn-secondary" onclick="closeTextbookReader()">Đóng bài giảng</button>
                <button class="btn-primary" id="reader-btn-quiz">🚀 Làm bài trắc nghiệm Chương này</button>
            </div>
        </div>
    </div>
    `;
}

function buildPageHTML(pageName, bodyContent) {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cổng Khóa học & Trắc nghiệm HNUE - Đại học Sư phạm Hà Nội</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body class="has-mobile-nav">

<div class="container">
    ${generateHeaderHTML(pageName)}

    ${bodyContent}

    ${generateModalsHTML()}

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
    if (typeof initPageFromURL === 'function') {
        initPageFromURL('${pageName}');
    }
});
</script>
</body>
</html>`;
}

console.log('--- START BUILDING MODULAR SEPARATE HTML FILES ---');

// 1. INDEX.HTML (Trang Chủ)
const indexBody = `
    <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: #ffffff; margin-bottom: 24px; padding: 32px 28px; border-radius: 18px; box-shadow: 0 10px 30px rgba(49, 46, 129, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div>
                <div style="font-size: 0.82rem; background: rgba(255,255,255,0.15); color: #e0e7ff; padding: 4px 14px; border-radius: 50px; display: inline-block; font-weight: 700; margin-bottom: 12px;">
                    🎓 Nền tảng Ôn thi Học phần HNUE
                </div>
                <h2 style="font-size: 1.6rem; color: #ffffff; font-weight: 800; margin-bottom: 10px;">👋 Chào mừng bạn đến với Cổng Khóa học & Ôn thi HNUE</h2>
                <p style="color: #c7d2fe; font-size: 0.95rem; max-width: 680px; line-height: 1.6; margin: 0;">
                    Hệ thống cung cấp đầy đủ các <strong>Giáo trình & Bài giảng Điện tử</strong> cùng <strong>Ngân hàng Đề thi Trắc nghiệm</strong> phục vụ Sinh viên ôn tập đạt kết quả cao nhất.
                </p>
            </div>
        </div>
    </div>

    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 1.2rem; color: #1e293b; font-weight: 800;">🎓 Danh sách Khóa học Nổi bật</h3>
        <span style="font-size: 0.85rem; color: #64748b;">Chọn môn để làm trắc nghiệm & đọc giáo trình</span>
    </div>

    <div id="home-courses-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 28px;"></div>

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
fs.writeFileSync(path.join(rootDir, 'index.html'), buildPageHTML('home', indexBody), 'utf8');
console.log('Build index.html successfully!');

// 2. COURSES.HTML (Khóa học & Giáo trình)
const coursesBody = `
    <div style="margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.9rem; font-weight: 700; color: #64748b;">Chọn Khóa học:</span>
        <div id="course-selector-pills" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
    </div>
    <div id="course-detail-container"></div>
`;
fs.writeFileSync(path.join(rootDir, 'courses.html'), buildPageHTML('courses', coursesBody), 'utf8');
console.log('Build courses.html successfully!');

// 3. QUIZZES.HTML (Ngân hàng Đề thi)
const quizzesBody = `
    <div class="card" id="input-card">
        <div class="card-title">📝 Ngân hàng Đề thi Trắc nghiệm Tất cả Môn học</div>
        <div id="preset-categories-container"></div>

        <div id="custom-upload-section">
            <div class="section-label" style="margin-top: 24px;">📁 Thêm Đề thi Cá nhân:</div>
            <div class="file-upload-wrapper" onclick="document.getElementById('file-input').click()">
                <p id="file-status">📄 Click hoặc kéo thả để chọn tệp đề thi từ máy tính</p>
                <input type="file" id="file-input" accept=".txt">
            </div>
            <div class="input-group">
                <textarea id="text-input" placeholder="Dán nội dung câu hỏi trắc nghiệm vào đây..."></textarea>
            </div>
            <div class="btn-container">
                <button class="btn-primary" onclick="openStartQuizModal(null, 'Đề thi Nhập thủ công')">Bắt đầu làm bài</button>
                <button class="btn-secondary" onclick="loadSampleText()">Sử dụng đề mẫu</button>
                <button class="btn-secondary" onclick="clearInput()">Xóa</button>
            </div>
        </div>
    </div>
`;
fs.writeFileSync(path.join(rootDir, 'quizzes.html'), buildPageHTML('quizzes', quizzesBody), 'utf8');
console.log('Build quizzes.html successfully!');

// 4. QUIZ-ROOM.HTML (Phòng thi Tập trung)
const quizRoomBody = `
    <div id="quiz-app" style="margin-top: 4px;">
        <div class="quiz-top-bar">
            <div style="display: flex; align-items: center; gap: 14px;">
                <button class="btn-quiz-back" onclick="backToConfig()">
                    <span>⬅️</span> Trở về Khóa học
                </button>
                <div class="quiz-title-badge" id="active-quiz-title">Tên Đề thi</div>
            </div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div class="timer-badge hidden" id="quiz-timer-badge">
                    ⏱️ <span id="timer-text">15:00</span>
                </div>
                <div class="progress-badge" id="progress-badge">0/0 (0%)</div>
            </div>
        </div>

        <div class="quiz-layout">
            <div class="quiz-main-content">
                <div id="score-summary" class="score-summary-card hidden">
                    <div class="score-title">🎉 KẾT QUẢ BÀI THI</div>
                    <div class="score-number" id="final-score">0 / 10</div>
                    <div class="score-desc" id="final-desc">Hoàn thành bài trắc nghiệm!</div>
                    <div class="btn-container" style="justify-content: center; margin-top: 14px;">
                        <button class="btn-primary" onclick="resetQuiz()">🔄 Làm lại đề này</button>
                        <button class="btn-quiz-back" onclick="backToConfig()">📋 Chọn bài khác</button>
                    </div>
                </div>
                <div id="questions-container"></div>
                <div class="quiz-bottom-actions" style="margin-top: 24px;">
                    <button class="btn-success" id="btn-submit-quiz" onclick="submitFullQuiz()">
                        📋 Nộp bài & Chấm điểm
                    </button>
                </div>
            </div>
            <div class="quiz-sidebar" id="quiz-sidebar">
                <div class="sidebar-title">Danh sách câu hỏi</div>
                <div class="q-grid-nav" id="sidebar-q-grid"></div>
                <div style="margin-top: 18px; display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn-success" id="btn-submit-quiz-sidebar" style="width: 100%; font-size: 0.9rem; padding: 10px; font-weight: 800; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);" onclick="submitFullQuiz()">
                        📋 Nộp bài & Chấm điểm
                    </button>
                    <button class="btn-secondary" style="width: 100%; font-size: 0.82rem; padding: 8px;" onclick="resetQuiz()">
                        🔄 Làm lại từ đầu
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Circular Textbook Quick Reader Button -->
    <div class="floating-tb-btn hidden" id="floating-textbook-btn" onclick="toggleQuickTextbookPicker()">
        📖
        <span class="floating-tb-tooltip">Tra cứu Giáo trình môn này</span>
    </div>

    <!-- Quick Textbook Picker Modal -->
    <div class="modal-overlay hidden" id="quick-textbook-picker-modal">
        <div class="modal-card" style="max-width: 520px;">
            <div class="modal-title">📖 Chọn Bài giảng / Giáo trình để Tra cứu</div>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px;">
                Chọn một bài giảng trong môn học này để xem và học tập trực tiếp song song với quá trình làm bài.
            </p>
            <div id="quick-tb-list-container" style="max-height: 360px; overflow-y: auto; padding-right: 4px;"></div>
            <div class="btn-container" style="margin-top: 18px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="toggleQuickTextbookPicker()">Đóng</button>
            </div>
        </div>
    </div>
`;
fs.writeFileSync(path.join(rootDir, 'quiz-room.html'), buildPageHTML('quiz-room', quizRoomBody), 'utf8');
console.log('Build quiz-room.html successfully!');

// 5. HISTORY.HTML (Lịch sử & Thống kê)
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
fs.writeFileSync(path.join(rootDir, 'history.html'), buildPageHTML('history', historyBody), 'utf8');
console.log('Build history.html successfully!');

console.log('--- ALL MODULAR HTML FILES BUILT SUCCESSFULLY ---');
