/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrioritasType = 'Tinggi' | 'Sedang' | 'Rendah';

export interface Tugas {
  id_tugas: number;
  judul_tugas: string;
  nama_matkul: string;
  tanggal_deadline: string; // format: YYYY-MM-DD
  prioritas: PrioritasType;
}

export interface UserProfile {
  nama_user: string;
}
