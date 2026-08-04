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
    fs.writeFileSync(path.join(rootDir, 'js/app.js'), appJs, 'utf8');
}

const logoB64 = fs.existsSync(path.join(rootDir, 'hnue-logo.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'hnue-logo.png')).toString('base64') : 'hnue-logo.png';
const qrB64 = fs.existsSync(path.join(rootDir, 'vietqr-tpbank.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(rootDir, 'vietqr-tpbank.png')).toString('base64') : 'vietqr-tpbank.png';

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống Trắc nghiệm HNUE - CNXH Khoa Học & Giáo Dục Học</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body class="has-mobile-nav">

<div class="container">
    <header>
        <div class="header-brand">
            <img src="${logoB64}" alt="Logo Trường Đại học Sư phạm Hà Nội" class="header-logo" onclick="backToConfig()">
            <div class="header-text-group">
                <span class="header-univ-tag">🎓 Trường Đại học Sư phạm Hà Nội - HNUE</span>
                <h1 onclick="backToConfig()">Trắc nghiệm HNUE</h1>
            </div>
        </div>
        <p>Hệ thống Ôn tập & Thi thử Trắc nghiệm Thông minh</p>
    </header>

    <!-- Config Card (Homepage) -->
    <div class="card" id="input-card">
        <div class="card-title">Danh mục Môn học & Đề thi</div>
        
        <!-- Preset Quizzes Gallery (Grouped & Collapsible per Subject) -->
        <div id="preset-categories-container"></div>

        <!-- Custom Upload & Text Raw Area -->
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

    <!-- Modal for Selecting Quiz Mode when clicking a Quiz Card -->
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
                    <span class="pill-opt" data-count="34" onclick="setMockCount(34)">34 câu (30 TN + 4 Đ/S)</span>
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
                    <span class="pill-opt" data-time="60" onclick="setMockTime(60)">60 phút</span>
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

    <!-- Retake Wrong Questions Mode Selection Modal -->
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
                <button class="btn-primary" onclick="confirmRetakeWrongExam()">🚀 Bắt đầu Ôn tập</button>
            </div>
        </div>
    </div>

    <!-- Custom HTML Confirmation Modal -->
    <div class="modal-overlay hidden" id="custom-confirm-modal">
        <div class="modal-card" style="max-width: 420px; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">⚠️</div>
            <div class="modal-title" style="justify-content: center; margin-bottom: 8px;" id="confirm-modal-title">Xác nhận thao tác</div>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;" id="confirm-modal-msg">Bạn có chắc chắn muốn thực hiện hành động này?</p>
            <div class="btn-container" style="justify-content: center;">
                <button class="btn-secondary" onclick="closeConfirmModal(false)">Hủy bỏ</button>
                <button class="btn-danger" id="confirm-modal-action-btn" onclick="closeConfirmModal(true)">Đồng ý xóa</button>
            </div>
        </div>
    </div>

    <!-- Quiz Main App Area (Hidden initially) -->
    <div id="quiz-app" class="hidden">
        <!-- Top Action Bar inside Quiz View -->
        <div class="quiz-top-bar">
            <div class="quiz-top-title">
                <span id="current-quiz-name">📖 Đề thi trắc nghiệm</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="timer-badge hidden" id="timer-badge">
                    ⏱️ <span id="timer-display">00:00</span>
                </div>

                <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.88rem;" onclick="backToConfig()">
                    🏠 Trang chủ (Chọn đề khác)
                </button>
            </div>
        </div>

        <div class="quiz-layout">
            <!-- Left: Question List & Summary -->
            <div class="quiz-main">
                <!-- Summary Card (Visible after quiz submission) -->
                <div class="summary-card hidden" id="score-summary">
                    <div class="summary-header">🎉 Kết Quả Bài Làm</div>
                    <div class="summary-score-badge" id="summary-score-text">0/0</div>
                    <div class="summary-details">
                        <span class="summary-item correct" id="summary-correct-count">✓ 0 đúng</span>
                        <span class="summary-item incorrect" id="summary-incorrect-count">✕ 0 sai</span>
                    </div>
                </div>

                <!-- Questions list container -->
                <div id="questions-container"></div>
            </div>

            <!-- Floating Minimized Bar for Mobile -->
            <div class="mobile-floating-bar hidden" id="mobile-floating-bar">
                <button class="mobile-floating-btn" onclick="setMobileNavVisibility(true)">
                    📋 Danh sách (<span id="floating-progress">0/0</span>)
                </button>
                <button class="mobile-floating-btn mobile-submit-btn" id="mobile-floating-submit" onclick="submitQuiz()">
                    ✓ Nộp bài
                </button>
            </div>

            <!-- Right Sidebar / Mobile Bottom Navigation -->
            <div class="quiz-sidebar" id="quiz-sidebar">
                <div class="sidebar-card" id="sidebar-card">
                    <!-- Mobile Header Summary & Actions -->
                    <div class="mobile-nav-handle">
                        <div class="mobile-handle-top">
                            <span class="mobile-nav-summary">📋 Tiến độ: <strong id="mobile-progress-text" style="color: var(--primary);">0/0</strong></span>
                            <div class="mobile-btn-group">
                                <button class="mobile-pill-btn" id="mobile-toggle-expand-btn" onclick="toggleMobileExpand()">▲ Tất cả câu</button>
                                <button class="mobile-pill-btn hide-btn" onclick="setMobileNavVisibility(false)">👁️ Ẩn thanh</button>
                            </div>
                        </div>
                    </div>

                    <!-- Horizontal Scrolling Question Strip (Visible when bottom bar is active on Mobile) -->
                    <div class="mobile-q-strip" id="mobile-q-strip"></div>

                    <!-- Desktop Progress Header -->
                    <div class="sidebar-header-desktop">
                        <div class="sidebar-title">
                            <span>📋 Danh sách câu hỏi</span>
                            <span id="progress-badge" style="font-size: 0.85rem; color: var(--primary);">0/0</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" id="progress-bar"></div>
                        </div>
                    </div>

                    <!-- Expandable Grid Container -->
                    <div class="sidebar-expandable-content" id="sidebar-expandable">
                        <div class="q-nav-grid" id="q-nav-grid"></div>

                        <div class="legend-grid">
                            <div class="legend-item"><div class="legend-dot dot-unanswered"></div> Chưa làm</div>
                            <div class="legend-item"><div class="legend-dot dot-answered"></div> Đã trả lời</div>
                            <div class="legend-item"><div class="legend-dot dot-correct"></div> Đúng</div>
                            <div class="legend-item"><div class="legend-dot dot-incorrect"></div> Sai</div>
                        </div>

                        <div class="sidebar-actions">
                            <button class="btn-success" id="btn-submit-quiz" onclick="submitQuiz()">✓ Nộp bài & Chấm điểm</button>
                            <button class="btn-secondary" onclick="resetQuiz()">🔄 Làm lại bài này</button>
                            <button class="btn-primary" onclick="backToConfig()">🏠 Trang chủ (Chọn đề khác)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Site Footer with Author Donation & VietQR -->
    <footer class="site-footer">
        <div class="donation-card">
            <div class="donation-info">
                <div class="donation-title">💖 Ủng hộ tác giả tiền học lại</div>
                <div class="donation-desc">
                    Mọi sự ủng hộ của bạn là nguồn động lực rất lớn giúp tác giả hoàn thiện và duy trì hệ thống ôn tập trắc nghiệm thông minh ngày một tốt hơn!
                </div>
                
                <div class="bank-details-box">
                    <div class="bank-detail-row">
                        <span class="bank-detail-label">Chủ tài khoản:</span>
                        <span class="bank-detail-value">NGUYỄN KHÁNH HƯNG</span>
                    </div>
                    <div class="bank-detail-row">
                        <span class="bank-detail-label">Số tài khoản:</span>
                        <span class="bank-detail-value">
                            <span id="stk-val" style="letter-spacing: 0.5px;">52403022005</span>
                            <button class="btn-copy-acc" onclick="copySTK()">📋 Sao chép</button>
                        </span>
                    </div>
                    <div class="bank-detail-row">
                        <span class="bank-detail-label">Ngân hàng:</span>
                        <span class="bank-detail-value" style="color: #7e22ce;">TPBank (Tiên Phong Bank)</span>
                    </div>
                </div>
            </div>

            <div class="donation-qr-container">
                <img src="${qrB64}" alt="VietQR TPBank Nguyễn Khánh Hưng" class="donation-qr-img">
                <span class="donation-qr-caption">⚡ Quét VietQR để ủng hộ</span>
            </div>
        </div>
    </footer>
</div>

<script>
${quizzesDataJs}

${cryptoJs}

${storageJs}

${parserJs}

${appJs}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), htmlContent, 'utf8');
console.log('Build index.html successfully!');
