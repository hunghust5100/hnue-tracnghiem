/* ========================================================
   QUESTION TEXT PARSER & FORMATTING HELPERS
======================================================== */
function parseQuizText(rawText) {
    const normalized = rawText.replace(/\r\n/g, '\n');
    const sections = normalized.split(/(?=^Câu\s+\d+:)/m);
    const parsedQuestions = [];

    sections.forEach(section => {
        const content = section.trim();
        if (!content) return;

        const headerMatch = content.match(/^Câu\s+(\d+):\s*([\s\S]*?)$/m);
        if (!headerMatch) return;
        const qId = headerMatch[1];

        let mainPart = content;
        let explanation = "";
        const expIndex = content.search(/Giải thích:/i);
        if (expIndex !== -1) {
            explanation = content.substring(expIndex + "Giải thích:".length).trim();
            mainPart = content.substring(0, expIndex).trim();
        }

        const lines = mainPart.split('\n').map(l => l.trim());
        let questionText = "";
        let options = [];
        let correctAnswers = [];
        let fillAnswer = "";
        let isFillType = false;

        if (/Đáp số:/i.test(mainPart)) {
            isFillType = true;
            const fillMatch = mainPart.match(/Đáp số:\s*([\s\S]*?)$/i);
            if (fillMatch) fillAnswer = fillMatch[1].trim();
            
            const qBodyLines = [];
            for (let line of lines) {
                if (/^Đáp số:/i.test(line)) break;
                if (/^Câu\s+\d+:/i.test(line)) {
                    qBodyLines.push(line.replace(/^Câu\s+\d+:\s*/i, ""));
                } else { qBodyLines.push(line); }
            }
            questionText = qBodyLines.join('\n').trim();
        } else {
            // Check if this is a true/false (Đúng/Sai) question using a) b) c) d) format
            const isTrueFalseFormat = lines.some(l => /^\*?[a-zA-Z]\)\s+/i.test(l));

            if (isTrueFalseFormat) {
                const qBodyLines = [];
                for (let line of lines) {
                    const tfMatch = line.match(/^(\*?)([a-zA-Z])\)\s+([\s\S]*)$/);
                    if (tfMatch) {
                        const isCorrectTF = tfMatch[1] === '*';
                        const letter = tfMatch[2].toUpperCase();
                        let optText = tfMatch[3].trim();
                        let isDung = false;

                        const dungMatch = optText.match(/->\s*\[?(ĐÚNG|SAI)\]?/i) || optText.match(/\s*\[?(ĐÚNG|SAI)\]?\s*$/i);
                        if (dungMatch) {
                            isDung = dungMatch[1].toUpperCase() === 'ĐÚNG';
                            optText = optText.replace(/->\s*\[?(ĐÚNG|SAI)\]?/i, '').replace(/\s*\[?(ĐÚNG|SAI)\]?\s*$/i, '').trim();
                        } else {
                            isDung = isCorrectTF;
                        }

                        options.push({ letter: letter, text: optText, isDung: isDung });
                        if (isDung) correctAnswers.push(letter);
                    } else {
                        if (/^Câu\s+\d+:/i.test(line)) {
                            qBodyLines.push(line.replace(/^Câu\s+\d+:\s*/i, ""));
                        } else { qBodyLines.push(line); }
                    }
                }
                questionText = qBodyLines.join('\n').trim();
            } else {
                const qBodyLines = [];
                for (let line of lines) {
                    const optMatch = line.match(/^(\*?)([A-Za-z])\.\s*([\s\S]*)$/);
                    if (optMatch) {
                        const isCorrect = optMatch[1] === '*';
                        const letter = optMatch[2].toUpperCase();
                        const optText = optMatch[3].trim();
                        options.push({ letter: letter, text: optText });
                        if (isCorrect) correctAnswers.push(letter);
                    } else {
                        if (/^Câu\s+\d+:/i.test(line)) {
                            qBodyLines.push(line.replace(/^Câu\s+\d+:\s*/i, ""));
                        } else { qBodyLines.push(line); }
                    }
                }
                questionText = qBodyLines.join('\n').trim();
            }
        }

        let finalType = "single";
        if (isFillType) finalType = "fill";
        else if (options.length > 0 && options.every(o => typeof o.isDung === 'boolean')) finalType = "truefalse";
        else if (correctAnswers.length > 1) finalType = "multiple";

        parsedQuestions.push({
            id: qId,
            type: finalType,
            question: questionText,
            options: options,
            correctAnswers: correctAnswers,
            fillAnswer: fillAnswer,
            explanation: explanation,
            userAnswers: [],
            userTFAnswers: {},
            isGraded: false,
            isCorrect: false
        });
    });
    return parsedQuestions;
}

/* SAFE STRING NORMALIZATION (Prevents null/undefined/type crashes) */
function normalizeString(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/,/g, ".")
        .replace(/\s+/g, "");
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatExplanationHTML(expText) {
    if (!expText) return '<div class="exp-plain-text">Không có giải thích cụ thể.</div>';
    
    const hasItems = /(?:^|\s|-)\s*[a-d]\)/i.test(expText);
    
    if (hasItems) {
        const parts = expText.split(/(?=\s*-\s*[a-d]\)|\s*^[a-d]\))/im).filter(p => p && p.trim());
        let html = '<div class="exp-structured-list">';
        
        parts.forEach(part => {
            const cleanPart = part.replace(/^-\s*/, '').trim();
            const itemMatch = cleanPart.match(/^([a-d]\))\s*(ĐÚNG|SAI)?\.?\s*([\s\S]*)$/i);
            
            if (itemMatch) {
                const letter = itemMatch[1].toLowerCase();
                const keyWord = itemMatch[2] ? itemMatch[2].toUpperCase() : '';
                const detail = itemMatch[3].trim();
                
                let keyBadge = '';
                if (keyWord === 'ĐÚNG') {
                    keyBadge = `<span class="exp-key-badge exp-badge-dung">✓ ĐÚNG</span>`;
                } else if (keyWord === 'SAI') {
                    keyBadge = `<span class="exp-key-badge exp-badge-sai">✕ SAI</span>`;
                }
                
                html += `
                    <div class="exp-structured-item">
                        <div class="exp-item-header">
                            <span class="exp-item-letter">${letter}</span>
                            ${keyBadge}
                        </div>
                        <div class="exp-item-text">${escapeHTML(detail)}</div>
                    </div>`;
            } else {
                html += `<div class="exp-plain-text">${escapeHTML(cleanPart)}</div>`;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    return `<div class="exp-plain-text">${escapeHTML(expText)}</div>`;
}
