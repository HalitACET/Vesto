'use client';

import { useState } from 'react';
import { overrideAiAnalysis } from '@/lib/firebase/adminAiService';
import { AiMonitorItem } from '@/types/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from "next/image";

const CATEGORIES = [
  'top', 'bottom', 'shoes', 'accessory', 'outerwear', 'other'
];

const MATERIALS = [
  'cotton', 'polyester', 'wool', 'silk', 'denim', 'leather',
  'linen', 'synthetic', 'knit', 'other'
];

export function AiMonitorTable({
  items, onUpdate
}: {
  items: AiMonitorItem[];
  onUpdate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: '',
    subcategory: '',
    material: '',
  });
  const [saving, setSaving] = useState(false);

  const startEdit = (item: AiMonitorItem) => {
    setEditingId(item.id);
    setEditForm({
      category: item.adminOverride?.category
          ?? item.aiAnalysis?.detectedCategory ?? '',
      subcategory: item.adminOverride?.subcategory
          ?? item.aiAnalysis?.detectedSubcategory ?? '',
      material: item.adminOverride?.material
          ?? item.aiAnalysis?.detectedMaterial ?? '',
    });
  };

  const saveEdit = async (itemId: string) => {
    setSaving(true);
    try {
      await overrideAiAnalysis(itemId, editForm);
      toast.success('AI analizi güncellendi');
      setEditingId(null);
      onUpdate();
    } catch {
      toast.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Kıyafet
            </th>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Kullanıcı
            </th>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Durum
            </th>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Kategori
            </th>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Materyal
            </th>
            <th className="text-left p-3 font-sans text-xs
                           font-semibold uppercase tracking-widest text-muted-foreground">
              Güven
            </th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mist">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-muted/50">
              {/* Kıyafet görseli */}
              <td className="p-3">
                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                  {(item.bgRemovedUrl || item.imageUrl) ? (
                    <Image width={800} height={800}
                      src={item.bgRemovedUrl || item.imageUrl || ''}
                      alt="Kıyafet"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Yok</span>
                  )}
                </div>
              </td>

              {/* Kullanıcı */}
              <td className="p-3">
                <span className="font-sans text-sm text-foreground">
                  {item.userDisplayName ?? '—'}
                </span>
              </td>

              {/* Durum */}
              <td className="p-3">
                <StatusBadge status={item.uploadStatus} />
              </td>

              {/* Kategori — düzenlenebilir */}
              <td className="p-3">
                {editingId === item.id ? (
                  <div className="space-y-1">
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm(f =>
                          ({ ...f, category: e.target.value }))}
                      className="w-full border border-border bg-background text-foreground rounded px-2 py-1
                                 font-sans text-xs"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      value={editForm.subcategory}
                      onChange={e => setEditForm(f =>
                          ({ ...f, subcategory: e.target.value }))}
                      placeholder="Alt kategori"
                      className="w-full border border-border bg-background text-foreground rounded px-2 py-1
                                 font-sans text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-sans text-sm text-foreground">
                      {item.adminOverride?.category
                          ?? item.aiAnalysis?.detectedCategory
                          ?? '—'}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground">
                      {item.adminOverride?.subcategory
                          ?? item.aiAnalysis?.detectedSubcategory
                          ?? ''}
                    </p>
                    {item.adminOverride && (
                      <span className="text-[10px] text-amber-600">
                        ✏️ Düzeltildi
                      </span>
                    )}
                  </div>
                )}
              </td>

              {/* Materyal — düzenlenebilir */}
              <td className="p-3">
                {editingId === item.id ? (
                  <select
                    value={editForm.material}
                    onChange={e => setEditForm(f =>
                        ({ ...f, material: e.target.value }))}
                    className="w-full border border-border bg-background text-foreground rounded px-2 py-1
                               font-sans text-xs"
                  >
                    <option value="">— Seç —</option>
                    {MATERIALS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <span className={cn(
                    'font-sans text-sm',
                    (item.adminOverride?.material
                        ?? item.aiAnalysis?.detectedMaterial)
                      ? 'text-foreground'
                      : 'text-red-400'
                  )}>
                    {item.adminOverride?.material
                        ?? item.aiAnalysis?.detectedMaterial
                        ?? 'Eksik ⚠️'}
                  </span>
                )}
              </td>

              {/* Güven skoru */}
              <td className="p-3">
                {item.aiAnalysis?.confidence ? (
                  <div>
                    <div className="w-16 h-1.5 bg-muted rounded-full">
                      <div
                        className="h-full bg-onyx rounded-full"
                        style={{
                          width: `${item.aiAnalysis.confidence * 100}%`
                        }}
                      />
                    </div>
                    <span className="font-sans text-xs text-muted-foreground mt-1">
                      {(item.aiAnalysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ) : '—'}
              </td>

              {/* Aksiyonlar */}
              <td className="p-3">
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-onyx text-pearl rounded
                                 font-sans text-xs font-semibold
                                 disabled:opacity-50"
                    >
                      {saving ? '...' : 'Kaydet'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 border border-border text-muted-foreground
                                 rounded font-sans text-xs"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1 border border-border text-foreground
                               rounded font-sans text-xs font-medium
                               hover:border-onyx transition"
                  >
                    Düzenle
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    ready: { label: 'Tamam', className: 'bg-green-50 text-green-700' },
    analyzing: { label: 'Bekliyor', className: 'bg-amber-50 text-amber-700' },
    failed: { label: 'Başarısız', className: 'bg-red-50 text-red-700' },
    uploading: { label: 'Yükleniyor', className: 'bg-blue-50 text-blue-700' },
  };
  
  const currentConfig = config[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <span className={cn(
      'px-2 py-1 rounded-full font-sans text-xs font-semibold',
      currentConfig.className
    )}>
      {currentConfig.label}
    </span>
  );
}

