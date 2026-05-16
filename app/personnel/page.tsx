"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';

interface Personnel {
  id: string;
  nrp: string;
  name: string;
  rank: string;
  unit: string;
  position: string;
  phone?: string;
  photo_url?: string;
  created_at: string;
}

const getInitials = (name: string) => {
  if (!name) return 'N/A';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const emptyForm = {
  nrp: '',
  name: '',
  rank: '',
  unit: '',
  position: '',
  phone: '',
  photo_url: '',
};

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

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

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (person: Personnel) => {
    setFormData({
      nrp: person.nrp,
      name: person.name,
      rank: person.rank,
      unit: person.unit,
      position: person.position,
      phone: person.phone || '',
      photo_url: person.photo_url || '',
    });
    setEditingId(person.id);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = { ...formData, photo_url: formData.photo_url || null };
      if (editingId) {
        await axios.put(`/api/personnel/${editingId}`, dataToSend);
        toast.success('Data personil berhasil diperbarui');
      } else {
        await axios.post('/api/personnel', dataToSend);
        toast.success('Personil berhasil ditambahkan');
      }
      setDialogOpen(false);
      resetForm();
      fetchPersonnel();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data personil ini?')) return;
    try {
      await axios.delete(`/api/personnel/${id}`);
      setPersonnel(personnel.filter((p) => p.id !== id));
      toast.success('Data personil berhasil dihapus');
    } catch (error) {
      console.error('Error deleting personnel:', error);
      toast.error('Gagal menghapus data');
    }
  };

  const filteredPersonnel = personnel.filter(
    (person) =>
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.nrp.toLowerCase().includes(search.toLowerCase()) ||
      person.unit.toLowerCase().includes(search.toLowerCase()) ||
      person.rank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Data Personil">
      <div data-testid="personnel-page">
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">
                Daftar Personil
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75675E]" />
                  <Input
                    placeholder="Cari personil..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-64 border-[#E6E1D8] focus:border-[#C3A987]"
                    data-testid="search-personnel"
                  />
                </div>
                <Button
                  onClick={openAddDialog}
                  className="bg-[#4A3628] hover:bg-[#36271D] text-white"
                  data-testid="add-personnel-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Personil
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F5F2] hover:bg-[#F7F5F2]">
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Foto
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      NRP
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Nama
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Pangkat
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Unit
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Jabatan
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4">
                      Telepon
                    </TableHead>
                    <TableHead className="text-[#75675E] text-xs uppercase tracking-wider font-semibold py-4 px-4 text-center">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#75675E]">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredPersonnel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#75675E]">
                        {search ? 'Tidak ada hasil pencarian' : 'Belum ada data personil'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPersonnel.map((person) => (
                      <TableRow
                        key={person.id}
                        className="hover:bg-[#F7F5F2]/50"
                        data-testid={`personnel-row-${person.id}`}
                      >
                        <TableCell className="py-5 px-4">
                          <Avatar className="w-10 h-10 border-2 border-[#C3A987]">
                            <AvatarImage src={person.photo_url} alt={person.name} />
                            <AvatarFallback className="bg-[#4A3628] text-white text-sm font-semibold">
                              {getInitials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-[#2D231F] py-5 px-4">
                          {person.nrp}
                        </TableCell>
                        <TableCell className="font-medium text-[#2D231F] py-5 px-4">
                          {person.name}
                        </TableCell>
                        <TableCell className="text-[#75675E] py-5 px-4">
                          {person.rank}
                        </TableCell>
                        <TableCell className="text-[#75675E] py-5 px-4">
                          {person.unit}
                        </TableCell>
                        <TableCell className="text-[#75675E] py-5 px-4">
                          {person.position}
                        </TableCell>
                        <TableCell className="text-[#75675E] py-5 px-4">
                          {person.phone || '-'}
                        </TableCell>
                        <TableCell className="py-5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(person)}
                              className="text-[#75675E] hover:text-[#4A3628]"
                              data-testid={`edit-btn-${person.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(person.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              data-testid={`delete-btn-${person.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="personnel-dialog">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Personil' : 'Tambah Personil'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-0">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <Avatar className="w-20 h-20 border-4 border-[#C3A987]">
                <AvatarImage src={formData.photo_url} alt="Preview" />
                <AvatarFallback className="bg-[#4A3628] text-white text-xl font-semibold">
                  {formData.name ? getInitials(formData.name) : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">URL Foto (Opsional)</Label>
              <Input
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-photo-url"
              />
              <p className="text-xs text-[#75675E]">Masukkan URL gambar untuk foto profil</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">
                NRP <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.nrp}
                onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                placeholder="Nomor Registrasi Polri"
                required
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-nrp"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama lengkap"
                required
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">
                Pangkat <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="Contoh: IPTU, BRIPKA, AIPDA"
                required
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-rank"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">
                Unit/Satuan Kerja <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Contoh: Polda Jatim, Polres Surabaya"
                required
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-unit"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">
                Jabatan <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Jabatan"
                required
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-position"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2D231F]">No. Telepon (Opsional)</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="border-[#E6E1D8] focus:border-[#C3A987]"
                data-testid="input-phone"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#E6E1D8] text-[#75675E] hover:text-[#4A3628]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4A3628] hover:bg-[#36271D] text-white"
                data-testid="submit-personnel-btn"
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
