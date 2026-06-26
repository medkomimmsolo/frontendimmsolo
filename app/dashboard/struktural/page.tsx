'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Struktural } from '@/types';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type BidangNode = {
  id: string;
  name: string;
  members: Struktural[];
};

type KategoriNode = {
  id: string;
  name: string;
  bidangs: BidangNode[];
};

export default function StrukturalManagement() {
  const { user } = useAuth();
  const [struktural, setStruktural] = useState<Struktural[]>([]);
  const [treeData, setTreeData] = useState<KategoriNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [expandedBidang, setExpandedBidang] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [copyStructure, setCopyStructure] = useState(true);

  const fetchStruktural = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/struktural');
      const data = response.data.data?.data || response.data.data || [];
      // Sort by urutan ascending, then id
      data.sort((a: Struktural, b: Struktural) => (a.urutan || 0) - (b.urutan || 0));
      setStruktural(data);
      
      // Auto-select latest period if not set
      if (data.length > 0 && !selectedPeriod) {
        const periods = Array.from(new Set(data.map((s: Struktural) => s.periode))).filter(Boolean).sort().reverse() as string[];
        if (periods.length > 0) {
          setSelectedPeriod(periods[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch struktural', error);
      toast.error('Gagal memuat data pengurus');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStruktural();
  }, []);

  // Build tree data whenever struktural or selectedPeriod changes
  useEffect(() => {
    const matchPeriod = selectedPeriod ? struktural.filter(s => s.periode === selectedPeriod) : struktural;
    const sorted = [...matchPeriod].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));

    const kats: string[] = [];
    sorted.forEach(s => {
      const k = s.kategori || 'BPH';
      if (!kats.includes(k)) kats.push(k);
    });

    const newTree = kats.map((kName, kIdx) => {
      const katItems = sorted.filter(s => (s.kategori || 'BPH') === kName);
      const bids: string[] = [];
      katItems.forEach(s => {
        const b = s.kelompok_bidang || 'Lainnya';
        if (!bids.includes(b)) bids.push(b);
      });

      return {
        id: `KAT-${kIdx}-${kName.replace(/\s+/g, '')}`,
        name: kName,
        bidangs: bids.map((bName, bIdx) => ({
          id: `BID-${kIdx}-${bIdx}-${bName.replace(/\s+/g, '')}`,
          name: bName,
          members: katItems.filter(s => (s.kelompok_bidang || 'Lainnya') === bName)
        }))
      };
    });

    setTreeData(newTree);
  }, [struktural, selectedPeriod]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pengurus ini?')) {
      try {
        await api.delete(`/struktural/${id}`);
        toast.success('Data pengurus berhasil dihapus');
        fetchStruktural();
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error('Gagal menghapus data');
      }
    }
  };

  // Get unique periods
  const periods = Array.from(new Set(struktural.map((s) => s.periode))).filter(Boolean).sort().reverse() as string[];

  const handleOpenModal = () => {
    setNewPeriodName('');
    setCopyStructure(true);
    setIsModalOpen(true);
  };

  const submitNewPeriod = async () => {
    const newPeriod = newPeriodName.trim();
    if (!newPeriod) return;
    if (periods.includes(newPeriod)) {
      toast.error('Periode tersebut sudah ada!');
      return;
    }
    
    setIsLoading(true);
    try {
      if (copyStructure && selectedPeriod) {
        const membersToCopy = struktural.filter(s => s.periode === selectedPeriod);
        for (const member of membersToCopy) {
          const formData = new FormData();
          formData.append('name', '-'); // Placeholder
          formData.append('jabatan', member.jabatan);
          formData.append('periode', newPeriod);
          formData.append('kategori', member.kategori || 'BPH');
          formData.append('kelompok_bidang', member.kelompok_bidang || 'Lainnya');
          formData.append('urutan', (member.urutan || 0).toString());
          
          await api.post('/struktural', formData);
        }
        toast.success(`Berhasil membuat periode ${newPeriod} dengan struktur salinan.`);
      } else {
        const formData = new FormData();
        formData.append('name', 'Belum Diisi');
        formData.append('jabatan', 'Ketua Umum');
        formData.append('periode', newPeriod);
        formData.append('kategori', 'BPH');
        formData.append('kelompok_bidang', 'Pimpinan Harian');
        formData.append('urutan', '1');
        
        await api.post('/struktural', formData);
        toast.success(`Berhasil membuat periode ${newPeriod}.`);
      }
      setIsModalOpen(false);
      await fetchStruktural();
      setSelectedPeriod(newPeriod);
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat periode baru');
      setIsLoading(false);
    }
  };

  const [isBidangModalOpen, setIsBidangModalOpen] = useState(false);
  const [newBidangName, setNewBidangName] = useState('');
  const [newKategori, setNewKategori] = useState('BPH');

  const handleOpenBidangModal = () => {
    setNewBidangName('');
    setNewKategori('BPH');
    setIsBidangModalOpen(true);
  };

  const submitNewBidang = async () => {
    if (!selectedPeriod) return;
    if (!newBidangName || newBidangName.trim() === '') return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', '-'); // Placeholder
      formData.append('jabatan', '-');
      formData.append('periode', selectedPeriod);
      formData.append('kelompok_bidang', newBidangName.trim());
      formData.append('kategori', newKategori);
      formData.append('urutan', '999');
      
      await api.post('/struktural', formData);
      toast.success(`Berhasil membuat ${newBidangName}.`);
      setIsBidangModalOpen(false);
      await fetchStruktural();
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat bidang baru');
      setIsLoading(false);
    }
  };

  const toggleBidang = (key: string) => {
    setExpandedBidang(prev => prev === key ? null : key);
  };

  // Drag and Drop Handler
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newTree = JSON.parse(JSON.stringify(treeData)); // Deep copy

    if (type === 'KATEGORI') {
      const [moved] = newTree.splice(source.index, 1);
      newTree.splice(destination.index, 0, moved);
    } 
    else if (type.startsWith('BIDANG-')) {
      const katId = type.replace('BIDANG-', '');
      const katIndex = newTree.findIndex((k: KategoriNode) => k.id === katId);
      if (katIndex > -1) {
        const [moved] = newTree[katIndex].bidangs.splice(source.index, 1);
        newTree[katIndex].bidangs.splice(destination.index, 0, moved);
      }
    } 
    else if (type.startsWith('ANGGOTA-')) {
      const parts = type.replace('ANGGOTA-', '').split('|');
      const katId = parts[0];
      const bidId = parts[1];
      
      const katIndex = newTree.findIndex((k: KategoriNode) => k.id === katId);
      if (katIndex > -1) {
        const bidIndex = newTree[katIndex].bidangs.findIndex((b: BidangNode) => b.id === bidId);
        if (bidIndex > -1) {
          const [moved] = newTree[katIndex].bidangs[bidIndex].members.splice(source.index, 1);
          newTree[katIndex].bidangs[bidIndex].members.splice(destination.index, 0, moved);
        }
      }
    }

    setTreeData(newTree);
    
    // Calculate global urutan
    let globalUrutan = 0;
    const itemsToUpdate: {id: number, urutan: number}[] = [];
    newTree.forEach((k: KategoriNode) => {
      k.bidangs.forEach((b: BidangNode) => {
        b.members.forEach((m: Struktural) => {
          itemsToUpdate.push({ id: m.id, urutan: globalUrutan++ });
        });
      });
    });

    setIsSavingOrder(true);
    try {
      await api.put('/struktural/reorder', { items: itemsToUpdate });
      
      // Update local state without fetching all again
      setStruktural(prev => {
        const copy = [...prev];
        itemsToUpdate.forEach(u => {
          const idx = copy.findIndex(x => x.id === u.id);
          if (idx > -1) copy[idx].urutan = u.urutan;
        });
        return copy;
      });
      toast.success('Urutan berhasil diperbarui');
    } catch (e) {
      toast.error('Gagal memperbarui urutan. Server error.');
      // Revert if failed
      fetchStruktural(); 
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Generate filtered tree data
  const filteredTreeData = React.useMemo(() => {
    if (!searchQuery.trim()) return treeData;
    
    const query = searchQuery.toLowerCase();
    const newTree: KategoriNode[] = [];
    
    for (const kat of treeData) {
      const katMatches = kat.name.toLowerCase().includes(query) || (kat.name === 'BPH' && 'badan pimpinan harian'.includes(query));
      const newBidangs: BidangNode[] = [];
      
      for (const bid of kat.bidangs) {
        const bidMatches = bid.name.toLowerCase().includes(query);
        const matchingMembers = bid.members.filter(m => 
          m.name.toLowerCase().includes(query) || 
          m.jabatan.toLowerCase().includes(query)
        );
        
        if (katMatches || bidMatches || matchingMembers.length > 0) {
          const membersToInclude = (katMatches || bidMatches) && matchingMembers.length === 0 
            ? bid.members 
            : (katMatches || bidMatches ? bid.members : matchingMembers);
            
          newBidangs.push({
            ...bid,
            members: membersToInclude
          });
        }
      }
      
      if (katMatches || newBidangs.length > 0) {
        newTree.push({
          ...kat,
          bidangs: newBidangs
        });
      }
    }
    
    return newTree;
  }, [treeData, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Kelola Struktur Organisasi
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Atur jajaran pengurus harian, bidang, dan lembaga PC IMM. Anda dapat mengatur urutan dengan menarik dan melepaskannya (Drag & Drop).</p>
        </div>

      </div>

      {/* Toolbar */}
      <Card className="border-[#0f172a]/10 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Period Dropdown */}
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative">
                <select
                  value={selectedPeriod || ''}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none bg-white border border-[#0f172a]/10 hover:border-[#0f172a]/30 rounded-sm pl-4 pr-10 py-2 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors cursor-pointer"
                >
                  {periods.length === 0 && <option value="" disabled>Belum ada periode</option>}
                  {periods.map(period => (
                    <option key={period} value={period}>
                      Periode {period}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/50 pointer-events-none" />
              </div>

              <button 
                onClick={handleOpenModal}
                className="px-3 py-2 flex items-center justify-center rounded-sm text-sm font-semibold transition-colors border border-dashed border-[#c20000] text-[#c20000] hover:bg-[#c20000]/5"
                title="Buat Periode Baru"
              >
                <Plus className="w-4 h-4" /> Baru
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f172a]/40" />
              <input 
                type="text" 
                placeholder="Cari nama, jabatan, bidang..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Bidang Action */}
      <div className="flex justify-between items-center mb-2">
         <div className="text-sm text-[#0f172a]/60 flex items-center gap-2">
           {isSavingOrder && <Loader2 className="w-3 h-3 animate-spin" />}
           {isSavingOrder ? 'Menyimpan urutan...' : 'Gunakan ikon ☰ untuk drag & drop urutan'}
         </div>
         <Button 
           onClick={handleOpenBidangModal}
           variant="outline" 
           className="border-dashed border-[#c20000] text-[#c20000] hover:bg-[#c20000]/5 text-sm h-9"
           disabled={!selectedPeriod}
         >
           <Plus className="w-4 h-4 mr-1" /> Buat Bidang Baru
         </Button>
      </div>

      {/* Data Grouped By Kategori -> Bidang using React Beautiful DnD */}
      {isLoading ? (
        <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-white/70">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#c20000]" />
              <p>Memuat data pengurus...</p>
            </div>
          </div>
        </Card>
      ) : filteredTreeData.length === 0 ? (
        <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-[#0f172a]/70">
              <Users className="w-12 h-12 mb-4 text-[#0f172a]/20" />
              <p className="text-lg font-medium text-[#0f172a] mb-1">
                {searchQuery ? 'Pencarian tidak ditemukan' : 'Belum ada data'}
              </p>
              <p>{searchQuery ? 'Coba gunakan kata kunci lain.' : 'Mulai tambahkan jajaran pengurus cabang Anda.'}</p>
            </div>
          </div>
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="KATEGORI">
            {(providedKat) => (
              <div 
                {...providedKat.droppableProps} 
                ref={providedKat.innerRef}
                className="space-y-10"
              >
                {filteredTreeData.map((kategori, katIndex) => {
                  
                  // If searching, filtering is already done
                  const isSearching = searchQuery.trim() !== '';
                  
                  return (
                  <Draggable key={kategori.id} draggableId={kategori.id} index={katIndex} isDragDisabled={isSearching}>
                    {(providedKatDrag) => (
                      <div 
                        ref={providedKatDrag.innerRef}
                        {...providedKatDrag.draggableProps}
                        className="space-y-4 bg-white/50 p-4 rounded-sm border border-transparent hover:border-[#0f172a]/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            {...providedKatDrag.dragHandleProps}
                            className={`p-1.5 rounded-sm text-[#0f172a]/30 hover:bg-slate-100 transition-colors ${isSearching ? 'cursor-not-allowed opacity-30' : 'cursor-grab'}`}
                            title="Drag to reorder Kategori"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <h2 className="text-xl font-bold text-[#0f172a] shrink-0" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                            {kategori.name === 'BPH' ? 'Badan Pimpinan Harian' : kategori.name}
                          </h2>
                          <div className="h-px bg-[#0f172a]/10 flex-1"></div>
                        </div>

                        <Droppable droppableId={`kat-${kategori.id}`} type={`BIDANG-${kategori.id}`}>
                          {(providedBidang) => (
                            <div 
                              className="space-y-6"
                              ref={providedBidang.innerRef}
                              {...providedBidang.droppableProps}
                            >
                              <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-[#f8fafc] border-b border-[#0f172a]/5 text-[#0f172a]/70 text-xs font-semibold uppercase tracking-wider">
                                        <th className="p-4 w-10"></th>
                                        <th className="p-4">Nama Bidang / Lembaga</th>
                                        <th className="p-4 text-center">Jumlah Anggota</th>
                                        <th className="p-4 pr-6 text-right">Aksi</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                      {kategori.bidangs.map((bidang, bidIndex) => {
                                        const groupKey = `${kategori.name}-${bidang.name}`;
                                        const isExpanded = expandedBidang === groupKey || isSearching;
                                        const filteredMembers = bidang.members.filter(m => m.name !== '-');

                                        return (
                                          <Draggable key={bidang.id} draggableId={bidang.id} index={bidIndex} isDragDisabled={isSearching}>
                                            {(providedBidangDrag) => (
                                              <Fragment>
                                                <tr 
                                                  ref={providedBidangDrag.innerRef}
                                                  {...providedBidangDrag.draggableProps}
                                                  className="hover:bg-slate-50/50 transition-colors bg-white"
                                                >
                                                  <td className="p-4 w-10">
                                                    <div 
                                                      {...providedBidangDrag.dragHandleProps} 
                                                      className={`p-1 rounded-sm text-[#0f172a]/20 hover:text-[#0f172a]/60 hover:bg-slate-100 transition-colors ${isSearching ? 'cursor-not-allowed opacity-30' : 'cursor-grab'}`}
                                                    >
                                                      <GripVertical className="w-4 h-4" />
                                                    </div>
                                                  </td>
                                                  <td className="p-4 font-bold text-[#0f172a] cursor-pointer" onClick={() => toggleBidang(groupKey)}>
                                                    {bidang.name}
                                                  </td>
                                                  <td className="p-4 text-center text-[#0f172a]/80 cursor-pointer" onClick={() => toggleBidang(groupKey)}>
                                                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-1 rounded-sm text-xs font-medium min-w-[2rem]">
                                                      {filteredMembers.length}
                                                    </span>
                                                  </td>
                                                  <td className="p-4 pr-6 text-right">
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm"
                                                      className="h-8 text-xs border-[#0f172a]/10 text-[#0f172a]/80 hover:bg-[#0f172a]/5 transition-colors"
                                                      onClick={(e) => { e.stopPropagation(); toggleBidang(groupKey); }}
                                                    >
                                                      Aksi Detail 
                                                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                                    </Button>
                                                  </td>
                                                </tr>
                                                {isExpanded && (
                                                  <tr className="bg-slate-50/50">
                                                    <td colSpan={4} className="p-0 border-t border-[#0f172a]/5">
                                                      <div className="p-6">
                                                        <div className="flex justify-between items-center mb-4">
                                                          <h4 className="font-semibold text-[#0f172a] flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-[#c20000]" />
                                                            Data Anggota: {bidang.name}
                                                          </h4>
                                                          <Link href={`/dashboard/struktural/create?periode=${selectedPeriod}&bidang=${encodeURIComponent(bidang.name)}&kategori=${encodeURIComponent(kategori.name)}`}>
                                                            <Button className="bg-[#c20000] hover:bg-[#a30000] text-white h-8 text-xs rounded-sm shadow-sm transition-colors">
                                                              <Plus className="w-3 h-3 mr-1" /> Tambah Anggota
                                                            </Button>
                                                          </Link>
                                                        </div>
                                                        
                                                        <div className="border border-[#0f172a]/10 rounded-sm overflow-hidden bg-white shadow-sm">
                                                          <Droppable droppableId={`anggota-${kategori.id}|${bidang.id}`} type={`ANGGOTA-${kategori.id}|${bidang.id}`}>
                                                            {(providedAnggota) => (
                                                              <table className="w-full text-left border-collapse">
                                                                <thead>
                                                                  <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-[11px] font-semibold uppercase tracking-wider">
                                                                    <th className="p-3 w-8"></th>
                                                                    <th className="p-3 pl-2">Nama Pengurus</th>
                                                                    <th className="p-3">Jabatan</th>
                                                                    <th className="p-3 text-right pr-4">Aksi</th>
                                                                  </tr>
                                                                </thead>
                                                                <tbody 
                                                                  className="divide-y divide-slate-100 text-sm"
                                                                  ref={providedAnggota.innerRef}
                                                                  {...providedAnggota.droppableProps}
                                                                >
                                                                  {filteredMembers.length === 0 ? (
                                                                    <tr>
                                                                      <td colSpan={4} className="p-6 text-center text-[#0f172a]/50 text-sm italic">
                                                                        Belum ada anggota di bidang ini.
                                                                      </td>
                                                                    </tr>
                                                                  ) : (
                                                                    filteredMembers.map((item, itemIdx) => (
                                                                      <Draggable key={`member-${item.id}`} draggableId={`member-${item.id}`} index={itemIdx} isDragDisabled={isSearching}>
                                                                        {(providedMem) => (
                                                                          <tr 
                                                                            className="hover:bg-slate-50/80 transition-colors bg-white"
                                                                            ref={providedMem.innerRef}
                                                                            {...providedMem.draggableProps}
                                                                          >
                                                                            <td className="p-3 w-8">
                                                                              <div 
                                                                                {...providedMem.dragHandleProps}
                                                                                className={`p-1 rounded-sm text-[#0f172a]/20 hover:text-[#0f172a]/60 hover:bg-slate-100 transition-colors ${isSearching ? 'cursor-not-allowed opacity-30' : 'cursor-grab'}`}
                                                                              >
                                                                                <GripVertical className="w-3.5 h-3.5" />
                                                                              </div>
                                                                            </td>
                                                                            <td className="p-3 pl-2">
                                                                              <div className="font-semibold text-[#0f172a]">{item.name}</div>
                                                                              {item.social_media && item.social_media.length > 0 ? (
                                                                                <div className="flex gap-2 mt-1">
                                                                                  {item.social_media.map((sm, smIdx) => (
                                                                                    <a key={smIdx} href={sm.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                                                                                      <img src={sm.icon} alt="Social Media" className="w-3 h-3 object-contain inline-block" />
                                                                                    </a>
                                                                                  ))}
                                                                                </div>
                                                                              ) : item.instagram_url ? (
                                                                                <a href={item.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[10px] mt-0.5 inline-block">
                                                                                  @instagram
                                                                                </a>
                                                                              ) : null}
                                                                            </td>
                                                                            <td className="p-3 text-[#0f172a]/80 text-xs">
                                                                              {item.jabatan}
                                                                            </td>
                                                                            <td className="p-3 pr-4">
                                                                              <div className="flex items-center justify-end gap-1">
                                                                                <Link href={`/dashboard/struktural/${item.id}`} className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors" title="Edit">
                                                                                  <Edit className="w-3.5 h-3.5" />
                                                                                </Link>
                                                                                <button 
                                                                                  onClick={() => handleDelete(item.id)}
                                                                                  className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors" 
                                                                                  title="Hapus"
                                                                                >
                                                                                  <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                              </div>
                                                                            </td>
                                                                          </tr>
                                                                        )}
                                                                      </Draggable>
                                                                    ))
                                                                  )}
                                                                  {providedAnggota.placeholder}
                                                                </tbody>
                                                              </table>
                                                            )}
                                                          </Droppable>
                                                        </div>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                )}
                                              </Fragment>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                      {providedBidang.placeholder}
                                    </tbody>
                                  </table>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                )})}
                {providedKat.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Create Period Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 border border-[#0f172a]/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Buat Periode Baru</h3>
            <p className="text-[#0f172a]/70 text-sm mb-6">Masukkan nama periode kepengurusan baru.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#0f172a]/90 mb-1.5">Nama Periode</label>
                <input 
                  type="text" 
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  placeholder="Contoh: 2025-2026"
                  className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
                  autoFocus
                />
              </div>
              
              {selectedPeriod && (
                <div className="flex items-start gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="copyStructure"
                    checked={copyStructure}
                    onChange={(e) => setCopyStructure(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#c20000] rounded-sm cursor-pointer"
                  />
                  <label htmlFor="copyStructure" className="text-sm text-[#0f172a]/80 cursor-pointer leading-relaxed">
                    Salin struktur jabatan dari periode <span className="font-semibold text-[#0f172a]">{selectedPeriod}</span> 
                    <br /><span className="text-xs text-[#0f172a]/60">(hanya menyalin format jabatannya, nama pengurus akan otomatis dikosongkan)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#0f172a]/5">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-sm px-4 text-sm h-9">
                Batal
              </Button>
              <Button onClick={submitNewPeriod} disabled={isLoading || !newPeriodName.trim()} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm px-4 text-sm h-9 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Buat Periode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Bidang Modal */}
      {isBidangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 border border-[#0f172a]/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Buat Bidang / Lembaga Baru</h3>
            <p className="text-[#0f172a]/70 text-sm mb-6">Tambah kelompok pengurus pada periode <span className="font-bold">{selectedPeriod}</span>.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#0f172a]/90 mb-1.5">Kategori</label>
                <select 
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
                >
                  <option value="BPH">Badan Pimpinan Harian (BPH)</option>
                  <option value="Lembaga Otonom">Lembaga Otonom</option>
                  <option value="Lembaga Semi Otonom">Lembaga Semi Otonom</option>
                  <option value="Korkom">Korkom</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0f172a]/90 mb-1.5">Nama Bidang / Lembaga</label>
                <input 
                  type="text" 
                  value={newBidangName}
                  onChange={(e) => setNewBidangName(e.target.value)}
                  placeholder="Contoh: Bidang Kader, LSO Tunas, Korkom UMS..."
                  className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#0f172a]/5">
              <Button variant="outline" onClick={() => setIsBidangModalOpen(false)} className="rounded-sm px-4 text-sm h-9">
                Batal
              </Button>
              <Button onClick={submitNewBidang} disabled={isLoading || !newBidangName.trim()} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm px-4 text-sm h-9 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan Bidang
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
