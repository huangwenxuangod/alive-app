import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChallengeStatus = "alive" | "warning" | "danger" | "dead";

export interface Submission {
  day: number;
  action: string;
  amount: number;
  date: string;
}

export interface Challenge {
  name: string;
  target: number;
  current: number;
  day: number;
  maxDays: number;
  status: ChallengeStatus;
  submissions: Submission[];
  createdAt: string;
}

interface ChallengeStore {
  challenge: Challenge | null;
  createChallenge: (name: string, target: number) => void;
  submitAction: (action: string, amount: number) => void;
  getDaysSinceLastSubmission: () => number;
  getProgress: () => number;
  getDaysLeft: () => number;
  getRevenueLeft: () => number;
}

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      challenge: null,

      createChallenge: (name: string, target: number) => {
        set({
          challenge: {
            name,
            target,
            current: 0,
            day: 1,
            maxDays: 30,
            status: "alive",
            submissions: [],
            createdAt: new Date().toISOString(),
          },
        });
      },

      submitAction: (action: string, amount: number) => {
        const { challenge } = get();
        if (!challenge) return;

        const newSubmissions = [
          ...challenge.submissions,
          { day: challenge.day, action, amount, date: new Date().toISOString() },
        ];

        const newCurrent = challenge.current + amount;
        let newDay = challenge.day;
        let newStatus: ChallengeStatus = "alive";

        if (newCurrent >= challenge.target) {
          newStatus = "alive";
        } else {
          newDay = challenge.day + 1;
          if (newDay > challenge.maxDays) {
            newStatus = "dead";
          }
        }

        set({
          challenge: {
            ...challenge,
            current: newCurrent,
            day: newDay,
            status: newStatus,
            submissions: newSubmissions,
          },
        });
      },

      getDaysSinceLastSubmission: () => {
        const { challenge } = get();
        if (!challenge) return 0;
        if (challenge.submissions.length === 0) return challenge.day - 1;
        const lastDate = new Date(challenge.submissions[challenge.submissions.length - 1].date);
        return Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      },

      getProgress: () => {
        const { challenge } = get();
        if (!challenge) return 0;
        return Math.min((challenge.current / challenge.target) * 100, 100);
      },

      getDaysLeft: () => {
        const { challenge } = get();
        if (!challenge) return 0;
        return challenge.maxDays - challenge.day;
      },

      getRevenueLeft: () => {
        const { challenge } = get();
        if (!challenge) return 0;
        return Math.max(0, challenge.target - challenge.current);
      },
    }),
    { name: "alive-challenge" }
  )
);
