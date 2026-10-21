export const compressOdometerPhoto = (e) =>
  new Promise((resolve, reject) => {
    const o = new FileReader();
    o.readAsDataURL(e);
    o.onload = (a) => {
      const d = new Image();
      d.src = a.target?.result;
      d.onload = () => {
        const f = document.createElement("canvas");
        const m = 1280;
        const x = 1280;
        let d_width = d.width;
        let d_height = d.height;
        if (d_width > d_height) {
          if (d_width > m) {
            d_height *= m / d_width;
            d_width = m;
          }
        } else if (d_height > x) {
          d_width *= x / d_height;
          d_height = x;
        }
        f.width = d_width;
        f.height = d_height;
        const g = f.getContext("2d");
        g?.drawImage(d, 0, 0, d_width, d_height);
        resolve(f.toDataURL("image/jpeg", 0.8));
      };
      d.onerror = (f) => reject(f);
    };
    o.onerror = (a) => reject(a);
  });

export const compressTripPhoto = (e) =>
  new Promise((resolve, reject) => {
    const o = new FileReader();
    o.readAsDataURL(e);
    o.onload = (a) => {
      const d = new Image();
      d.src = a.target?.result;
      d.onload = () => {
        const f = document.createElement("canvas");
        const m = 1024;
        const x = 1024;
        let d_width = d.width;
        let d_height = d.height;
        if (d_width > d_height) {
          if (d_width > m) {
            d_height *= m / d_width;
            d_width = m;
          }
        } else if (d_height > x) {
          d_width *= x / d_height;
          d_height = x;
        }
        f.width = d_width;
        f.height = d_height;
        const g = f.getContext("2d");
        g?.drawImage(d, 0, 0, d_width, d_height);
        resolve(f.toDataURL("image/jpeg", 0.7));
      };
      d.onerror = (f) => reject(f);
    };
    o.onerror = (a) => reject(a);
  });
