export const generateRandomString = (length: number, hasSpecialChars: boolean = false) => {
  let result: string = '';
  let characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (hasSpecialChars) {
    characters += '~!@#$%^&*-_=+<>?;:{}[].,';
  }
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
