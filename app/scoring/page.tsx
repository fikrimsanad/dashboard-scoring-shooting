"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Save, Target, Brain, FileCheck, Search, UserPlus, X, Check } from 'lucide-react';

interface Personnel {
  id: string;
  nrp: string;
  name: string;
  rank: string;
  unit: string;
  position: string;
  phone?: string;
  photo_url?: string;
}

const getInitials = (name: string) => {
  if (!name) return 'N/A';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const ScoreInput = ({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testId: string;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-[#E6E1D8] last:border-b-0">
    <Label className="text-[#2D231F] font-medium flex-1">{label}</Label>
    <Input
      type="number"
      min={1}
      max={10}
      value={value}
      onChange={(e) => {
        let val = parseInt(e.target.value) || 1;
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        onChange(val);
      }}
      className="w-20 text-center font-bold text-lg border-[#E6E1D8] focus:border-[#C3A987]"
      data-testid={testId}
    />
  </div>
);

const PersonnelAutocomplete = ({
  personnel,
  selectedPersonnel,
  onSelect,
  loading,
}: {
  personnel: Personnel[];
  selectedPersonnel: string;
  onSelect: (id: string) => void;
  loading: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Personnel | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPersonnel) {
      const found = personnel.find((p) => p.id === selectedPersonnel);
      setSelectedData(found || null);
      if (found) setSearchTerm('');
    } else {
      setSelectedData(null);
    }
  }, [selectedPersonnel, personnel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPersonnel = personnel.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nrp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (person: Personnel) => {
    onSelect(person.id);
    setSelectedData(person);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect('');
    setSelectedData(null);
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      {selectedData ? (
        <div className="flex items-center gap-3 p-3 border border-[#C3A987] bg-[#F7F5F2] rounded-md">
          <Avatar className="w-10 h-10 border-2 border-[#C3A987]">
            <AvatarImage src={selectedData.photo_url} alt={selectedData.name} />
            <AvatarFallback className="bg-[#4A3628] text-white text-sm font-semibold">
              {getInitials(selectedData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#2D231F] truncate">
              {selectedData.rank} {selectedData.name}
            </p>
            <p className="text-sm text-[#75675E] truncate">
              NRP: {selectedData.nrp} &bull; {selectedData.unit}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-[#75675E] hover:text-red-500 hover:bg-red-50"
            data-testid="clear-personnel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75675E]" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Ketik nama, NRP, atau pangkat..."
            className="pl-10 border-[#E6E1D8] focus:border-[#C3A987]"
            data-testid="personnel-search-input"
          />
        </div>
      )}
      {isOpen && !selectedData && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6E1D8] rounded-lg shadow-[0_8px_24px_rgba(74,54,40,0.12)] max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[#75675E]">Memuat data...</div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[#75675E] mb-3">
                {personnel.length === 0
                  ? 'Belum ada data personil'
                  : `Tidak ditemukan "${searchTerm}"`}
              </p>
              <Link href="/personnel">
                <Button type="button" className="bg-[#4A3628] hover:bg-[#36271D] text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Personil
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="py-2">
              {filteredPersonnel.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(person)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F5F2] transition-colors text-left"
                    data-testid={`personnel-option-${person.id}`}
                  >
                    <Avatar className="w-9 h-9 border border-[#E6E1D8]">
                      <AvatarImage src={person.photo_url} alt={person.name} />
                      <AvatarFallback className="bg-[#4A3628] text-white text-xs font-semibold">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2D231F] truncate">
                        {person.rank} {person.name}
                      </p>
                      <p className="text-sm text-[#75675E] truncate">
                        NRP: {person.nrp} &bull; {person.unit}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ACTIVITIES = [
  'Latihan Menembak Rutin',
  'Ujian Kualifikasi Menembak',
  'Simulasi Taktis Lapangan',
  'Latihan Menembak Reaksi Cepat',
  'Simulasi Penanganan Ancaman',
  'Latihan Menembak Jarak Jauh',
  'Latihan Menembak Bergerak',
  'Ujian Sertifikasi Tahunan',
  'Latihan Gabungan',
  'Simulasi Situasi Darurat',
];

const ActivityAutocomplete = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filteredActivities = ACTIVITIES.filter((act) =>
    act.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75675E]" />
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Ketik atau pilih nama kegiatan..."
          className="pl-10 border-[#E6E1D8] focus:border-[#C3A987]"
          data-testid="activity-input"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75675E] hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E6E1D8] rounded-lg shadow-[0_8px_24px_rgba(74,54,40,0.12)] max-h-64 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-4 text-center text-[#75675E]">
              <p className="mb-2">Kegiatan &ldquo;{value}&rdquo; akan digunakan</p>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-[#4A3628] hover:bg-[#36271D] text-white"
              >
                <Check className="w-4 h-4 mr-1" /> Gunakan
              </Button>
            </div>
          ) : (
            <ul className="py-2">
              {filteredActivities.map((activity, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(activity);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#F7F5F2] transition-colors text-[#2D231F]"
                    data-testid={`activity-option-${index}`}
                  >
                    {activity}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default function ScoringPage() {
  const router = useRouter();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [activityName, setActivityName] = useState('');
  const [simulationDate, setSimulationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Technical scores
  const [akurasiTembakan, setAkurasiTembakan] = useState(5);
  const [kecepatanTarget, setKecepatanTarget] = useState(5);
  const [konsistensiTembakan, setKonsistensiTembakan] = useState(5);
  const [posisiMenembak, setPosisiMenembak] = useState(5);
  const [penguasaanSenjata, setPenguasaanSenjata] = useState(5);

  // Tactical scores
  const [analisaSituasi, setAnalisaSituasi] = useState(5);
  const [ketepatanRespon, setKetepatanRespon] = useState(5);
  const [pengendalianAncaman, setPengendalianAncaman] = useState(5);
  const [kepatuhanProsedur, setKepatuhanProsedur] = useState(5);

  // SOP scores
  const [kepatuhanSop, setKepatuhanSop] = useState(5);
  const [kontrolLaras, setKontrolLaras] = useState(5);
  const [posisiJari, setPosisiJari] = useState(5);
  const [kesadaranLingkungan, setKesadaranLingkungan] = useState(5);
  const [prosedurPaskaMenembak, setProsedurPaskaMenembak] = useState(5);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const { data } = await axios.get('/api/personnel');
      setPersonnel(data);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast.error('Gagal memuat data personil');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalTechnical =
      akurasiTembakan + kecepatanTarget + konsistensiTembakan + posisiMenembak + penguasaanSenjata;
    const totalTactical =
      analisaSituasi + ketepatanRespon + pengendalianAncaman + kepatuhanProsedur;
    const totalSop =
      kepatuhanSop + kontrolLaras + posisiJari + kesadaranLingkungan + prosedurPaskaMenembak;
    return {
      totalTechnical,
      totalTactical,
      totalSop,
      totalScore: totalTechnical + totalTactical + totalSop,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonnel) {
      toast.error('Pilih personil terlebih dahulu');
      return;
    }
    if (!activityName.trim()) {
      toast.error('Masukkan nama kegiatan');
      return;
    }
    setSubmitting(true);
    const scoreData = {
      personnel_id: selectedPersonnel,
      simulation_date: simulationDate,
      technical: {
        akurasi_tembakan: akurasiTembakan,
        kecepatan_target: kecepatanTarget,
        konsistensi_tembakan: konsistensiTembakan,
        posisi_menembak: posisiMenembak,
        penguasaan_senjata: penguasaanSenjata,
      },
      tactical: {
        analisa_situasi: analisaSituasi,
        ketepatan_respon: ketepatanRespon,
        pengendalian_ancaman: pengendalianAncaman,
        kepatuhan_prosedur: kepatuhanProsedur,
      },
      sop: {
        kepatuhan_sop: kepatuhanSop,
        kontrol_laras: kontrolLaras,
        posisi_jari: posisiJari,
        kesadaran_lingkungan: kesadaranLingkungan,
        prosedur_paska_menembak: prosedurPaskaMenembak,
      },
      notes: activityName + (notes ? `\n\nCatatan: ${notes}` : ''),
    };
    try {
      await axios.post('/api/scores', scoreData);
      toast.success('Penilaian berhasil disimpan');
      router.push('/scores');
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Gagal menyimpan penilaian');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <DashboardLayout title="Form Simulasi Menembak">
      <div className="w-full" data-testid="scoring-form-page">
        <form onSubmit={handleSubmit}>
          {/* Informasi Peserta */}
          <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)] mb-6">
            <CardHeader className="border-b border-[#E6E1D8] pb-4">
              <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">
                Informasi Peserta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#2D231F] font-medium">
                    Pilih Personil <span className="text-red-500">*</span>
                  </Label>
                  <PersonnelAutocomplete
                    personnel={personnel}
                    selectedPersonnel={selectedPersonnel}
                    onSelect={setSelectedPersonnel}
                    loading={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2D231F] font-medium">
                    Nama Kegiatan <span className="text-red-500">*</span>
                  </Label>
                  <ActivityAutocomplete value={activityName} onChange={setActivityName} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#2D231F] font-medium">
                    Tanggal Simulasi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={simulationDate}
                    onChange={(e) => setSimulationDate(e.target.value)}
                    className="border-[#E6E1D8] focus:border-[#C3A987]"
                    data-testid="simulation-date-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Technical */}
            <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
              <CardHeader className="border-b border-[#E6E1D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-base font-bold text-[#2D231F]">
                      1. Nilai Teknis Menembak
                    </CardTitle>
                    <p className="text-sm text-[#75675E]">
                      Total:{' '}
                      <span className="font-bold text-[#4A3628]">{totals.totalTechnical}</span>
                      /50
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ScoreInput
                  label="Akurasi Tembakan"
                  value={akurasiTembakan}
                  onChange={setAkurasiTembakan}
                  testId="input-akurasi"
                />
                <ScoreInput
                  label="Kecepatan Target"
                  value={kecepatanTarget}
                  onChange={setKecepatanTarget}
                  testId="input-kecepatan"
                />
                <ScoreInput
                  label="Konsistensi Tembakan"
                  value={konsistensiTembakan}
                  onChange={setKonsistensiTembakan}
                  testId="input-konsistensi"
                />
                <ScoreInput
                  label="Posisi Menembak"
                  value={posisiMenembak}
                  onChange={setPosisiMenembak}
                  testId="input-posisi"
                />
                <ScoreInput
                  label="Penguasaan Senjata"
                  value={penguasaanSenjata}
                  onChange={setPenguasaanSenjata}
                  testId="input-senjata"
                />
              </CardContent>
            </Card>

            {/* Tactical */}
            <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
              <CardHeader className="border-b border-[#E6E1D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4A3628]/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-[#4A3628]" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-base font-bold text-[#2D231F]">
                      2. Aspek Taktis Diskresi
                    </CardTitle>
                    <p className="text-sm text-[#75675E]">
                      Total:{' '}
                      <span className="font-bold text-[#4A3628]">{totals.totalTactical}</span>
                      /40
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ScoreInput
                  label="Analisa Situasi"
                  value={analisaSituasi}
                  onChange={setAnalisaSituasi}
                  testId="input-analisa"
                />
                <ScoreInput
                  label="Ketepatan Respon"
                  value={ketepatanRespon}
                  onChange={setKetepatanRespon}
                  testId="input-respon"
                />
                <ScoreInput
                  label="Pengendalian Ancaman"
                  value={pengendalianAncaman}
                  onChange={setPengendalianAncaman}
                  testId="input-ancaman"
                />
                <ScoreInput
                  label="Kepatuhan Prosedur"
                  value={kepatuhanProsedur}
                  onChange={setKepatuhanProsedur}
                  testId="input-prosedur"
                />
              </CardContent>
            </Card>

            {/* SOP */}
            <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
              <CardHeader className="border-b border-[#E6E1D8] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#34D399]" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-base font-bold text-[#2D231F]">
                      3. Kepatuhan SOP
                    </CardTitle>
                    <p className="text-sm text-[#75675E]">
                      Total:{' '}
                      <span className="font-bold text-[#4A3628]">{totals.totalSop}</span>
                      /50
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ScoreInput
                  label="Kepatuhan SOP"
                  value={kepatuhanSop}
                  onChange={setKepatuhanSop}
                  testId="input-sop"
                />
                <ScoreInput
                  label="Kontrol Laras"
                  value={kontrolLaras}
                  onChange={setKontrolLaras}
                  testId="input-laras"
                />
                <ScoreInput
                  label="Posisi Jari"
                  value={posisiJari}
                  onChange={setPosisiJari}
                  testId="input-jari"
                />
                <ScoreInput
                  label="Kesadaran Lingkungan"
                  value={kesadaranLingkungan}
                  onChange={setKesadaranLingkungan}
                  testId="input-lingkungan"
                />
                <ScoreInput
                  label="Prosedur Paska Menembak"
                  value={prosedurPaskaMenembak}
                  onChange={setProsedurPaskaMenembak}
                  testId="input-paska"
                />
              </CardContent>
            </Card>
          </div>

          {/* Total Score + Notes */}
          <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)] mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#D4AF37]/10 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-sm text-[#75675E] mb-1">Total Keseluruhan</p>
                    <p className="font-heading text-5xl font-black text-[#4A3628]">
                      {totals.totalScore}
                      <span className="text-2xl text-[#75675E] font-normal">/140</span>
                    </p>
                    <div className="mt-3">
                      {totals.totalScore >= 70 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                          <Check className="w-4 h-4" /> LULUS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                          <X className="w-4 h-4" /> TIDAK LULUS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2D231F] font-medium">Catatan (Opsional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan penilaian..."
                    className="border-[#E6E1D8] focus:border-[#C3A987] min-h-[140px]"
                    data-testid="notes-textarea"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting || !selectedPersonnel || !activityName.trim()}
            className="w-full bg-[#4A3628] hover:bg-[#36271D] text-white font-semibold py-6 text-lg"
            data-testid="submit-score-button"
          >
            {submitting ? (
              'Menyimpan...'
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan Penilaian
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
