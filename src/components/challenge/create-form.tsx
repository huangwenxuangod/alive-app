'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateChallenge } from '@/hooks/use-challenge';
import { CreditBalance } from '@/components/credits/credit-balance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  targetYuan: z.number().int().positive('请选择目标金额'),
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50个字符'),
});

type FormValues = z.infer<typeof formSchema>;

const targetOptions = siteConfig.challenge.defaultTargets.map((yuan) => ({
  value: yuan,
  label: `¥${yuan}`,
  desc:
    yuan === 1
      ? '先赚到第一块钱'
      : yuan === 10
      ? '一杯咖啡钱'
      : yuan === 100
      ? '小试牛刀'
      : 'serious 模式',
}));

export function CreateForm() {
  const { mutate: createChallenge, isPending } = useCreateChallenge();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetYuan: 100,
      nickname: '',
    },
  });

  const selectedTarget = watch('targetYuan');

  const onSubmit = (values: FormValues) => {
    createChallenge({
      name: values.nickname.trim() || '挑战者',
      target: values.targetYuan * 100, // 元转分
    });
  };

  return (
    <div className="max-w-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-bold">创建你的生存挑战</h2>
        <CreditBalance />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="block text-sm text-[#888] font-semibold mb-3">
            选择目标金额
          </label>
          <div className="grid grid-cols-2 gap-3">
            {targetOptions.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('targetYuan', t.value, { shouldValidate: true })}
                className={cn(
                  'p-5 bg-[#111] border-2 rounded-xl text-center cursor-pointer transition-all',
                  selectedTarget === t.value
                    ? 'border-[#00ff88] bg-[rgba(0,255,136,0.05)]'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                )}
              >
                <div className="text-[28px] font-extrabold">{t.label}</div>
                <div className="text-xs text-[#666] mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
          {errors.targetYuan && (
            <p className="text-xs text-[#ff4444] mt-2">{errors.targetYuan.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-[#888] font-semibold mb-3">
            挑战周期
          </label>
          <div className="p-4 bg-[#111] border border-[#1a1a1a] rounded-lg text-lg font-semibold">
            {siteConfig.challenge.maxDays} 天
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-[#888] font-semibold mb-3">
            你的昵称
          </label>
          <Input
            {...register('nickname')}
            placeholder="输入你的昵称"
          />
          {errors.nickname && (
            <p className="text-xs text-[#ff4444] mt-2">{errors.nickname.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full text-lg font-bold"
          disabled={isPending}
        >
          {isPending ? '创建中...' : '开始生存'}
        </Button>
      </form>
    </div>
  );
}
