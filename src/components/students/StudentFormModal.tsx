import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, Student, StudentStatus } from '../../types';
import { BELT_ORDER, getBeltConfig } from '../../utils/beltColors';
import { X, User, Award, Check, Upload, ArrowLeft, ArrowRight, Image as ImageIcon, Trash2 } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  defaultClubId?: string;
  defaultBelt?: BeltRank;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  defaultClubId,
  defaultBelt
}) => {
  const { clubs, addStudent, updateStudent, addToast } = useApp();

  // 2 bước rõ ràng: 1 = Thông tin cá nhân, 2 = Thông tin cấp đai
  const [step, setStep] = useState<1 | 2>(1);

  // PHẦN I: THÔNG TIN CÁ NHÂN
  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState<number | string>(2008);
  const [dob, setDob] = useState('2008-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState<number | string>('');
  const [weight, setWeight] = useState<number | string>('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // PHẦN II: THÔNG TIN CẤP ĐAI
  const [currentBelt, setCurrentBelt] = useState<BeltRank>('NAU_DAI');
  const [currentBeltLevel, setCurrentBeltLevel] = useState<number>(0);
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [unitName, setUnitName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StudentStatus>('ACTIVE');
  const [code, setCode] = useState('');

  // Thông tin văn bằng (chỉ áp dụng từ Lam Đai 1 trở lên, Cấp 0 Nâu Đai không nhập)
  const [diplomaIssueDate, setDiplomaIssueDate] = useState('');
  const [diplomaIssuePlace, setDiplomaIssuePlace] = useState('Bà Rịa - Vũng Tàu');
  const [diplomaIssuingAuthority, setDiplomaIssuingAuthority] = useState('Môn Phái Phật Quang Quyền');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Khởi tạo & nạp dữ liệu khi mở form
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);

    if (studentToEdit) {
      setFullName(studentToEdit.fullName || '');
      setCode(studentToEdit.code || '');
      setDob(studentToEdit.dob || '2008-01-01');
      setBirthYear(studentToEdit.birthYear || (studentToEdit.dob ? studentToEdit.dob.split('-')[0] : 2008));
      setGender(studentToEdit.gender || 'Nam');
      setPhone(studentToEdit.phone || '');
      setAddress(studentToEdit.address || '');
      setHeight(studentToEdit.height || '');
      setWeight(studentToEdit.weight || '');
      setAvatarUrl(studentToEdit.avatarUrl || '');

      const sBelt = studentToEdit.currentBelt || 'NAU_DAI';
      setCurrentBelt(sBelt);
      if (sBelt === 'NAU_DAI') {
        setCurrentBeltLevel(0);
      } else {
        setCurrentBeltLevel(studentToEdit.currentBeltLevel !== undefined ? Number(studentToEdit.currentBeltLevel) : 1);
      }

      setClubId(studentToEdit.clubId || clubs[0]?.id || '');
      const club = clubs.find(c => c.id === (studentToEdit.clubId || clubs[0]?.id));
      setUnitName(studentToEdit.unitName || club?.name || '');
      setCoachName(studentToEdit.coachName || club?.coach || '');
      setJoinDate(studentToEdit.joinDate || new Date().toISOString().split('T')[0]);
      setStatus(studentToEdit.status || 'ACTIVE');

      setDiplomaIssueDate(studentToEdit.diplomaIssueDate || '');
      setDiplomaIssuePlace(studentToEdit.diplomaIssuePlace || 'Bà Rịa - Vũng Tàu');
      setDiplomaIssuingAuthority(studentToEdit.diplomaIssuingAuthority || 'Môn Phái Phật Quang Quyền');
    } else {
      setFullName('');
      const targetClub = defaultClubId ? clubs.find(c => c.id === defaultClubId) : clubs[0];
      const clubCode = targetClub ? targetClub.code.replace('CLB-', '') : 'PQ1';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`PQQ-${clubCode}-${randomNum}`);
      setDob('2008-01-01');
      setBirthYear(2008);
      setGender('Nam');
      setPhone('');
      setAddress(targetClub?.address.includes('Đồng Nai') ? 'Đồng Nai' : 'Bà Rịa - Vũng Tàu');
      setHeight('');
      setWeight('');
      setAvatarUrl('');

      const initBelt = defaultBelt || 'NAU_DAI';
      setCurrentBelt(initBelt);
      setCurrentBeltLevel(initBelt === 'NAU_DAI' ? 0 : 1);

      setClubId(defaultClubId || clubs[0]?.id || '');
      setUnitName(targetClub?.name || '');
      setCoachName(targetClub?.coach || '');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setStatus('ACTIVE');

      setDiplomaIssueDate(new Date().toISOString().split('T')[0]);
      setDiplomaIssuePlace(targetClub?.address.includes('Đồng Nai') ? 'Đồng Nai' : 'Bà Rịa - Vũng Tàu');
      setDiplomaIssuingAuthority('Môn Phái Phật Quang Quyền');
    }
  }, [studentToEdit, defaultClubId, defaultBelt, clubs, isOpen]);

  if (!isOpen) return null;

  // Xử lý chọn CLB
  const handleClubChange = (id: string) => {
    setClubId(id);
    const club = clubs.find(c => c.id === id);
    if (club) {
      setUnitName(club.name);
      if (club.coach) setCoachName(club.coach);
    }
  };

  // Xử lý chọn Cấp đai
  const handleBeltSelect = (b: BeltRank) => {
    setCurrentBelt(b);
    if (b === 'NAU_DAI') {
      setCurrentBeltLevel(0);
      setDiplomaIssueDate('');
      setDiplomaIssuePlace('');
      setDiplomaIssuingAuthority('');
    } else {
      if (currentBeltLevel === 0) {
        setCurrentBeltLevel(1);
      }
      if (!diplomaIssuePlace) setDiplomaIssuePlace('Bà Rịa - Vũng Tàu');
      if (!diplomaIssuingAuthority) setDiplomaIssuingAuthority('Môn Phái Phật Quang Quyền');
      if (!diplomaIssueDate) setDiplomaIssueDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Tải ảnh thẻ 3x4 từ file máy / camera (Tự động nén kích thước chuẩn 3x4 để tối ưu Google Sheets và localStorage)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file hình ảnh hợp lệ!', 'warning', 'Ảnh thẻ 3x4');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Nén ảnh tỉ lệ 3:4 với kích thước 240x320 px (dưới 15KB) để tương thích an toàn 100% với Google Sheets
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const targetRatio = 240 / 320;
          const imgRatio = img.width / img.height;
          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

          if (imgRatio > targetRatio) {
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / targetRatio;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 240, 320);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAvatarUrl(compressedDataUrl);
        } else {
          setAvatarUrl(rawDataUrl);
        }
      };
      img.onerror = () => {
        setAvatarUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Điều kiện để nút Xác nhận Phần I sáng lên
  const isStep1Valid = fullName.trim().length > 0 && String(birthYear).trim().length > 0;

  // Điều kiện Phần II
  const isStep2Valid = isStep1Valid && clubId.trim().length > 0;

  // Lưu thông tin võ sinh
  const saveStudentData = (useDefaultsForBelt: boolean = false) => {
    if (!isStep1Valid) {
      addToast('Vui lòng nhập Họ và Tên cùng Năm sinh!', 'warning', 'Thiếu thông tin');
      return;
    }

    const bBelt = useDefaultsForBelt ? (defaultBelt || 'NAU_DAI') : currentBelt;
    const bLevel = useDefaultsForBelt ? (bBelt === 'NAU_DAI' ? 0 : 1) : (bBelt === 'NAU_DAI' ? 0 : Number(currentBeltLevel) || 1);
    const bClubId = useDefaultsForBelt ? (defaultClubId || clubs[0]?.id || '') : clubId;
    const targetClub = clubs.find(c => c.id === bClubId);
    const bUnitName = useDefaultsForBelt ? (targetClub?.name || '') : unitName.trim() || (targetClub?.name || '');
    const bCoach = useDefaultsForBelt ? (targetClub?.coach || '') : coachName.trim() || (targetClub?.coach || '');

    const beltCfg = getBeltConfig(bBelt);
    const diplomaName = bBelt === 'NAU_DAI' ? 'Nâu Đai (Cấp 0)' : `${beltCfg.name} Cấp ${bLevel}`;
    const numHeight = height !== '' && !isNaN(Number(height)) ? Number(height) : undefined;
    const numWeight = weight !== '' && !isNaN(Number(weight)) ? Number(weight) : undefined;

    // Cấp 0 Nâu Đai không lưu thông tin ngày cấp, nơi cấp, cơ quan cấp
    const isLevelZero = bBelt === 'NAU_DAI' || bLevel === 0;

    const finalIssueDate = isLevelZero ? undefined : (diplomaIssueDate || undefined);
    const finalIssuePlace = isLevelZero ? undefined : (diplomaIssuePlace.trim() || undefined);
    const finalIssuingAuth = isLevelZero ? undefined : (diplomaIssuingAuthority.trim() || undefined);

    if (studentToEdit) {
      updateStudent({
        ...studentToEdit,
        fullName: fullName.trim(),
        code: code.trim(),
        dob,
        birthYear: Number(birthYear) || 2008,
        gender,
        height: numHeight,
        weight: numWeight,
        phone: phone.trim(),
        address: address.trim(),
        clubId: bClubId,
        unitName: bUnitName,
        currentBelt: bBelt,
        currentBeltLevel: bLevel,
        diplomaName,
        diplomaIssueDate: finalIssueDate,
        diplomaIssuePlace: finalIssuePlace,
        diplomaIssuingAuthority: finalIssuingAuth,
        coachName: bCoach,
        avatarUrl: avatarUrl.trim() || undefined,
        joinDate,
        status
      });
      addToast(`Đã cập nhật võ sinh: ${fullName.trim()}`, 'success', 'Cập nhật thành công');
    } else {
      addStudent({
        fullName: fullName.trim(),
        code: code.trim(),
        dob,
        birthYear: Number(birthYear) || 2008,
        gender,
        height: numHeight,
        weight: numWeight,
        phone: phone.trim(),
        address: address.trim(),
        birthPlace: address.trim() || 'Bà Rịa - Vũng Tàu',
        clubId: bClubId,
        unitName: bUnitName,
        currentBelt: bBelt,
        currentBeltLevel: bLevel,
        diplomaName,
        diplomaIssueDate: finalIssueDate,
        diplomaIssuePlace: finalIssuePlace,
        diplomaIssuingAuthority: finalIssuingAuth,
        coachName: bCoach,
        avatarUrl: avatarUrl.trim() || undefined,
        joinDate,
        status
      });
      addToast(`Đã thêm võ sinh mới: ${fullName.trim()}`, 'success', 'Thêm thành công');
    }

    onClose();
  };

  const selectedBeltConfig = getBeltConfig(currentBelt);
  const isBrownBeltLevelZero = currentBelt === 'NAU_DAI' || currentBeltLevel === 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-3xl max-w-lg sm:max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER: Tiêu đề & Nút đóng */}
        <div className="bg-[#0072de] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              {studentToEdit ? 'Chỉnh Sửa Võ Sinh' : 'Thêm Võ Sinh Mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEPPER TABS: I/ THÔNG TIN CÁ NHÂN  &  II/ THÔNG TIN CẤP ĐAI */}
        <div className="px-5 pt-3.5 pb-2 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Tab I */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                step === 1
                  ? 'bg-white text-[#0072de] shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  step === 1 ? 'bg-[#0072de] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span className="truncate">I/ Thông tin cá nhân</span>
            </button>

            {/* Tab II */}
            <button
              type="button"
              onClick={() => {
                if (isStep1Valid || studentToEdit) {
                  setStep(2);
                } else {
                  addToast('Vui lòng nhập Họ tên và Năm sinh ở Phần I trước!', 'info', 'Nhập thông tin');
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                step === 2
                  ? 'bg-white text-[#0072de] shadow-xs border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  step === 2 ? 'bg-[#0072de] text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className="truncate">II/ Thông tin cấp đai</span>
            </button>
          </div>
        </div>

        {/* BODY NỘI DUNG FORM */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* ============================================================== */}
          {/* PHẦN I: THÔNG TIN CÁ NHÂN                                      */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* KHỐI ẢNH THẺ 3x4 & HỌ TÊN, NĂM SINH */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/90">
                {/* Khung Ảnh Thẻ 3x4 */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-24 h-32 rounded-xl bg-white border-2 border-dashed border-slate-300 hover:border-[#0072de] overflow-hidden flex flex-col items-center justify-center shadow-2xs group transition-colors">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Ảnh thẻ 3x4"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
                        <ImageIcon className="w-7 h-7 mb-1 text-slate-300 group-hover:text-[#0072de] transition-colors" />
                        <span className="text-[10px] font-bold">Ảnh 3x4</span>
                      </div>
                    )}

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-[11px] font-bold text-[#0072de] hover:text-[#005bb5] bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh 3x4'}</span>
                  </button>
                </div>

                {/* Họ Tên & Năm Sinh & Giới Tính */}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Họ và Tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white font-semibold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Năm sinh <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={birthYear}
                        onChange={e => {
                          setBirthYear(e.target.value);
                          if (e.target.value) {
                            setDob(`${e.target.value}-01-01`);
                          }
                        }}
                        placeholder="2008"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SỐ ĐIỆN THOẠI & ĐỊA CHỈ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Số điện thoại (SĐT)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Bà Rịa - Vũng Tàu, TP.HCM..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* CHIỀU CAO & CÂN NẶNG */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="165"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="58"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHẦN II: THÔNG TIN CẤP ĐAI                                     */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* CHỌN CẤP ĐAI TRỰC QUAN (BAO GỒM NÂU ĐAI CẤP 0 VÀ CÁC ĐAI TRÊN) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Cấp đai
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BELT_ORDER.map(b => {
                    const cfg = getBeltConfig(b);
                    const isSelected = currentBelt === b;
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleBeltSelect(b)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#0072de] bg-blue-50/70 shadow-xs ring-1 ring-[#0072de]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-black/10"
                          style={{ backgroundColor: cfg.bgHex }}
                        />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {b === 'NAU_DAI' ? 'Nâu Đai (Cấp 0)' : cfg.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CẤP / GẠCH & CÂU LẠC BỘ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Cấp / Gạch
                  </label>
                  {currentBelt === 'NAU_DAI' ? (
                    <select
                      value={0}
                      disabled
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50 text-slate-700 cursor-not-allowed"
                    >
                      <option value={0}>Cấp 0 (Nhập môn)</option>
                    </select>
                  ) : (
                    <select
                      value={currentBeltLevel}
                      onChange={e => setCurrentBeltLevel(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                    >
                      {Array.from({ length: selectedBeltConfig.maxLevels }, (_, i) => i + 1).map(l => (
                        <option key={l} value={l}>
                          Cấp {l}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Câu Lạc Bộ
                  </label>
                  <select
                    value={clubId}
                    onChange={e => handleClubChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                  >
                    {clubs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HUẤN LUYỆN VIÊN & NGÀY NHẬP MÔN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Huấn luyện viên phụ trách
                  </label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={e => setCoachName(e.target.value)}
                    placeholder="Võ sư Thích Tâm Thiện"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ngày nhập môn
                  </label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={e => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* THÔNG TIN VĂN BẰNG (CHỈ TỪ LAM ĐAI 1 TRỞ LÊN, CẤP 0 NÂU ĐAI HOÀN TOÀN ẨN) */}
              {!isBrownBeltLevelZero && (
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0072de]">
                    <Award className="w-4 h-4" />
                    <span>Thông tin văn bằng chứng nhận</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        value={diplomaIssueDate}
                        onChange={e => setDiplomaIssueDate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nơi cấp
                      </label>
                      <input
                        type="text"
                        value={diplomaIssuePlace}
                        onChange={e => setDiplomaIssuePlace(e.target.value)}
                        placeholder="Bà Rịa - Vũng Tàu"
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Cơ quan cấp
                      </label>
                      <input
                        type="text"
                        value={diplomaIssuingAuthority}
                        onChange={e => setDiplomaIssuingAuthority(e.target.value)}
                        placeholder="Môn Phái Phật Quang Quyền"
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TRẠNG THÁI SINH HOẠT */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Trạng thái học tập
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as StudentStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-[#0072de] focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-slate-900 transition-all"
                >
                  <option value="ACTIVE">Còn học (Đang tập luyện)</option>
                  <option value="SUSPENDED">Tạm nghỉ</option>
                  <option value="INACTIVE">Nghỉ (Đã thôi học)</option>
                  <option value="TRANSFERRED">Chuyển CLB</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* FOOTER ACTIONS: NÚT XÁC NHẬN / BỎ QUA                          */}
        {/* ============================================================== */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step === 1 ? (
            /* Ở PHẦN 1: NÚT XÁC NHẬN SÁNG LÊN KHI CÓ DỮ LIỆU ĐỂ SANG BƯỚC 2 */
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 ${
                  isStep1Valid
                    ? 'bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white shadow-md shadow-blue-500/25 cursor-pointer ring-2 ring-blue-400/40'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 border border-slate-200'
                }`}
              >
                <span>Xác nhận</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Ở PHẦN 2: NÚT XÁC NHẬN VÀ NÚT BỎ QUA */
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs sm:text-sm font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Nút Bỏ qua: lưu ngay với đai mặc định (Nâu Đai Cấp 0) */}
                <button
                  type="button"
                  onClick={() => saveStudentData(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  title="Bỏ qua phần cấp đai và lưu với cấp 0 Nâu Đai mặc định"
                >
                  Bỏ qua
                </button>

                {/* Nút Xác nhận: lưu đầy đủ thông tin Phần I + Phần II */}
                <button
                  type="button"
                  disabled={!isStep2Valid}
                  onClick={() => saveStudentData(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 ${
                    isStep2Valid
                      ? 'bg-[#0072de] hover:bg-[#0060bd] active:scale-95 text-white shadow-md shadow-blue-500/25 cursor-pointer ring-2 ring-blue-400/40'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 border border-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Xác nhận</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;
