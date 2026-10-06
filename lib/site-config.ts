// Cấu hình chung của site: menu, mạng xã hội và thông tin liên hệ.

/** Địa chỉ gốc của site, dùng cho sitemap và robots. */
export const siteUrl = "https://ctit-embedded.vercel.app";

/** Các mục menu chính (cũng dùng cho ô lưới ở trang chủ và banner từng trang). */
export const nav = [
  {
    href: "/about",
    en: "About",
    label: "Giới thiệu",
    intro: "Người phụ trách và các số liệu tổng quan về CTIT."
  },
  {
    href: "/admissions",
    en: "Admissions",
    label: "Tuyển sinh",
    intro: "Các bước để tham gia CTIT."
  },
  {
    href: "/schools",
    en: "Schools & Departments",
    label: "Trường & Khoa",
    intro: "Học viên tiêu biểu, phân loại theo trường."
  },
  {
    href: "/research",
    en: "Research",
    label: "Nghiên cứu",
    intro: "Các đề tài, dự án và hoạt động nghiên cứu của CTIT."
  },
  {
    href: "/news",
    en: "News",
    label: "Tin tức",
    intro: "Tin mới từ CTIT."
  },
  {
    href: "/events",
    en: "Events",
    label: "Sự kiện",
    intro: "Lịch các buổi học, workshop và hoạt động sắp tới."
  },
  {
    href: "/resources",
    en: "Resources",
    label: "Tài nguyên",
    intro: "Tài liệu, inventory và các nguồn lực kỹ thuật của CTIT."
  },
  {
    href: "/campus",
    en: "Campus",
    label: "Khuôn viên",
    intro: "Hình ảnh và đời sống học tập tại CTIT."
  }
];

/** Liên kết tiện ích (không nằm trong menu chính). */
export const utility = [
  {
    href: "/resources",
    label: "Tài nguyên"
  },
  {
    href: "/admin",
    label: "Admin"
  }
];

/** Mạng xã hội ở footer. Muốn thêm mạng khác thì thêm icon tương ứng trong components/Footer.tsx. */
export const socials = [
  {
    name: "TikTok",
    href: "#"
  },
  {
    name: "Instagram",
    href: "#"
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100090175012090"
  },
  {
    name: "YouTube",
    href: "#"
  }
];

export const contact = {
  phone: "0900 000 000",
  email: "dothanhdat020405@gmail.com"
};
