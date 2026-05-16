"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Lock, Bell, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ emailNotifications: true, scoreAlerts: true });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profil berhasil diperbarui');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    toast.success('Password berhasil diubah');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <DashboardLayout title="Pengaturan">
      <div className="max-w-3xl space-y-6" data-testid="settings-page">
        {/* Profil */}
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4A3628]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#4A3628]" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">Profil Pengguna</CardTitle>
                <CardDescription className="text-[#75675E]">Kelola informasi profil Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2D231F]">Nama Lengkap</Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Nama lengkap"
                    className="border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                    data-testid="settings-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2D231F]">Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="email@polri.go.id"
                    className="border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                    data-testid="settings-email-input"
                  />
                </div>
              </div>
              <Button type="submit" className="bg-[#4A3628] hover:bg-[#36271D] text-white" data-testid="save-profile-btn">
                <Save className="w-4 h-4 mr-2" />Simpan Profil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ubah Password */}
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">Ubah Password</CardTitle>
                <CardDescription className="text-[#75675E]">Perbarui password akun Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#2D231F]">Password Saat Ini</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                  data-testid="current-password-input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2D231F]">Password Baru</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                    data-testid="new-password-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2D231F]">Konfirmasi Password Baru</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ulangi password baru"
                    className="border-[#E6E1D8] focus:border-[#C3A987] focus:ring-[#C3A987]"
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>
              <Button type="submit" className="bg-[#4A3628] hover:bg-[#36271D] text-white" data-testid="change-password-btn">
                <Lock className="w-4 h-4 mr-2" />Ubah Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifikasi */}
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#60A5FA]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">Notifikasi</CardTitle>
                <CardDescription className="text-[#75675E]">Atur preferensi notifikasi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D231F]">Notifikasi Email</p>
                <p className="text-sm text-[#75675E]">Terima pemberitahuan via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                data-testid="email-notifications-switch"
              />
            </div>
            <Separator className="bg-[#E6E1D8]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#2D231F]">Peringatan Score</p>
                <p className="text-sm text-[#75675E]">Notifikasi saat ada score baru</p>
              </div>
              <Switch
                checked={notifications.scoreAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, scoreAlerts: checked })}
                data-testid="score-alerts-switch"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tentang Aplikasi */}
        <Card className="border-[#E6E1D8] shadow-[0_2px_8px_rgba(74,54,40,0.06)]">
          <CardHeader className="border-b border-[#E6E1D8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg font-bold text-[#2D231F]">Tentang Aplikasi</CardTitle>
                <CardDescription className="text-[#75675E]">Informasi sistem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#75675E]">Nama Aplikasi</span>
                <span className="font-medium text-[#2D231F]">Simulasi Menembak Lemdiklat Polri</span>
              </div>
              <Separator className="bg-[#E6E1D8]" />
              <div className="flex justify-between">
                <span className="text-[#75675E]">Versi</span>
                <span className="font-medium text-[#2D231F]">1.0.0 (Next.js)</span>
              </div>
              <Separator className="bg-[#E6E1D8]" />
              <div className="flex justify-between">
                <span className="text-[#75675E]">Terakhir Diperbarui</span>
                <span className="font-medium text-[#2D231F]">Mei 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
