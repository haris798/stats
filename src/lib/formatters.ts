export function formatMinutesToHours(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 menit';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} menit`;
  }
  if (minutes === 0) {
    return `${hours} jam`;
  }
  return `${hours}j ${minutes}m`;
}

export function formatMinutesFull(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 menit';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} menit`;
  }
  if (minutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${minutes} menit`;
}

export function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const monthsIndonesian = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    return `${parseInt(day)} ${monthsIndonesian[dateObj.getMonth()]} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

export function formatDateDayName(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const daysIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return daysIndonesian[dateObj.getDay()];
  } catch (e) {
    return '';
  }
}

export function getAppMeta(pkg: string, name: string): { color: string; iconBg: string; category: string } {
  const p = pkg.toLowerCase();
  const n = name.toLowerCase();

  if (p.includes('youtube') || n.includes('youtube')) {
    return { color: 'bg-red-500', iconBg: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400', category: 'Hiburan' };
  }
  if (p.includes('whatsapp') || n.includes('whatsapp')) {
    return { color: 'bg-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', category: 'Komunikasi' };
  }
  if (p.includes('chrome') || n.includes('chrome')) {
    return { color: 'bg-blue-500', iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', category: 'Produktivitas' };
  }
  if (p.includes('instagram') || n.includes('instagram')) {
    return { color: 'bg-pink-500', iconBg: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400', category: 'Sosial' };
  }
  if (p.includes('tiktok') || n.includes('tiktok')) {
    return { color: 'bg-zinc-800 dark:bg-zinc-200', iconBg: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100', category: 'Sosial' };
  }
  if (p.includes('mobile.legends') || n.includes('legend')) {
    return { color: 'bg-amber-500', iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', category: 'Game' };
  }
  if (p.includes('spotify') || n.includes('spotify')) {
    return { color: 'bg-green-500', iconBg: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400', category: 'Audio' };
  }
  if (p.includes('tokopedia') || p.includes('shopee') || n.includes('shopee')) {
    return { color: 'bg-orange-500', iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400', category: 'Belanja' };
  }

  return { color: 'bg-indigo-500', iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400', category: 'Aplikasi' };
}
