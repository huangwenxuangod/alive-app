'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSubmitAction } from '@/hooks/use-challenge';
import { useCreditBalance } from '@/hooks/use-credits';
import { SUBMIT_COST } from '@/config/credits';
import { compressImage, formatFileSize } from '@/utils/image-compress';
import { ImagePlus, X, Loader2 } from 'lucide-react';

const formSchema = z.object({
  action: z.string().min(1, '行动描述不能为空').max(500, '行动描述最多500字'),
  amountYuan: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, '金额不能为负数'),
  note: z.string().max(500, '备注最多500字').optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitModal({ open, onOpenChange }: SubmitModalProps) {
  const { mutate: submitAction, isPending } = useSubmitAction();
  const { data: credits } = useCreditBalance();
  const fileRef = useRef<HTMLInputElement>(null);

  // 截图状态
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [compressInfo, setCompressInfo] = useState<{ orig: number; comp: number } | null>(null);
  const [compressError, setCompressError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: '',
      amountYuan: '0',
      note: '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressError('');
    setCompressing(true);
    setScreenshotPreview(null);
    setScreenshotData(null);
    setCompressInfo(null);

    try {
      const result = await compressImage(file);
      if (result.success && result.dataUrl) {
        setScreenshotPreview(result.dataUrl);
        setScreenshotData(result.dataUrl);
        setScreenshotName(file.name);
        setCompressInfo({ orig: result.originalSize, comp: result.compressedSize });
      } else {
        setCompressError(result.error || '图片处理失败');
      }
    } catch {
      setCompressError('图片处理失败');
    } finally {
      setCompressing(false);
      // 清空 input，允许重复选择同一文件
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotData(null);
    setScreenshotName('');
    setCompressInfo(null);
    setCompressError('');
  };

  const onSubmit = (values: FormValues) => {
    const amountCents = Math.round(parseFloat(values.amountYuan) * 100);

    submitAction(
      {
        action: values.action.trim(),
        amount: amountCents,
        note: values.note || undefined,
        screenshotData: screenshotData || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.data?.success) {
            reset();
            removeScreenshot();
            onOpenChange(false);
          }
        },
      }
    );
  };

  const creditsInsufficient = credits !== undefined && credits < SUBMIT_COST;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>提交今日行动</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 px-6 pb-6">
            <div>
              <label className="block text-sm text-[#888] font-semibold mb-2">
                今天做了什么
              </label>
              <Textarea
                {...register('action')}
                placeholder="描述你今天为赚钱做了什么..."
                className="min-h-[100px] resize-y"
              />
              {errors.action && (
                <p className="text-xs text-[#ff4444] mt-1">{errors.action.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#888] font-semibold mb-2">
                收入金额 (¥)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('amountYuan')}
              />
              {errors.amountYuan && (
                <p className="text-xs text-[#ff4444] mt-1">
                  {errors.amountYuan.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#888] font-semibold mb-2">
                收入截图 <span className="text-[#666] font-normal">(可选，≤500KB)</span>
              </label>

              {!screenshotPreview ? (
                <div
                  onClick={() => !compressing && fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    compressing
                      ? 'border-[#333] cursor-wait bg-[#0a0a0a]'
                      : 'border-[#1a1a1a] hover:border-[#333]'
                  }`}
                >
                  {compressing ? (
                    <>
                      <Loader2 className="inline w-6 h-6 animate-spin text-[#888] mb-2" />
                      <div className="text-sm text-[#888]">正在压缩图片...</div>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="inline w-6 h-6 text-[#888] mb-2" />
                      <div className="text-sm text-[#888]">点击上传截图</div>
                      <div className="text-xs text-[#666] mt-1">
                        支持 JPG/PNG/WebP，自动压缩至 500KB 以内
                      </div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-[#1a1a1a]">
                  <img
                    src={screenshotPreview}
                    alt="截图预览"
                    className="w-full max-h-[200px] object-contain bg-[#0a0a0a]"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="px-3 py-2 bg-[#111] text-xs text-[#888] flex items-center justify-between">
                    <span className="truncate">{screenshotName}</span>
                    {compressInfo && (
                      <span className="text-[#00ff88] ml-2 shrink-0">
                        {formatFileSize(compressInfo.orig)} → {formatFileSize(compressInfo.comp)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {compressError && (
                <p className="text-xs text-[#ff4444] mt-1">{compressError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-[#888] font-semibold mb-2">
                备注
              </label>
              <Input {...register('note')} placeholder="可选" />
              {errors.note && (
                <p className="text-xs text-[#ff4444] mt-1">{errors.note.message}</p>
              )}
            </div>

            <div
              className={`text-xs ${
                creditsInsufficient ? 'text-[#ff4444]' : 'text-[#666]'
              }`}
            >
              提交消耗 {SUBMIT_COST} 积分，当前余额: {credits ?? '--'} 积分
              {creditsInsufficient && ' (积分不足)'}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isPending || creditsInsufficient || compressing}
            >
              {isPending ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
