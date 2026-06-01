import { UserStyleReport } from '@/types/report';
import Image from "next/image";

export function ReportContent({ report }: { report: UserStyleReport }) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* Kapak */}
      <div className="text-center pb-6 border-b border-border">
        <p className="font-sans text-xs uppercase tracking-widest
                      text-muted-foreground mb-4">
          VESTO STİL RAPORU
        </p>
        <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4
                        flex items-center justify-center overflow-hidden">
          {report.user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image width={800} height={800}
              src={report.user.photoUrl}
              className="w-full h-full object-cover"
              alt={report.user.displayName}
            />
          ) : (
            <span className="font-playfair text-3xl text-foreground">
              {report.user.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="font-playfair text-3xl text-foreground mb-1">
          {report.user.displayName}
        </h1>
        {report.user.username && (
          <p className="font-sans text-sm text-muted-foreground">
            @{report.user.username}
          </p>
        )}
        {report.user.bio && (
          <p className="font-sans text-sm text-muted-foreground mt-2 italic">
            &ldquo;{report.user.bio}&rdquo;
          </p>
        )}
        <p className="font-sans text-xs text-muted-foreground mt-4">
          {new Date(report.generatedAt).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Gardırop Özeti */}
      <section>
        <SectionTitle>Gardırop Analizi</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatBox
            value={report.wardrobe.totalItems}
            label="Toplam Kıyafet"
          />
          <StatBox
            value={report.wardrobe.publicItems}
            label="Paylaşılan"
          />
          <StatBox
            value={report.wardrobe.recentlyAdded}
            label="Son 30 Günde"
          />
        </div>

        {/* Kategori Dağılımı */}
        <p className="font-sans text-xs uppercase tracking-widest
                      text-muted-foreground mb-3">
          KATEGORİ DAĞILIMI
        </p>
        <div className="space-y-2">
          {report.wardrobe.categoryBreakdown.slice(0, 5).map(cat => (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-sm text-foreground capitalize">
                  {cat.category}
                </span>
                <span className="font-sans text-sm text-muted-foreground">
                  {cat.count} adet (%{cat.percentage})
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Renk Paleti */}
      <section>
        <SectionTitle>Renk Paleti</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {report.wardrobe.topColors.map(color => (
            <div key={color.hex} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-sans text-xs text-muted-foreground">
                {color.count}×
              </span>
            </div>
          ))}
        </div>
        {report.wardrobe.topColors.length === 0 && (
          <p className="font-sans text-sm text-muted-foreground">
            Henüz renk analizi yok
          </p>
        )}
      </section>

      {/* Materyaller */}
      {report.wardrobe.topMaterials.length > 0 && (
        <section>
          <SectionTitle>Sık Kullanılan Materyaller</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {report.wardrobe.topMaterials.map(mat => (
              <span
                key={mat.material}
                className="px-3 py-1 bg-muted rounded-full
                           font-sans text-sm text-foreground capitalize"
              >
                {mat.material} ({mat.count})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Kombin İstatistikleri */}
      <section>
        <SectionTitle>Kombin İstatistikleri</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatBox
            value={report.outfits.totalOutfits}
            label="Toplam Kombin"
          />
          <StatBox
            value={report.outfits.totalWearCount}
            label="Toplam Giyim"
          />
          <StatBox
            value={report.outfits.favoriteCount}
            label="Favori"
          />
        </div>
        {report.outfits.mostWornOutfit && (
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="font-sans text-xs uppercase tracking-widest
                          text-muted-foreground mb-2">
              EN ÇOK GİYİLEN KOMBİN
            </p>
            <p className="font-playfair text-lg text-foreground">
              {report.outfits.mostWornOutfit.name}
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              {report.outfits.mostWornOutfit.wearCount} kez giyildi
            </p>
          </div>
        )}
      </section>

      {/* Sosyal İstatistikler */}
      <section>
        <SectionTitle>Sosyal Profil</SectionTitle>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <StatBox
            value={report.social.followerCount}
            label="Takipçi"
          />
          <StatBox
            value={report.social.followingCount}
            label="Takip"
          />
          <StatBox
            value={report.social.forumPostCount}
            label="Forum Post"
          />
          <StatBox
            value={report.social.totalLikesReceived}
            label="Beğeni"
          />
        </div>

        {/* Stilist Stats */}
        {report.social.isStylist && report.social.stylistStats && (
          <div className="bg-muted border border-border text-foreground rounded-lg p-4">
            <p className="font-sans text-xs uppercase tracking-widest
                          text-muted-foreground mb-3">
              ✨ STİLİST İSTATİSTİKLERİ
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-playfair text-2xl text-foreground">
                  {report.social.stylistStats.suggestionsSent}
                </div>
                <div className="font-sans text-xs text-muted-foreground mt-1">
                  Öneri
                </div>
              </div>
              <div className="text-center">
                <div className="font-playfair text-2xl text-foreground">
                  {report.social.stylistStats.suggestionsAccepted}
                </div>
                <div className="font-sans text-xs text-muted-foreground mt-1">
                  Kabul
                </div>
              </div>
              <div className="text-center">
                <div className="font-playfair text-2xl text-foreground">
                  %{report.social.stylistStats.acceptRate}
                </div>
                <div className="font-sans text-xs text-muted-foreground mt-1">
                  Oran
                </div>
              </div>
              <div className="text-center">
                <div className="font-playfair text-2xl text-foreground">
                  {report.social.stylistStats.averageRating > 0
                    ? `★ ${report.social.stylistStats.averageRating.toFixed(1)}`
                    : '—'}
                </div>
                <div className="font-sans text-xs text-muted-foreground mt-1">
                  Puan
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-border">
        <p className="font-sans text-xs text-muted-foreground">
          Bu rapor Vesto AI tarafından otomatik oluşturulmuştur.
        </p>
        <p className="font-sans text-xs text-muted-foreground mt-1">
          vesto.app • {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-playfair text-xl text-foreground mb-4 pb-2
                   border-b border-border">
      {children}
    </h2>
  );
}

function StatBox({
  value, label
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="text-center bg-card border border-border
                    rounded-lg p-4">
      <div className="font-playfair text-2xl text-foreground">{value}</div>
      <div className="font-sans text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

