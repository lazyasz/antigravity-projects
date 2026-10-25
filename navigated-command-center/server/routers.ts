import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { dispatchCorridorAction, getCorridorState, getInMemoryActionHistory, getInMemoryScenarioHistory } from "./corridorState";
import { broadcastCorridorState, getRealtimeClientCount } from "./realtime";
import { getActionHistory, getScenarioHistory, getTrainEtaHistory, recordOperatorAction, recordScenarioTransition } from "./db";

const actionSchema = z.object({
  type: z.enum(["NAVIGATE_VIEW", "SET_SCENARIO", "CLEAR_SCENARIO", "SET_SPEED", "TOGGLE_LIVE", "SELECT_TRAIN", "RUN_RECALCULATION", "RUN_RETRAIN", "RUN_API_TEST", "EXPORT_BRIEF", "TOGGLE_PLAYBACK", "PLAYBACK_SEEK"]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  corridor: router({
    getState: publicProcedure.query(() => ({ ...getCorridorState(), realtimeClients: getRealtimeClientCount() })),
    getActionHistory: publicProcedure.query(async () => {
      const rows = await getActionHistory(24);
      return rows.length ? rows : getInMemoryActionHistory();
    }),
    getScenarioHistory: publicProcedure.query(async () => {
      const rows = await getScenarioHistory(12);
      return rows.length ? rows : getInMemoryScenarioHistory();
    }),
    getTrainEtaHistory: publicProcedure.input(z.object({ trainId: z.string().max(16) })).query(async ({ input }) => getTrainEtaHistory(input.trainId, 24)),
    dispatchAction: publicProcedure.input(actionSchema).mutation(async ({ input, ctx }) => {
      const payload = input.payload ?? {};
      const result = dispatchCorridorAction(input.type, payload);
      const actorOpenId = ctx.user?.openId;
      await recordOperatorAction(input.type, payload, actorOpenId);
      if (result.scenarioEvent) {
        await recordScenarioTransition(result.scenarioEvent.scenarioId, result.scenarioEvent.action, result.scenarioEvent.delayMinutes, result.scenarioEvent.affectedFleet, actorOpenId);
      }
      broadcastCorridorState({ ...result.state, realtimeClients: getRealtimeClientCount() });
      return result.state;
    }),
  }),
});

export type AppRouter = typeof appRouter;
