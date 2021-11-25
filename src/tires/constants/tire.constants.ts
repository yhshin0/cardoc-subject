export const TIRE_CONSTANTS = {
  VALID_TIRE_STATUS: 'success',
  INVALID_TIRE_STATUS: 'error',
  TIRE_FORMAT_REGEX: /^[0-9]{3}\/[0-9]{2}R[0-9]{2}/g,
  TIRE_SPEC_SPLIT_REGEX: /[\/R]/g,
  CAR_SPEC_API_URL: 'https://dev.mycar.cardoc.co.kr/v1/trim/',
  DEFAULT_PAGE: 0,
  DEFAULT_PAGE_SIZE: 5,
  MAX_NUM_OF_INPUT_DATA: 5,
};

export const TIRE_ERROR_MSG = {
  INVALID_INPUT_DATA: '입력 정보가 잘못되었습니다',
  NO_INPUT_DATA: '입력 데이터가 없습니다',
  EXCEED_INPUT_DATA: `입력 데이터 개수가 ${TIRE_CONSTANTS.MAX_NUM_OF_INPUT_DATA}개를 초과하였습니다`,
};
