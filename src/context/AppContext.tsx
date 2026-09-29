import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, AttendanceRecord, Certificate, Club, ExamSession, ExamSheet, Student, VideoSubmission, VideoExamResult } from '../types';
import { storageService, DEFAULT_SETTINGS } from '../services/storageService';
import { googleSheetService } from '../services/googleSheetService';
import { generateId } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

interface AppContextType {
  // Dữ liệu
  clubs: Club[];
  students: Student[];
  exams: ExamSession[];
  examSheets: ExamSheet[];
  certificates: Certificate[];
  attendance: AttendanceRecord[];
  videos: VideoSubmission[];
  settings: AppSettings;
  
  // Trạng thái đồng bộ Google Sheet
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncMessage: string;

  // Bộ lọc toàn cục
  selectedClubFilter: string; // 'ALL' hoặc clubId
  setSelectedClubFilter: (clubId: string) => void;

  // Quản lý Võ Sinh (CRUD)
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;

  // Quản lý CLB (CRUD)
  addClub: (club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>) => Club;
  updateClub: (club: Club) => void;
  deleteClub: (id: string) => void;

  // Quản lý Đợt thi (CRUD)
  addExam: (exam: Omit<ExamSession, 'id' | 'createdAt' | 'updatedAt'>) => ExamSession;
  updateExam: (exam: ExamSession) => void;
  deleteExam: (id: string) => void;

  // Quản lý Phiếu thi & Đăng ký thi (CRUD)
  addExamSheet: (sheet: Omit<ExamSheet, 'id' | 'createdAt' | 'updatedAt'>) => ExamSheet;
  updateExamSheet: (sheet: ExamSheet) => void;
  deleteExamSheet: (id: string) => void;

  // Quản lý Video bài thi & Chấm điểm (CRUD & Grading)
  addVideoSubmission: (video: Omit<VideoSubmission, 'id' | 'createdAt' | 'updatedAt'>) => VideoSubmission;
  updateVideoSubmission: (video: VideoSubmission) => void;
  deleteVideoSubmission: (id: string) => void;
  gradeVideoSubmission: (id: string, status: VideoExamResult, judgeNote?: string, reviewerName?: string) => void;

  // Quản lý Văn bằng (CRUD)
  addCertificate: (cert: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>) => Certificate;
  updateCertificate: (cert: Certificate) => void;
  deleteCertificate: (id: string) => void;
  generateCertificatesForExam: (examId: string) => { createdCount: number };

  // Quản lý Điểm danh
  saveAttendanceBatch: (records: AttendanceRecord[]) => void;

  // Cấu hình & Đồng bộ
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  syncToGoogleSheet: () => Promise<boolean>;
  pullFromGoogleSheet: () => Promise<boolean>;
  resetToSampleData: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clubs, setClubs] = useState<Club[]>(() => storageService.loadClubs());
  const [students, setStudents] = useState<Student[]>(() => storageService.loadStudents());
  const [exams, setExams] = useState<ExamSession[]>(() => storageService.loadExams());
  const [examSheets, setExamSheets] = useState<ExamSheet[]>(() => storageService.loadExamSheets());
  const [certificates, setCertificates] = useState<Certificate[]>(() => storageService.loadCertificates());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.loadAttendance());
  const [videos, setVideos] = useState<VideoSubmission[]>(() => storageService.loadVideoSubmissions());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings());

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncMessage, setLastSyncMessage] = useState<string>('');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('ALL');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info',
      title?: string,
      duration = 5000
    ) => {
      const id = generateId('toast');
      setToasts(prev => [...prev, { id, type, message, title, duration }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Tự động lưu LocalStorage khi dữ liệu thay đổi
  useEffect(() => { storageService.saveClubs(clubs); }, [clubs]);
  useEffect(() => { storageService.saveStudents(students); }, [students]);
  useEffect(() => { storageService.saveExams(exams); }, [exams]);
  useEffect(() => { storageService.saveExamSheets(examSheets); }, [examSheets]);
  useEffect(() => { storageService.saveCertificates(certificates); }, [certificates]);
  useEffect(() => { storageService.saveAttendance(attendance); }, [attendance]);
  useEffect(() => { storageService.saveVideoSubmissions(videos); }, [videos]);
  useEffect(() => { storageService.saveSettings(settings); }, [settings]);

  // ===================== TỰ ĐỘNG ĐỒNG BỘ GOOGLE SHEETS =====================
  const triggerAutoSaveStudent = (student: Student) => {
    if (!settings.googleSheetScriptUrl) return;
    setSyncStatus('syncing');
    googleSheetService.saveSingleRecord(
      settings.googleSheetScriptUrl,
      settings.secretToken,
      'saveStudent',
      student
    ).then(res => {
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncMessage(`Đã đồng bộ võ sinh lúc ${new Date().toLocaleTimeString('vi-VN')}`);
        updateSettings({ lastSyncedAt: new Date().toISOString() });
      } else {
        setSyncStatus('error');
      }
    }).catch(err => {
      console.warn('Lỗi tự động đẩy võ sinh lên Google Sheet:', err);
      setSyncStatus('error');
    });
  };

  const triggerAutoDeleteStudent = (studentId: string) => {
    if (!settings.googleSheetScriptUrl) return;
    setSyncStatus('syncing');
    googleSheetService.deleteSingleRecord(
      settings.googleSheetScriptUrl,
      settings.secretToken,
      'deleteStudent',
      studentId
    ).then(res => {
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncMessage(`Đã đồng bộ xóa võ sinh lúc ${new Date().toLocaleTimeString('vi-VN')}`);
        updateSettings({ lastSyncedAt: new Date().toISOString() });
      } else {
        setSyncStatus('error');
      }
    }).catch(err => {
      console.warn('Lỗi tự động xóa võ sinh trên Google Sheet:', err);
      setSyncStatus('error');
    });
  };

  // ===================== CRUD VÕ SINH =====================
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: generateId('std'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setStudents(prev => [newStudent, ...prev]);
    addToast(`Đã thêm võ sinh: ${newStudent.fullName}`, 'success');

    // Tự động đẩy ngay lên Google Sheet chạy nền
    triggerAutoSaveStudent(newStudent);

    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    const studentWithTime = { ...updatedStudent, updatedAt: new Date().toISOString() };
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? studentWithTime : s));
    addToast(`Đã cập nhật hồ sơ: ${updatedStudent.fullName}`, 'success');

    // Tự động cập nhật lên Google Sheet chạy nền
    triggerAutoSaveStudent(studentWithTime);
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    // Xóa phiếu thi và văn bằng liên quan
    setExamSheets(prev => prev.filter(es => es.studentId !== id));
    setCertificates(prev => prev.filter(c => c.studentId !== id));
    addToast(`Đã xóa võ sinh: ${target ? target.fullName : id}`, 'info');

    // Tự động xóa trên Google Sheet chạy nền
    triggerAutoDeleteStudent(id);
  };

  const triggerAutoSaveRecord = (action: string, data: any) => {
    if (!settings.googleSheetScriptUrl) return;
    setSyncStatus('syncing');
    googleSheetService.saveSingleRecord(
      settings.googleSheetScriptUrl,
      settings.secretToken,
      action,
      data
    ).then(res => {
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncMessage(`Đã đồng bộ lúc ${new Date().toLocaleTimeString('vi-VN')}`);
        updateSettings({ lastSyncedAt: new Date().toISOString() });
      } else {
        setSyncStatus('error');
      }
    }).catch(err => {
      console.warn(`Lỗi tự động lưu ${action} lên Google Sheet:`, err);
      setSyncStatus('error');
    });
  };

  // ===================== CRUD CÂU LẠC BỘ =====================
  const addClub = (clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Club => {
    const newClub: Club = {
      ...clubData,
      id: generateId('clb'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setClubs(prev => [...prev, newClub]);
    addToast(`Đã thêm câu lạc bộ: ${newClub.name}`, 'success');
    triggerAutoSaveRecord('saveClub', newClub);
    return newClub;
  };

  const updateClub = (updatedClub: Club) => {
    const clubWithTime = { ...updatedClub, updatedAt: new Date().toISOString() };
    setClubs(prev => prev.map(c => c.id === updatedClub.id ? clubWithTime : c));
    addToast(`Đã cập nhật CLB: ${updatedClub.name}`, 'success');
    triggerAutoSaveRecord('saveClub', clubWithTime);
  };

  const deleteClub = (id: string) => {
    const countStudents = students.filter(s => s.clubId === id).length;
    if (countStudents > 0) {
      addToast(`Không thể xóa CLB đang có ${countStudents} võ sinh sinh hoạt!`, 'warning', 'Ràng buộc dữ liệu');
      return;
    }
    setClubs(prev => prev.filter(c => c.id !== id));
    addToast('Đã xóa câu lạc bộ', 'info', 'Thao tác dữ liệu');
  };

  // ===================== CRUD ĐỢT THI =====================
  const addExam = (examData: Omit<ExamSession, 'id' | 'createdAt' | 'updatedAt'>): ExamSession => {
    const newExam: ExamSession = {
      ...examData,
      id: generateId('exam'),
      totalCandidates: 0,
      passedCandidates: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExams(prev => [newExam, ...prev]);
    addToast(`Đã tạo đợt thi: ${newExam.name}`, 'success');
    triggerAutoSaveRecord('saveExam', newExam);
    return newExam;
  };

  const updateExam = (updatedExam: ExamSession) => {
    const examWithTime = { ...updatedExam, updatedAt: new Date().toISOString() };
    setExams(prev => prev.map(e => e.id === updatedExam.id ? examWithTime : e));
    addToast(`Đã cập nhật đợt thi: ${updatedExam.name}`, 'success');
    triggerAutoSaveRecord('saveExam', examWithTime);
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setExamSheets(prev => prev.filter(es => es.examId !== id));
    setCertificates(prev => prev.filter(c => c.examId !== id));
    addToast('Đã xóa đợt thi và phiếu thi liên quan', 'info');
  };

  // ===================== CRUD PHIẾU THI =====================
  const addExamSheet = (sheetData: Omit<ExamSheet, 'id' | 'createdAt' | 'updatedAt'>): ExamSheet => {
    const newSheet: ExamSheet = {
      ...sheetData,
      id: generateId('sheet'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExamSheets(prev => [newSheet, ...prev]);

    // Cập nhật số lượng thí sinh trong kỳ thi
    setExams(prev => prev.map(e => {
      if (e.id === newSheet.examId) {
        return {
          ...e,
          totalCandidates: (e.totalCandidates || 0) + 1,
          passedCandidates: (newSheet.result === 'PASS' || newSheet.result === 'DISTINCTION') 
            ? (e.passedCandidates || 0) + 1 
            : (e.passedCandidates || 0)
        };
      }
      return e;
    }));

    addToast('Đã đăng ký phiếu dự thi cho võ sinh', 'success');
    triggerAutoSaveRecord('saveExamSheet', newSheet);
    return newSheet;
  };

  const updateExamSheet = (updatedSheet: ExamSheet) => {
    const sheetWithTime = { ...updatedSheet, updatedAt: new Date().toISOString() };
    setExamSheets(prev => prev.map(s => s.id === updatedSheet.id ? sheetWithTime : s));

    // Cập nhật lại số lượng passedCandidates của kỳ thi
    const examId = updatedSheet.examId;
    setTimeout(() => {
      setExams(prev => prev.map(e => {
        if (e.id === examId) {
          const relatedSheets = examSheets.map(s => s.id === updatedSheet.id ? sheetWithTime : s).filter(s => s.examId === examId);
          const passed = relatedSheets.filter(s => s.result === 'PASS' || s.result === 'DISTINCTION').length;
          return { ...e, totalCandidates: relatedSheets.length, passedCandidates: passed };
        }
        return e;
      }));
    }, 0);

    addToast('Đã cập nhật kết quả chấm điểm phiếu thi', 'success');
    triggerAutoSaveRecord('saveExamSheet', sheetWithTime);
  };

  const deleteExamSheet = (id: string) => {
    const target = examSheets.find(s => s.id === id);
    setExamSheets(prev => prev.filter(s => s.id !== id));
    if (target) {
      setExams(prev => prev.map(e => {
        if (e.id === target.examId) {
          return {
            ...e,
            totalCandidates: Math.max(0, (e.totalCandidates || 1) - 1),
            passedCandidates: (target.result === 'PASS' || target.result === 'DISTINCTION')
              ? Math.max(0, (e.passedCandidates || 1) - 1)
              : (e.passedCandidates || 0)
          };
        }
        return e;
      }));
    }
    addToast('Đã xóa phiếu dự thi', 'info');
  };

  // ===================== CRUD & CHẤM ĐIỂM VIDEO BÀI THI =====================
  const addVideoSubmission = (videoData: Omit<VideoSubmission, 'id' | 'createdAt' | 'updatedAt'>): VideoSubmission => {
    const newVideo: VideoSubmission = {
      ...videoData,
      id: generateId('vid'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setVideos(prev => [newVideo, ...prev]);

    // Đồng thời gắn video vào phiếu dự thi của võ sinh (nếu có)
    setExamSheets(prev => prev.map(s => {
      if (s.studentId === newVideo.studentId) {
        return {
          ...s,
          videoSubmissionId: newVideo.id,
          videoUrl: newVideo.videoUrl
        };
      }
      return s;
    }));

    addToast(`Đã nộp video bài thi: ${newVideo.content} cho võ sinh ${newVideo.studentName}`, 'success');
    return newVideo;
  };

  const updateVideoSubmission = (updatedVideo: VideoSubmission) => {
    setVideos(prev => prev.map(v => (v.id === updatedVideo.id ? { ...updatedVideo, updatedAt: new Date().toISOString() } : v)));
    addToast('Đã cập nhật thông tin video bài thi', 'success');
  };

  const deleteVideoSubmission = (id: string) => {
    const video = videos.find(v => v.id === id);
    setVideos(prev => prev.filter(v => v.id !== id));
    addToast(`Đã xóa video bài thi của võ sinh ${video?.studentName || ''}`, 'info');
  };

  const gradeVideoSubmission = (
    id: string,
    status: VideoExamResult,
    judgeNote?: string,
    reviewerName = 'Hội Đồng Ban Giám Khảo'
  ) => {
    const targetVideo = videos.find(v => v.id === id);
    if (!targetVideo) return;

    const now = new Date().toISOString().split('T')[0];
    const defaultNote = status === 'PASS'
      ? 'Đòn thế chuẩn xác, tấn pháp vững chãi, đạt yêu cầu thăng đai.'
      : 'Cần rèn luyện thêm kỹ thuật và nộp lại video.';
    const finalNote = judgeNote?.trim() ? judgeNote.trim() : defaultNote;

    const updatedVideo: VideoSubmission = {
      ...targetVideo,
      status,
      judgeNote: finalNote,
      reviewerName,
      reviewedAt: now,
      updatedAt: new Date().toISOString()
    };

    setVideos(prev => prev.map(v => (v.id === id ? updatedVideo : v)));

    // Đồng bộ kết quả trực tiếp sang danh sách phiếu đăng ký thi của võ sinh
    setExamSheets(prev => prev.map(sheet => {
      if (sheet.studentId === targetVideo.studentId) {
        return {
          ...sheet,
          result: status === 'PASS' ? 'PASS' : 'FAIL',
          examiners: reviewerName,
          notes: finalNote,
          updatedAt: new Date().toISOString()
        };
      }
      return sheet;
    }));

    if (status === 'PASS') {
      addToast(`Đã chấm ĐẠT cho bài thi của võ sinh ${targetVideo.studentName}!`, 'success', 'Chúc mừng');
    } else {
      addToast(`Đã ghi nhận kết quả: CHƯA ĐẠT cho võ sinh ${targetVideo.studentName}.`, 'warning', 'Kết quả chấm thi');
    }
  };

  // ===================== CRUD VĂN BẰNG =====================
  const addCertificate = (certData: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>): Certificate => {
    const newCert: Certificate = {
      ...certData,
      id: generateId('cert'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCertificates(prev => [newCert, ...prev]);

    // Đồng thời cập nhật cấp đai mới cho võ sinh!
    setStudents(prev => prev.map(s => {
      if (s.id === newCert.studentId) {
        return {
          ...s,
          currentBelt: newCert.beltConferred,
          currentBeltLevel: newCert.beltLevel,
          lastPromotionDate: newCert.issueDate,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    addToast(`Đã phát hành Văn bằng số: ${newCert.certNumber}`, 'success');
    triggerAutoSaveRecord('saveCertificate', newCert);
    return newCert;
  };

  const updateCertificate = (updatedCert: Certificate) => {
    const certWithTime = { ...updatedCert, updatedAt: new Date().toISOString() };
    setCertificates(prev => prev.map(c => c.id === updatedCert.id ? certWithTime : c));
    addToast('Đã cập nhật thông tin văn bằng', 'success');
    triggerAutoSaveRecord('saveCertificate', certWithTime);
  };

  const deleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
    addToast('Đã xóa văn bằng', 'info');
  };

  // Tự động sinh Văn bằng cho toàn bộ võ sinh đã thi "Đạt" trong đợt thi
  const generateCertificatesForExam = (examId: string): { createdCount: number } => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { createdCount: 0 };

    const passedSheets = examSheets.filter(
      s => s.examId === examId && (s.result === 'PASS' || s.result === 'DISTINCTION')
    );

    let createdCount = 0;
    const year = new Date(exam.examDate).getFullYear() || new Date().getFullYear();
    const existingCerts = [...certificates];
    const newCerts: Certificate[] = [];

    for (const sheet of passedSheets) {
      // Kiểm tra xem đã cấp bằng cho thí sinh ở kỳ thi này chưa
      const alreadyHas = existingCerts.some(c => c.examId === examId && c.studentId === sheet.studentId);
      if (!alreadyHas) {
        createdCount++;
        const certIndex = existingCerts.length + createdCount;
        const certNumber = `VB-PQQ-${year}-${String(certIndex).padStart(3, '0')}`;
        const newCert: Certificate = {
          id: generateId('cert'),
          certNumber,
          studentId: sheet.studentId,
          examId,
          beltConferred: sheet.targetBelt,
          beltLevel: sheet.targetBeltLevel,
          issueDate: exam.examDate,
          signerTitle: settings.masterSignerTitle || 'Trưởng Ban Chuyên Môn',
          signerName: settings.masterSignerName || 'Võ sư Thích Tâm Thiện',
          decisionNumber: `${String(createdCount).padStart(2, '0')}/QĐ-PQQ/${year}`,
          qrCode: `PQQ-${year}-${certNumber}-${sheet.targetBelt}`,
          status: 'ACTIVE',
          notes: `Được công nhận sau đợt thi: ${exam.name}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newCerts.push(newCert);

        // Nâng cấp đai cho võ sinh
        setStudents(prev => prev.map(s => {
          if (s.id === sheet.studentId) {
            return {
              ...s,
              currentBelt: sheet.targetBelt,
              currentBeltLevel: sheet.targetBeltLevel,
              lastPromotionDate: exam.examDate,
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        }));
      }
    }

    if (newCerts.length > 0) {
      setCertificates(prev => [...newCerts, ...prev]);
      newCerts.forEach(c => triggerAutoSaveRecord('saveCertificate', c));
      addToast(`Đã tự động tạo ${newCerts.length} Văn bằng thăng đai cho đợt thi!`, 'success');
    } else {
      addToast('Không có thí sinh thi đạt mới nào cần cấp văn bằng', 'info');
    }

    return { createdCount };
  };

  // ===================== CẤU HÌNH & GOOGLE SHEETS =====================
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('Đã lưu cấu hình hệ thống', 'success');
  };

  const syncToGoogleSheet = async (): Promise<boolean> => {
    if (!settings.googleSheetScriptUrl) {
      addToast('Chưa cấu hình URL Google Apps Script! Hãy vào Cài đặt để thêm URL.', 'warning', 'Thiếu cấu hình');
      return false;
    }

    setSyncStatus('syncing');
    setLastSyncMessage('Đang tải dữ liệu lên Google Sheets...');

    // Lấy dữ liệu mới nhất từ storage để đảm bảo không bị closure lag
    const currentStudents = storageService.loadStudents();
    const currentClubs = storageService.loadClubs();
    const currentExams = storageService.loadExams();
    const currentExamSheets = storageService.loadExamSheets();
    const currentCerts = storageService.loadCertificates();

    const res = await googleSheetService.syncAllData(
      settings.googleSheetScriptUrl,
      settings.secretToken,
      {
        clubs: currentClubs.length > 0 ? currentClubs : clubs,
        students: currentStudents.length > 0 ? currentStudents : students,
        exams: currentExams.length > 0 ? currentExams : exams,
        examSheets: currentExamSheets.length > 0 ? currentExamSheets : examSheets,
        certificates: currentCerts.length > 0 ? currentCerts : certificates
      }
    );

    if (res.success) {
      setSyncStatus('synced');
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setLastSyncMessage(`Đã đồng bộ thành công lúc ${nowStr}`);
      updateSettings({ lastSyncedAt: new Date().toISOString() });
      addToast('Đã đồng bộ toàn bộ dữ liệu lên Google Sheet an toàn!', 'success', 'Đồng bộ thành công');
      return true;
    } else {
      setSyncStatus('error');
      setLastSyncMessage(res.error || 'Đồng bộ thất bại');
      addToast(res.error || 'Không thể kết nối máy chủ Google Sheets', 'error', 'Lỗi đồng bộ');
      return false;
    }
  };

  const pullFromGoogleSheet = async (): Promise<boolean> => {
    if (!settings.googleSheetScriptUrl) {
      addToast('Chưa cấu hình URL Google Apps Script!', 'warning', 'Thiếu cấu hình');
      return false;
    }

    setSyncStatus('syncing');
    setLastSyncMessage('Đang tải dữ liệu từ Google Sheets về...');

    const res = await googleSheetService.fetchAllData(
      settings.googleSheetScriptUrl,
      settings.secretToken,
      true
    );

    if (res.success && res.data) {
      if (res.data.clubs?.length) setClubs(res.data.clubs);
      const incomingStudents = res.data.students;
      if (incomingStudents && incomingStudents.length > 0) {
        setStudents(prev => {
          const sheetIds = new Set(incomingStudents.map(s => s.id));
          const localOnly = prev.filter(s => !sheetIds.has(s.id));
          if (localOnly.length > 0) {
            localOnly.forEach(st => triggerAutoSaveStudent(st));
          }
          return [...incomingStudents, ...localOnly];
        });
      }
      if (res.data.exams?.length) setExams(res.data.exams);
      if (res.data.examSheets?.length) setExamSheets(res.data.examSheets);
      if (res.data.certificates?.length) setCertificates(res.data.certificates);

      setSyncStatus('synced');
      setLastSyncMessage('Đang sử dụng dữ liệu mới nhất từ Google Sheets');
      addToast('Đã cập nhật dữ liệu mới nhất từ Google Sheet!', 'success', 'Cập nhật thành công');
      return true;
    } else {
      setSyncStatus('error');
      setLastSyncMessage(res.error || 'Tải dữ liệu thất bại');
      addToast(res.error || 'Lỗi khi tải dữ liệu từ Google Sheet', 'error', 'Lỗi tải dữ liệu');
      return false;
    }
  };

  // Tự động kiểm tra và đồng bộ dữ liệu mới nhất từ Google Sheets liên tục (Mobile & Web)
  useEffect(() => {
    if (!settings.googleSheetScriptUrl) return;

    let isMounted = true;

    const fetchLatestFromCloud = () => {
      googleSheetService.fetchAllData(settings.googleSheetScriptUrl, settings.secretToken, false)
        .then(res => {
          if (!isMounted || !res.success || !res.data) return;

          if (res.data.clubs?.length) setClubs(res.data.clubs);

          const incomingStudents = res.data.students;
          if (incomingStudents && incomingStudents.length > 0) {
            setStudents(prev => {
              const sheetIds = new Set(incomingStudents.map(s => s.id));
              const localOnlyStudents = prev.filter(s => !sheetIds.has(s.id));

              // Tự động đẩy bù các võ sinh vừa tạo cục bộ mà trên Google Sheet chưa có
              if (localOnlyStudents.length > 0 && settings.googleSheetScriptUrl) {
                localOnlyStudents.forEach(st => triggerAutoSaveStudent(st));
              }

              return [...incomingStudents, ...localOnlyStudents];
            });
          }

          if (res.data.exams?.length) setExams(res.data.exams);
          if (res.data.examSheets?.length) setExamSheets(res.data.examSheets);
          if (res.data.certificates?.length) setCertificates(res.data.certificates);

          setSyncStatus('synced');
          setLastSyncMessage(`Đã đồng bộ với Google Sheets lúc ${new Date().toLocaleTimeString('vi-VN')}`);
        })
        .catch(err => {
          console.warn('Lỗi tự động kéo dữ liệu Google Sheet:', err);
        });
    };

    // 1. Kéo dữ liệu ngay khi mở app
    fetchLatestFromCloud();

    // 2. Kéo dữ liệu tự động khi người dùng chuyển lại tab hoặc mở màn hình điện thoại
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestFromCloud();
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // 3. Tự động kiểm tra đồng bộ trong nền mỗi 30 giây
    const intervalId = setInterval(() => {
      fetchLatestFromCloud();
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      clearInterval(intervalId);
    };
  }, [settings.googleSheetScriptUrl, settings.secretToken]);

  // ===================== QUẢN LÝ ĐIỂM DANH =====================
  const saveAttendanceBatch = (newRecords: AttendanceRecord[]) => {
    setAttendance(prev => {
      const map = new Map<string, AttendanceRecord>();
      prev.forEach(r => map.set(`${r.studentId}_${r.date}_${r.session}`, r));
      newRecords.forEach(r => map.set(`${r.studentId}_${r.date}_${r.session}`, r));
      return Array.from(map.values());
    });
    addToast(`Đã lưu điểm danh thành công (${newRecords.length} võ sinh)!`, 'success');
  };

  const resetToSampleData = () => {
    storageService.resetToSampleData();
    setClubs(storageService.loadClubs());
    setStudents(storageService.loadStudents());
    setExams(storageService.loadExams());
    setExamSheets(storageService.loadExamSheets());
    setCertificates(storageService.loadCertificates());
    setAttendance(storageService.loadAttendance());
    setVideos(storageService.loadVideoSubmissions());
    setSettings(DEFAULT_SETTINGS);
    addToast('Đã khôi phục dữ liệu mẫu Môn phái Phật Quang Quyền!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        clubs,
        students,
        exams,
        examSheets,
        certificates,
        attendance,
        videos,
        settings,
        syncStatus,
        lastSyncMessage,
        selectedClubFilter,
        setSelectedClubFilter,
        addStudent,
        updateStudent,
        deleteStudent,
        addClub,
        updateClub,
        deleteClub,
        addExam,
        updateExam,
        deleteExam,
        addExamSheet,
        updateExamSheet,
        deleteExamSheet,
        addVideoSubmission,
        updateVideoSubmission,
        deleteVideoSubmission,
        gradeVideoSubmission,
        addCertificate,
        updateCertificate,
        deleteCertificate,
        generateCertificatesForExam,
        saveAttendanceBatch,
        updateSettings,
        syncToGoogleSheet,
        pullFromGoogleSheet,
        resetToSampleData,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
