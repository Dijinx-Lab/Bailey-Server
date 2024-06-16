const PatternUtil = {
  checkPasswordLength: (password) => {
    return password.length > 8;
  },

  checkEmailPattern: (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  },

  checkAlphabeticName: (name) => {
    const alphabeticPattern = /^[a-zA-Z]+$/;
    return alphabeticPattern.test(name);
  },

  filterParametersFromObject: (object, params) => {
    const objectWithoutParams = Object.fromEntries(
      Object.entries(object).filter(([key]) => !params.includes(key))
    );
    return objectWithoutParams;
  },

  generateRandomCode() {
    const characters = "0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  },

  renameKeys: (object, keyMap) => {
    const renamedObject = {};
    Object.keys(object).forEach((key) => {
      const newKey = keyMap[key] || key;
      renamedObject[newKey] = object[key];
    });
    return renamedObject;
  },
};

export default PatternUtil;
