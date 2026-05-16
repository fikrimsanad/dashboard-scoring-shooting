"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Trash2, ArrowUpDown, Target, Brain, FileCheck } from 'lucide-react';

interface TechnicalScore { akurasi_tembakan: number; kecepatan_target: number; konsistensi_tembakan: number; posisi_menembak: number; penguasaan_senjata: number; }
interface TacticalScore { analisa_situasi: number; ketepatan_respon: number; pengendalian_ancaman: number; kepatuhan_prosedur: number; }
interface SOPScore { kepatuhan_sop: number; kontrol_laras: number; posisi_jari: number; kesadaran_lingkungan: number; prosedur_paska_menembak: number; }

interface Score {
  id: string;
  personnel_id: string;
  personnel_name: string;
  personnel_nrp: string;
  personnel_rank: string;
  personnel_unit: string;
  simulation_date: string;
  technical: TechnicalScore;
  tactical: TacticalScore;
  sop: SOPScore;
  total_technical: number;
  total_tactical: number;
  total_sop: number;
  total_score: number;
  notes?: string;
  created_at: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('total_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => { fetchScores(); }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      if (!res.ok) throw new Error();
      setScores(await res.json());
    } catch {
      toast.error('Gagal memuat data penilaian');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const handlePreview = (score: Score) => {
    setSelectedScore(score);
    setPreviewOpen(true);
  };

  const handleDelete = async (scoreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`/api/scores/${scoreId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setScores(scores.filter((s) => s.id !== scoreId));
      toast.success('Data berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus data');
    }
  };

  const filteredScores = scores
    .filter(
      (score) =>
        score.personnel_name.toLowerCase().includes(search.toLowerCase()) ||
        score.personnel_nrp.toLowerCase().includes(search.toLowerCase()) ||
        score.personnel_unit.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField as keyof Score];
      const bVal = b[sortField as keyof Score];
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  const getScoreColor = (score: number) => {
    if (score >= 120) return 'text-green-600 bg-green-50';
    if (score >= 100) return 'text-blue-600 bg-blue-50';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPassStatus = (score: number) =>
    score >= 70
      ? { text: 'LULUS', color: 'text-green-600 bg-green-50' }
      : { text: 'TIDAK LULUS', color: 'text-red-600 bg-red-50' };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-[#4A3628] transition-colors"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-[#D4AF37]' : ''}`} />
    </button>
  );

  return (
    <DashboardLayout title="Data Scoring">
      <div data-testid="scores-list-page">
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">Daftar Penilaian Simulasi</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75675E]" />
                <Input
                  placeholder="Cari nama, NRP, atau unit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                  data-testid="search-input"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F5F2] hover:bg-[#F7F5F2]">
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4"><SortButton field="personnel_name">Nama</SortButton></TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">NRP</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Pangkat</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Unit</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4"><SortButton field="simulation_date">Tanggal</SortButton></TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center"><SortButton field="total_score">Score</SortButton></TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center">Status</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-[#75675E]">Memuat data...</TableCell></TableRow>
                  ) : filteredScores.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-[#75675E]">{search ? 'Tidak ada hasil pencarian' : 'Belum ada data penilaian'}</TableCell></TableRow>
                  ) : (
                    filteredScores.map((score) => {
                      const passStatus = getPassStatus(score.total_score);
                      return (
                        <TableRow
                          key={score.id}
                          className="hover:bg-[#F7F5F2]/50 cursor-pointer"
                          onClick={() => handlePreview(score)}
                          data-testid={`score-row-${score.id}`}
                        >
                          <TableCell className="font-medium text-[#2D231F] py-5 px-4">{score.personnel_name}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{score.personnel_nrp}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{score.personnel_rank}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{score.personnel_unit}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{score.simulation_date}</TableCell>
                          <TableCell className="text-center py-5 px-4">
                            <Badge className={`${getScoreColor(score.total_score)} border-0`}>{score.total_score}/140</Badge>
                          </TableCell>
                          <TableCell className="text-center py-5 px-4">
                            <Badge className={`${passStatus.color} border-0 font-semibold`}>{passStatus.text}</Badge>
                          </TableCell>
                          <TableCell className="py-5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handlePreview(score); }}
                                className="text-[#75675E] hover:text-[#4A3628]"
                                data-testid={`preview-btn-${score.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(score.id, e)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                data-testid={`delete-btn-${score.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Penilaian</DialogTitle>
            </DialogHeader>
            {selectedScore && (
              <div className="p-6 space-y-6">
                {/* Identitas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-[#75675E]">Nama</span><p className="font-medium text-[#2D231F]">{selectedScore.personnel_name}</p></div>
                  <div><span className="text-[#75675E]">NRP</span><p className="font-medium text-[#2D231F]">{selectedScore.personnel_nrp}</p></div>
                  <div><span className="text-[#75675E]">Pangkat</span><p className="font-medium text-[#2D231F]">{selectedScore.personnel_rank}</p></div>
                  <div><span className="text-[#75675E]">Unit</span><p className="font-medium text-[#2D231F]">{selectedScore.personnel_unit}</p></div>
                  <div><span className="text-[#75675E]">Tanggal Simulasi</span><p className="font-medium text-[#2D231F]">{selectedScore.simulation_date}</p></div>
                  <div>
                    <span className="text-[#75675E]">Total Score</span>
                    <Badge className={`mt-1 block w-fit ${getScoreColor(selectedScore.total_score)} border-0 font-bold text-sm`}>
                      {selectedScore.total_score}/140
                    </Badge>
                  </div>
                </div>

                {/* Teknis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="font-semibold text-[#2D231F]">Teknis ({selectedScore.total_technical}/50)</h3>
                  </div>
                  <div className="space-y-1 text-sm pl-6">
                    {selectedScore.technical && Object.entries(selectedScore.technical).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[#75675E]">
                        <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-[#2D231F]">{v}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Taktis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-[#60A5FA]" />
                    <h3 className="font-semibold text-[#2D231F]">Taktis ({selectedScore.total_tactical}/40)</h3>
                  </div>
                  <div className="space-y-1 text-sm pl-6">
                    {selectedScore.tactical && Object.entries(selectedScore.tactical).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[#75675E]">
                        <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-[#2D231F]">{v}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOP */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="w-4 h-4 text-[#34D399]" />
                    <h3 className="font-semibold text-[#2D231F]">SOP ({selectedScore.total_sop}/50)</h3>
                  </div>
                  <div className="space-y-1 text-sm pl-6">
                    {selectedScore.sop && Object.entries(selectedScore.sop).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[#75675E]">
                        <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-[#2D231F]">{v}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedScore.notes && (
                  <div>
                    <span className="text-[#75675E] text-sm">Catatan</span>
                    <p className="text-sm text-[#2D231F] mt-1">{selectedScore.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
