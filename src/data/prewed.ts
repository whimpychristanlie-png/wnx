export type PhotoCategory = 'Gereja' | 'Klasik' | 'Taman';
export interface PrewedPhoto {
  id: string;
  src: string;
  alt: string;
  category: PhotoCategory;
  width: number;
  height: number;
}

const photo = (id:string,alt:string,category:PhotoCategory,width=1365):PrewedPhoto => ({
  id,src:`/assets/prewed/${id}.jpg`,alt,category,width,height:2048,
});

/** Original photographs, in album order. Cover and portrait keep their own roles. */
export const PREWED_PHOTOS: PrewedPhoto[] = [
  photo('cover','Di bangku gereja · 教堂里的我们','Gereja',1152),
  photo('portrait','Bersamamu di setiap langkah · 与你并肩','Gereja'),
  photo('aisle','Satu langkah menuju selamanya · 走向我们的未来','Gereja'),
  photo('prayer','Doa untuk bahtera kita · 为我们的婚姻祈祷','Gereja'),
  photo('vows','Janji kita · 我们的约定','Gereja'),
  photo('kiss','Sebuah kecupan · 轻轻一吻','Klasik'),
  photo('sunglasses','Tawa kecil kita · 我们的小欢喜','Klasik'),
  photo('newspaper','Kabar bahagia · 我们的喜讯','Klasik'),
  photo('archway','Di ambang cerita baru · 新篇章的起点','Klasik'),
  photo('together','Dekat denganmu · 靠近你','Klasik'),
  photo('courtyard','Di halaman yang tenang · 静静的庭院','Taman'),
  photo('red-dress','Hanya kamu · 眼中只有你','Taman'),
  photo('garden','Kita dan musim yang indah · 我们与美好时光','Taman'),
  photo('autumn','Hangatnya kebersamaan · 相伴的温暖','Taman'),
];

export const PREWED_HIGHLIGHTS = ['aisle','autumn','kiss','prayer','red-dress','newspaper'];
