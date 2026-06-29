/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertCircle, Sparkles, Calendar, Plus, User, Check, Edit2, X } from 'lucide-react';
import { Tugas, PrioritasType } from './types';

export default function App() {
  // State variables
  const [profileName, setProfileName] = useState<string>('Ilham Kurniawan');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const [tugasList, setTugasList] = useState<Tugas[]>([]);
  const [judulTugas, setJudulTugas] = useState<string>('');
  const [namaMatkul, setNamaMatkul] = useState<string>('');
  const [tanggalDeadline, setTanggalDeadline] = useState<string>('');
  const [prioritas, setPrioritas] = useState<PrioritasType>('Sedang');

  // Interactive task delete state (confirm dialog)
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Initialize data from Clever Cloud MySQL database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        setProfileName(profileData.nama_user);
        setTempName(profileData.nama_user);

        const tugasRes = await fetch('/api/tugas');
        const tugasData = await tugasRes.json();
        setTugasList(tugasData);
      } catch (err) {
        console.error('Error fetching data from database:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchData();
  }, []);

  // Update profile handler
  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tempName.trim()) return;
    try {
      setProfileName(tempName);
      setIsEditingName(false);
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_user: tempName })
      });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleStartEditProfile = () => {
    setTempName(profileName);
    setIsEditingName(true);
  };

  // Add task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulTugas.trim() || !namaMatkul.trim() || !tanggalDeadline) return;

    const newTugas: Tugas = {
      id_tugas: Date.now(),
      judul_tugas: judulTugas.trim(),
      nama_matkul: namaMatkul.trim(),
      tanggal_deadline: tanggalDeadline,
      prioritas: prioritas,
    };

    // Optimistic update
    setTugasList([...tugasList, newTugas]);

    // Reset form fields
    setJudulTugas('');
    setNamaMatkul('');
    setTanggalDeadline('');
    setPrioritas('Sedang');

    try {
      await fetch('/api/tugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTugas)
      });
    } catch (err) {
      console.error('Error adding task:', err);
      // Fallback: fetch again to stay in sync
      try {
        const res = await fetch('/api/tugas');
        const data = await res.json();
        setTugasList(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Delete task helper after confirmation
  const executeDeleteTask = async (id: number) => {
    const updatedTasks = tugasList.filter((item) => item.id_tugas !== id);
    setTugasList(updatedTasks);
    setDeleteId(null);

    try {
      await fetch(`/api/delete-tugas/${id}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      // Fallback: fetch again to stay in sync
      try {
        const res = await fetch('/api/tugas');
        const data = await res.json();
        setTugasList(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sort tasks by deadline (earlier deadlines first)
  const sortedTugas = [...tugasList].sort((a, b) => {
    return new Date(a.tanggal_deadline).getTime() - new Date(b.tanggal_deadline).getTime();
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-20 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* HEADER NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div id="nav-container" className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div id="nav-logo" className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="checklist">📋</span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              PoliTask
            </span>
          </div>

          {/* User Profile Controls */}
          <div id="profile-container" className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {isLoadingProfile ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center animate-pulse shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-400">Memuat...</span>
                    <span className="text-[10px] text-slate-300">Harap tunggu</span>
                  </div>
                </motion.div>
              ) : isEditingName ? (
                <motion.form
                  key="editing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleUpdateProfile}
                  className="flex items-center gap-1.5"
                >
                  <input
                    id="input-nama"
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-36 md:w-44 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 transition-all font-medium"
                    placeholder="Ketik nama..."
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white p-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                    title="Simpan"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1 rounded-lg text-xs transition-all flex items-center justify-center"
                    title="Batal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 shadow-inner flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 uppercase border border-indigo-200">
                    {profileName.trim().charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] md:max-w-[170px]" id="user-display-name">
                      Halo, {profileName}
                    </span>
                    <button
                      onClick={handleStartEditProfile}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-left transition-all flex items-center gap-0.5 group"
                    >
                      <span>Ganti Nama</span>
                      <Edit2 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER SECTION */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* ADD TASK FORM PANEL */}
        <section id="form-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden transition-all hover:shadow-md">
          {/* Form Background Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-2xl -mr-6 -mt-6"></div>

          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-lg flex items-center justify-center shadow-xs">
              ✨
            </span>
            Tambah Tugas Baru
          </h2>

          <form onSubmit={handleAddTask} className="space-y-5">
            {/* Task Title Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Judul Tugas
              </label>
              <input
                id="judul"
                type="text"
                required
                value={judulTugas}
                onChange={(e) => setJudulTugas(e.target.value)}
                placeholder="Contoh: Laporan Praktikum"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 bg-slate-5/60 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Course Name Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nama Mata Kuliah
              </label>
              <input
                id="matkul"
                type="text"
                required
                value={namaMatkul}
                onChange={(e) => setNamaMatkul(e.target.value)}
                placeholder="Contoh: Pemrograman Web"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 bg-slate-5/60 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Double column Grid for Deadline & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Deadline
                </label>
                <div className="relative">
                  <input
                    id="deadline"
                    type="date"
                    required
                    value={tanggalDeadline}
                    onChange={(e) => setTanggalDeadline(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 bg-slate-5/60 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Prioritas
                </label>
                <select
                  id="prioritas"
                  value={prioritas}
                  onChange={(e) => setPrioritas(e.target.value as PrioritasType)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 bg-slate-5/60 transition-all text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="Tinggi">🔴 Tinggi</option>
                  <option value="Sedang">🟡 Sedang</option>
                  <option value="Rendah">🟢 Rendah</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              Simpan ke Jadwal
            </motion.button>
          </form>
        </section>

        {/* TIMELINE SECTION */}
        <section id="timeline-section" className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
              Linimasa Tugas
            </h2>
            <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-2xs" id="task-count">
              {tugasList.length} Tugas
            </span>
          </div>

          <div id="tugas-list" className="relative pl-1 md:pl-2 space-y-6">
            
            {/* Custom SVG/CSS timeline vertical line - hidden when empty */}
            {sortedTugas.length > 0 && (
              <div 
                className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200" 
                style={{ zIndex: 0 }}
              />
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {sortedTugas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-10 py-10 text-center bg-white/70 rounded-2xl border border-dashed border-slate-300 p-6"
                >
                  <p className="text-sm text-slate-400 italic font-medium">
                    Belum ada tugas terjadwal. Semua tugas selesai! 🎉
                  </p>
                </motion.div>
              ) : (
                sortedTugas.map((task) => {
                  // Color styling logic mapping to priority
                  let dotColor = 'bg-emerald-500';
                  let tagClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                  if (task.prioritas === 'Tinggi') {
                    dotColor = 'bg-red-500';
                    tagClass = 'bg-red-50 text-red-600 border border-red-100';
                  } else if (task.prioritas === 'Sedang') {
                    dotColor = 'bg-amber-50 text-amber-600 border border-amber-100';
                  }

                  // Localized dates
                  const dateStr = new Date(task.tanggal_deadline).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  // Flag if this task is marked for delete-confirmation
                  const isConfirmingDelete = deleteId === task.id_tugas;

                  return (
                    <motion.div
                      key={task.id_tugas}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.95 }}
                      layout
                      className="relative pl-12 group"
                      style={{ zIndex: 10 }}
                    >
                      {/* Timeline status indicator dot */}
                      <div 
                        className={`absolute left-[12px] top-4.5 w-4 h-4 rounded-full ${dotColor} border-4 border-white shadow-md z-20 transition-all group-hover:scale-115`}
                      />

                      {/* Card block */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md active:shadow-xs transition-all relative overflow-hidden">
                        
                        <AnimatePresence mode="wait">
                          {isConfirmingDelete ? (
                            /* RENDER DELETE CONFIRMATION MINI-POP */
                            <motion.div
                              key="delete-confirm"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col md:flex-row items-center justify-between gap-3 text-slate-700 font-medium py-1"
                            >
                              <div className="flex items-center gap-2 text-rose-600 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Hapus tugas <strong>"{task.judul_tugas}"</strong>?</span>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                  type="button"
                                  onClick={() => setDeleteId(null)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => executeDeleteTask(task.id_tugas)}
                                  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Ya, Hapus
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            /* STANDARD TASK INFO READOUT */
                            <motion.div
                              key="task-details"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex justify-between items-start gap-4"
                            >
                              <div className="space-y-1.5 overflow-hidden">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`${tagClass} text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight shrink-0`}>
                                    {task.prioritas}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[150px] md:max-w-xs">
                                    {task.nama_matkul}
                                  </span>
                                </div>

                                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug truncate hover:whitespace-normal transition-all duration-300">
                                  {task.judul_tugas}
                                </h3>

                                <div className="flex items-center text-xs text-slate-500 gap-1.5 pt-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-medium text-[11px] text-slate-500">{dateStr}</span>
                                </div>
                              </div>

                              {/* Action Buttons (Delete Trigger) */}
                              <button
                                onClick={() => setDeleteId(task.id_tugas)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all shrink-0 cursor-pointer"
                                title="Hapus tugas"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>

          </div>
        </section>

      </main>
    </div>
  );
}
