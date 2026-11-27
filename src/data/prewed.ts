export interface PrewedPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

const photo = (id:string,alt:string,width=1365,height=2048):PrewedPhoto => ({
  id,src:`/assets/prewed/${id}.jpg`,alt,width,height,
});

/** Original photographs, in album order. Cover and portrait keep their own roles. */
export const PREWED_PHOTOS: PrewedPhoto[] = [
  photo('portrait','Bersamamu di setiap langkah · 与你并肩'),
  photo('dance-nov27','Whimpy dan Xinxin berdansa dalam busana pengantin · 携手共舞',1365,2048),
  photo('aisle','Satu langkah menuju selamanya · 走向我们的未来'),
  photo('prayer','Doa untuk bahtera kita · 为我们的婚姻祈祷'),
  photo('vows','Janji kita · 我们的约定'),
  photo('kiss','Sebuah kecupan · 轻轻一吻'),
  photo('sunglasses','Tawa kecil kita · 我们的小欢喜'),
  photo('newspaper-portrait-nov27','Whimpy dan Xinxin memegang koran dalam potret hitam-putih'),
  photo('courtyard','Di halaman yang tenang · 静静的庭院'),
  photo('red-dress','Hanya kamu · 眼中只有你'),
  photo('garden','Kita dan musim yang indah · 我们与美好时光'),
  photo('autumn','Hangatnya kebersamaan · 相伴的温暖'),
  photo('album-nov-1','Foto prewedding Whimpy dan Xinxin 1',1800,1200),
  photo('album-nov-2','Foto prewedding Whimpy dan Xinxin 2',1200,1800),
  photo('album-nov-3','Foto prewedding Whimpy dan Xinxin 3',1200,1800),
  photo('album-nov-4','Foto prewedding Whimpy dan Xinxin 4',1200,1800),
  photo('album-nov-5','Foto prewedding Whimpy dan Xinxin 5',1200,1800),
  photo('album-nov-6','Foto prewedding Whimpy dan Xinxin 6',1800,1200),
  photo('album-nov-7','Foto prewedding Whimpy dan Xinxin 7',1135,1800),
  photo('album-nov-8','Foto prewedding Whimpy dan Xinxin 8',1200,1800),
  photo('album-nov-9','Foto prewedding Whimpy dan Xinxin 9',1800,1200),
  photo('album-nov-10','Foto prewedding Whimpy dan Xinxin 10',1800,1200),
  photo('album-nov-11','Foto prewedding Whimpy dan Xinxin 11',1800,1200),
  photo('album-nov-12','Foto prewedding Whimpy dan Xinxin 12',1200,1800),
];
