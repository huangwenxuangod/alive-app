/**
 * 图片压缩工具（MVP方案）
 *
 * 将上传的图片压缩到 ≤500KB 并转为 base64 data URL
 * 限制：单张图片最大 500KB，超过会自动压缩尺寸和质量
 */

const MAX_SIZE_BYTES = 500 * 1024; // 500KB
const MAX_DIMENSION = 1200; // 最大宽高 1200px
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.3;

export interface CompressResult {
  success: boolean;
  dataUrl?: string; // base64 data URL (data:image/jpeg;base64,...)
  error?: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * 压缩图片文件为 base64 data URL
 */
export async function compressImage(file: File): Promise<CompressResult> {
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: '请上传图片文件',
      originalSize: file.size,
      compressedSize: 0,
    };
  }

  try {
    // 读取文件
    const originalDataUrl = await readFileAsDataURL(file);

    // 如果已经很小了，直接返回
    if (file.size <= MAX_SIZE_BYTES) {
      return {
        success: true,
        dataUrl: originalDataUrl,
        originalSize: file.size,
        compressedSize: file.size,
      };
    }

    // 需要压缩
    const img = await loadImage(originalDataUrl);

    // 计算压缩后的尺寸（保持比例）
    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // 逐步降低质量直到满足大小限制
    let quality = INITIAL_QUALITY;
    let compressedDataUrl = '';
    let compressedSize = 0;

    while (quality >= MIN_QUALITY) {
      compressedDataUrl = await canvasToDataURL(img, width, height, quality);
      compressedSize = estimateBase64Size(compressedDataUrl);

      if (compressedSize <= MAX_SIZE_BYTES) break;

      // 如果尺寸已经很小了但还是太大，再缩小尺寸
      if (width > 600 && quality <= MIN_QUALITY + 0.1) {
        width = Math.round(width * 0.8);
        height = Math.round(height * 0.8);
        quality = INITIAL_QUALITY; // 重置质量重试
      } else {
        quality -= 0.1;
      }
    }

    if (compressedSize > MAX_SIZE_BYTES) {
      return {
        success: false,
        error: '图片太大，无法压缩到500KB以内，请选择更小的图片',
        originalSize: file.size,
        compressedSize,
      };
    }

    return {
      success: true,
      dataUrl: compressedDataUrl,
      originalSize: file.size,
      compressedSize,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片处理失败',
      originalSize: file.size,
      compressedSize: 0,
    };
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

function canvasToDataURL(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', quality));
  });
}

/**
 * 估算 base64 data URL 的字节大小
 * base64 编码后大小约为原始的 4/3
 */
function estimateBase64Size(dataUrl: string): number {
  // data:image/jpeg;base64, 前缀约 23 字节
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
