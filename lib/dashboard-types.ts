export type OverviewStat = {
  label: string;
  value: string;
};

export type AboutInfo = {
  name: string;
  school: string;
  major: string;
  faculty: string;
  bio: string;
  photo: string;
  // Tuy chon: logo hien o Header (thay cho chu "CT" mac dinh). De trong thi
  // van dung chu "CT" nhu cu, khong loi gi ca.
  logo: string;
  // 2 dong tuy chon, de trong trong sheet thi trang /about tu dung tieu de/mo ta
  // mac dinh trong lib/site-config.ts (khong bat buoc phai dien).
  pageTitle: string;
  pageIntro: string;
};

export type Student = {
  school: string; // ten viet tat (cot "Tên viết tắt"), vd HCMUT
  schoolFull: string; // ten day du (cot "Tên đầy đủ"), "" neu sheet de trong
  name: string;
  major: string;
  faculty: string;
  photo: string;
};

export type FeedItem = {
  title: string;
  date: string;
  summary: string;
  url: string;
  image: string;
  tag: string;
};

// Tab Campus: them place (dia diem) va featured (anh hero) so voi FeedItem.
export type CampusItem = FeedItem & {
  place: string;
  featured: boolean;
};

// Tab Events: giong FeedItem + place (dia diem), time (gio, vd "18:00 - 20:00"),
// featured (uu tien lam hero). Trang /events tu chia Sap dien ra / Da dien ra
// dua vao "date" so voi ngay hom nay, khong can them cot rieng trong sheet.
export type EventItem = FeedItem & {
  place: string;
  time: string;
  featured: boolean;
};

// ---- Tab Admissions: 1 tab duy nhat, cot "section" phan loai moi dong ----
// (status / step / requirement / track / timeline / faq). Xem huong dan chi
// tiet trong README.md.
export type AdmissionsStatus = {
  title: string;
  content: string;
  url: string;
};

export type AdmissionsStep = {
  title: string;
  content: string;
};

export type AdmissionsRequirement = {
  title: string;
};

export type AdmissionsTrack = {
  title: string;
  content: string;
  url: string;
  image: string;
};

export type AdmissionsTimelineItem = {
  date: string;
  title: string;
  content: string;
};

export type AdmissionsFaq = {
  title: string;
  content: string;
};

export type AdmissionsData = {
  status: AdmissionsStatus | null;
  steps: AdmissionsStep[];
  requirements: AdmissionsRequirement[];
  tracks: AdmissionsTrack[];
  timeline: AdmissionsTimelineItem[];
  faqs: AdmissionsFaq[];
};


export type ResearchItem = {
  section: "focus" | "project" | "achievement" | "publication";
  order: number | null;
  index: number;
  title: string;
  content: string;
  date: string;
  url: string;
  image: string;
  tag: string;
  // Chi dung cho dong "project": ghi DUNG ten cua 1 dong "focus" (khong phan
  // biet hoa/thuong/dau) de du an do hien len trong khoi noi bat khi bam tab
  // huong nghien cuu tuong ung. De trong thi du an chi hien trong luoi chung.
  category: string;
};

export type ResearchData = {
  focus: ResearchItem[];
  project: ResearchItem[];
  achievement: ResearchItem[];
  publication: ResearchItem[];
};
