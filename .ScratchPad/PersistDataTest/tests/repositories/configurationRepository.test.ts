import { updateSupportedGenerations } from '../../src/repositories/configurationRepository';
import * as configurationData from '../../src/data/configurationData';
import * as logRepository from '../../src/repositories/logRepository';
import { DateData } from '../../src/types/dateData';
import { SupportedGeneration } from '../../src/types/configurationData';

const getGenerationUpdateDataMock = jest.spyOn(configurationData, "getGenerationUpdateData");
const upsertConfigurationDataMock = jest.spyOn(configurationData, "upsertConfigurationData");

let supportedGenerations: SupportedGeneration[] = [];

beforeEach(() => {
    supportedGenerations = [{
        id: 1, 
        generation_name: 'string',
        description: 'string',
        starting_dex_no: 1, 
        count: 2,
        active: true,
        stale_by_dts: null,
        last_modified_dts: '2020-06-16T01:05:02.988Z'
    }]
})

afterEach(() => {
    getGenerationUpdateDataMock.mockClear();
    upsertConfigurationDataMock.mockClear();
});

describe('updateSupportedGenerations', () => {

    const logInfoMock = jest.spyOn(logRepository, "logInfo");

    it('should not update configuration data if the value last_modified_dts from the server is older than what is stored', () => {

        // ARRANGE 
        upsertConfigurationDataMock.mockImplementation();
        logInfoMock.mockImplementation();

        const mockDateData: DateData = {
            last_modified_dts: '2020-06-16T01:04:02.988Z',
            source_last_modified_dts: '2020-06-16T01:06:02.988Z',
        };

        getGenerationUpdateDataMock.mockImplementation(() => mockDateData);

        // ACT
        updateSupportedGenerations(supportedGenerations);

        // ASSERT 
        expect(configurationData.getGenerationUpdateData).toHaveBeenCalledTimes(1);
        expect(configurationData.upsertConfigurationData).toHaveBeenCalledTimes(0);
    });

    it('should update configuration data if the value last_modified_dts from the server is newer than what is stored', () => {

        // ARRANGE 
        upsertConfigurationDataMock.mockImplementation();
        logInfoMock.mockImplementation();

        const mockDateData: DateData = {
            last_modified_dts: '2020-06-16T01:04:02.988Z',
            stale_by_dts: '2020-06-15T01:00:00.988Z',
        };

        getGenerationUpdateDataMock.mockImplementation(() => mockDateData);

        // ACT
        updateSupportedGenerations(supportedGenerations);

        // ASSERT 
        expect(configurationData.getGenerationUpdateData).toHaveBeenCalledTimes(1);
        expect(configurationData.upsertConfigurationData).toHaveBeenCalledTimes(1);
    });

    it('should update configuration data if if there is no data stored', () => {
        // ARRANGE
        upsertConfigurationDataMock.mockImplementation();
        logInfoMock.mockImplementation();

        getGenerationUpdateDataMock.mockImplementation(() => undefined);

        // ACT
        updateSupportedGenerations(supportedGenerations);

        // ASSERT 
        expect(configurationData.getGenerationUpdateData).toHaveBeenCalledTimes(1);
        expect(configurationData.upsertConfigurationData).toHaveBeenCalledTimes(1);
    });
});
