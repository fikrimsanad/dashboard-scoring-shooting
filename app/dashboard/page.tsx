"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  ClipboardList,
  Database,
  ArrowRight,
} from 'lucide-react';

interface RankingItem {
  rank: number;
  id: string;
  name: string;
  nrp: string;
  unit: string;
  total_score: number;
  simulation_date: string;
}

interface Stats {
  total_personnel: number;
  today_simulations: number;
  avg_score: number;
  total_sessions: number;
  rankings: RankingItem[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_personnel: 0,
    today_simulations: 0,
    avg_score: 0,
    total_sessions: 0,
    rankings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const statsCards = [
    { title: 'Total Personil', value: stats.total_personnel, icon: Users, color: 'text-[#4A3628]', bgColor: 'bg-[#4A3628]/5' },
    { title: 'Simulasi Hari Ini', value: stats.today_simulations, icon: Target, color: 'text-[#D4AF37]', bgColor: 'bg-[#D4AF37]/10' },
    { title: 'Rata-rata Score', value: stats.avg_score, icon: TrendingUp, color: 'text-[#34D399]', bgColor: 'bg-[#34D399]/10' },
    { title: 'Total Sesi', value: stats.total_sessions, icon: Calendar, color: 'text-[#60A5FA]', bgColor: 'bg-[#60A5FA]/10' },
  ];

  return (
    <DashboardLayout title="Dashboard Penilaian">
      <div data-testid="dashboard-page">
        {/* Stats Cards */}
        <section className="mb-8" data-testid="stats-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card
                key={stat.title}
                className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)] hover:shadow-[0_8px_24px_rgba(74,54,40,0.1)] hover:-translate-y-1 transition-all duration-300"
                data-testid={`stat-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#75675E] mb-1">{stat.title}</p>
                      <p className="font-heading text-3xl font-bold text-[#2D231F]">
                        {loading ? '...' : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="mb-8" data-testid="nav-section">
          <h2 className="font-heading text-xl font-bold text-[#2D231F] mb-4">Menu Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/scoring" data-testid="nav-card-scoring-form">
              <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)] hover:shadow-[0_8px_24px_rgba(74,54,40,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                        <ClipboardList className="w-7 h-7 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-[#2D231F] group-hover:text-[#4A3628]">Form Simulasi Menembak</h3>
                        <p className="text-sm text-[#75675E]">Isi penilaian simulasi menembak</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#C3A987] group-hover:text-[#4A3628] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/scores" data-testid="nav-card-scores-list">
              <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)] hover:shadow-[0_8px_24px_rgba(74,54,40,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[#4A3628]/10 flex items-center justify-center group-hover:bg-[#4A3628]/20 transition-colors">
                        <Database className="w-7 h-7 text-[#4A3628]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-[#2D231F] group-hover:text-[#4A3628]">Data Scoring</h3>
                        <p className="text-sm text-[#75675E]">Lihat semua data penilaian</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#C3A987] group-hover:text-[#4A3628] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Ranking Table */}
        <section data-testid="ranking-section">
          <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
            <CardHeader className="border-b border-[#E6E1D8] pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#D4AF37]" />
                <CardTitle className="font-heading text-xl font-bold text-[#2D231F]">Ranking Simulasi Menembak</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F5F2] hover:bg-[#F7F5F2]">
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Rank</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Nama</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">NRP</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Unit</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">Tanggal</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center">Score</TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-[#75675E]">Memuat data...</TableCell>
                    </TableRow>
                  ) : stats.rankings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-[#75675E]">Belum ada data ranking</TableCell>
                    </TableRow>
                  ) : (
                    stats.rankings.map((item) => {
                      const passStatus = getPassStatus(item.total_score);
                      return (
                        <TableRow key={item.id} className="hover:bg-[#F7F5F2]/50" data-testid={`ranking-row-${item.rank}`}>
                          <TableCell className="font-medium py-5 px-4">
                            <div className="flex items-center gap-2">
                              {item.rank <= 3 && (
                                <Trophy className={`w-4 h-4 ${item.rank === 1 ? 'text-[#D4AF37]' : item.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                              )}
                              #{item.rank}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-[#2D231F] py-5 px-4">{item.name}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{item.nrp}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{item.unit}</TableCell>
                          <TableCell className="text-[#75675E] py-5 px-4">{item.simulation_date}</TableCell>
                          <TableCell className="text-center py-5 px-4">
                            <Badge className={`${getScoreColor(item.total_score)} border-0`}>{item.total_score}/140</Badge>
                          </TableCell>
                          <TableCell className="text-center py-5 px-4">
                            <Badge className={`${passStatus.color} border-0 font-semibold`}>{passStatus.text}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
