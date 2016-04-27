const COURSES_NAMES = ['1P', '2P', '3P', '4P', '5P', '6P', '1ESO', '2ESO', '3ESO', '4ESO',];

const SESSION_TYPES = {
  tlk_2: {
    silaba_types: {
      mono: ["ACT 1", "ACT 2", "ACT 3", "ACT4"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    tlk_key: 'TLK_OLD'
  },
  tlk_2_6 : {
    silaba_types: {
      mono: ["ACT 1", "ACT 2", "ACT 3"],
      bi: ["ACT4", "ACT 5", "ACT 6", "ACT 7", "ACT 8", "ACT 9"],
      tri: ["ACT 10", "ACT 11", "ACT 12"],
    },
    tlk_key: 'TLK_OLD'
  },
  tlk_2_n : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    tlk_key: 'TLK'
  },
  tlk_2_6_n : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
      bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
      tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
    },
    tlk_key: 'TLK'
  },
};

const CONSTANTS = {
  BASE_API: 'http://app.binding-edu.org/api',
  CHROME_PORT: 'tlk2',
  COURSES_NAMES,
  SESSION_TYPES,
};

export default CONSTANTS;
