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
import { Plus } from 'lucide-react';

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
  const [fileName, setFileName] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // MVP 阶段：只保存文件名，不上传
      setFileName(e.target.files[0].name);
    }
  };

  const onSubmit = (values: FormValues) => {
    const amountCents = Math.round(parseFloat(values.amountYuan) * 100);

    submitAction(
      {
        action: values.action.trim(),
        amount: amountCents,
        note: values.note || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.data?.success) {
            reset();
            setFileName('');
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
                收入截图
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  fileName
                    ? 'border-[#00ff88]'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="text-2xl mb-2">
                  {fileName ? '✓' : <Plus className="inline w-6 h-6" />}
                </div>
                <div className="text-sm text-[#888]">
                  {fileName || '点击上传截图'}
                </div>
                <div className="text-xs text-[#666] mt-1">
                  支持 Stripe、PayPal、微信、支付宝等
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
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
              disabled={isPending || creditsInsufficient}
            >
              {isPending ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
