import { NoData } from "@/components/NoData";
import type { AboutInfo } from "@/lib/dashboard-types";
import { resolvePhotoUrl } from "@/lib/photo-url";

// Noi dung gio lay tu tab "About" trong Google Sheet (xem README),
// khong con hardcode trong file nay nua. Cot "photo" trong sheet nhan ca
// ten file (anh de trong public/images/About/) lan link URL day du.
type Props = {
  about: AboutInfo | null;
};

export function AboutIntro({ about }: Props) {
  if (!about) {
    return (
      <section className="about-intro">
        <NoData what="giới thiệu" env="ABOUT_SHEET_CSV_URL" />
      </section>
    );
  }

  const photoSrc = resolvePhotoUrl(about.photo || "about-photo.jpg", "about");
  const tags = [about.school, about.major, about.faculty].filter(Boolean);

  return (
    <section className="about-intro">
      <div className="about-photo-wrap">
        <div className="about-photo">
          <img src={photoSrc} alt={about.name} />
        </div>
        <span className="about-badge">CTIT Lead</span>
      </div>
      <div className="about-copy">
        <span className="about-kicker"><i />Người phụ trách</span>
        <h2>{about.name}</h2>
        {tags.length > 0 ? (
          <div className="meta">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
        {about.bio ? <p className="about-bio">{about.bio}</p> : null}
      </div>
    </section>
  );
}
