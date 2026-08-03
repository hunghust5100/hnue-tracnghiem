function copySTK() {
    navigator.clipboard.writeText("52403022005").then(() => {
        alert("📋 Đã sao chép số tài khoản: 52403022005 (TPBank - NGUYỄN KHÁNH HƯNG)");
    }).catch(() => {
        alert("Số tài khoản: 52403022005 (TPBank - NGUYỄN KHÁNH HƯNG)");
    });
}
let currentQuestions = [];
let currentQuizMode = 'instant'; // 'instant' or 'submit' (default to instant)
let isQuizSubmitted = false;

// Global store for categories to prevent inline JS quote escaping bugs
let allCategoriesData = [];

// Timer state
let timerInterval = null;
let totalSecondsLeft = 0;

// Pending selection for Start Quiz Modal
let pendingQuizFile = null;
let pendingQuizTitle = "";
let currentSubjectId = "cnxh";

// Mock exam generator state
let activeSubjectGroup = null;
let activeMockFolderName = null;
let selectedMockCount = 20; // default 20 questions
let selectedMockTime = 15; // default 15 mins
let selectedMockMode = 'instant';

// Accordion state (ALL COLLAPSED BY DEFAULT)
let accordionStates = { cnxh: false, gdh: false };

// Confirm Modal callback handler
let confirmModalCallback = null;

// Preset Quizzes List fallback
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
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 1. Nhập môn CNXH Khoa học.enc",
        "icon": "📚"
      },
      {
        "id": "cnxh-moi-ch2",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 2. Sứ mệnh lịch sử của giai cấp công nhân.enc",
        "icon": "⚙️"
      },
      {
        "id": "cnxh-moi-ch3",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 3: CNXH và Thời kỳ quá độ lên CNXH",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 3. Chủ nghĩa xã hội và thời kỳ quá độ lên chủ nghĩa xã hội.enc",
        "icon": "🚀"
      },
      {
        "id": "cnxh-moi-ch4",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 4: Dân chủ XHCN và Nhà nước XHCN",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 4. Dân chủ xã hội chủ nghĩa và nhà nước xã hội chủ nghĩa.enc",
        "icon": "⚖️"
      },
      {
        "id": "cnxh-moi-ch5",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 5: Cơ cấu XH - Giai cấp & Liên minh giai cấp",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 5. Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội.enc",
        "icon": "🤝"
      },
      {
        "id": "cnxh-moi-ch6",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 6: Vấn đề dân tộc và tôn giáo",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 6. Vấn đề dân tộc và tôn giáo trong thời kỳ quá độ lên chủ nghĩa xã hội.enc",
        "icon": "🌍"
      },
      {
        "id": "cnxh-moi-ch7",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Chương 7: Vấn đề gia đình",
        "description": "Bộ câu hỏi trắc nghiệm chất lượng cao (40 câu)",
        "file": "CNXH/Câu hỏi trắc nghiệm (mới)/Chương 7. Vấn đề gia đình trong thời kỳ quá độ lên chủ nghĩa xã hội.enc",
        "icon": "🏡"
      },
      {
        "id": "cnxh-cb-ch1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 1: Nhập môn Chủ nghĩa xã hội Khoa học",
        "description": "Bộ câu hỏi Nhập môn Chủ nghĩa xã hội khoa học Mác - Lênin",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 1. Nhập môn Chủ nghĩa xã hội Khoa học.enc",
        "icon": "📘"
      },
      {
        "id": "cnxh-cb-ch2-p1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân (Phần 1)",
        "description": "Bộ câu hỏi Sứ mệnh lịch sử của giai cấp công nhân (Phần 1)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 2. Sứ mệnh lịch sử của giai cấp công nhân (Phần 1).enc",
        "icon": "📕"
      },
      {
        "id": "cnxh-cb-ch2-p2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 2: Sứ mệnh lịch sử của giai cấp công nhân (Phần 2)",
        "description": "Bộ câu hỏi Sứ mệnh lịch sử của giai cấp công nhân (Phần 2)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 2. Sứ mệnh lịch sử của giai cấp công nhân (Phần 2).enc",
        "icon": "📕"
      },
      {
        "id": "cnxh-cb-ch3",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 3: CNXH và Thời kỳ quá độ lên CNXH",
        "description": "Bộ câu hỏi Chủ nghĩa xã hội và Thời kỳ quá độ lên Chủ nghĩa xã hội",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 3. Chủ nghĩa xã hội và Thời kỳ quá độ lên Chủ nghĩa xã hội.enc",
        "icon": "🏛️"
      },
      {
        "id": "cnxh-cb-ch4-p1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 4: Dân chủ XHCN và Nhà nước XHCN (Phần 1)",
        "description": "Bộ câu hỏi Dân chủ Xã hội chủ nghĩa và Nhà nước Xã hội chủ nghĩa (Phần 1)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 4. Dân chủ Xã hội chủ nghĩa và Nhà nước Xã hội chủ nghĩa (Phần 1).enc",
        "icon": "📜"
      },
      {
        "id": "cnxh-cb-ch4-p2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 4: Dân chủ XHCN và Nhà nước XHCN (Phần 2)",
        "description": "Bộ câu hỏi Dân chủ Xã hội chủ nghĩa và Nhà nước Xã hội chủ nghĩa (Phần 2)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 4. Dân chủ Xã hội chủ nghĩa và Nhà nước Xã hội chủ nghĩa (Phần 2).enc",
        "icon": "📜"
      },
      {
        "id": "cnxh-cb-ch5",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 5: Cơ cấu XH - Giai cấp & Liên minh giai cấp",
        "description": "Cơ cấu xã hội - giai cấp và Liên minh giai cấp, tầng lớp trong thời kỳ quá độ",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 5. Cơ cấu Xã hội - Giai cấp và Liên minh giai cấp, tầng lớp trong thời kỳ Quá độ lên Chủ nghĩa xã hội.enc",
        "icon": "🤝"
      },
      {
        "id": "cnxh-cb-ch6-p1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 6: Vấn đề dân tộc trong thời kỳ quá độ (Phần 1)",
        "description": "Bộ câu hỏi Vấn đề dân tộc trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 6. Vấn đề dân tộc trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1).enc",
        "icon": "🌍"
      },
      {
        "id": "cnxh-cb-ch6-p2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 6: Vấn đề dân tộc trong thời kỳ quá độ (Phần 2)",
        "description": "Bộ câu hỏi Vấn đề dân tộc trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 6. Vấn đề dân tộc trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2).enc",
        "icon": "🌍"
      },
      {
        "id": "cnxh-cb-ch7-p1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 7: Vấn đề tôn giáo trong thời kỳ quá độ (Phần 1)",
        "description": "Bộ câu hỏi Vấn đề tôn giáo trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 7. Vấn đề tôn giáo trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1).enc",
        "icon": "🕊️"
      },
      {
        "id": "cnxh-cb-ch7-p2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 7: Vấn đề tôn giáo trong thời kỳ quá độ (Phần 2)",
        "description": "Bộ câu hỏi Vấn đề tôn giáo trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 7. Vấn đề tôn giáo trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2).enc",
        "icon": "🕊️"
      },
      {
        "id": "cnxh-cb-ch8-p1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 8: Vấn đề gia đình trong thời kỳ quá độ (Phần 1)",
        "description": "Bộ câu hỏi Vấn đề gia đình trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 8. Vấn đề gia đình trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 1).enc",
        "icon": "🏡"
      },
      {
        "id": "cnxh-cb-ch8-p2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 8: Vấn đề gia đình trong thời kỳ quá độ (Phần 2)",
        "description": "Bộ câu hỏi Vấn đề gia đình trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2)",
        "file": "CNXH/Câu hỏi trắc nghiệm cơ bản/Chương 8. Vấn đề gia đình trong thời kỳ Quá độ lên Chủ nghĩa xã hội (Phần 2).enc",
        "icon": "🏡"
      }
    ]
  },
  {
    "category": "🎓 Giáo dục học - HNUE",
    "subjectId": "gdh",
    "status": "available",
    "quizzes": [
      {
        "id": "gdh-nc-ch1",
        "folder": "🔥 Bộ câu hỏi trắc nghiệm Nâng cao",
        "title": "Chương 1: Giáo dục học là một khoa học (Nâng cao)",
        "description": "50 câu Vận dụng & Vận dụng cao (40 câu MCQ + 10 câu Đúng/Sai, tích hợp tình huống thực tế)",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm nâng cao/Chương 1. Giáo dục học là một khoa học (Nâng cao).enc",
        "icon": "⚡"
      },
      {
        "id": "gdh-nc-ch2",
        "folder": "🔥 Bộ câu hỏi trắc nghiệm Nâng cao",
        "title": "Chương 2: Giáo dục và sự phát triển xã hội (Nâng cao)",
        "description": "50 câu Vận dụng & Vận dụng cao (40 câu MCQ + 10 câu Đúng/Sai, tích hợp tình huống thực tế)",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm nâng cao/Chương 2. Giáo dục và sự phát triển xã hội (Nâng cao).enc",
        "icon": "🔥"
      },
      {
        "id": "gdh-moi-80cau",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Bộ 80 câu hỏi Trắc nghiệm Giáo dục học Đại cương",
        "description": "Biên soạn bởi ThS. Nguyễn Thúy Quỳnh – Khoa Tâm lý, ĐHSP Hà Nội",
        "file": "Giáo dục học/Câu hỏi trắc nghiệm (mới)/80 câu hỏi trắc nghiệm.enc",
        "icon": "🎓"
      },
      {
        "id": "gdh-moi-80cau-ontap",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Bộ 80 câu hỏi Trắc nghiệm Ôn tập Môn Giáo dục học",
        "description": "Chia sẻ bởi RAM Club – Phạm Vũ Ngọc Quỳnh (Khoa Toán Tin, ĐHSP Hà Nội)",
        "file": "Giáo dục học/Câu hỏi trắc nghiệm (mới)/80 câu hỏi trắc nghiệm ôn tập môn Giáo dục học.enc",
        "icon": "📝"
      },
      {
        "id": "gdh-moi-60cau",
        "folder": "✨ Bộ câu hỏi trắc nghiệm (Mới)",
        "title": "Bộ 60 câu hỏi Trắc nghiệm Giáo dục học (RAM Club)",
        "description": "Tổng hợp bởi ThS. Nguyễn Thúy Quỳnh – Khoa Tâm lý, ĐHSP Hà Nội",
        "file": "Giáo dục học/Câu hỏi trắc nghiệm (mới)/60 câu hỏi trắc nghiệm Giáo dục học (ThS Nguyễn Thúy Quỳnh).enc",
        "icon": "📕"
      },
      {
        "id": "gdh-cb-ch1",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 1: Giáo dục học là một khoa học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 1: Giáo dục học là một khoa học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 1. Giáo dục học là một khoa học.enc",
        "icon": "📖"
      },
      {
        "id": "gdh-cb-ch2",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 2: Giáo dục và sự phát triển xã hội",
        "description": "Bộ câu hỏi trắc nghiệm Chương 2: Giáo dục và sự phát triển xã hội",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 2. Giáo dục và sự phát triển xã hội.enc",
        "icon": "🌐"
      },
      {
        "id": "gdh-cb-ch3",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 3: Giáo dục và sự phát triển nhân cách",
        "description": "Bộ câu hỏi trắc nghiệm Chương 3: Giáo dục và sự phát triển nhân cách",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 3. Giáo dục và sự phát triển nhân cách.enc",
        "icon": "👤"
      },
      {
        "id": "gdh-cb-ch4",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 4: Mục đích và nguyên lý giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 4: Mục đích và nguyên lý giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 4. Mục đích và nguyên lý giáo dục.enc",
        "icon": "🎯"
      },
      {
        "id": "gdh-cb-ch5",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 5: Hệ thống giáo dục quốc dân",
        "description": "Bộ câu hỏi trắc nghiệm Chương 5: Hệ thống giáo dục quốc dân",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 5. Hệ thống giáo dục quốc dân.enc",
        "icon": "🏫"
      },
      {
        "id": "gdh-cb-ch6",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 6: Quá trình dạy học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 6: Quá trình dạy học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 6. Quá trình dạy học.enc",
        "icon": "📚"
      },
      {
        "id": "gdh-cb-ch7",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 7: Tính quy luật và nguyên tắc dạy học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 7: Tính quy luật và nguyên tắc dạy học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 7. Tính quy luật và nguyên tắc dạy học.enc",
        "icon": "⚖️"
      },
      {
        "id": "gdh-cb-ch8",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 8: Nội dung dạy học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 8: Nội dung dạy học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 8. Nội dung dạy học.enc",
        "icon": "📖"
      },
      {
        "id": "gdh-cb-ch9",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 9: Phương pháp và phương tiện dạy học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 9: Phương pháp và phương tiện dạy học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 9. Phương pháp và phương tiện dạy học.enc",
        "icon": "🛠️"
      },
      {
        "id": "gdh-cb-ch10",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 10: Hình thức tổ chức dạy học",
        "description": "Bộ câu hỏi trắc nghiệm Chương 10: Hình thức tổ chức dạy học",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 10. Hình thức tổ chức dạy học.enc",
        "icon": "🏫"
      },
      {
        "id": "gdh-cb-ch11",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 11: Kiểm tra, đánh giá kết quả học tập",
        "description": "Bộ câu hỏi trắc nghiệm Chương 11: Kiểm tra, đánh giá kết quả học tập",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 11. Kiểm tra, đánh giá kết quả học tập.enc",
        "icon": "📝"
      },
      {
        "id": "gdh-cb-ch12",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 12: Quá trình giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 12: Quá trình giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 12. Quá trình giáo dục.enc",
        "icon": "🌱"
      },
      {
        "id": "gdh-cb-ch13",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 13: Nguyên tắc giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 13: Nguyên tắc giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 13. Nguyên tắc giáo dục.enc",
        "icon": "⚖️"
      },
      {
        "id": "gdh-cb-ch14",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 14: Nội dung giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 14: Nội dung giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 14. Nội dung giáo dục.enc",
        "icon": "📜"
      },
      {
        "id": "gdh-cb-ch15",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 15: Phương pháp giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 15: Phương pháp giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 15. Phương pháp giáo dục.enc",
        "icon": "💡"
      },
      {
        "id": "gdh-cb-ch16",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 16: Môi trường giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 16: Môi trường giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 16. Môi trường giáo dục.enc",
        "icon": "🏡"
      },
      {
        "id": "gdh-cb-ch17",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 17: Một số vấn đề cơ bản về quản lý nhà trường",
        "description": "Bộ câu hỏi trắc nghiệm Chương 17: Một số vấn đề cơ bản về quản lý nhà trường",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 17. Một số vấn đề cơ bản về quản lý nhà trường.enc",
        "icon": "🏛️"
      },
      {
        "id": "gdh-cb-ch18",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 18: Lao động sư phạm của giáo viên và hoạt động của Hội đồng giáo dục",
        "description": "Bộ câu hỏi trắc nghiệm Chương 18: Lao động sư phạm của giáo viên và hoạt động của Hội đồng giáo dục",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 18. Lao động sư phạm của giáo viên và hoạt động của Hội đồng giáo dục.enc",
        "icon": "👩‍🏫"
      },
      {
        "id": "gdh-cb-ch19",
        "folder": "📘 Bộ câu hỏi trắc nghiệm Cơ bản",
        "title": "Chương 19: Công tác của giáo viên chủ nhiệm lớp ở trường phổ thông",
        "description": "Bộ câu hỏi trắc nghiệm Chương 19: Công tác của giáo viên chủ nhiệm lớp ở trường phổ thông",
        "file": "Giáo dục học/Bộ câu hỏi trắc nghiệm cơ bản/Chương 19. Công tác của giáo viên chủ nhiệm lớp ở trường phổ thông.enc",
        "icon": "📋"
      }
    ]
  }
];

const sampleQuizText = `Câu 1: Chủ nghĩa xã hội khoa học là một trong ba bộ phận cấu thành của:
*A. Chủ nghĩa Mác – Lênin
B. Triết học Mác – Lênin
C. Kinh tế chính trị Mác – Lênin
D. Chủ nghĩa xã hội không tưởng
Giải thích: Chủ nghĩa Mác – Lênin được tạo thành từ ba bộ phận lý luận cấu thành thống nhất: Triết học Mác – Lênin, Kinh tế chính trị Mác – Lênin và Chủ nghĩa xã hội khoa học.

Câu 2: Sản xuất đại công nghiệp là tiền đề kinh tế - xã hội cho sự ra đời của:
*A. Chủ nghĩa Mác
B. Triết học cổ điển Đức
C. Chủ nghĩa xã hội không tưởng
D. Kinh tế chính trị cổ điển Anh

Câu 3: Xác định các phát biểu sau đúng hay sai về ba bộ phận cấu thành Chủ nghĩa Mác – Lênin:
*a) Triết học Mác – Lênin là một trong ba bộ phận cấu thành
b) Mỹ học Mác – Lênin là một trong ba bộ phận cấu thành
*c) Chủ nghĩa xã hội khoa học là một trong ba bộ phận cấu thành
d) Xã hội học Mác – Lênin là một trong ba bộ phận cấu thành
Giải thích: Ba bộ phận cấu thành gồm Triết học Mác – Lênin, Kinh tế chính trị Mác – Lênin và Chủ nghĩa xã hội khoa học. Mỹ học và Xã hội học không nằm trong ba bộ phận cấu thành.`;

// Load available preset quizzes & dashboard statistics on startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPresets());
} else {
    initPresets();
}

/* ========================================================
   CUSTOM CONFIRMATION MODAL
======================================================== */
function showCustomConfirm(title, message, actionText, callback) {
    document.getElementById('confirm-modal-title').innerText = title;
    document.getElementById('confirm-modal-msg').innerText = message;
    document.getElementById('confirm-modal-action-btn').innerText = actionText || 'Đồng ý';
    confirmModalCallback = callback;
    document.getElementById('custom-confirm-modal').classList.remove('hidden');
}

function closeConfirmModal(result) {
    document.getElementById('custom-confirm-modal').classList.add('hidden');
    if (confirmModalCallback) {
        confirmModalCallback(result);
        confirmModalCallback = null;
    }
}

/* ========================================================
   PRESET & ACCORDION RENDER LOGIC
======================================================== */
async function initPresets() {
    const gridContainer = document.getElementById('preset-categories-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    let data = defaultCategories;

    try {
        const res = await fetch('quizzes.json?v=' + Date.now());
        if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) data = json;
        }
    } catch (e) {
        console.log("Dùng danh sách mặc định.");
    }

    allCategoriesData = data; // store globally

    data.forEach((group, idx) => {
        const subjectId = group.subjectId || `sub_${idx}`;
        const isCollapsed = accordionStates[subjectId] !== true;

        const accordionItem = document.createElement('div');
        accordionItem.className = `subject-accordion-item ${isCollapsed ? 'collapsed' : ''}`;
        accordionItem.id = `accordion-${subjectId}`;

        // Header bar
        const header = document.createElement('div');
        header.className = 'subject-accordion-header';
        header.onclick = () => toggleSubjectAccordion(subjectId);
        header.innerHTML = `
            <div class="subject-title-group">
                <span class="accordion-arrow">▼</span>
                <span class="subject-title">${escapeHTML(group.category)}</span>
                <span class="subject-count-badge">${group.quizzes ? group.quizzes.length + ' bài' : '0 bài'}</span>
            </div>
            <div>
                <span class="preset-badge" style="background: rgba(239, 68, 68, 0.08); color: var(--danger-text); box-shadow: none;" id="subject-wrong-badge-${subjectId}">
                    🔥 0 câu sai
                </span>
            </div>
        `;
        accordionItem.appendChild(header);

        if (group.status === 'updating' || !group.quizzes || group.quizzes.length === 0) {
            const body = document.createElement('div');
            body.className = 'subject-content-body';
            body.innerHTML = `
                <div class="preset-card updating-card">
                    <div class="preset-card-left">
                        <div class="preset-icon">🔄</div>
                        <div class="preset-info">
                            <div class="preset-title">Nội dung Giáo dục học</div>
                            <div class="preset-desc">Dữ liệu các chương đang được hệ thống cập nhật và biên soạn...</div>
                        </div>
                    </div>
                    <div class="preset-card-right">
                        <span class="preset-badge updating-badge">🔄 Đang cập nhật dữ liệu</span>
                    </div>
                </div>
            `;
            accordionItem.appendChild(body);
        } else {
            const actionsBar = document.createElement('div');
            actionsBar.className = 'subject-actions-bar';
            actionsBar.innerHTML = `
                <div class="subject-actions-left">
                    <button class="btn-danger" style="padding: 6px 14px; font-size: 0.82rem; min-height: 34px;" id="btn-retake-subject-${subjectId}" onclick="startRetakeWrongExamForSubject('${subjectId}')">
                        🔥 Ôn lại câu sai
                    </button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.82rem; min-height: 34px;" onclick="clearSubjectWrongBank('${subjectId}')">
                        Xóa kho câu sai
                    </button>
                </div>
                <div class="subject-actions-right" id="subject-history-list-${subjectId}"></div>
            `;
            accordionItem.appendChild(actionsBar);

            const body = document.createElement('div');
            body.className = 'subject-content-body';

            const pList = document.createElement('div');
            pList.className = 'preset-list';

            const mockCard = document.createElement('div');
            mockCard.className = 'preset-card mock-exam-card';
            mockCard.onclick = () => openMockModalById(subjectId);
            mockCard.innerHTML = `
                <div class="preset-card-left">
                    <div class="preset-icon">🎲</div>
                    <div class="preset-info">
                        <div class="preset-title">Thi thử Ngẫu nhiên môn này</div>
                        <div class="preset-desc">Tạo đề trộn câu hỏi ngẫu nhiên từ tất cả các chương (${group.quizzes.length} bài)</div>
                    </div>
                </div>
                <div class="preset-card-right">
                    <span class="preset-badge mock-badge">🎲 Tạo đề ngẫu nhiên</span>
                </div>
            `;
            pList.appendChild(mockCard);

            const subfoldersMap = {};
            const ungroupedQuizzes = [];

            group.quizzes.forEach((quiz, qIdx) => {
                if (quiz.folder) {
                    if (!subfoldersMap[quiz.folder]) subfoldersMap[quiz.folder] = [];
                    subfoldersMap[quiz.folder].push({ quiz, originalIndex: qIdx });
                } else {
                    ungroupedQuizzes.push({ quiz, originalIndex: qIdx });
                }
            });

            const folderNames = Object.keys(subfoldersMap);
            folderNames.forEach((fName, fIdx) => {
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
                        <span class="subfolder-arrow">▶</span>
                        <span class="subfolder-title">${escapeHTML(fName)}</span>
                        <span class="subfolder-count">${subQuizzes.length} bài</span>
                    </div>
                    <div>
                        <button class="btn-secondary" style="padding: 3px 10px; font-size: 0.76rem; min-height: 26px; border-color: rgba(99,102,241,0.3); color: var(--primary);" onclick="event.stopPropagation(); openMockModalById('${subjectId}', '${escapeHTML(fName).replace(/'/g, "\\'")}')">
                            🎲 Thi thử thư mục này
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
                    const card = document.createElement('div');
                    card.className = 'preset-card';
                    card.onclick = () => openStartQuizModalById(subjectId, item.originalIndex);
                    card.innerHTML = `
                        <div class="preset-card-left">
                            <div class="preset-icon">${quiz.icon || '📖'}</div>
                            <div class="preset-info">
                                <div class="preset-title">${escapeHTML(quiz.title)}</div>
                                <div class="preset-desc">${escapeHTML(quiz.description || '')}</div>
                            </div>
                        </div>
                        <div class="preset-card-right">
                            <span class="preset-badge">Vào làm bài ➔</span>
                        </div>
                    `;
                    sfList.appendChild(card);
                });

                sfContent.appendChild(sfList);
                sfBlock.appendChild(sfContent);
                pList.appendChild(sfBlock);
            });

            ungroupedQuizzes.forEach(item => {
                const quiz = item.quiz;
                const card = document.createElement('div');
                card.className = 'preset-card';
                card.onclick = () => openStartQuizModalById(subjectId, item.originalIndex);
                card.innerHTML = `
                    <div class="preset-card-left">
                        <div class="preset-icon">${quiz.icon || '📖'}</div>
                        <div class="preset-info">
                            <div class="preset-title">${escapeHTML(quiz.title)}</div>
                            <div class="preset-desc">${escapeHTML(quiz.description || '')}</div>
                        </div>
                    </div>
                    <div class="preset-card-right">
                        <span class="preset-badge">Vào làm bài ➔</span>
                    </div>
                `;
                pList.appendChild(card);
            });

            body.appendChild(pList);
            accordionItem.appendChild(body);
        }

        gridContainer.appendChild(accordionItem);
        updateSubjectStatsUI(subjectId);
    });
}

function toggleSubfolderAccordion(subjectId, fIdx) {
    const el = document.getElementById(`subfolder-${subjectId}-${fIdx}`);
    if (el) {
        el.classList.toggle('collapsed');
    }
}

function toggleSubjectAccordion(subjectId) {
    const item = document.getElementById(`accordion-${subjectId}`);
    if (item) {
        item.classList.toggle('collapsed');
        accordionStates[subjectId] = !item.classList.contains('collapsed');
    }
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
    selectModalQuizMode('instant'); // default to instant
    const modal = document.getElementById('start-quiz-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeStartQuizModal() {
    document.getElementById('start-quiz-modal').classList.add('hidden');
}

function selectModalQuizMode(mode) {
    currentQuizMode = mode;
    document.querySelectorAll('#start-quiz-modal .mode-card').forEach(c => c.classList.remove('active'));
    if (mode === 'instant') {
        document.getElementById('modal-mode-instant').classList.add('active');
        document.querySelector('#modal-mode-instant input').checked = true;
    } else {
        document.getElementById('modal-mode-submit').classList.add('active');
        document.querySelector('#modal-mode-submit input').checked = true;
    }
}

let pendingRetakeSubjectId = null;
let selectedRetakeMode = 'submit';

function confirmAndStartQuiz() {
    closeStartQuizModal();
    fetchAndLoadQuiz(pendingQuizFile, pendingQuizTitle || 'Đề trắc nghiệm');
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
    document.getElementById('retake-modal').classList.remove('hidden');
}

function selectRetakeQuizMode(mode) {
    selectedRetakeMode = mode;
    currentQuizMode = mode;
    document.querySelectorAll('#retake-modal .mode-card').forEach(c => c.classList.remove('active'));
    if (mode === 'instant') {
        const inst = document.getElementById('retake-mode-instant');
        if (inst) inst.classList.add('active');
        const rad = document.querySelector('#retake-mode-instant input');
        if (rad) rad.checked = true;
    } else {
        const sub = document.getElementById('retake-mode-submit');
        if (sub) sub.classList.add('active');
        const rad = document.querySelector('#retake-mode-submit input');
        if (rad) rad.checked = true;
    }
}

function closeRetakeModal() {
    document.getElementById('retake-modal').classList.add('hidden');
}

async function confirmRetakeWrongExam() {
    closeRetakeModal();

    currentSubjectId = pendingRetakeSubjectId || 'cnxh';
    const wrongBankAll = await getStoredWrongBank();
    const wrongBank = wrongBankAll.filter(b => (b.subjectId || 'cnxh') === currentSubjectId);
    if (wrongBank.length === 0) return;

    currentQuestions = JSON.parse(JSON.stringify(wrongBank));
    currentQuestions.forEach((q, idx) => {
        q.id = String(idx + 1);
        q.userAnswers = [];
        q.userTFAnswers = {};
        q.isGraded = false;
        q.isCorrect = false;
    });

    currentQuizMode = selectedRetakeMode;
    document.getElementById('current-quiz-name').innerText = `🔥 Luyện lại câu sai (${currentQuestions.length} câu)`;
    document.getElementById('file-status').innerText = `📄 Đã nạp ${currentQuestions.length} câu hỏi sai để luyện lại.`;

    isQuizSubmitted = false;
    stopCountdownTimer();
    const timerBadge = document.getElementById('timer-badge');
    if (timerBadge) timerBadge.classList.add('hidden');

    enterQuizScreen();
    renderQuiz();
    renderSidebarNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMockModalById(subjectId, folderName = null) {
    const group = allCategoriesData.find(g => (g.subjectId || '') === subjectId);
    if (!group) return;
    activeSubjectGroup = group;
    activeMockFolderName = folderName;
    currentSubjectId = subjectId;

    const modalTitle = folderName ? `Thi thử: ${folderName}` : `Thi thử ngẫu nhiên: ${group.category}`;
    document.getElementById('mock-modal-title').innerText = modalTitle;

    setMockCount(20);
    setMockTime(15);
    selectMockQuizMode('instant');

    document.getElementById('mock-exam-modal').classList.remove('hidden');
}

function closeMockModal() {
    document.getElementById('mock-exam-modal').classList.add('hidden');
}

function setMockCount(count) {
    selectedMockCount = count;
    const container = document.getElementById('count-pills');
    container.querySelectorAll('.pill-opt').forEach(pill => pill.classList.remove('active'));
    const target = container.querySelector(`[data-count="${count}"]`);
    if (target) target.classList.add('active');
    document.getElementById('custom-count-input').value = "";
}

function setCustomMockCount(val) {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
        selectedMockCount = parsed;
        const container = document.getElementById('count-pills');
        container.querySelectorAll('.pill-opt').forEach(pill => pill.classList.remove('active'));
    }
}

function setMockTime(timeMins) {
    selectedMockTime = timeMins;
    const container = document.getElementById('timer-pills');
    container.querySelectorAll('.pill-opt').forEach(pill => pill.classList.remove('active'));
    const target = container.querySelector(`[data-time="${timeMins}"]`);
    if (target) target.classList.add('active');
    document.getElementById('custom-time-input').value = "";
}

function setCustomMockTime(val) {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
        selectedMockTime = parsed;
        const container = document.getElementById('timer-pills');
        container.querySelectorAll('.pill-opt').forEach(pill => pill.classList.remove('active'));
    }
}

function selectMockQuizMode(mode) {
    selectedMockMode = mode;
    currentQuizMode = mode;
    document.querySelectorAll('#mock-exam-modal .mode-card').forEach(card => card.classList.remove('active'));
    if (mode === 'instant') {
        document.getElementById('mock-mode-instant').classList.add('active');
        document.querySelector('#mock-mode-instant input').checked = true;
    } else {
        document.getElementById('mock-mode-submit').classList.add('active');
        document.querySelector('#mock-mode-submit input').checked = true;
    }
}

async function startRandomMockExam() {
    if (!activeSubjectGroup || !activeSubjectGroup.quizzes) return;
    closeMockModal();

    document.getElementById('file-status').innerText = `⌛ Đang gộp dữ liệu...`;

    try {
        let targetQuizzes = activeSubjectGroup.quizzes;
        if (activeMockFolderName) {
            targetQuizzes = targetQuizzes.filter(q => (q.folder || 'Các bài trắc nghiệm khác') === activeMockFolderName);
        }

        const fetchPromises = targetQuizzes.map(async (q) => {
            return await getQuizDataText(q.file);
        });
        const results = await Promise.all(fetchPromises);

        let allQuestionsPool = [];
        results.forEach(textData => {
            const parsed = parseQuizText(textData);
            allQuestionsPool = allQuestionsPool.concat(parsed);
        });

        if (allQuestionsPool.length === 0) {
            alert("Không thể gộp được câu hỏi nào từ danh mục này!");
            return;
        }

        for (let i = allQuestionsPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestionsPool[i], allQuestionsPool[j]] = [allQuestionsPool[j], allQuestionsPool[i]];
        }

        let finalCount = allQuestionsPool.length;
        if (selectedMockCount !== 'all' && typeof selectedMockCount === 'number') {
            finalCount = Math.min(selectedMockCount, allQuestionsPool.length);
        }

        currentQuestions = allQuestionsPool.slice(0, finalCount);

        currentQuestions.forEach((q, idx) => {
            q.id = String(idx + 1);
        });

        currentQuizMode = selectedMockMode;

        const scopeTitle = activeMockFolderName ? ` (${activeMockFolderName})` : '';
        document.getElementById('current-quiz-name').innerText = `🎲 Thi thử ngẫu nhiên${scopeTitle} (${finalCount} câu - ${selectedMockTime > 0 ? selectedMockTime + ' phút' : 'Không giới hạn'})`;
        document.getElementById('file-status').innerText = `📄 Đã tạo đề thi thử: ${finalCount} câu ngẫu nhiên.`;

        isQuizSubmitted = false;
        enterQuizScreen();
        renderQuiz();
        renderSidebarNav();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (selectedMockTime > 0) {
            startCountdownTimer(selectedMockTime);
        } else {
            stopCountdownTimer();
            document.getElementById('timer-badge').classList.add('hidden');
        }

    } catch (err) {
        alert("Lỗi khi tạo đề thi ngẫu nhiên: " + err.message);
    }
}

/* ========================================================
   COUNTDOWN TIMER LOGIC
======================================================== */
function startCountdownTimer(minutes) {
    stopCountdownTimer();
    totalSecondsLeft = minutes * 60;
    
    const badge = document.getElementById('timer-badge');
    badge.classList.remove('hidden', 'warning-timer');

    updateTimerDisplay();

    timerInterval = setInterval(() => {
        totalSecondsLeft--;
        if (totalSecondsLeft <= 120) {
            badge.classList.add('warning-timer');
        }
        if (totalSecondsLeft <= 0) {
            stopCountdownTimer();
            alert("⏰ ĐÃ HẾT THỜI GIAN LÀM BÀI! Hệ thống sẽ tự động nộp bài.");
            submitQuiz();
        }
        updateTimerDisplay();
    }, 1000);
}

function stopCountdownTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(Math.max(0, totalSecondsLeft) / 60);
    const secs = Math.max(0, totalSecondsLeft) % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timer-display').innerText = formatted;
}

function findEmbeddedQuizBase64(filePath) {
    if (!window.EMBEDDED_QUIZZES || !filePath) return null;
    
    // 1. Direct match
    if (window.EMBEDDED_QUIZZES[filePath]) return window.EMBEDDED_QUIZZES[filePath];

    // 2. Cleaned & decoded path
    const clean = filePath.replace(/^\.?\/+/, '');
    if (window.EMBEDDED_QUIZZES[clean]) return window.EMBEDDED_QUIZZES[clean];

    const decoded = decodeURIComponent(clean);
    if (window.EMBEDDED_QUIZZES[decoded]) return window.EMBEDDED_QUIZZES[decoded];

    // 3. Normalized NFC match
    const normClean = clean.normalize('NFC');
    const normDecoded = decoded.normalize('NFC');
    
    for (const key in window.EMBEDDED_QUIZZES) {
        const keyNorm = key.normalize('NFC');
        if (keyNorm === normClean || keyNorm === normDecoded || keyNorm.endsWith(normDecoded)) {
            return window.EMBEDDED_QUIZZES[key];
        }
    }

    return null;
}

async function getQuizDataText(filePath) {
    let arrayBuffer = null;

    try {
        const res = await fetch(encodeURI(filePath) + '?v=' + Date.now());
        if (res.ok) {
            if (filePath.endsWith('.enc')) {
                arrayBuffer = await res.arrayBuffer();
            } else {
                return await res.text();
            }
        }
    } catch (e) {
        console.warn("Fetch API failed (file:// CORS restriction). Using embedded bundle fallback.", e);
    }

    if (!arrayBuffer) {
        const b64 = findEmbeddedQuizBase64(filePath);
        if (b64) {
            const binary = window.atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            arrayBuffer = bytes.buffer;
        }
    }

    if (arrayBuffer) {
        return await decryptQuizArrayBuffer(arrayBuffer);
    }

    throw new Error("Không thể nạp tệp đề thi: " + filePath + "\nHãy kiểm tra đường dẫn tệp.");
}

async function fetchAndLoadQuiz(filePath, title) {
    stopCountdownTimer();
    const timerBadge = document.getElementById('timer-badge');
    if (timerBadge) timerBadge.classList.add('hidden');

    if (!filePath) {
        // Raw text input mode
        const fileStatus = document.getElementById('file-status');
        if (fileStatus) fileStatus.innerText = `📄 Đã nạp đề nhập tay`;
        const quizName = document.getElementById('current-quiz-name');
        if (quizName) quizName.innerText = `📖 Đề: ${title || 'Đề nhập tay'}`;
        processInput();
        return;
    }

    try {
        const fileStatus = document.getElementById('file-status');
        if (fileStatus) fileStatus.innerText = `⌛ Đang tải và giải mã dữ liệu từ ${title}...`;
        
        const textData = await getQuizDataText(filePath);

        const textInput = document.getElementById('text-input');
        if (textInput) textInput.value = textData;
        if (fileStatus) fileStatus.innerText = `📄 Đã tải xong: ${title}`;
        const quizName = document.getElementById('current-quiz-name');
        if (quizName) quizName.innerText = `📖 Đề: ${title}`;
        processInput();
    } catch (err) {
        alert("Lỗi khi đọc file đề thi: " + err.message);
        const fileStatus = document.getElementById('file-status');
        if (fileStatus) fileStatus.innerText = `⚠️ Không thể tải file ${filePath}`;
    }
}

// File input listener setup
const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('file-status').innerText = `📁 Đang chọn file: ${file.name}`;
        document.getElementById('current-quiz-name').innerText = `📖 Đề: ${file.name}`;
        const reader = new FileReader();
        reader.onload = function(evt) { document.getElementById('text-input').value = evt.target.result; };
        reader.readAsText(file, 'UTF-8');
    });
}

function loadSampleText() {
    document.getElementById('text-input').value = sampleQuizText;
    document.getElementById('file-status').innerText = "📄 Đã tải cấu trúc đề mẫu thành công";
    document.getElementById('current-quiz-name').innerText = "📖 Đề mẫu thử nghiệm";
}

function clearInput() {
    document.getElementById('text-input').value = "";
    if (document.getElementById('file-input')) document.getElementById('file-input').value = "";
    document.getElementById('file-status').innerText = "📄 Kéo thả hoặc click để chọn file cấu trúc .txt";
}

/* ========================================================
   SCREEN TRANSITION & BROWSER / MOBILE HISTORY HANDLER
======================================================== */
function enterQuizScreen() {
    const inputCard = document.getElementById('input-card');
    if (inputCard) inputCard.classList.add('hidden');

    const quizApp = document.getElementById('quiz-app');
    if (quizApp) quizApp.classList.remove('hidden');
    
    try {
        window.history.pushState({ page: 'quiz' }, "", "#quiz");
    } catch (e) {
        console.warn("pushState ignored for file:// sandbox:", e);
    }
    setMobileNavVisibility(true);
}

function backToConfig(shouldGoBackHistory = true) {
    if (shouldGoBackHistory && window.location.hash === '#quiz') {
        try {
            window.history.back();
            return;
        } catch (e) {
            console.warn("history.back ignored:", e);
        }
    }
    stopCountdownTimer();
    const quizApp = document.getElementById('quiz-app');
    if (quizApp) quizApp.classList.add('hidden');

    const inputCard = document.getElementById('input-card');
    if (inputCard) inputCard.classList.remove('hidden');

    setMobileNavVisibility(false);
    updateSubjectStatsUI(currentSubjectId);
}

window.addEventListener('popstate', function(e) {
    const quizApp = document.getElementById('quiz-app');
    if (quizApp && !quizApp.classList.contains('hidden')) {
        backToConfig(false);
    }
});

function processInput() {
    const rawText = document.getElementById('text-input').value;
    currentQuestions = parseQuizText(rawText);

    if (currentQuestions.length === 0) {
        alert("Không tìm thấy câu hỏi hợp lệ! Hãy đảm bảo cấu trúc bắt đầu bằng 'Câu X:'.");
        return;
    }

    isQuizSubmitted = false;
    enterQuizScreen();
    renderQuiz();
    renderSidebarNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========================================================
   QUIZ RENDERING & INTERACTION LOGIC
======================================================== */
function renderQuiz() {
    const container = document.getElementById('questions-container');
    container.innerHTML = "";

    currentQuestions.forEach(q => {
        const card = document.createElement('div');
        card.id = `card-${q.id}`;
        card.className = `question-card ${q.isGraded ? (q.isCorrect ? 'correct' : 'incorrect') : ''}`;

        let badgeText = "1 Đáp án";
        let badgeClass = "badge-single";
        if (q.type === "multiple") {
            badgeText = "Nhiều đáp án";
            badgeClass = "badge-multiple";
        } else if (q.type === "truefalse") {
            badgeText = "Đúng / Sai";
            badgeClass = "badge-truefalse";
        } else if (q.type === "fill") {
            badgeText = "Điền từ";
            badgeClass = "badge-fill";
        }

        let html = `
            <div class="question-header">
                <span class="question-title">Câu ${q.id}</span>
                <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="question-text">${escapeHTML(q.question)}</div>
        `;

        if (q.isGraded) {
            if (q.isCorrect) {
                html += `<div class="feedback-badge feedback-correct">✓ Chính xác!</div>`;
            } else {
                html += `<div class="feedback-badge feedback-incorrect">✕ Chưa chính xác!</div>`;
            }
        }

        if (q.type === "truefalse") {
            html += `<div class="tf-assertions-list">`;
            q.options.forEach(opt => {
                const userChoice = q.userTFAnswers ? q.userTFAnswers[opt.letter] : undefined;
                const isSelectedDung = userChoice === true;
                const isSelectedSai = userChoice === false;
                const isGradedRow = q.isGraded;
                const isThisRowCorrect = isGradedRow ? (userChoice === opt.isDung) : false;

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

                    const correctKeyPill = `<span class="tf-result-pill correct-key">Đáp án: ${opt.isDung ? 'Đúng' : 'Sai'}</span>`;

                    html += `
                        <div class="tf-result-badge-group">
                            ${userChoicePill}
                            ${correctKeyPill}
                        </div>
                    `;
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
            q.options.forEach(opt => {
                const isChecked = q.userAnswers.includes(opt.letter);
                let optClass = "";
                let choiceBadge = "";
                if (q.isGraded) {
                    if (q.correctAnswers.includes(opt.letter)) {
                        optClass = "correct-opt";
                        if (isChecked) {
                            choiceBadge = `<span class="opt-badge opt-badge-correct">✓ Đáp án đúng bạn chọn</span>`;
                        } else {
                            choiceBadge = `<span class="opt-badge opt-badge-correct-key">✓ Đáp án chuẩn</span>`;
                        }
                    } else if (isChecked) {
                        optClass = "incorrect-opt";
                        choiceBadge = `<span class="opt-badge opt-badge-wrong">✕ Bạn chọn sai</span>`;
                    }
                }

                const inputType = q.type === "multiple" ? "checkbox" : "radio";
                const disabledClick = q.isGraded ? "disabled-click" : "";
                html += `
                    <label class="option-item ${optClass} ${disabledClick}" onclick="${q.type === 'multiple' ? `handleMultipleSelection('${q.id}')` : `handleUserSelection('${q.id}', '${opt.letter}')`}">
                        <input type="${inputType}" name="q_${q.id}" value="${opt.letter}" ${isChecked ? 'checked' : ''} ${q.isGraded ? 'disabled' : ''}>
                        <div class="option-content">
                            <span class="option-letter">${opt.letter}.</span>
                            <span class="option-text-val">${escapeHTML(opt.text)}</span>
                        </div>
                        ${choiceBadge}
                    </label>
                `;
            });
        }

        if (currentQuizMode === 'instant' && !q.isGraded) {
            let hasSelectedAny = false;
            if (q.type === 'truefalse') {
                hasSelectedAny = Object.keys(q.userTFAnswers || {}).length > 0;
            } else if (q.type === 'fill') {
                hasSelectedAny = (q.userAnswers && q.userAnswers[0] ? String(q.userAnswers[0]).trim().length > 0 : false);
            } else {
                hasSelectedAny = Array.isArray(q.userAnswers) && q.userAnswers.length > 0;
            }

            const displayStyle = hasSelectedAny ? 'flex' : 'none';

            html += `
                <div class="btn-action-zone" id="action-zone-${q.id}" style="display: ${displayStyle};">
                    <span class="action-zone-hint">💡 Đã chọn đáp án. Bấm nút để kiểm tra:</span>
                    <button class="btn-instant-confirm" onclick="gradeIndividualQuestion('${q.id}')">
                        <span class="btn-icon">✨</span> Kiểm tra & Xem giải thích
                    </button>
                </div>
            `;
        }

        const expDisplay = q.isGraded ? "block" : "none";
        html += `
            <div class="explanation-box" id="exp-${q.id}" style="display: ${expDisplay};">
                <div class="explanation-title">💡 Giải thích chi tiết:</div>
                <div>${formatExplanationHTML(q.explanation)}</div>
            </div>
        `;

        card.innerHTML = html;
        container.appendChild(card);
    });

    if (!isQuizSubmitted) {
        const submitCard = document.createElement('div');
        submitCard.className = 'quiz-bottom-submit-zone';
        submitCard.style.cssText = 'margin: 30px 0; text-align: center; background: var(--bg-card); padding: 24px; border-radius: var(--radius-lg); border: 2px dashed var(--primary-light); box-shadow: 0 4px 12px rgba(0,0,0,0.05);';
        submitCard.innerHTML = `
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
                🎉 Bạn đã sẵn sàng hoàn thành bài làm?
            </div>
            <button class="btn-success" style="padding: 14px 32px; font-size: 1.05rem; font-weight: 800; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.3);" onclick="submitQuiz()">
                ✓ Nộp bài & Chấm điểm
            </button>
        `;
        container.appendChild(submitCard);
    }

    updateProgress();
}

function updateInstantActionZone(qId) {
    if (currentQuizMode !== 'instant') return;
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;

    let hasSelectedAny = false;
    if (q.type === 'truefalse') {
        hasSelectedAny = Object.keys(q.userTFAnswers || {}).length > 0;
    } else if (q.type === 'fill') {
        hasSelectedAny = (q.userAnswers && q.userAnswers[0] ? String(q.userAnswers[0]).trim().length > 0 : false);
    } else {
        hasSelectedAny = Array.isArray(q.userAnswers) && q.userAnswers.length > 0;
    }

    const actionZone = document.getElementById(`action-zone-${qId}`);
    if (actionZone) {
        actionZone.style.display = hasSelectedAny ? 'flex' : 'none';
    }
}

function handleUserSelection(qId, letter) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;

    q.userAnswers = [letter];
    updateProgress();
    if (currentQuizMode === 'instant') {
        gradeIndividualQuestion(qId);
        renderSidebarNav();
    }
}

function handleMultipleSelection(qId) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;

    setTimeout(() => {
        const checkedBoxes = document.querySelectorAll(`input[name="q_${qId}"]:checked`);
        q.userAnswers = Array.from(checkedBoxes).map(cb => cb.value);
        updateProgress();
        if (currentQuizMode === 'instant') {
            updateInstantActionZone(qId);
            renderSidebarNav();
        }
    }, 0);
}

function handleFillInput(qId) {
    const q = currentQuestions.find(item => item.id === qId);
    if (!q || q.isGraded) return;

    const inputVal = document.getElementById(`fill-input-${qId}`).value;
    q.userAnswers = [inputVal];
    updateProgress();
    if (currentQuizMode === 'instant') {
        updateInstantActionZone(qId);
        renderSidebarNav();
    }
}

function handleFillKeyPress(e, qId) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const q = currentQuestions.find(item => item.id === qId);
        if (!q || q.isGraded) return;
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
    if (currentQuizMode === 'instant') {
        updateInstantActionZone(qId);
        renderSidebarNav();
    }
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
        if (!q.options || q.options.length === 0) {
            allAssertionsCorrect = false;
        } else {
            q.options.forEach(opt => {
                const userChoice = q.userTFAnswers ? q.userTFAnswers[opt.letter] : undefined;
                if (userChoice !== opt.isDung) {
                    allAssertionsCorrect = false;
                }
            });
        }
        q.isCorrect = allAssertionsCorrect;
    } else {
        const userSorted = [...q.userAnswers].sort().join(',');
        const correctSorted = [...(q.correctAnswers || [])].sort().join(',');
        q.isCorrect = (userSorted !== "" && userSorted === correctSorted);
    }

    const card = document.getElementById(`card-${qId}`);
    if (card) {
        card.className = `question-card ${q.isCorrect ? 'correct' : 'incorrect'}`;

        const header = card.querySelector('.question-header');
        if (header) {
            const oldBadge = card.querySelector('.feedback-badge');
            if (oldBadge) oldBadge.remove();

            const feedbackBadge = document.createElement('div');
            feedbackBadge.className = `feedback-badge ${q.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
            feedbackBadge.innerText = q.isCorrect ? "✓ Chính xác!" : "✕ Chưa chính xác!";
            header.insertAdjacentElement('afterend', feedbackBadge);
        }

        if (q.type === "truefalse") {
            q.options.forEach(opt => {
                const row = document.getElementById(`tf-row-${qId}-${opt.letter}`);
                if (row) {
                    const leftContainer = row.querySelector('.tf-assertion-left');
                    const toggleGroup = row.querySelector('.tf-toggle-group');

                    row.classList.add('tf-graded');

                    const userChoice = q.userTFAnswers ? q.userTFAnswers[opt.letter] : undefined;
                    const isThisCorrect = (userChoice === opt.isDung);

                    if (leftContainer && !leftContainer.querySelector('.tf-assertion-icon')) {
                        const iconSpan = document.createElement('span');
                        iconSpan.className = 'tf-assertion-icon';
                        if (isThisCorrect) {
                            iconSpan.style.color = 'var(--success)';
                            iconSpan.innerText = '✓';
                        } else {
                            iconSpan.style.color = 'var(--danger)';
                            iconSpan.innerText = '✕';
                        }
                        leftContainer.insertBefore(iconSpan, leftContainer.firstChild);
                    }

                    if (toggleGroup) toggleGroup.style.display = 'none';

                    let badgeGroup = row.querySelector('.tf-result-badge-group');
                    if (!badgeGroup) {
                        badgeGroup = document.createElement('div');
                        badgeGroup.className = 'tf-result-badge-group';
                        row.appendChild(badgeGroup);
                    }

                    let userChoicePill = '';
                    if (userChoice === undefined) {
                        userChoicePill = `<span class="tf-result-pill user-wrong">Chưa chọn</span>`;
                    } else if (isThisCorrect) {
                        userChoicePill = `<span class="tf-result-pill user-correct">✓ Chọn: ${userChoice ? 'Đúng' : 'Sai'}</span>`;
                    } else {
                        userChoicePill = `<span class="tf-result-pill user-wrong">✕ Chọn: ${userChoice ? 'Đúng' : 'Sai'}</span>`;
                    }

                    const correctKeyPill = `<span class="tf-result-pill correct-key">Đáp án: ${opt.isDung ? 'Đúng' : 'Sai'}</span>`;
                    badgeGroup.innerHTML = `${userChoicePill} ${correctKeyPill}`;

                    if (isThisCorrect) {
                        row.classList.add('tf-correct');
                    } else {
                        row.classList.add('tf-incorrect');
                    }
                }
            });
        } else if (q.type === "fill") {
            const input = document.getElementById(`fill-input-${qId}`);
            if (input) input.disabled = true;

            if (!q.isCorrect) {
                let ansDisp = card.querySelector('.correct-ans-display');
                if (!ansDisp) {
                    ansDisp = document.createElement('div');
                    ansDisp.className = 'correct-ans-display';
                    ansDisp.innerHTML = `💡 Đáp án chuẩn: <strong>${escapeHTML(q.fillAnswer)}</strong>`;
                    const container = card.querySelector('.fill-container');
                    if (container) container.appendChild(ansDisp);
                }
            }
        } else {
            const options = card.querySelectorAll('.option-item');
            options.forEach(optLabel => {
                const input = optLabel.querySelector('input');
                if (input) {
                    const val = input.value;
                    const isUserSelected = q.userAnswers.includes(val);
                    const isCorrectKey = q.correctAnswers.includes(val);

                    input.checked = isUserSelected;
                    input.disabled = true;
                    optLabel.classList.add('disabled-click');

                    const oldBadge = optLabel.querySelector('.opt-badge');
                    if (oldBadge) oldBadge.remove();

                    if (isCorrectKey) {
                        optLabel.classList.add('correct-opt');
                        const badge = document.createElement('span');
                        badge.className = isUserSelected ? 'opt-badge opt-badge-correct' : 'opt-badge opt-badge-correct-key';
                        badge.innerHTML = isUserSelected ? '✓ Đáp án đúng bạn chọn' : '✓ Đáp án chuẩn';
                        optLabel.appendChild(badge);
                    } else if (isUserSelected) {
                        optLabel.classList.add('incorrect-opt');
                        const badge = document.createElement('span');
                        badge.className = 'opt-badge opt-badge-wrong';
                        badge.innerHTML = '✕ Bạn chọn sai';
                        optLabel.appendChild(badge);
                    }
                }
            });
        }

        const actionZone = card.querySelector('.btn-action-zone');
        if (actionZone) actionZone.style.display = 'none';

        const expDiv = document.getElementById(`exp-${qId}`);
        if (expDiv) {
            expDiv.style.display = "block";
        }
    }

    updateProgress();
}

function submitQuiz() {
    stopCountdownTimer();

    if (currentQuestions.length === 0) return;

    const unansweredCount = currentQuestions.filter(q => q.userAnswers.length === 0).length;
    if (unansweredCount > 0 && totalSecondsLeft > 0) {
        showCustomConfirm("Nộp Bài Thi", `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`, "Nộp bài ngay", (confirmed) => {
            if (confirmed) executeSubmitQuiz();
        });
        return;
    }

    executeSubmitQuiz();
}

async function executeSubmitQuiz() {
    currentQuestions.forEach(q => {
        if (!q.isGraded) {
            gradeIndividualQuestion(q.id);
        }
    });

    isQuizSubmitted = true;

    // Score summary
    const total = currentQuestions.length;
    const correctCount = currentQuestions.filter(q => q.isCorrect).length;
    const incorrectCount = total - correctCount;
    const scoreText = `${correctCount}/${total}`;

    document.getElementById('summary-score-text').innerText = scoreText;
    document.getElementById('summary-correct-count').innerText = `✓ ${correctCount} câu đúng`;
    document.getElementById('summary-incorrect-count').innerText = `✕ ${incorrectCount} câu sai`;
    document.getElementById('score-summary').classList.remove('hidden');

    // Save History & Wrong Questions to LocalStorage per subject
    const title = document.getElementById('current-quiz-name').innerText.replace(/^📖 Đề:\s*|^🎲\s*|^🔥\s*/, '');
    await saveQuizHistoryItem(currentSubjectId, title, scoreText, correctCount, total);
    await saveWrongQuestions(currentSubjectId, currentQuestions);

    document.getElementById('score-summary').scrollIntoView({ behavior: 'smooth' });
}

function renderSidebarNav() {
    const navGrid = document.getElementById('q-nav-grid');
    const mobileStrip = document.getElementById('mobile-q-strip');
    if (!navGrid || !mobileStrip) return;
    navGrid.innerHTML = "";
    mobileStrip.innerHTML = "";

    currentQuestions.forEach(q => {
        const btn = document.createElement('button');
        btn.id = `nav-btn-${q.id}`;
        btn.innerText = q.id;
        btn.onclick = () => scrollToQuestion(q.id);
        navGrid.appendChild(btn);

        const mBtn = document.createElement('button');
        mBtn.id = `mobile-nav-btn-${q.id}`;
        mBtn.innerText = q.id;
        mBtn.onclick = () => scrollToQuestion(q.id);
        mobileStrip.appendChild(mBtn);
    });

    updateProgress();
}

function updateProgress() {
    const total = currentQuestions.length;
    let answeredCount = 0;

    currentQuestions.forEach(q => {
        const btn = document.getElementById(`nav-btn-${q.id}`);
        const mBtn = document.getElementById(`mobile-nav-btn-${q.id}`);

        const stateClass = q.isGraded ? (q.isCorrect ? 'correct' : 'incorrect') : (q.userAnswers.length > 0 ? 'answered' : '');
        
        if (btn) btn.className = `q-nav-btn ${stateClass}`.trim();
        if (mBtn) mBtn.className = `q-nav-btn ${stateClass}`.trim();

        if (q.isGraded || q.userAnswers.length > 0) {
            answeredCount++;
        }
    });

    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    const summaryText = `${answeredCount}/${total} (${percent}%)`;

    const pBadge = document.getElementById('progress-badge');
    const mpText = document.getElementById('mobile-progress-text');
    const fProgress = document.getElementById('floating-progress');
    const pBar = document.getElementById('progress-bar');

    if (pBadge) pBadge.innerText = summaryText;
    if (mpText) mpText.innerText = summaryText;
    if (fProgress) fProgress.innerText = summaryText;
    if (pBar) pBar.style.width = `${percent}%`;

    const submitBtn = document.getElementById('btn-submit-quiz');
    if (submitBtn) {
        if (isQuizSubmitted) {
            submitBtn.classList.add('hidden');
        } else {
            submitBtn.classList.remove('hidden');
        }
    }
}

function setMobileNavVisibility(visible) {
    const sidebar = document.getElementById('quiz-sidebar');
    const floatingBar = document.getElementById('mobile-floating-bar');

    if (visible) {
        if (sidebar) sidebar.classList.remove('nav-hidden');
        if (floatingBar) floatingBar.classList.add('hidden');
        document.body.classList.add('has-mobile-nav');
    } else {
        if (sidebar) {
            sidebar.classList.add('nav-hidden');
            sidebar.classList.remove('drawer-expanded');
        }
        if (floatingBar && !document.getElementById('quiz-app').classList.contains('hidden')) {
            floatingBar.classList.remove('hidden');
        }
        document.body.classList.remove('has-mobile-nav');
    }
}

function toggleMobileExpand() {
    const sidebar = document.getElementById('quiz-sidebar');
    const expandBtn = document.getElementById('mobile-toggle-expand-btn');

    if (sidebar) sidebar.classList.toggle('drawer-expanded');
    if (expandBtn) {
        if (sidebar && sidebar.classList.contains('drawer-expanded')) {
            expandBtn.innerText = "▼ Thu gọn";
        } else {
            expandBtn.innerText = "▲ Tất cả câu";
        }
    }
}

function scrollToQuestion(qId) {
    const card = document.getElementById(`card-${qId}`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('highlight-flash');
    void card.offsetWidth; // trigger reflow
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
    document.getElementById('score-summary').classList.add('hidden');
    const sidebar = document.getElementById('quiz-sidebar');
    if (sidebar) sidebar.classList.remove('drawer-expanded');
    const expandBtn = document.getElementById('mobile-toggle-expand-btn');
    if (expandBtn) expandBtn.innerText = "▲ Tất cả câu";
    renderQuiz();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (selectedMockTime > 0) {
        startCountdownTimer(selectedMockTime);
    }
}
