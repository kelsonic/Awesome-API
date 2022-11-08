// Relative imports.
import ClientService from "./client";

describe("Client Service", () => {
  let clientService;
  const mockClient = {
    createdAt: "2019-01-01T00:00:00.000Z",
    email: "test@example.com",
    firstName: "Test",
    id: 1,
    lastName: "Client",
    password: "password",
    updatedAt: "2019-01-01T00:00:00.000Z",
  };
  let clients = [];

  beforeEach(() => {
    // Mock the client service.
    clients = [];
    const prisma = {
      client: {
        create: async (options) => {
          const client = {
            ...options.data,
            id: clients.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          clients.push(client);
          return client;
        },
        findUnique: async (options) => {
          return clients.find((client) => client.id === options.where.id);
        },
        update: async (options) => {
          let client = clients.find((client) => client.id === options.where.id);
          client = { ...client, ...options.data };
          return client;
        },
      },
    };
    const redis = {
      get: async (key) => {
        return null;
      },
      set: async (key, value) => {
        return "OK";
      },
    };
    clientService = new ClientService(prisma, redis);
  });

  describe("getByID", () => {
    it("should return a client by ID", async () => {
      // Setup.
      clients = [mockClient];
      const client = await clientService.getByID(1);

      // Assertions.
      expect(client).toEqual({
        ...mockClient,
        password: undefined,
      });
    });
  });

  describe("create", () => {
    it("should create a client", async () => {
      // Setup.
      await clientService.create(mockClient);
      await clientService.create(mockClient);
      await clientService.create(mockClient);

      // Assertions.
      expect(clients).toHaveLength(3);
    });
  });

  describe("updateByID", () => {
    it("should update a client by ID", async () => {
      // Setup.
      clients = [mockClient];
      const input = {
        email: "test2@example.com",
        firstName: "Updated",
        lastName: "Updated",
      };
      const client = await clientService.updateByID(1, input);

      // Assertions.
      expect(client).toEqual({
        ...mockClient,
        ...input,
        password: undefined,
      });
    });
  });
});
