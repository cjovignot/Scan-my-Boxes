import { useMemo } from "react";

type CloudinaryOptions = {
  w?: number;
  h?: number;
  crop?: "fill" | "fit" | "thumb" | "scale";
  responsive?: boolean;
};

export function useCloudinaryImage(url?: string, opts?: CloudinaryOptions) {
  const optimized = useMemo(() => {
    if (!url || !url.includes("res.cloudinary.com")) return { src: url };

    const w = opts?.w ? `w_${opts.w}` : "";
    const h = opts?.h ? `h_${opts.h}` : "";
    const crop = opts?.crop ? `c_${opts.crop}` : "";
    const baseTransforms = [w, h, crop, "f_auto", "q_auto"]
      .filter(Boolean)
      .join(",");

    const src = url.replace("/upload/", `/upload/${baseTransforms}/`);

    // Responsive mode: srcSet for 1x, 2x, 3x
    if (opts?.responsive && opts?.w) {
      const srcSet = [
        `${url.replace(
          "/upload/",
          `/upload/w_${opts.w},${crop},f_auto,q_auto/`
        )} 1x`,
        `${url.replace(
          "/upload/",
          `/upload/w_${opts.w * 2},${crop},f_auto,q_auto/`
        )} 2x`,
        `${url.replace(
          "/upload/",
          `/upload/w_${opts.w * 3},${crop},f_auto,q_auto/`
        )} 3x`,
      ];

      return { src, srcSet: srcSet.join(", ") };
    }

    return { src };
  }, [url, opts?.w, opts?.h, opts?.crop, opts?.responsive]);

  return optimized;
}
