import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BeltRank, Student, StudentStatus } from '../../types';
import { BELT_ORDER, getBeltConfig } from '../../utils/beltColors';
import { X, User, Award, Check } from 'lucide-react';

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

  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [dob, setDob] = useState('2005-01-01');
  const [birthYear, setBirthYear] = useState<number | string>(2005);
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState<number | string>('');
  const [weight, setWeight] = useState<number | string>('');
  const [birthPlace, setBirthPlace] = useState('Bà Rịa - Vũng Tàu');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [unitName, setUnitName] = useState('');
  const [currentBelt, setCurrentBelt] = useState<BeltRank>('LAM_DAI');
  const [currentBeltLevel, setCurrentBeltLevel] = useState<number>(1);
  const [diplomaName, setDiplomaName] = useState('');
  const [diplomaIssueDate, setDiplomaIssueDate] = useState('');
  const [diplomaIssuePlace, setDiplomaIssuePlace] = useState('Bà Rịa - Vũng Tàu');
  const [diplomaIssuingAuthority, setDiplomaIssuingAuthority] = useState('Môn Phái Phật Quang Quyền');
  const [educationLevel, setEducationLevel] = useState('12/12');
  const [coachName, setCoachName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastPromotionDate, setLastPromotionDate] = useState('');
  const [status, setStatus] = useState<StudentStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName || '');
      setCode(studentToEdit.code || '');
      setDob(studentToEdit.dob || '2005-01-01');
      setBirthYear(studentToEdit.birthYear || (studentToEdit.dob ? studentToEdit.dob.split('-')[0] : 2005));
      setGender(studentToEdit.gender || 'Nam');
      setPhone(studentToEdit.phone || '');
      setEmail(studentToEdit.email || '');
      setAddress(studentToEdit.address || '');
      setHeight(studentToEdit.height || '');
      setWeight(studentToEdit.weight || '');
      setBirthPlace(studentToEdit.birthPlace || 'Bà Rịa - Vũng Tàu');
      setClubId(studentToEdit.clubId || clubs[0]?.id || '');
      const club = clubs.find(c => c.id === (studentToEdit.clubId || clubs[0]?.id));
      setUnitName(studentToEdit.unitName || club?.name || '');
      setCurrentBelt(studentToEdit.currentBelt || 'LAM_DAI');
      setCurrentBeltLevel(studentToEdit.currentBeltLevel || 1);
      setDiplomaName(studentToEdit.diplomaName || '');
      setDiplomaIssueDate(studentToEdit.diplomaIssueDate || '');
      setDiplomaIssuePlace(studentToEdit.diplomaIssuePlace || 'Bà Rịa - Vũng Tàu');
      setDiplomaIssuingAuthority(studentToEdit.diplomaIssuingAuthority || 'Môn Phái Phật Quang Quyền');
      setEducationLevel(studentToEdit.educationLevel || '12/12');
      setCoachName(studentToEdit.coachName || club?.coach || '');
      setAvatarUrl(studentToEdit.avatarUrl || '');
      setJoinDate(studentToEdit.joinDate || new Date().toISOString().split('T')[0]);
      setLastPromotionDate(studentToEdit.lastPromotionDate || '');
      setStatus(studentToEdit.status || 'ACTIVE');
      setNotes(studentToEdit.notes || '');
    } else {
      setFullName('');
      const targetClub = defaultClubId ? clubs.find(c => c.id === defaultClubId) : clubs[0];
      const clubCode = targetClub ? targetClub.code.replace('CLB-', '') : 'PQQ';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`PQQ-${clubCode}-${randomNum}`);
      setDob('2005-01-01');
      setBirthYear(2005);
      setGender('Nam');
      setPhone('');
      setEmail('');
      setAddress('');
      setHeight('');
      setWeight('');
      setBirthPlace(targetClub?.address.includes('Đồng Nai') ? 'Đồng Nai' : 'Bà Rịa - Vũng Tàu');
      setClubId(defaultClubId || clubs[0]?.id || '');
      setUnitName(targetClub?.name || '');
      setCurrentBelt(defaultBelt || 'LAM_DAI');
      setCurrentBeltLevel(1);
      setDiplomaName('Lam Đai Cấp 1');
      setDiplomaIssueDate(new Date().toISOString().split('T')[0]);
      setDiplomaIssuePlace(targetClub?.address.includes('Đồng Nai') ? 'Đồng Nai' : 'Bà Rịa - Vũng Tàu');
      setDiplomaIssuingAuthority('Môn Phái Phật Quang Quyền');
      setEducationLevel('12/12');
      setCoachName(targetClub?.coach || '');
      setAvatarUrl('');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setLastPromotionDate('');
      setStatus('ACTIVE');
      setNotes('');
    }
  }, [studentToEdit, defaultClubId, defaultBelt, clubs, isOpen]);

  // Khi chọn CLB, tự động gán tên Đơn vị và HLV phụ trách
  const handleClubChange = (id: string) => {
    setClubId(id);
    const club = clubs.find(c => c.id === id);
    if (club) {
      setUnitName(club.name);
      if (!coachName && club.coach) setCoachName(club.coach);
    }
  };

  const handleDobChange = (val: string) => {
    setDob(val);
    const year = val.split('-')[0];
    if (year) setBirthYear(year);
  };

  if (!isOpen) return null;

  // Rút gọn địa chỉ chỉ lưu theo Tỉnh/TP
  const formatCityProvince = (addr?: string) => {
    if (!addr || !addr.trim()) return 'Bà Rịa - Vũng Tàu';
    const trimmed = addr.trim();
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
      return parts[parts.length - 1]; // Lấy Tỉnh/Thành phố
    }
    return trimmed;
  };

  // Chuẩn hóa trình độ văn hóa theo định dạng /12
  const formatEducation = (val?: string) => {
    if (!val || !val.trim()) return '12/12';
    const clean = val.trim();
    if (clean.includes('/12')) return clean;
    const matchNum = clean.match(/\b(\d{1,2})\b/);
    if (matchNum) {
      return `${matchNum[1]}/12`;
    }
    return `${clean}/12`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Họ và tên võ sinh không được để trống!', 'warning', 'Thiếu thông tin');
      return;
    }

    const bConfig = getBeltConfig(currentBelt);
    const finalDiploma = diplomaName.trim() || `${bConfig.name} Cấp ${currentBeltLevel}`;
    const cleanAddress = formatCityProvince(address);
    const cleanEducationLevel = formatEducation(educationLevel);
    const numHeight = height !== '' && !isNaN(Number(height)) ? Number(height) : undefined;
    const numWeight = weight !== '' && !isNaN(Number(weight)) ? Number(weight) : undefined;

    if (studentToEdit) {
      updateStudent({
        ...studentToEdit,
        fullName: fullName.trim(),
        code: code.trim(),
        dob,
        birthYear: Number(birthYear) || (dob ? Number(dob.split('-')[0]) : 2005),
        gender,
        height: numHeight,
        weight: numWeight,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: cleanAddress,
        birthPlace: birthPlace.trim() || 'Bà Rịa - Vũng Tàu',
        clubId,
        unitName: unitName.trim(),
        currentBelt,
        currentBeltLevel: Number(currentBeltLevel),
        diplomaName: finalDiploma,
        diplomaIssueDate: diplomaIssueDate || undefined,
        diplomaIssuePlace: diplomaIssuePlace.trim(),
        diplomaIssuingAuthority: diplomaIssuingAuthority.trim(),
        educationLevel: cleanEducationLevel,
        coachName: coachName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        joinDate,
        lastPromotionDate: lastPromotionDate || undefined,
        status,
        notes: notes.trim() || undefined
      });
    } else {
      addStudent({
        fullName: fullName.trim(),
        code: code.trim(),
        dob,
        birthYear: Number(birthYear) || (dob ? Number(dob.split('-')[0]) : 2005),
        gender,
        height: numHeight,
        weight: numWeight,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: cleanAddress,
        birthPlace: birthPlace.trim() || 'Bà Rịa - Vũng Tàu',
        clubId,
        unitName: unitName.trim(),
        currentBelt,
        currentBeltLevel: Number(currentBeltLevel),
        diplomaName: finalDiploma,
        diplomaIssueDate: diplomaIssueDate || undefined,
        diplomaIssuePlace: diplomaIssuePlace.trim(),
        diplomaIssuingAuthority: diplomaIssuingAuthority.trim(),
        educationLevel: cleanEducationLevel,
        coachName: coachName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        joinDate,
        lastPromotionDate: lastPromotionDate || undefined,
        status,
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  const selectedBeltConfig = getBeltConfig(currentBelt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">
                {studentToEdit ? 'Chỉnh Sửa Hồ Sơ Võ Sinh' : 'Thêm Võ Sinh Mới Vào Danh Sách'}
              </h3>
              <p className="text-xs text-amber-100 font-light">
                Chuẩn 14 trường thông tin Thư ký môn phái Phật Quang Quyền
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Nhóm 1: Thông tin nhân thân */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b pb-1">
              1. Thông Tin Cá Nhân Võ Sinh
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm Sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={birthYear}
                  onChange={e => setBirthYear(e.target.value)}
                  placeholder="2005"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày Sinh Đầy Đủ
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => handleDobChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới Tính
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chiều Cao (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="165"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cân Nặng (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="60"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa Chỉ Thường Trú (Tỉnh / Thành phố)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Bà Rịa - Vũng Tàu, TP. Hồ Chí Minh, Đồng Nai..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nơi Sinh (Tỉnh/Thành phố)
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="Bà Rịa - Vũng Tàu, Đồng Nai..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trình Độ Văn Hóa (tính theo /12)
                </label>
                <input
                  type="text"
                  value={educationLevel}
                  onChange={e => setEducationLevel(e.target.value)}
                  placeholder="12/12, 11/12, 10/12..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng Thái Học Tập
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as StudentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ACTIVE">Còn học (Đang tập luyện)</option>
                  <option value="SUSPENDED">Tạm nghỉ</option>
                  <option value="INACTIVE">Nghỉ (Đã thôi học)</option>
                  <option value="TRANSFERRED">Chuyển CLB</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Đơn vị CLB & HLV */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b pb-1">
              2. Đơn Vị Câu Lạc Bộ & Huấn Luyện Viên
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Câu Lạc Bộ (5 CLB)
                </label>
                <select
                  value={clubId}
                  onChange={e => handleClubChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Đơn Vị (Hiển thị bảng)
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={e => setUnitName(e.target.value)}
                  placeholder="CLB Phước Quang 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Huấn Luyện Viên (HLV)
                </label>
                <input
                  type="text"
                  value={coachName}
                  onChange={e => setCoachName(e.target.value)}
                  placeholder="Võ sư Thích Tâm Thiện"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 3: Cấp đai & Văn bằng */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700" />
              <span>3. Cấp Đai & Thông Tin Văn Bằng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cấp Đai Hiện Tại
                </label>
                <select
                  value={currentBelt}
                  onChange={e => setCurrentBelt(e.target.value as BeltRank)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {BELT_ORDER.map(b => (
                    <option key={b} value={b}>
                      {getBeltConfig(b).name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cấp / Gạch
                </label>
                <select
                  value={currentBeltLevel}
                  onChange={e => setCurrentBeltLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {Array.from({ length: selectedBeltConfig.maxLevels }, (_, i) => i + 1).map(l => (
                    <option key={l} value={l}>
                      Cấp {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Văn Bằng
                </label>
                <input
                  type="text"
                  value={diplomaName}
                  onChange={e => setDiplomaName(e.target.value)}
                  placeholder="Lam Đai Cấp 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày Cấp Văn Bằng
                </label>
                <input
                  type="date"
                  value={diplomaIssueDate}
                  onChange={e => setDiplomaIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nơi Cấp
                </label>
                <input
                  type="text"
                  value={diplomaIssuePlace}
                  onChange={e => setDiplomaIssuePlace(e.target.value)}
                  placeholder="Bà Rịa - Vũng Tàu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cơ Quan Cấp
                </label>
                <input
                  type="text"
                  value={diplomaIssuingAuthority}
                  onChange={e => setDiplomaIssuingAuthority(e.target.value)}
                  placeholder="Môn Phái Phật Quang Quyền"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 4: Ảnh thẻ & Ghi chú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đường Dẫn Ảnh Thẻ (URL ảnh 3x4 hoặc Avatar)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://... ảnh thẻ võ sinh"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi Chú
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về võ sinh..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{studentToEdit ? 'Lưu Thay Đổi' : 'Thêm Võ Sinh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
