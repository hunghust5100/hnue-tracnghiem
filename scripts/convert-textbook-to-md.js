const fs = require('fs');
const path = require('path');

const inputDir = path.resolve(__dirname, '../data/Giáo dục học/Giáo trình/Các chương');
const outputDir = path.resolve(__dirname, '../data/Giáo dục học/Giáo trình/Các chương MD');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function isRomanNumeral(str) {
    return /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i.test(str);
}

function isHeadingText(str) {
    if (str.length > 100) return false;
    // Check if mostly uppercase or short heading title
    const upperCount = (str.match(/[A-ZÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/g) || []).length;
    const letterCount = (str.match(/[a-zA-Záàảãạănắằẳẵặnâtấtầnẩẫnậnđéèẻẽẹêếtềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/g) || []).length;
    return letterCount > 0 && (upperCount / letterCount > 0.45 || str.length < 50);
}

function processTextFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove Form Feed control characters (\x0c)
    content = content.replace(/\x0c/g, '\n');

    // 2. Remove repetitive PDF headers/footers like "Giáo trình Giáo dục học..."
    content = content.replace(/Giáo trình Giáo dục học.*?\n/gi, '\n');

    // 3. Fix hyphenated line breaks (e.g. "giáo-\ndục" -> "giáo dục")
    content = content.replace(/(\w+)-\r?\n(\w+)/g, '$1$2');

    // Split into lines
    const rawLines = content.split(/\r?\n/);
    const cleanedLines = [];

    for (let i = 0; i < rawLines.length; i++) {
        let line = rawLines[i].trim();

        // Skip standalone page numbers
        if (/^\d{1,3}$/.test(line)) {
            continue;
        }

        cleanedLines.push(line);
    }

    const mdLines = [];
    let currentParagraph = [];

    function flushParagraph() {
        if (currentParagraph.length > 0) {
            mdLines.push(currentParagraph.join(' '));
            mdLines.push('');
            currentParagraph = [];
        }
    }

    for (let i = 0; i < cleanedLines.length; i++) {
        const line = cleanedLines[i];

        if (!line) {
            flushParagraph();
            continue;
        }

        // Chapter Main Title (# Chương ...)
        if (/^Chương\s+\d+[\.\s\-]/i.test(line)) {
            flushParagraph();
            const formatted = line.replace(/^Chương\s+(\d+)[\.\s\-]+\s*/i, 'Chương $1: ');
            mdLines.push(`# ${formatted}`);
            mdLines.push('');
            continue;
        }

        // Introduction / References headers
        if (/^(00\s*\-|Tài liệu tham khảo|Lời nói đầu|Mục lục)/i.test(line)) {
            flushParagraph();
            mdLines.push(`# ${line}`);
            mdLines.push('');
            continue;
        }

        // Major Roman Numeral Sections (## I. GIÁO DỤC LÀ...)
        const romanMatch = line.match(/^([I|V|X]+)\.\s+(.+)$/);
        if (romanMatch && isRomanNumeral(romanMatch[1]) && isHeadingText(romanMatch[2])) {
            flushParagraph();
            mdLines.push(`## ${line}`);
            mdLines.push('');
            continue;
        }

        // Subsections (### 1. CẤU TRÚC...) - Only if header text is short/uppercase
        const numberMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (numberMatch && parseInt(numberMatch[1], 10) < 50 && isHeadingText(numberMatch[2])) {
            flushParagraph();
            mdLines.push(`### ${line}`);
            mdLines.push('');
            continue;
        }

        // Bullet Points or Lettered points (e.g. "- ...", "+ ...", "a) ...")
        if (/^[\-\+\*]\s+/.test(line) || /^[a-z]\)\s+/.test(line)) {
            flushParagraph();
            mdLines.push(line);
            mdLines.push('');
            continue;
        }

        // Regular paragraph content
        currentParagraph.push(line);
    }

    flushParagraph();

    // Clean up multiple consecutive empty lines
    const finalMd = mdLines.join('\n').replace(/\n{3,}/g, '\n\n');
    return finalMd;
}

console.log('--- START RE-CONVERTING TEXTBOOK TXT TO MD ---');
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.txt'));

files.forEach(file => {
    const fullPath = path.join(inputDir, file);
    const mdName = file.replace(/\.txt$/, '.md');
    const outPath = path.join(outputDir, mdName);

    const mdContent = processTextFile(fullPath);
    fs.writeFileSync(outPath, mdContent, 'utf8');
    console.log(`Converted: ${file} -> ${mdName}`);
});

console.log('--- RE-CONVERTED ALL TEXTBOOK MD FILES SUCCESSFULLY ---');
