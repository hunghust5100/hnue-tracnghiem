/* ========================================================
   LOCALSTORAGE HISTORY & WRONG QUESTIONS PER SUBJECT
======================================================== */
const STORAGE_KEY_HISTORY = 'hnue_quiz_history_v2';
const STORAGE_KEY_WRONG = 'hnue_wrong_questions_v2';

async function getStoredHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (!raw) return [];
        const decrypted = await decryptData(raw);
        return decrypted ? JSON.parse(decrypted) : [];
    } catch(e) { return []; }
}

async function saveQuizHistoryItem(subjectId, title, scoreText, correctCount, totalCount) {
    try {
        const history = await getStoredHistory();
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} - ${now.getDate()}/${now.getMonth()+1}`;
        history.unshift({ subjectId: subjectId || 'cnxh', title, scoreText, correctCount, totalCount, time: timeStr });
        if (history.length > 30) history.pop();
        const encrypted = await encryptData(JSON.stringify(history));
        localStorage.setItem(STORAGE_KEY_HISTORY, encrypted);
        await updateSubjectStatsUI(subjectId || 'cnxh');
    } catch(e) {}
}

function clearSubjectHistory(subjectId) {
    showCustomConfirm("Xóa Lịch Sử Làm Bài", "Bạn có chắc chắn muốn xóa tất cả lịch sử làm bài của môn này không?", "Xóa lịch sử", async (confirmed) => {
        if (confirmed) {
            let history = await getStoredHistory();
            history = history.filter(h => h.subjectId !== subjectId);
            const encrypted = await encryptData(JSON.stringify(history));
            localStorage.setItem(STORAGE_KEY_HISTORY, encrypted);
            await updateSubjectStatsUI(subjectId);
        }
    });
}

async function getStoredWrongBank() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_WRONG);
        if (!raw) return [];
        const decrypted = await decryptData(raw);
        return decrypted ? JSON.parse(decrypted) : [];
    } catch(e) { return []; }
}

async function saveWrongQuestions(subjectId, gradedQuestions) {
    try {
        let bank = await getStoredWrongBank();
        const subId = subjectId || 'cnxh';
        
        gradedQuestions.forEach(q => {
            const existingIndex = bank.findIndex(item => item.question === q.question && (item.subjectId || 'cnxh') === subId);
            if (!q.isCorrect) {
                if (existingIndex === -1) {
                    bank.push({ ...q, subjectId: subId });
                } else {
                    bank[existingIndex] = { ...q, subjectId: subId };
                }
            } else {
                // Remove from wrong bank if answered correctly
                if (existingIndex !== -1) {
                    bank.splice(existingIndex, 1);
                }
            }
        });

        const encrypted = await encryptData(JSON.stringify(bank));
        localStorage.setItem(STORAGE_KEY_WRONG, encrypted);
        await updateSubjectStatsUI(subId);
    } catch(e) {}
}

function clearSubjectWrongBank(subjectId) {
    showCustomConfirm("Xóa Kho Câu Sai", "Bạn có chắc chắn muốn xóa toàn bộ câu hỏi làm sai đã lưu của môn này?", "Xóa kho câu sai", async (confirmed) => {
        if (confirmed) {
            let bank = await getStoredWrongBank();
            bank = bank.filter(b => b.subjectId !== subjectId);
            const encrypted = await encryptData(JSON.stringify(bank));
            localStorage.setItem(STORAGE_KEY_WRONG, encrypted);
            await updateSubjectStatsUI(subjectId);
        }
    });
}

async function updateSubjectStatsUI(subjectId) {
    const subId = subjectId || 'cnxh';
    const wrongBankAll = await getStoredWrongBank();
    const wrongBank = wrongBankAll.filter(b => (b.subjectId || 'cnxh') === subId);
    const wrongBadge = document.getElementById(`subject-wrong-badge-${subId}`);
    const retakeBtn = document.getElementById(`btn-retake-subject-${subId}`);
    
    if (wrongBadge) {
        wrongBadge.innerText = `🔥 ${wrongBank.length} câu sai`;
    }
    if (retakeBtn) {
        if (wrongBank.length > 0) {
            retakeBtn.innerText = `🔥 Ôn lại câu sai (${wrongBank.length} câu)`;
            retakeBtn.disabled = false;
            retakeBtn.style.opacity = "1";
            retakeBtn.style.cursor = "pointer";
        } else {
            retakeBtn.innerText = `🔥 Không có câu sai (0 câu)`;
            retakeBtn.disabled = true;
            retakeBtn.style.opacity = "0.6";
            retakeBtn.style.cursor = "not-allowed";
        }
    }

    // Render history summary badge in subject toolbar
    const historyAll = await getStoredHistory();
    const historyList = historyAll.filter(h => (h.subjectId || 'cnxh') === subId);
    const historyContainer = document.getElementById(`subject-history-list-${subId}`);
    if (historyContainer) {
        if (historyList.length === 0) {
            historyContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Chưa có lịch sử làm bài.</span>`;
        } else {
            const lastResult = historyList[0];
            historyContainer.innerHTML = `
                <span style="font-size: 0.8rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); padding: 4px 12px; border-radius: 50px; color: var(--text-light);">
                    📊 Bài gần nhất: <strong>${escapeHTML(lastResult.title)}</strong> (${lastResult.scoreText})
                </span>
                <button class="btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; min-height: 26px;" onclick="clearSubjectHistory('${subId}')">Xóa lịch sử</button>
            `;
        }
    }
}
