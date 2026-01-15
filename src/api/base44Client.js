// src/api/base44Client.js
// Local stub: no real network calls, just empty data.

export const base44 = {
  entities: {
    Farm: {
      list: async () => [],
    },
    Block: {
      list: async () => [],
    },
    Tree: {
      list: async () => [],
      filter: async () => [],
      create: async (data) => data,
      update: async (id, data) => ({ id, ...data }),
    },
    TaskSchedule: {
      list: async () => [],
      filter: async () => [],
      create: async (data) => data,
      update: async (id, data) => ({ id, ...data }),
    },
    HarvestRecord: {
      list: async () => [],
      create: async (data) => data,
    },
    IrrigationRecord: {
      list: async () => [],
      create: async (data) => data,
    },
    FertilizerRecord: {
      list: async () => [],
      create: async (data) => data,
    },
    GrowthRecord: {
      list: async () => [],
      create: async (data) => data,
    },
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ url: '' }),
    },
  },
  appLogs: {
    logUserInApp: async () => {},
  },
  auth: {
    login: () => {},
    logout: () => {},
    me: async () => null,
  },
};
