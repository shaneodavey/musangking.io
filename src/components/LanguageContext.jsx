import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    trees: "Trees",
    tasks: "Tasks",
    analytics: "Analytics",
    settings: "Settings",
    
    // Dashboard
    farmOverview: "Farm Overview",
    totalTrees: "Total Trees",
    activeTrees: "Active Trees",
    sickTrees: "Sick Trees",
    averageAge: "Average Age",
    years: "years",
    months: "months",
    treesByVariety: "Trees by Variety",
    growthStages: "Growth Stages",
    upcomingTasks: "Upcoming Tasks",
    noTasks: "No upcoming tasks",
    viewAll: "View All",
    
    // Tree statuses
    active: "Active",
    dead: "Dead",
    removed: "Removed",
    sick: "Sick",
    
    // Growth stages
    flush: "Flush",
    vegetative: "Vegetative",
    flowerBud: "Flower Bud",
    flowering: "Flowering",
    fruitSet: "Fruit Set",
    maturing: "Maturing",
    harvest: "Harvest",
    rest: "Rest",
    
    // Tree list
    searchTrees: "Search trees...",
    filterBy: "Filter by",
    allVarieties: "All Varieties",
    allStatuses: "All Statuses",
    allBlocks: "All Blocks",
    listView: "List",
    mapView: "Map",
    treeId: "Tree ID",
    variety: "Variety",
    age: "Age",
    status: "Status",
    block: "Block",
    noTrees: "No trees found",
    
    // Tree profile
    treeProfile: "Tree Profile",
    overview: "Overview",
    growth: "Growth",
    fertilizer: "Fertilizer & Soil",
    pestDisease: "Pest & Disease",
    harvestHistory: "Harvest",
    lastGrowth: "Last Growth",
    lastFertilizer: "Last Fertilizer",
    lastIrrigation: "Last Irrigation",
    currentStage: "Current Stage",
    plantingDate: "Planting Date",
    rootstock: "Rootstock",
    spacing: "Spacing",
    location: "Location",
    
    // Forms
    addRecord: "Add Record",
    growthRecord: "Growth Record",
    fertilizerRecord: "Fertilizer Record",
    irrigationRecord: "Irrigation Record",
    pestRecord: "Pest & Disease",
    harvestRecord: "Harvest Record",
    date: "Date",
    height: "Height (m)",
    trunkDiameter: "Trunk Diameter (cm)",
    canopyDiameter: "Canopy Diameter (m)",
    stage: "Stage",
    vigor: "Vigor (1-5)",
    photos: "Photos",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    
    // Fertilizer
    fertilizerType: "Fertilizer Type",
    amount: "Amount",
    method: "Method",
    soilPh: "Soil pH",
    soilEc: "Soil EC",
    
    // Irrigation
    irrigationMethod: "Irrigation Method",
    duration: "Duration (min)",
    volume: "Volume (L)",
    weather: "Weather",
    
    // Pest
    pestType: "Pest/Disease Type",
    severity: "Severity",
    treatment: "Treatment",
    product: "Product",
    dose: "Dose",
    
    // Harvest
    floweringStage: "Flowering/Harvest Stage",
    estimatedFruits: "Estimated Fruits",
    harvestedFruits: "Harvested Fruits",
    totalWeight: "Total Weight (kg)",
    gradeBreakdown: "Grade Breakdown",
    pricePerKg: "Price per kg",
    totalRevenue: "Total Revenue",
    
    // Tasks
    taskSchedule: "Task Schedule",
    addTask: "Add Task",
    taskType: "Task Type",
    title: "Title",
    description: "Description",
    dueDate: "Due Date",
    repeatEvery: "Repeat Every",
    days: "days",
    noRepeat: "No repeat",
    pending: "Pending",
    completed: "Completed",
    overdue: "Overdue",
    markComplete: "Mark Complete",
    
    // Settings
    language: "Language",
    english: "English",
    indonesian: "Bahasa Indonesia",
    defaultFarm: "Default Farm",
    defaultBlock: "Default Block",
    defaultFertilizer: "Default Fertilizer",
    exportData: "Export Data",
    exportCsv: "Export CSV",
    exportPdf: "Export PDF Report",
    syncStatus: "Sync Status",
    synced: "All data synced",
    
    // Analytics
    yieldAnalytics: "Yield Analytics",
    growthAnalytics: "Growth Analytics",
    perVariety: "Per Variety",
    perYear: "Per Year",
    averageYield: "Average Yield",
    totalHarvest: "Total Harvest",
    
    // Common
    select: "Select",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    farm: "Farm",
    tree: "Tree",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    
    // Units
    kg: "kg",
    g: "g",
    m: "m",
    cm: "cm",
    l: "L",
    min: "min",
  },
  id: {
    // Navigation
    dashboard: "Dasbor",
    trees: "Pohon",
    tasks: "Tugas",
    analytics: "Analitik",
    settings: "Pengaturan",
    
    // Dashboard
    farmOverview: "Ringkasan Kebun",
    totalTrees: "Total Pohon",
    activeTrees: "Pohon Aktif",
    sickTrees: "Pohon Sakit",
    averageAge: "Rata-rata Umur",
    years: "tahun",
    months: "bulan",
    treesByVariety: "Pohon per Varietas",
    growthStages: "Tahap Pertumbuhan",
    upcomingTasks: "Tugas Mendatang",
    noTasks: "Tidak ada tugas mendatang",
    viewAll: "Lihat Semua",
    
    // Tree statuses
    active: "Aktif",
    dead: "Mati",
    removed: "Dihapus",
    sick: "Sakit",
    
    // Growth stages
    flush: "Tunas",
    vegetative: "Vegetatif",
    flowerBud: "Kuncup Bunga",
    flowering: "Berbunga",
    fruitSet: "Pembuahan",
    maturing: "Pematangan",
    harvest: "Panen",
    rest: "Istirahat",
    
    // Tree list
    searchTrees: "Cari pohon...",
    filterBy: "Filter",
    allVarieties: "Semua Varietas",
    allStatuses: "Semua Status",
    allBlocks: "Semua Blok",
    listView: "Daftar",
    mapView: "Peta",
    treeId: "ID Pohon",
    variety: "Varietas",
    age: "Umur",
    status: "Status",
    block: "Blok",
    noTrees: "Tidak ada pohon",
    
    // Tree profile
    treeProfile: "Profil Pohon",
    overview: "Ringkasan",
    growth: "Pertumbuhan",
    fertilizer: "Pupuk & Tanah",
    pestDisease: "Hama & Penyakit",
    harvestHistory: "Panen",
    lastGrowth: "Pertumbuhan Terakhir",
    lastFertilizer: "Pemupukan Terakhir",
    lastIrrigation: "Irigasi Terakhir",
    currentStage: "Tahap Saat Ini",
    plantingDate: "Tanggal Tanam",
    rootstock: "Batang Bawah",
    spacing: "Jarak Tanam",
    location: "Lokasi",
    
    // Forms
    addRecord: "Tambah Catatan",
    growthRecord: "Catatan Pertumbuhan",
    fertilizerRecord: "Catatan Pemupukan",
    irrigationRecord: "Catatan Irigasi",
    pestRecord: "Hama & Penyakit",
    harvestRecord: "Catatan Panen",
    date: "Tanggal",
    height: "Tinggi (m)",
    trunkDiameter: "Diameter Batang (cm)",
    canopyDiameter: "Diameter Tajuk (m)",
    stage: "Tahap",
    vigor: "Vigor (1-5)",
    photos: "Foto",
    notes: "Catatan",
    save: "Simpan",
    cancel: "Batal",
    
    // Fertilizer
    fertilizerType: "Jenis Pupuk",
    amount: "Jumlah",
    method: "Metode",
    soilPh: "pH Tanah",
    soilEc: "EC Tanah",
    
    // Irrigation
    irrigationMethod: "Metode Irigasi",
    duration: "Durasi (menit)",
    volume: "Volume (L)",
    weather: "Cuaca",
    
    // Pest
    pestType: "Jenis Hama/Penyakit",
    severity: "Tingkat Keparahan",
    treatment: "Penanganan",
    product: "Produk",
    dose: "Dosis",
    
    // Harvest
    floweringStage: "Tahap Pembungaan/Panen",
    estimatedFruits: "Perkiraan Buah",
    harvestedFruits: "Buah Dipanen",
    totalWeight: "Total Berat (kg)",
    gradeBreakdown: "Rincian Grade",
    pricePerKg: "Harga per kg",
    totalRevenue: "Total Pendapatan",
    
    // Tasks
    taskSchedule: "Jadwal Tugas",
    addTask: "Tambah Tugas",
    taskType: "Jenis Tugas",
    title: "Judul",
    description: "Deskripsi",
    dueDate: "Tanggal Jatuh Tempo",
    repeatEvery: "Ulangi Setiap",
    days: "hari",
    noRepeat: "Tidak berulang",
    pending: "Menunggu",
    completed: "Selesai",
    overdue: "Terlambat",
    markComplete: "Tandai Selesai",
    
    // Settings
    language: "Bahasa",
    english: "English",
    indonesian: "Bahasa Indonesia",
    defaultFarm: "Kebun Default",
    defaultBlock: "Blok Default",
    defaultFertilizer: "Pupuk Default",
    exportData: "Ekspor Data",
    exportCsv: "Ekspor CSV",
    exportPdf: "Ekspor Laporan PDF",
    syncStatus: "Status Sinkronisasi",
    synced: "Semua data tersinkron",
    
    // Analytics
    yieldAnalytics: "Analitik Hasil",
    growthAnalytics: "Analitik Pertumbuhan",
    perVariety: "Per Varietas",
    perYear: "Per Tahun",
    averageYield: "Rata-rata Hasil",
    totalHarvest: "Total Panen",
    
    // Common
    select: "Pilih",
    loading: "Memuat...",
    error: "Error",
    success: "Berhasil",
    confirm: "Konfirmasi",
    delete: "Hapus",
    edit: "Edit",
    farm: "Kebun",
    tree: "Pohon",
    today: "Hari Ini",
    thisWeek: "Minggu Ini",
    thisMonth: "Bulan Ini",
    
    // Units
    kg: "kg",
    g: "g",
    m: "m",
    cm: "cm",
    l: "L",
    min: "menit",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('durian_language');
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('durian_language', lang);
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default LanguageContext;