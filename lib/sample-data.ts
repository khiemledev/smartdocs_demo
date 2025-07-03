export const sampleFiles = [
  {
    name: "TTG-970.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/970-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 970 về quy định mới",
    size: "174 KB",
    pages: 788,
  },
  {
    name: "TTG-981.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/981-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 981 về tiêu chuẩn đánh giá",
    size: "144 KB",
    pages: 643,
  },
  {
    name: "TTG-985.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/985-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 985 về quy trình tuyển sinh",
    size: "152 KB",
    pages: 656,
  },
  {
    name: "TTG-999.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/999-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 999 về chương trình đào tạo",
    size: "204 KB",
    pages: 920,
  },
  {
    name: "TTG-1009.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1009-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1009 về tiêu chuẩn chất lượng",
    size: "560 KB",
    pages: 2733,
  },
  {
    name: "TTG-1039.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1039-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1039 về quy định thi cử",
    size: "159 KB",
    pages: 745,
  },
  {
    name: "TTG-1053.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1053-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1053 về tiêu chuẩn giảng viên",
    size: "140 KB",
    pages: 601,
  },
  {
    name: "TTG-1114.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1114-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1114 về quy định nghiên cứu",
    size: "147 KB",
    pages: 667,
  },
  {
    name: "TTG-1139.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1139-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1139 về tiêu chuẩn cơ sở vật chất",
    size: "145 KB",
    pages: 634,
  },
  {
    name: "TTG-1160.pdf",
    path: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/samples/1160-ttg.signed.pdf`,
    description: "Thông tư giáo dục số 1160 về quy định đánh giá chất lượng",
    size: "152 KB",
    pages: 714,
  },
]

export const extractionResults = {
  "Cơ quan ban hành": "Bộ Giáo dục và Đào tạo",
  "Số hiệu văn bản": "TTG-1009",
  "Ngày ban hành": "15/03/2024",
  "Loại văn bản": "Thông tư",
  "Tóm tắt": "Quy định về tiêu chuẩn chất lượng giáo dục đại học",
  "Chức danh người ký": "Thứ trưởng",
  "Tên người ký": "Nguyễn Văn A",
  "Đối tượng áp dụng": "Các cơ sở giáo dục đại học",
  "Mức độ mật": "Công khai",
  "Mức độ khẩn": "Thường",
}

export type SampleFile = typeof sampleFiles[0] 