const isValidEmail = email => {
  const re = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+.com$/;
  return re.test(String(email).toLowerCase());
};

const isArrayOfValidEmails = array => {
  let areAllValidEmails = true;
  let invalidEmails = [];

  for (let email of array) {
    if (!isValidEmail(email)) {
      areAllValidEmails = false;
      invalidEmails.push(email)
    }
  }

  return { areAllValidEmails, invalidEmails }
};

module.exports = { isValidEmail, isArrayOfValidEmails };