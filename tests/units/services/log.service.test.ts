import LogService from "../../../src/services/log.service";
import LoginModel from "../../../src/mongo/log.mongo";

describe("LogService", () => {
    describe("writeLog", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should write log", async () => {
            const logService = new LogService();
            LoginModel.create = jest.fn().mockResolvedValue({
                _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                email: "test@email.com",
                status: "success",
                timestamp: 12324453412,
            });

            logService.writeLog("test@email.com", "success");

            expect(LoginModel.create).toHaveBeenCalledTimes(1);
            expect(LoginModel.create).toHaveBeenCalledWith({
                email: "test@email.com",
                status: "success",
                timestamp: expect.any(Number),
            });
        });
    });

    describe("getLogs", () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should get logs", async () => {
            LoginModel.find = jest.fn().mockResolvedValue([
                {
                    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                    email: "test@email.com",
                    status: "success",
                    timestamp: 1597490990000,
                },
                {
                    _id: "5e8g8g8g8g8g8g8g8g8g8g8g",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597490980000,
                },
            ]);

            const logService = new LogService();

            const expected = [
                {
                    _id: "5e8f8f8f8f8f8f8f8f8f8f8f",
                    email: "test@email.com",
                    status: "success",
                    timestamp: 1597490990000,
                },
                {
                    _id: "5e8g8g8g8g8g8g8g8g8g8g8g",
                    email: "test@email.com",
                    status: "fail",
                    timestamp: 1597490980000,
                },
            ];

            await expect(
                logService.getLogs("test@email.com", 1597490970000)
            ).resolves.toEqual(expected);
            expect(LoginModel.find).toHaveBeenCalledTimes(1);
        });
    });
});
